#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const fileCandidates = {
  manual: [
    path.join(root, 'docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md'),
    path.join(root, 'docs/ontologia/manual-ontologia-handebol-de-praia.md'),
  ],
  glossary: [
    path.join(root, 'docs/ontologia/manuais/glossario-ontologico-controlado.md'),
    path.join(root, 'docs/ontologia/glossario-ontologico-controlado.md'),
  ],
  sources: [
    path.join(root, 'docs/ontologia/manuais/registro-fontes.md'),
    path.join(root, 'docs/ontologia/registro-fontes.md'),
  ],
  matrix: [
    path.join(root, 'docs/ontologia/manuais/matriz-relacoes.md'),
    path.join(root, 'docs/ontologia/matriz-relacoes.md'),
  ],
  svg: [
    path.join(root, 'docs/design/navegacao.drawio.svg'),
  ],
}

const defaultAllowedRelations = new Set([
  'is-a',
  'part-of',
  'influences',
  'causes',
  'structures',
  'enables',
  'opposes',
  'precedes',
  'requires',
  'has-attribute',
])

const errors = []
const warnings = []
const resolvedFiles = {}

function resolvePath(label, candidates) {
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i]
    if (fs.existsSync(candidate)) {
      if (i > 0) {
        warnings.push(`Fallback legado em uso para "${label}": ${candidate}`)
      }
      return candidate
    }
  }
  errors.push(`Falha ao resolver caminho para "${label}". Candidatos: ${candidates.join(' | ')}`)
  return ''
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    errors.push(`Falha ao ler arquivo: ${filePath} (${error.message})`)
    return ''
  }
}

function extractSection(text, startMarker, endMarker) {
  const startIndex = text.indexOf(startMarker)
  if (startIndex < 0) return ''
  const fromStart = text.slice(startIndex)
  const endIndex = fromStart.indexOf(endMarker)
  if (endIndex < 0) return fromStart
  return fromStart.slice(0, endIndex)
}

function parseAttributes(attrText) {
  const attrs = {}
  const attrRegex = /(\w+)="([^"]*)"/g
  let match
  while ((match = attrRegex.exec(attrText))) {
    attrs[match[1]] = match[2]
  }
  return attrs
}

function decodeXmlEntities(encoded) {
  return encoded
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
}

function parseMatrixRows(text) {
  const rows = []
  const lines = text.split('\n')
  for (const line of lines) {
    if (!/^\|\s*\d+\s*\|/.test(line)) continue
    const cols = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim())
    if (cols.length < 7) {
      errors.push(`Linha inválida na matriz (colunas insuficientes): ${line}`)
      continue
    }
    rows.push({
      number: cols[0],
      origin: cols[1].replaceAll('`', '').trim(),
      relation: cols[2].replaceAll('`', '').trim(),
      destination: cols[3].replaceAll('`', '').trim(),
      layer: cols[4].replaceAll('`', '').trim(),
      sources: cols[5].replaceAll('`', '').trim(),
    })
  }
  return rows
}

function parseRequiredEdgesFromManual(text) {
  const section = extractSection(text, '### 14.3 Arestas obrigatórias', '### 14.4')
  const edges = new Set()
  const rowRegex = /^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/gm
  let match
  while ((match = rowRegex.exec(section))) {
    const origin = match[1].trim()
    const relation = match[2].trim()
    const destination = match[3].trim()
    edges.add(`${origin}|${relation}|${destination}`)
  }
  return edges
}

function parseAcceptedRelationsFromGlossary(text) {
  const set = new Set()
  let foundAny = false

  // Formato textual em uma linha:
  // Tipos de relação aceitos: `is-a` | `part-of` | ...
  for (const match of text.matchAll(/Tipos de relação aceitos:\s*(.+)/g)) {
    foundAny = true
    const relRegex = /`([a-z-]+)`/g
    let relMatch
    while ((relMatch = relRegex.exec(match[1]))) {
      set.add(relMatch[1])
    }
  }

  // Formato em tabela markdown (resiliente a futuras mudanças de redação):
  // | `is-a` | descrição | direção |
  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*`([a-z-]+)`\s*\|/)
    if (!m) continue
    foundAny = true
    set.add(m[1])
  }

  if (set.size === 0) {
    if (!foundAny) {
      warnings.push('Lista de tipos de relação aceitos não encontrada no glossário; usando fallback interno.')
    } else {
      warnings.push('Lista de tipos de relação no glossário está vazia; usando fallback interno.')
    }
    return new Set(defaultAllowedRelations)
  }
  return set
}

