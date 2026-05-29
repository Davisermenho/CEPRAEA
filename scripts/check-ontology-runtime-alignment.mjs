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
  ontology: path.join(root, 'ontology/core.ttl'),
  packageJson: path.join(root, 'package.json'),
}

const errors = []

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

function assertAllRuntimeCodesPresent(label, codes, runtimeCodes) {
  for (const code of codes) {
    if (!runtimeCodes.has(code)) {
      errors.push(`${label} sem cepr:runtimeCode em ontology/core.ttl: ${code}`)
    }
  }
}

function main() {
  const types = readText('src/types/index.ts', files.types)
  const flowContract = readText('liveCollectionFlow.contract.ts', files.flowContract)
  const ontology = readText('ontology/core.ttl', files.ontology)
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

  const packageJson = JSON.parse(packageJsonText)
  const expectedScript = 'node scripts/check-ontology-runtime-alignment.mjs'
  if (packageJson.scripts?.['check:ontology:runtime-alignment'] !== expectedScript) {
    errors.push(`package.json deve expor "check:ontology:runtime-alignment": "${expectedScript}"`)
  }

  reportAndExit({
    phaseCodes: phaseCodes.length,
    finishTypeCodes: finishTypeCodes.length,
    factualResultCodes: factualResultCodes.length,
    flowIds: flowIds.length,
    runtimeCodes: runtimeCodes.size,
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
  }

  for (const error of errors) {
    console.error(`ERROR: ${error}`)
  }

  if (errors.length > 0) {
    console.error(`\nFalha: ${errors.length} erro(s) encontrado(s).`)
    process.exit(1)
  }

  console.log('\nOK: runtime e ontologia formal estão alinhados no escopo mínimo.')
}

main()
