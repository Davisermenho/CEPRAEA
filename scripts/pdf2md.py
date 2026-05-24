#!/usr/bin/env python3
"""
pdf2md.py v4 - Converte PDF em Markdown com OCR, snapshots e relatórios por página.

Uso: python3 scripts/pdf2md.py <arquivo.pdf> [--out <pasta>] [--lang LANG] [--no-ocr]

Saída:
  <pasta>/<nome>.md                      texto em Markdown
  <pasta>/images/<nome>/extracted/       imagens úteis extraídas
  <pasta>/images/<nome>/pages/           snapshots de páginas suspeitas/OCR
  <pasta>/reports/<nome>.report.json     metadados por página
  <pasta>/reports/<nome>.report.md       relatório legível

Exemplos:
  python3 scripts/pdf2md.py 'googledrive/PLANO DE JOGO.pdf'
  python3 scripts/pdf2md.py 'artigo.pdf' --out docs/ontologia/artigos/
  python3 scripts/pdf2md.py 'artigo.pdf' --lang en
  python3 scripts/pdf2md.py 'artigo.pdf' --no-ocr

OCR automático:
  Backend: easyocr (Python puro, sem dependência de tesseract).
  Na primeira execução os modelos são baixados (~500 MB) e armazenados em cache.

Heurísticas de página suspeita:
  - Texto extraído com menos de MIN_TEXT_CHARS caracteres
  - Muitos tokens grudados (razão de espaços < limiar)
  - Muitos elementos com mesmo eixo-y (layout colapsado)
  - Página com muitas imagens/objetos visuais
  - Baixa confiança média do OCR
"""

import sys
import os
import json
import argparse
import io
import fitz  # PyMuPDF
from pathlib import Path

# ---- GPU auto-detect ----
try:
    import torch as _torch
    USE_GPU: bool = _torch.cuda.is_available()
except ImportError:
    USE_GPU = False

# ---- OCR backend (easyocr) ----
try:
    import easyocr as _easyocr_mod
    HAS_OCR = True
except ImportError:
    HAS_OCR = False

_OCR_READER_CACHE: dict = {}

# Limiar: páginas com menos que N chars não-espaço são candidatas a OCR/suspeitas
_DEFAULT_MIN_TEXT_CHARS = 30
# Tamanho mínimo de imagem para não ser considerada decorativa (bytes)
_MIN_IMAGE_BYTES = 1024
# Zoom para renderização de snapshots
_SNAPSHOT_ZOOM = 2.0


def _get_reader(langs: list[str]):
    key = tuple(sorted(langs))
    if key not in _OCR_READER_CACHE:
        import easyocr
        print(f"  [OCR] Inicializando modelo easyocr para {langs} (pode demorar na 1a vez)...")
        _OCR_READER_CACHE[key] = easyocr.Reader(langs, gpu=USE_GPU, verbose=False)
    return _OCR_READER_CACHE[key]


def _ocr_page(page, langs: list[str]) -> tuple[str, float]:
    """Renderiza a página e executa OCR. Retorna (texto, confiança_média)."""
    mat = fitz.Matrix(_SNAPSHOT_ZOOM, _SNAPSHOT_ZOOM)
    pix = page.get_pixmap(matrix=mat)
    img_bytes = pix.tobytes("png")

    reader = _get_reader(langs)
    results = reader.readtext(img_bytes, detail=1, paragraph=False)

    if not results:
        return "", 0.0

    texts = []
    confidences = []
    for (_, text, conf) in results:
        texts.append(text)
        confidences.append(conf)

    avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
    return "\n".join(texts).strip(), avg_conf


