#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const files = {
  types: path.join(root, 'src/types/index.ts'),
  flowContract: path.join(root, 'src/features/scout/domain/liveCollectionFlow.contract.ts'),
  compatibilityMatrix: path.join(root, 'src/features/scout/domain/liveCollectionCompatibility.matrix.ts'),
  ontology: path.join(root, 'ontology/core.ttl'),
  shacl: path.join(root, 'shacl/core.shacl.ttl'),
  auditedValid: path.join(root, 'examples/golden/scout-audited-flows-valid.ttl'),
  auditedInvalid: path.join(root, 'examples/golden/scout-audited-flows-invalid.ttl'),
  competencyTests: path.join(root, 'queries/competency/tests.json'),
  packageJson: path.join(root, 'package.json'),
}

const errors = []
const warnings = []

function readText(label, filePath) {
  if (!fs.existsSync(filePath)) {
    errors.push(`Arquivo obrigatório ausente (${label}): ${filePath}`)
    return ''
  }
  return fs.readFileSync(filePath, 'utf8')
}

function extractUnionLiterals(source, typeName) {
  const declaration = source.match(new RegExp(`export\\s+type\\s+${typeName}\\s*=([\\s\\S]*?)(?:\\nexport\\s+type\\s+|\\nexport\\s+interface\\s+|\\n\\n|$)`))
  if (!declaration) {
    errors.push(`Tipo TypeScript não encontrado: ${typeName}`)
    return []
  }

  return [...declaration[1].matchAll(/'([^']+)'/g)].map((match) => match[1])
}

function extractRuntimeCodes(ttl) {
  return new Set([...ttl.matchAll(/cepr:runtimeCode\s+"([^"]+)"/g)].map((match) => match[1]))
}

function extractRuntimeIriMap(ttl, rdfType) {
  const map = new Map()
  const statements = ttl.split(/\.\s*(?:\n|$)/)

  for (const statement of statements) {
    if (!statement.includes(`a ${rdfType}`) || !statement.includes('cepr:runtimeCode')) continue

    const iriMatch = statement.match(/cepr:([A-Za-z0-9_]+)/)
    const runtimeMatch = statement.match(/cepr:runtimeCode\s+"([^"]+)"/)
    if (iriMatch && runtimeMatch) {
      map.set(runtimeMatch[1], `cepr:${iriMatch[1]}`)
    }
  }

  return map
}

function assertAllRuntimeCodesPresent(label, codes, runtimeCodes) {
  for (const code of codes) {
    if (!runtimeCodes.has(code)) {
      errors.push(`${label} sem cepr:runtimeCode em ontology/core.ttl: ${code}`)
    }
  }
}

function findBalancedObject(source, marker) {
  const markerIndex = source.indexOf(marker)
  if (markerIndex === -1) return ''

  const start = source.indexOf('{', markerIndex)
  if (start === -1) return ''

  let depth = 0
  for (let i = start; i < source.length; i += 1) {
    const char = source[i]
    if (char === '{') depth += 1
    if (char === '}') depth -= 1
    if (depth === 0) return source.slice(start, i + 1)
  }

  return ''
}

function extractStringArray(block, key) {
  const keyIndex = block.indexOf(`${key}:`)
  if (keyIndex === -1) return []

  const start = block.indexOf('[', keyIndex)
  if (start === -1) return []

  let depth = 0
  for (let i = start; i < block.length; i += 1) {
    const char = block[i]
    if (char === '[') depth += 1
    if (char === ']') depth -= 1
    if (depth === 0) {
      return [...block.slice(start, i + 1).matchAll(/'([^']+)'/g)].map((match) => match[1])
    }
  }

  return []
}

function extractLiteralProperty(block, key) {
  return block.match(new RegExp(`${key}:\\s*'([^']+)'`))?.[1] ?? null
}

