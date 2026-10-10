#!/usr/bin/env bash
# Fails if any native library in the APK is not 16 KB page-aligned (Google Play requirement for
# apps targeting Android 15+). Uses zipalign's page-alignment check from the Android build tools.
set -euo pipefail
apk="$1"
build_tools="${ANDROID_HOME:-$HOME/Library/Android/sdk}/build-tools"
zipalign="$(ls -d "$build_tools"/*/ | sort -V | tail -1)zipalign"
"$zipalign" -c -P 16 -v 4 "$apk" | grep -E "lib/.*\.so" | grep -v "(OK" && { echo "✗ Unaligned native libraries above"; exit 1; }
echo "✓ All native libraries in $(basename "$apk") are 16 KB aligned"
