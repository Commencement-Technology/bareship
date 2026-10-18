#!/usr/bin/env bash
# Creates an app from the npm template the way a user would, and checks it (ADR 0001):
# pack → `cli init` → no "BareshipApp" left → app README with working links → pnpm install → bundle install → bootstrap → strip-examples
# → pnpm check. Takes a few minutes; no native build.
set -euo pipefail
cd "$(dirname "$0")/../.."
root="$PWD"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
export LANG="${LANG:-en_US.UTF-8}"

pnpm pack-template
tarball="$(ls "$root"/dist/npm/bareship-*.tgz)"
cd "$work"
node "$root/node_modules/@react-native-community/cli/build/bin.js" init AcmeShop \
  --template "file:$tarball" --pm npm --skip-install --install-pods false --skip-git-init > init.log 2>&1 \
  || { cat init.log; exit 1; }
cd AcmeShop

if grep -rIl -e BareshipApp -e bareshipapp -e bareship-app . ; then
  echo "✖ The template placeholder survived init in the files above"; exit 1
fi
grep -q 'PRODUCT_BUNDLE_IDENTIFIER = "com.acmeshop$(BUNDLE_ID_SUFFIX)"' ios/AcmeShop.xcodeproj/project.pbxproj \
  || { echo "✖ iOS bundle id lost its environment suffix"; exit 1; }
head -1 README.md | grep -qx '# AcmeShop' || { echo "✖ README.md isn't the app's README"; exit 1; }
node -e '
const fs = require("fs"), path = require("path");
const md = ["README.md", "AGENTS.md", ...fs.readdirSync("docs", { recursive: true }).map(f => path.join("docs", f))]
  .filter(f => f.endsWith(".md"));
let broken = 0;
for (const f of md)
  for (const [, link] of fs.readFileSync(f, "utf8").matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = link.split("#")[0];
    if (!target || /^[a-z]+:/.test(target)) continue;
    if (!fs.existsSync(path.join(path.dirname(f), target))) { console.log(`✖ ${f} links to missing ${link}`); broken++; }
  }
process.exit(broken ? 1 : 0);
'
test -f .gitignore || { echo "✖ .gitignore missing (npm drops it; the package ships _gitignore)"; exit 1; }

git init -q && git add -A && git -c user.name=ci -c user.email=ci@example.com commit -qm init --no-verify
pnpm install --frozen-lockfile
bundle install --quiet
# The quick start's case: no --name (init set it), and a bundle id that extends the package init made
# (com.acmeshop → com.acmeshop.app), so the Android package moves into a folder inside its old one.
pnpm bootstrap --bundle-id com.acmeshop.app --display-name "Acme Shop" --skip-pods
kotlin=android/app/src/main/java/com/acmeshop/app
test -f "$kotlin/MainActivity.kt" && test -f "$kotlin/MainApplication.kt" \
  || { echo "✖ bootstrap didn't move the Android package to $kotlin"; exit 1; }
test -z "$(find android/app/src/main/java -name '*.kt' -not -path "$kotlin/*")" \
  || { echo "✖ Kotlin files left outside $kotlin"; exit 1; }
grep -q '"name": "AcmeShop"' app.json && grep -q '"displayName": "Acme Shop"' app.json \
  || { echo "✖ app.json lost the name or display name"; exit 1; }
# A second run has nothing to rename, but must still set up iOS rather than stop.
pnpm bootstrap --bundle-id com.acmeshop.app --display-name "Acme Shop" --skip-pods | grep -q 'Setting up the iOS' \
  || { echo "✖ a second bootstrap run skipped the iOS setup"; exit 1; }
pnpm strip-examples
pnpm check
echo "✔ An app made from the template renames, strips and passes its checks"
