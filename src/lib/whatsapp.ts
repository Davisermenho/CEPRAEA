import type { Training, Athlete, AttendanceRecord } from '@/types'
import { formatDateLong, formatDateCompact } from './utils'

function bold(text: string): string {
  return `*${text}*`
}

/** Gera anúncio pré-treino para o grupo */
export function gerarAnuncioTreino(
  training: Training,
  nomeEquipe: string,
  local?: string,
): string {
  const localStr = local || training.local || 'A confirmar'
  return `🏃 ${bold(nomeEquipe + ' — Treino Confirmado')}

📅 ${formatDateLong(training.data)}
⏰ ${training.horaInicio} às ${training.horaFim}
📍 ${localStr}

Confirme sua presença respondendo com ✅ ou ❌.

Até lá! 💪`
}

/** Gera mensagem para enviar individualmente à atleta com link de confirmação */
export function gerarMensagemConfirmacao(
  training: Training,
  athlete: Athlete,
  appUrl: string,
): string {
  const link = `${appUrl}/confirmar/${training.id}/${athlete.id}`
  const data = formatDateCompact(training.data)
  return `Olá, ${athlete.nome.split(' ')[0]}! 👋

Confirmando sua presença no treino de ${bold(data)} às ${bold(training.horaInicio)}?

Acesse o link para confirmar:
${link}`
}

/** Gera pedido de confirmação coletivo listando todas as atletas */
export function gerarPedidoConfirmacaoGrupo(
  training: Training,
  athletes: Athlete[],
): string {
  const ativas = athletes.filter((a) => a.status === 'ativo')
  const lista = ativas.map((a) => `• ${a.nome}`).join('\n')
  return `✅ ${bold('Confirmação de Presença')}

Treino: ${bold(formatDateCompact(training.data))} — ${training.horaInicio} às ${training.horaFim}

Por favor, confirmem presença:
${lista}

Responda com seu nome + ✅ (vou) ou ❌ (não vou).`
}

/** Gera resumo pós-treino */
export function gerarResumoPresenca(
  training: Training,
  records: AttendanceRecord[],
  athletes: Athlete[],
): string {
  const atletaMap = new Map(athletes.map((a) => [a.id, a]))
  const ativas = athletes.filter((a) => a.status === 'ativo')

  const presentes = records
    .filter((r) => r.status === 'presente')
    .map((r) => atletaMap.get(r.atletaId)?.nome ?? '?')

  const ausentes = records
    .filter((r) => r.status === 'ausente')
    .map((r) => atletaMap.get(r.atletaId)?.nome ?? '?')

  const justificados = records
    .filter((r) => r.status === 'justificado')
    .map((r) => atletaMap.get(r.atletaId)?.nome ?? '?')

  const pct =
    ativas.length > 0 ? Math.round((presentes.length / ativas.length) * 100) : 0

  return `📊 ${bold('Resumo do Treino — ' + formatDateCompact(training.data))}

✅ Presentes (${presentes.length}): ${presentes.join(', ') || '—'}
❌ Ausentes (${ausentes.length}): ${ausentes.join(', ') || '—'}
⚠️ Justificados (${justificados.length}): ${justificados.join(', ') || '—'}

📈 Frequência: ${bold(pct + '%')}`
}

/** Abre o WhatsApp com texto pré-preenchido */
export function abrirWhatsApp(text: string, telefone?: string): void {
  const encoded = encodeURIComponent(text)
  const url = telefone
    ? `https://wa.me/55${telefone.replace(/\D/g, '')}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

/** Copia texto para clipboard */
export async function copiarTexto(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