function extractFlowContracts(flowContractSource, flowIds) {
  return flowIds.map((flowId) => {
    const block = findBalancedObject(flowContractSource, `'${flowId}':`)
    if (!block) errors.push(`Contrato vivo não encontrado para fluxo auditado: ${flowId}`)

    return {
      flowId,
      block,
      phase: extractLiteralProperty(block, 'phase'),
      category: extractLiteralProperty(block, 'category'),
      action: extractLiteralProperty(block, 'action'),
      allowedFinishTypes: extractStringArray(block, 'allowedFinishTypes'),
      allowedResults: extractStringArray(block, 'allowedResults'),
    }
  })
}

function extractAuditedMatrixActionBlock(matrixSource, contract) {
  const phaseBlock = findBalancedObject(matrixSource, `${contract.phase}:`)
  if (!phaseBlock) return ''

  const categoryBlock = findBalancedObject(phaseBlock, `${contract.category}:`)
  if (!categoryBlock) return ''

  return findBalancedObject(categoryBlock, `${contract.action}:`)
}

function extractShaclSparqlBlocks(shacl) {
  return [...shacl.matchAll(/sh:select\s+"""([\s\S]*?)"""/g)].map((match) => match[1])
}

function extractCeprTerms(source, prefix) {
  return new Set([...source.matchAll(new RegExp(`cepr:${prefix}[A-Za-z0-9_]+`, 'g'))].map((match) => match[0]))
}

function findShaclBlocksForFlow(shaclBlocks, flowIri) {
  return shaclBlocks.filter((block) => block.includes(flowIri))
}

function findFinishValidationBlock(shaclBlocks, flowIri) {
  return shaclBlocks.find((block) => block.includes(flowIri) && block.includes('hasFinishType')) ?? ''
}

function findResultValidationBlocks(shaclBlocks, flowIri) {
  return shaclBlocks.filter((block) => block.includes(flowIri) && block.includes('hasFactualResult'))
}

function addCoverageWarning(message) {
  if (!warnings.includes(message)) warnings.push(message)
}

function assertSetEqual(label, actual, expected) {
  for (const item of expected) {
    if (!actual.has(item)) errors.push(`${label}: ausente ${item}`)
  }

  for (const item of actual) {
    if (!expected.has(item)) errors.push(`${label}: item inesperado ${item}`)
  }
}

function assertTextContains(label, text, token) {
  if (!text.includes(token)) errors.push(`${label}: token ausente ${token}`)
}

function parseJson(label, text) {
  try {
    return JSON.parse(text)
  } catch (error) {
    errors.push(`${label}: JSON inválido (${error.message})`)
    return null
  }
}

