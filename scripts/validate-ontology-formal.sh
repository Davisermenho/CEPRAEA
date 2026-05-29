#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
from rdflib import Graph

files = [
    "ontology/core.ttl",
    "shacl/core.shacl.ttl",
    "examples/minimal-data.ttl",
    "examples/invalid-data.ttl",
    "examples/golden/scout-live-real-valid.ttl",
    "examples/golden/scout-live-real-invalid.ttl",
]

for file_path in files:
    graph = Graph()
    graph.parse(file_path, format="turtle")
    print(f"[OK] parsed {file_path} with {len(graph)} triples")
PY

pyshacl -s shacl/core.shacl.ttl -e ontology/core.ttl -m -f human examples/minimal-data.ttl
pyshacl -s shacl/core.shacl.ttl -e ontology/core.ttl -m -f human examples/golden/scout-live-real-valid.ttl

set +e
INVALID_OUTPUT="$(
  pyshacl -s shacl/core.shacl.ttl -e ontology/core.ttl -m -f human examples/invalid-data.ttl 2>&1
)"
INVALID_STATUS=$?
set -e

printf '%s\n' "$INVALID_OUTPUT"
if [ "$INVALID_STATUS" -eq 0 ]; then
  echo "Expected invalid ontology dataset to fail SHACL validation."
  exit 1
fi
printf '%s\n' "$INVALID_OUTPUT" | grep -q "Conforms: False"
echo "[OK] invalid-data.ttl failed SHACL as expected"

set +e
GOLDEN_INVALID_OUTPUT="$(
  pyshacl -s shacl/core.shacl.ttl -e ontology/core.ttl -m -f human examples/golden/scout-live-real-invalid.ttl 2>&1
)"
GOLDEN_INVALID_STATUS=$?
set -e

printf '%s\n' "$GOLDEN_INVALID_OUTPUT"
if [ "$GOLDEN_INVALID_STATUS" -eq 0 ]; then
  echo "Expected golden invalid scout dataset to fail SHACL validation."
  exit 1
fi
printf '%s\n' "$GOLDEN_INVALID_OUTPUT" | grep -q "Conforms: False"
echo "[OK] scout-live-real-invalid.ttl failed SHACL as expected"

python3 - <<'PY'
import json
from pathlib import Path
from rdflib import Graph

manifest = json.loads(Path("queries/competency/tests.json").read_text(encoding="utf-8"))

datasets = manifest["datasets"]
ontology_files = manifest["ontology"]

def term_to_string(value):
    if hasattr(value, "toPython"):
        py_value = value.toPython()
        if isinstance(py_value, str):
            return py_value
    return str(value)

for test in manifest["tests"]:
    graph = Graph()
    for ontology_file in ontology_files:
        graph.parse(ontology_file, format="turtle")
    graph.parse(datasets[test["dataset"]], format="turtle")
    for extra_graph in test.get("extra_graphs", []):
        graph.parse(extra_graph, format="turtle")

    query = Path(test["query"]).read_text(encoding="utf-8")
    rows = list(graph.query(query))
    assertion = test["assert"]

    if "row_count_eq" in assertion and len(rows) != assertion["row_count_eq"]:
        raise SystemExit(f"{test['id']}: expected {assertion['row_count_eq']} rows, got {len(rows)}")
    if "row_count_gte" in assertion and len(rows) < assertion["row_count_gte"]:
        raise SystemExit(f"{test['id']}: expected at least {assertion['row_count_gte']} rows, got {len(rows)}")

    expected_rows = assertion.get("expected_rows", [])
    if expected_rows:
        variable_names = [str(var) for var in rows[0].labels] if rows else []
        actual = [
            {variable_names[index]: term_to_string(value) for index, value in enumerate(row)}
            for row in rows
        ]
        for expected in expected_rows:
            if expected not in actual:
                raise SystemExit(f"{test['id']}: missing expected row {expected}; actual={actual}")

    print(f"[OK] {test['id']}: row_count={len(rows)}")
PY