def _save_snapshot(page, path: str):
    """Renderiza e salva um snapshot PNG da página."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    mat = fitz.Matrix(_SNAPSHOT_ZOOM, _SNAPSHOT_ZOOM)
    pix = page.get_pixmap(matrix=mat)
    pix.save(path)


def _parse_langs(lang_str: str) -> list[str]:
    return [l.strip() for l in lang_str.replace("+", ",").split(",") if l.strip()]


def _is_suspicious_layout(words_list: list, image_count: int, min_chars: int, text: str) -> tuple[bool, list[str]]:
    """
    Avalia heurísticas de layout suspeito.
    Retorna (is_suspicious, lista_de_razões).
    """
    reasons = []
    nchars = len(text.replace(" ", "").replace("\n", ""))

    # Heurística 1: poucos caracteres úteis
    if nchars < min_chars:
        reasons.append(f"low_text_chars={nchars}")

    # Heurística 2: tokens grudados (texto sem espaços em sequências longas)
    if text:
        words = text.split()
        long_no_space = [w for w in words if len(w) > 20 and " " not in w]
        if len(long_no_space) > 3:
            reasons.append(f"glued_tokens={len(long_no_space)}")

    # Heurística 3: muitos elementos no mesmo eixo-y (layout colapsado)
    if words_list:
        y_buckets = {}
        for w in words_list:
            yb = round(w[1] / 4) * 4
            y_buckets[yb] = y_buckets.get(yb, 0) + 1
        max_same_y = max(y_buckets.values()) if y_buckets else 0
        if max_same_y > 15:
            reasons.append(f"collapsed_y_axis={max_same_y}")

    # Heurística 4: muitas imagens na página
    if image_count >= 5:
        reasons.append(f"many_images={image_count}")

    return len(reasons) > 0, reasons


def _reconstruct_text(words_list: list) -> str:
    """Reconstrói texto a partir de palavras posicionadas."""
    if not words_list:
        return ""

    words_pos = sorted(words_list, key=lambda w: (round(w[1] / 6) * 6, w[0]))
    visual_lines = []
    cur_y_bucket = None
    cur_line_words = []

    for w in words_pos:
        x0, y0, x1, y1, word = w[0], w[1], w[2], w[3], w[4]
        y_bucket = round(y0 / 6) * 6
        if cur_y_bucket is None:
            cur_y_bucket = y_bucket
        if abs(y_bucket - cur_y_bucket) > 8:
            visual_lines.append((cur_y_bucket, cur_line_words))
            cur_line_words = []
            cur_y_bucket = y_bucket
        cur_line_words.append((x0, word))

    if cur_line_words:
        visual_lines.append((cur_y_bucket, cur_line_words))

    result_lines = []
    prev_y = None
    avg_gap = 14

    for y_bucket, line_words in visual_lines:
        line_text = " ".join(w[1] for w in sorted(line_words, key=lambda w: w[0]))
        if prev_y is not None and (y_bucket - prev_y) > avg_gap * 1.8:
            result_lines.append("")
        result_lines.append(line_text)
        if prev_y is not None:
            avg_gap = avg_gap * 0.8 + (y_bucket - prev_y) * 0.2
        prev_y = y_bucket

    return "\n".join(result_lines).strip()


def pdf_to_markdown(
    pdf_path: str,
    out_dir: str,
    langs: list[str],
    use_ocr: bool,
    min_text_chars: int = _DEFAULT_MIN_TEXT_CHARS,
    snapshot_suspicious: bool = True,
) -> dict:
    """
    Converte um PDF para Markdown com metadados por página.
    Retorna dicionário com estatísticas do processamento.
    """
    pdf_path = os.path.abspath(pdf_path)
    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    md_path = os.path.join(out_dir, f"{base_name}.md")
    img_extracted_dir = os.path.join(out_dir, "images", base_name, "extracted")
    img_pages_dir = os.path.join(out_dir, "images", base_name, "pages")
    reports_dir = os.path.join(out_dir, "reports")

    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(img_extracted_dir, exist_ok=True)
    os.makedirs(img_pages_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    doc = fitz.open(pdf_path)
    total_pages = len(doc)

    print(f'[START] file="{os.path.basename(pdf_path)}"')
    print(f"[INFO] pages_total={total_pages}")

    lines = [f"# {base_name}\n\n", f"> Extraído de: `{os.path.basename(pdf_path)}`\n\n"]

    # Contadores globais
    native_text_count = 0
    ocr_count = 0
    suspicious_count = 0
    snapshot_count = 0
    useful_images_count = 0
    review_needed_count = 0

    pages_meta = []
    pages_review_needed = []

    ocr_available = use_ocr and HAS_OCR

    for page_num, page in enumerate(doc, start=1):
        lines.append(f"---\n\n## Página {page_num}\n\n")

        words_list = page.get_text("words")
        text = _reconstruct_text(words_list)
        nchars = len(text.replace(" ", "").replace("\n", ""))

        image_infos = page.get_images(full=True)
        page_image_count = len(image_infos)

        # Avaliar suspeita antes de decidir método
        is_suspicious, susp_reasons = _is_suspicious_layout(
            words_list, page_image_count, min_text_chars, text
        )

        method = "native_text"
        ocr_confidence = None
        snapshot_saved = False
        status = "ok"
        page_reasons = susp_reasons.copy()

        if nchars >= min_text_chars:
            # Texto nativo suficiente
            method = "native_text"
            native_text_count += 1
            lines.append(text + "\n\n")

            # Mesmo com texto nativo, se layout suspeito → snapshot
            if is_suspicious and snapshot_suspicious:
                snap_path = os.path.join(img_pages_dir, f"page_{page_num:03d}_suspicious.png")
                try:
                    _save_snapshot(page, snap_path)
                    snapshot_saved = True
                    snapshot_count += 1
                    status = "review_needed"
                    review_needed_count += 1
                    pages_review_needed.append(page_num)
                except Exception as e:
                    page_reasons.append(f"snapshot_error={e}")

        elif ocr_available:
            # Texto insuficiente → OCR
            method = "easyocr"
            try:
                print(f"  [OCR] Página {page_num}/{total_pages}...", end="\r", flush=True)
                ocr_text, ocr_confidence = _ocr_page(page, langs)

                if ocr_text:
                    lines.append(f"> *[OCR — {'+'.join(langs)} — conf={ocr_confidence:.2f}]*\n\n{ocr_text}\n\n")
                    ocr_count += 1
                else:
                    lines.append("> *[Página sem texto legível após OCR — apenas imagens/diagramas]*\n\n")
                    page_reasons.append("ocr_empty_result")

                # Snapshot sempre que OCR for usado
                snap_path = os.path.join(img_pages_dir, f"page_{page_num:03d}_ocr.png")
                try:
                    _save_snapshot(page, snap_path)
                    snapshot_saved = True
                    snapshot_count += 1
                except Exception as e:
                    page_reasons.append(f"snapshot_error={e}")

                # Baixa confiança → revisão
                if ocr_confidence is not None and ocr_confidence < 0.6:
                    status = "review_needed"
                    review_needed_count += 1
                    pages_review_needed.append(page_num)
                    page_reasons.append(f"low_ocr_confidence={ocr_confidence:.2f}")
                else:
                    # suspeito mas OCR ok
                    if is_suspicious:
                        status = "review_needed"
                        review_needed_count += 1
                        pages_review_needed.append(page_num)

            except Exception as e:
                lines.append(f"> *[Erro OCR página {page_num}: {e}]*\n\n")
                page_reasons.append(f"ocr_exception={e}")
                status = "review_needed"
                review_needed_count += 1
                pages_review_needed.append(page_num)

        else:
            # Sem OCR disponível
            if not HAS_OCR:
                lines.append(
                    "> *[Página sem camada de texto. Para OCR: "
                    "pip install easyocr (no venv do projeto)]*\n\n"
                )
            else:
                lines.append("> *[OCR desativado. Remova --no-ocr para ativar.]*\n\n")
            native_text_count += 1

        if is_suspicious:
            suspicious_count += 1

        # Imagens embutidas no PDF
        page_img_count = 0
        for img_index, img_info in enumerate(image_infos):
            xref = img_info[0]
            try:
                base_image = doc.extract_image(xref)
                img_ext = base_image["ext"]
                img_bytes = base_image["image"]
                if len(img_bytes) < _MIN_IMAGE_BYTES:
                    continue  # ignorar decorativas
                img_filename = f"p{page_num}_img{img_index + 1}.{img_ext}"
                img_full_path = os.path.join(img_extracted_dir, img_filename)
                with open(img_full_path, "wb") as f:
                    f.write(img_bytes)
                rel_path = os.path.relpath(img_full_path, out_dir)
                lines.append(f"![Imagem {useful_images_count + 1}]({rel_path})\n\n")
                useful_images_count += 1
                page_img_count += 1
            except Exception as e:
                lines.append(f"*[Erro ao extrair imagem: {e}]*\n\n")

        # Log por página
        conf_str = f" confidence_avg={ocr_confidence:.2f}" if ocr_confidence is not None else ""
        reasons_str = f" reason={','.join(page_reasons)}" if page_reasons else ""
        print(
            f"[PAGE] page={page_num} method={method} chars={nchars} "
            f"images={page_img_count} snapshot={str(snapshot_saved).lower()}"
            f"{conf_str}{reasons_str} status={status}"
        )

        pages_meta.append({
            "page": page_num,
            "method": method,
            "chars": nchars,
            "images": page_img_count,
            "snapshot": snapshot_saved,
            "ocr_confidence": round(ocr_confidence, 3) if ocr_confidence is not None else None,
            "suspicious": is_suspicious,
            "reasons": page_reasons,
            "status": status,
        })

    doc.close()
    if ocr_available:
        print()  # nova linha após barra de progresso

    with open(md_path, "w", encoding="utf-8") as f:
        f.writelines(lines)

    # ---- Relatório JSON ----
    report_data = {
        "file": os.path.basename(pdf_path),
        "pages_total": total_pages,
        "native_text": native_text_count,
        "ocr": ocr_count,
        "suspicious": suspicious_count,
        "snapshots": snapshot_count,
        "useful_images": useful_images_count,
        "review_needed": review_needed_count,
        "pages_review_needed": pages_review_needed,
        "pages": pages_meta,
    }

    json_path = os.path.join(reports_dir, f"{base_name}.report.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, ensure_ascii=False, indent=2)

    # ---- Relatório MD ----
    md_report_path = os.path.join(reports_dir, f"{base_name}.report.md")
    md_report_lines = [
        f"# Relatório — {base_name}\n\n",
        f"| Campo | Valor |\n",
        f"|---|---|\n",
        f"| Arquivo | `{os.path.basename(pdf_path)}` |\n",
        f"| Páginas totais | {total_pages} |\n",
        f"| Texto nativo | {native_text_count} |\n",
        f"| OCR aplicado | {ocr_count} |\n",
        f"| Páginas suspeitas | {suspicious_count} |\n",
        f"| Snapshots salvos | {snapshot_count} |\n",
        f"| Imagens úteis | {useful_images_count} |\n",
        f"| Páginas para revisão | {review_needed_count} |\n",
    ]
    if pages_review_needed:
        md_report_lines.append(f"\n## Páginas para revisão visual\n\n")
        md_report_lines.append(", ".join(str(p) for p in pages_review_needed) + "\n\n")

    md_report_lines.append(f"\n## Detalhe por página\n\n")
    md_report_lines.append("| Pág | Método | Chars | Imgs | Snapshot | Status | Razões |\n")
    md_report_lines.append("|---:|---|---:|---:|---|---|---|\n")
    for pm in pages_meta:
        reasons_str = ", ".join(pm["reasons"]) if pm["reasons"] else "—"
        snap_str = "✓" if pm["snapshot"] else ""
        md_report_lines.append(
            f"| {pm['page']} | {pm['method']} | {pm['chars']} | {pm['images']} "
            f"| {snap_str} | {pm['status']} | {reasons_str} |\n"
        )

    with open(md_report_path, "w", encoding="utf-8") as f:
        f.writelines(md_report_lines)

    print(
        f'[SUMMARY] file="{os.path.basename(pdf_path)}" '
        f"pages_total={total_pages} native_text={native_text_count} "
        f"ocr={ocr_count} suspicious={suspicious_count} snapshots={snapshot_count} "
        f"useful_images={useful_images_count} review_needed={review_needed_count}"
    )
    print(f'[DONE] output="{md_path}"')

    return report_data


def main():
    parser = argparse.ArgumentParser(
        description="pdf2md.py v4 — Converte PDF em Markdown com OCR, snapshots e relatórios."
    )
    parser.add_argument("pdf", help="Caminho para o arquivo PDF")
    parser.add_argument(
        "--out", default=None,
        help="Pasta de saída (padrão: mesma pasta do PDF)"
    )
    parser.add_argument(
        "--lang", default="en",
        help=(
            "Idiomas OCR para easyocr (padrão: en). "
            "Use '+' ou ',' para múltiplos: en+pt. "
            "Códigos: en=inglês, pt=português."
        )
    )
    parser.add_argument(
        "--no-ocr", action="store_true",
        help="Desativar OCR mesmo que easyocr esteja instalado"
    )
    parser.add_argument(
        "--ocr-backend", default="easyocr",
        help="Backend OCR a usar (padrão: easyocr)"
    )
    parser.add_argument(
        "--snapshot-suspicious", action="store_true", default=True,
        help="Salvar snapshot de páginas suspeitas (padrão: ativo)"
    )
    parser.add_argument(
        "--no-snapshot-suspicious", action="store_false", dest="snapshot_suspicious",
        help="Desativar snapshots de páginas suspeitas"
    )
    parser.add_argument(
        "--min-text-chars", type=int, default=_DEFAULT_MIN_TEXT_CHARS,
        help=f"Mínimo de chars não-espaço para considerar texto nativo (padrão: {_DEFAULT_MIN_TEXT_CHARS})"
    )
    parser.add_argument(
        "--report", action="store_true", default=True,
        help="Gerar relatório JSON e MD por PDF (padrão: ativo)"
    )
    args = parser.parse_args()

    # ---- ENV diagnostics ----
    import os as _os
    _wsl_fs = "windows" if str(_os.getcwd()).startswith("/mnt/") else "linux"
    try:
        import torch as _t
        _cuda = _t.cuda.is_available()
    except ImportError:
        _cuda = False
    _easyocr_gpu = USE_GPU and _cuda
    print(f"[ENV] wsl_project_fs={_wsl_fs}")
    print(f"[ENV] torch_cuda_available={str(_cuda).lower()}")
    print(f"[ENV] easyocr_gpu={str(_easyocr_gpu).lower()}")
    if not _easyocr_gpu:
        print("[WARN] GPU indisponível; EasyOCR rodará em CPU")

    if not os.path.isfile(args.pdf):
        print(f"Erro: arquivo não encontrado: {args.pdf}", file=sys.stderr)
        sys.exit(1)

    use_ocr = not args.no_ocr
    langs = _parse_langs(args.lang)

    if use_ocr and not HAS_OCR:
        print(
            "Aviso: easyocr não instalado. OCR desativado.\n"
            "Para ativar: source .venv/bin/activate && pip install easyocr",
            file=sys.stderr,
        )
        use_ocr = False

    out_dir = args.out or os.path.dirname(os.path.abspath(args.pdf))

    result = pdf_to_markdown(
        args.pdf,
        out_dir,
        langs,
        use_ocr,
        min_text_chars=args.min_text_chars,
        snapshot_suspicious=args.snapshot_suspicious,
    )

    print(f"Markdown gerado: {os.path.join(out_dir, os.path.splitext(os.path.basename(args.pdf))[0] + '.md')}")
    print(f"Imagens em:      {os.path.join(out_dir, 'images', os.path.splitext(os.path.basename(args.pdf))[0])}")
    print(f"Relatório JSON:  {os.path.join(out_dir, 'reports', os.path.splitext(os.path.basename(args.pdf))[0] + '.report.json')}")
    print(f"Relatório MD:    {os.path.join(out_dir, 'reports', os.path.splitext(os.path.basename(args.pdf))[0] + '.report.md')}")


if __name__ == "__main__":
    main()