function parseSourceIds(text) {
  const ids = new Set()
  const idRegex = /^###\s+([A-Z][A-Z0-9-]+)\s*$/gm
  let match
  while ((match = idRegex.exec(text))) {
    ids.add(match[1].trim())
  }
  return ids
}

function main() {
  for (const [label, candidates] of Object.entries(fileCandidates)) {
    resolvedFiles[label] = resolvePath(label, candidates)
  }

  if (errors.length > 0) {
    reportAndExit()
  }

  const manual = readText(resolvedFiles.manual)
  const glossary = readText(resolvedFiles.glossary)
  const sources = readText(resolvedFiles.sources)
  const matrix = readText(resolvedFiles.matrix)
  const svg = readText(resolvedFiles.svg)

  if (errors.length > 0) {
    reportAndExit()
  }

  const conceptsSection = extractSection(manual, '### 14.2 Vértices obrigatórios por banda', '### 14.3')
  if (!conceptsSection) {
    errors.push('Não foi possível extrair a seção 14.2 do manual.')
  }

  const manualConcepts = new Set()
  const manualConceptRegex = /`([A-Z][A-Za-z0-9_]+)`/g
  let manualMatch
  while ((manualMatch = manualConceptRegex.exec(conceptsSection))) {
    manualConcepts.add(manualMatch[1])
  }

  if (manualConcepts.size === 0) {
    errors.push('Nenhum conceito canônico encontrado na seção 14.2 do manual.')
  }

  const glossaryHeadings = [...glossary.matchAll(/^###\s+(.+)$/gm)].map((m) => m[1].trim())
  const glossaryConcepts = glossaryHeadings.filter((h) => /^[A-Z][A-Za-z0-9_]+$/.test(h) && h !== 'NomeDoConceito')
  const glossaryConceptSet = new Set(glossaryConcepts)
  if (glossaryConceptSet.size !== glossaryConcepts.length) {
    errors.push('Existem conceitos duplicados no glossário (headings repetidos).')
  }

  const sourceIds = parseSourceIds(sources)
  if (sourceIds.size === 0) {
    errors.push('Nenhum ID de fonte foi encontrado no registro de fontes.')
  }

  const matrixRows = parseMatrixRows(matrix)
  if (matrixRows.length === 0) {
    errors.push('Nenhuma relação numerada foi encontrada na matriz.')
  }

  const acceptedRelations = parseAcceptedRelationsFromGlossary(glossary)
  for (const relation of defaultAllowedRelations) {
    if (!acceptedRelations.has(relation)) {
      warnings.push(`Tipo de relação ausente na lista declarada do glossário: ${relation}`)
    }
  }

  const matrixConcepts = new Set()
  const matrixEdgeSet = new Set()
  for (const row of matrixRows) {
    matrixConcepts.add(row.origin)
    matrixConcepts.add(row.destination)
    matrixEdgeSet.add(`${row.origin}|${row.relation}|${row.destination}`)

    if (!acceptedRelations.has(row.relation)) {
      errors.push(`Tipo de relação inválido na matriz (#${row.number}): ${row.relation}`)
    }

    if (!row.sources || row.sources === '-' || row.sources === '—') {
      errors.push(`Fonte ausente na matriz (#${row.number}).`)
    } else {
      const rowSourceIds = row.sources
        .split(/[,;/]/)
        .map((s) => s.trim())
        .filter(Boolean)
      for (const id of rowSourceIds) {
        if (!sourceIds.has(id)) {
          errors.push(`Fonte inválida na matriz (#${row.number}): ${id}`)
        }
      }
    }
  }

  const glossaryRelationRegex = /`([A-Z][A-Za-z0-9_]+)`\s+([a-z-]+)\s+`([A-Z][A-Za-z0-9_]+)`/g
  let glossaryRelMatch
  while ((glossaryRelMatch = glossaryRelationRegex.exec(glossary))) {
    const relation = glossaryRelMatch[2]
    if (!acceptedRelations.has(relation)) {
      errors.push(`Tipo de relação inválido no glossário: ${glossaryRelMatch[0]}`)
    }
  }

  for (const sourceRef of glossary.matchAll(/\*\*Fonte\*\*:\s*([A-Z][A-Z0-9-]+)/g)) {
    const id = sourceRef[1]
    if (!sourceIds.has(id)) {
      errors.push(`Fonte inválida no glossário: ${id}`)
    }
  }

  const svgHostCount = (svg.match(/host="app\.diagrams\.net"/g) || []).length
  if (svgHostCount !== 1) {
    errors.push(`SVG inválido: esperado 1 host=\"app.diagrams.net\", encontrado ${svgHostCount}.`)
  }

  const svgContentMatch = svg.match(/content="([\s\S]*?)"\s*>\s*<defs\/>/)
  if (!svgContentMatch) {
    errors.push('SVG inválido: atributo content não encontrado no formato esperado.')
  }

  const encodedMxfile = svgContentMatch?.[1] ?? ''
  if (!encodedMxfile.startsWith('&lt;mxfile')) {
    errors.push('SVG inválido: content não inicia com mxfile HTML-encoded.')
  }

  const legacyCount = (svg.match(/\[draw\.io\]/g) || []).length
  if (legacyCount > 0) {
    errors.push('SVG inválido: contém formato legado [draw.io].')
  }

  const decodedMxfile = decodeXmlEntities(encodedMxfile)
  const cellMatches = [...decodedMxfile.matchAll(/<mxCell\b([^>]*)\/?>/g)]
  const idToConcept = new Map()
  const svgConceptSet = new Set()
  const edgeCells = []

  for (const match of cellMatches) {
    const attrs = parseAttributes(match[1])
    const value = attrs.value?.trim()

    if (attrs.vertex === '1' && value && /^[A-Z][A-Za-z0-9_]+$/.test(value)) {
      svgConceptSet.add(value)
      if (attrs.id) {
        idToConcept.set(attrs.id, value)
      }
    }

    if (attrs.edge === '1' && attrs.source && attrs.target && attrs.value) {
      edgeCells.push(attrs)
    }
  }

  const svgEdgeSet = new Set()
  for (const edge of edgeCells) {
    const relation = edge.value.trim()
    if (!acceptedRelations.has(relation)) continue
    const origin = idToConcept.get(edge.source)
    const destination = idToConcept.get(edge.target)
    if (origin && destination) {
      svgEdgeSet.add(`${origin}|${relation}|${destination}`)
    }
  }

  const missingInGlossary = [...manualConcepts].filter((c) => !glossaryConceptSet.has(c))
  const missingInMatrix = [...manualConcepts].filter((c) => !matrixConcepts.has(c))
  const missingInSvg = [...manualConcepts].filter((c) => !svgConceptSet.has(c))
  const extraInGlossary = [...glossaryConceptSet].filter((c) => !manualConcepts.has(c))

  for (const concept of missingInGlossary) {
    errors.push(`Conceito canônico ausente no glossário: ${concept}`)
  }
  for (const concept of missingInMatrix) {
    errors.push(`Conceito canônico ausente na matriz: ${concept}`)
  }
  for (const concept of missingInSvg) {
    errors.push(`Conceito canônico ausente no SVG: ${concept}`)
  }
  for (const concept of extraInGlossary) {
    warnings.push(`Conceito extra no glossário (fora da seção 14.2): ${concept}`)
  }

  const requiredEdges = parseRequiredEdgesFromManual(manual)
  if (requiredEdges.size === 0) {
    errors.push('Não foi possível extrair as arestas obrigatórias da seção 14.3 do manual.')
  }

  for (const edge of requiredEdges) {
    if (!matrixEdgeSet.has(edge)) {
      errors.push(`Aresta obrigatória ausente na matriz: ${edge}`)
    }
    if (!svgEdgeSet.has(edge)) {
      warnings.push(`Aresta obrigatória não encontrada no SVG (visualização): ${edge}`)
    }
  }

  reportAndExit({
    manualConcepts: manualConcepts.size,
    glossaryConcepts: glossaryConceptSet.size,
    matrixConcepts: matrixConcepts.size,
    svgConcepts: svgConceptSet.size,
    matrixEdges: matrixRows.length,
    requiredEdges: requiredEdges.size,
  })
}

function reportAndExit(summary = null) {
  if (summary) {
    console.log('=== Ontologia: Checagem Semântica ===')
    console.log(`Conceitos (manual): ${summary.manualConcepts}`)
    console.log(`Conceitos (glossário): ${summary.glossaryConcepts}`)
    console.log(`Conceitos (matriz): ${summary.matrixConcepts}`)
    console.log(`Conceitos (svg): ${summary.svgConcepts}`)
    console.log(`Relações (matriz): ${summary.matrixEdges}`)
    console.log(`Arestas obrigatórias (manual 14.3): ${summary.requiredEdges}`)
  }

  for (const warning of warnings) {
    console.warn(`WARN: ${warning}`)
  }
  for (const error of errors) {
    console.error(`ERROR: ${error}`)
  }

  if (errors.length > 0) {
    console.error(`\nFalha: ${errors.length} erro(s) encontrado(s).`)
    process.exit(1)
  }

  console.log(`\nOK: checagem semântica concluída sem erros (${warnings.length} aviso(s)).`)
}

main()
