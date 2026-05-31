#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const schemaPath = path.resolve('docs/agent/EXECUTION_LOG_SCHEMA.json');
const inputPath = process.argv[2];

if (!inputPath) {
  console.error('Usage: node scripts/validate-execution-log.mjs <log-json-file>');
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const payload = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));

const entries = Array.isArray(payload) ? payload : [payload];

const required = schema.required || [];
const properties = schema.properties || {};

function fail(message) {
  console.error(`validate-execution-log: ${message}`);
  process.exit(1);
}

function assertType(value, type, field) {
  if (type === 'array' && !Array.isArray(value)) {
    fail(`field '${field}' must be array`);
  }
  if (type === 'object' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
    fail(`field '${field}' must be object`);
  }
  if (type !== 'array' && type !== 'object' && typeof value !== type) {
    fail(`field '${field}' must be ${type}`);
  }
}

for (const [index, entry] of entries.entries()) {
  for (const field of required) {
    if (!(field in entry)) {
      fail(`entry[${index}] missing required field '${field}'`);
    }
  }

  for (const [field, config] of Object.entries(properties)) {
    if (!(field in entry)) continue;
    if (config.type) {
      assertType(entry[field], config.type, field);
    }
    if (config.minItems && Array.isArray(entry[field]) && entry[field].length < config.minItems) {
      fail(`field '${field}' must contain at least ${config.minItems} items`);
    }
    if (config.enum && !config.enum.includes(entry[field])) {
      fail(`field '${field}' must be one of: ${config.enum.join(', ')}`);
    }
  }
}

console.log(`validate-execution-log: OK (${entries.length} entr${entries.length === 1 ? 'y' : 'ies'})`);
