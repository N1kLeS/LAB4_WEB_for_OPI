#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

paths=(
  ".gradle"
  "build"
  "target"
  "dist"
  "out"
  "backend/build"
  "backend/bin"
  "backend/target"
  "buildSrc/.gradle"
  "buildSrc/build"
  "frontend/node_modules"
  "frontend/build"
  "frontend/dist"
  "frontend/.next"
  "functional-tests/node_modules"
  "functional-tests/playwright-report"
  "functional-tests/test-results"
  "coverage"
)

for path in "${paths[@]}"; do
  if [[ -e "$path" ]]; then
    rm -rf "$path"
    printf 'removed %s\n' "$path"
  fi
done

find . -name ".DS_Store" -type f -print -delete
find . -name "__MACOSX" -type d -prune -print -exec rm -rf {} +

printf 'done\n'