function main() {
  const types = readText('src/types/index.ts', files.types)
  const flowContract = readText('liveCollectionFlow.contract.ts', files.flowContract)
  const compatibilityMatrix = readText('liveCollectionCompatibility.matrix.ts', files.compatibilityMatrix)
  const ontology = readText('ontology/core.ttl', files.ontology)
  const shacl = readText('shacl/core.shacl.ttl', files.shacl)
  const auditedValid = readText('examples/golden/scout-audited-flows-valid.ttl', files.auditedValid)
  const auditedInvalid = readText('examples/golden/scout-audited-flows-invalid.ttl', files.auditedInvalid)
  const competencyTestsText = readText('queries/competency/tests.json', files.competencyTests)
  const packageJsonText = readText('package.json', files.packageJson)

  if (errors.length > 0) reportAndExit()

  const runtimeCodes = extractRuntimeCodes(ontology)
  const phaseCodes = extractUnionLiterals(types, 'ScoutPhaseCode')
  const finishTypeCodes = extractUnionLiterals(types, 'ScoutFinishTypeCode')
  const factualResultCodes = extractUnionLiterals(types, 'ScoutFactualResultCode')
  const flowIds = extractUnionLiterals(flowContract, 'LiveCollectionFlowId')

  assertAllRuntimeCodesPresent('ScoutPhaseCode', phaseCodes, runtimeCodes)
  assertAllRuntimeCodesPresent('ScoutFinishTypeCode', finishTypeCodes, runtimeCodes)
  assertAllRuntimeCodesPresent('ScoutFactualResultCode', factualResultCodes, runtimeCodes)
  assertAllRuntimeCodesPresent('LiveCollectionFlowId', flowIds, runtimeCodes)

  const forbiddenCanonicalClasses = [
    'cepr:SpinShot',
    'cepr:InFlightShot',
    'cepr:Throw',
  ]

  for (const term of forbiddenCanonicalClasses) {
    const classPattern = new RegExp(`${term.replace(':', ':')}\\s+a\\s+owl:Class\\b`)
    if (classPattern.test(ontology)) {
      errors.push(`Conceito proibido reapareceu como classe canônica: ${term}`)
    }
  }

  const packageJson = parseJson('package.json', packageJsonText)
  const competencyTests = parseJson('queries/competency/tests.json', competencyTestsText)

  const expectedScript = 'node scripts/check-ontology-runtime-alignment.mjs'
  if (packageJson?.scripts?.['check:ontology:runtime-alignment'] !== expectedScript) {
    errors.push(`package.json deve expor "check:ontology:runtime-alignment": "${expectedScript}"`)
  }

  const flowIris = extractRuntimeIriMap(ontology, 'cepr:ScoutFlowContract')
  const phaseIris = extractRuntimeIriMap(ontology, 'cepr:ScoutPhase')
  const finishIris = extractRuntimeIriMap(ontology, 'cepr:ScoutFinishType')
  const resultIris = extractRuntimeIriMap(ontology, 'cepr:ScoutFactualResult')
  const shaclBlocks = extractShaclSparqlBlocks(shacl)
  const contracts = extractFlowContracts(flowContract, flowIds)
  const cq05 = competencyTests?.tests?.find((test) => test.id === 'CEPR-CQ-05')

  if (!cq05) {
    errors.push('queries/competency/tests.json sem teste CEPR-CQ-05 para fluxos auditados')
  }

  for (const contract of contracts) {
    const flowIri = flowIris.get(contract.flowId)
    if (!flowIri) {
      errors.push(`Fluxo auditado sem indivíduo cepr:ScoutFlowContract em ontology/core.ttl: ${contract.flowId}`)
      continue
    }

    const expectedPhaseIri = phaseIris.get(contract.phase)
    if (!expectedPhaseIri) errors.push(`Fase do fluxo ${contract.flowId} sem IRI ontológico: ${contract.phase}`)

    assertTextContains(`SHACL sem referência ao fluxo auditado ${contract.flowId}`, shacl, flowIri)
    assertTextContains(`Dataset válido sem fluxo auditado ${contract.flowId}`, auditedValid, flowIri)
    assertTextContains(`Dataset inválido sem fluxo auditado ${contract.flowId}`, auditedInvalid, flowIri)
    assertTextContains(`CEPR-CQ-05 sem fluxo auditado ${contract.flowId}`, JSON.stringify(cq05 ?? {}), contract.flowId)

    const flowShaclBlocks = findShaclBlocksForFlow(shaclBlocks, flowIri)
    if (flowShaclBlocks.length === 0) {
      errors.push(`Fluxo auditado sem constraint SPARQL em SHACL: ${contract.flowId}`)
    }

    if (expectedPhaseIri) {
      const hasPhaseConstraint = flowShaclBlocks.some((block) => block.includes('hasScoutPhase') && block.includes(expectedPhaseIri))
      if (!hasPhaseConstraint) {
        errors.push(`Fluxo auditado sem constraint de fase esperada em SHACL: ${contract.flowId} -> ${contract.phase}`)
      }
    }

    const finishValidationBlock = findFinishValidationBlock(shaclBlocks, flowIri)
    if (contract.allowedFinishTypes.length > 0) {
      if (!finishValidationBlock) {
        errors.push(`Fluxo auditado sem constraint de tipo de finalização em SHACL: ${contract.flowId}`)
      } else {
        const expectedFinishIris = new Set(contract.allowedFinishTypes.map((code) => finishIris.get(code)).filter(Boolean))
        if (expectedFinishIris.size !== contract.allowedFinishTypes.length) {
          const missing = contract.allowedFinishTypes.filter((code) => !finishIris.has(code))
          errors.push(`Fluxo ${contract.flowId} referencia tipoFinalizacao sem IRI ontológico: ${missing.join(', ')}`)
        }

        const shaclFinishIris = extractCeprTerms(finishValidationBlock, 'finish_')
        assertSetEqual(`Constraint SHACL de finishTypes contradiz contrato ${contract.flowId}`, shaclFinishIris, expectedFinishIris)
      }
    }

    for (const resultCode of contract.allowedResults) {
      const resultIri = resultIris.get(resultCode)
      if (!resultIri) {
        errors.push(`Fluxo ${contract.flowId} referencia resultado factual sem IRI ontológico: ${resultCode}`)
      }
    }

    const matrixActionBlock = extractAuditedMatrixActionBlock(compatibilityMatrix, contract)
    if (!matrixActionBlock) {
      errors.push(`Matriz TypeScript sem ação auditada ${contract.phase}.${contract.category}.${contract.action}`)
    } else {
      const matrixAllowedFinishTypes = extractStringArray(matrixActionBlock, 'allowedFinishTypes')
      const matrixAllowedResults = extractStringArray(matrixActionBlock, 'allowedResults')
      const matrixForbiddenResults = extractStringArray(matrixActionBlock, 'forbiddenResults')

      assertSetEqual(
        `Contrato vivo e matriz divergem em allowedFinishTypes ${contract.flowId}`,
        new Set(contract.allowedFinishTypes),
        new Set(matrixAllowedFinishTypes),
      )
      assertSetEqual(
        `Contrato vivo e matriz divergem em allowedResults ${contract.flowId}`,
        new Set(contract.allowedResults),
        new Set(matrixAllowedResults),
      )

      for (const forbiddenResult of matrixForbiddenResults) {
        const forbiddenIri = resultIris.get(forbiddenResult)
        if (!forbiddenIri) {
          errors.push(`forbiddenResult sem IRI ontológico em ${contract.flowId}: ${forbiddenResult}`)
          continue
        }

        const resultBlocks = findResultValidationBlocks(shaclBlocks, flowIri)
        const coveredByShacl = resultBlocks.some((block) => block.includes(forbiddenIri))
        const coveredByInvalidDataset = auditedInvalid.includes(flowIri) && auditedInvalid.includes(forbiddenIri)

        if (!coveredByShacl && !coveredByInvalidDataset) {
          addCoverageWarning(`forbiddenResult ainda sem cobertura SHACL/dataset inválido em ${contract.flowId}: ${forbiddenResult}`)
        }
      }
    }
  }

  reportAndExit({
    phaseCodes: phaseCodes.length,
    finishTypeCodes: finishTypeCodes.length,
    factualResultCodes: factualResultCodes.length,
    flowIds: flowIds.length,
    runtimeCodes: runtimeCodes.size,
    shaclSparqlBlocks: shaclBlocks.length,
    auditedFlows: contracts.length,
  })
}

function reportAndExit(summary = null) {
  console.log('=== Ontologia: Alinhamento Runtime ===')
  if (summary) {
    console.log(`ScoutPhaseCode: ${summary.phaseCodes}`)
    console.log(`ScoutFinishTypeCode: ${summary.finishTypeCodes}`)
    console.log(`ScoutFactualResultCode: ${summary.factualResultCodes}`)
    console.log(`LiveCollectionFlowId: ${summary.flowIds}`)
    console.log(`cepr:runtimeCode: ${summary.runtimeCodes}`)
    console.log(`SHACL SPARQL constraints: ${summary.shaclSparqlBlocks}`)
    console.log(`Fluxos auditados verificados: ${summary.auditedFlows}`)
    console.log(`Pendências de cobertura formal: ${warnings.length}`)
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

  console.log('\nOK: runtime, matriz TypeScript, SHACL, exemplos e SPARQL estão alinhados no escopo auditado bloqueante.')
}

main()
