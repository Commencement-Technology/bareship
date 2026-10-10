#!/usr/bin/env bash
# Fails if a built variant carries another environment's values (for example dev values in a prod build).
# Usage: scripts/ci/check-env.sh <flavor> <buildType>     e.g. scripts/ci/check-env.sh prod release
set -euo pipefail
flavor="$1"; build_type="$2"
namespace=$(grep -E '^\s*namespace\s+"' android/app/build.gradle | sed -E 's/.*"(.*)".*/\1/' | tr . /)
file="android/app/build/generated/source/buildConfig/$flavor/$build_type/$namespace/BuildConfig.java"
actual=$(grep -E 'String APP_ENV' "$file" | sed -E 's/.*"(.*)".*/\1/')
if [ "$actual" != "$flavor" ]; then
  echo "✗ $flavor$build_type was built with APP_ENV=$actual (expected $flavor). Check the env wiring in android/app/build.gradle."
  exit 1
fi
echo "✓ $flavor$build_type carries APP_ENV=$flavor"
