#!/usr/bin/env bash
# Fails if a release JS bundle from the normal entry point contains the mock backend (MSW).
# Demo builds (index.demo.js) are the only release bundles allowed to include it. ADR 0004.
set -euo pipefail
cd "$(dirname "$0")/../.."
out="$(mktemp -d)"
trap 'rm -rf "$out"' EXIT

for platform in android ios; do
  pnpm exec react-native bundle --entry-file index.js --platform "$platform" --dev false --minify true \
    --bundle-output "$out/$platform.js" --assets-dest "$out/assets" > "$out/$platform.log" 2>&1 \
    || { cat "$out/$platform.log"; exit 1; }
  # Strings only the mock backend contains (src/mocks/native.ts and MSW itself).
  if grep -q -e 'Serving API requests from src/mocks' -e '\[MSW\]' "$out/$platform.js"; then
    echo "✖ The $platform release bundle contains the mock backend. Only index.demo.js may import src/mocks."
    exit 1
  fi
  echo "✔ $platform release bundle has no mock backend"
done
