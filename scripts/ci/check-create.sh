#!/usr/bin/env bash
# Creates apps with the installer the way a user would, from the packed tarballs, and checks them (ADR 0018):
# pack → `npx create-bareship-<v>.tgz AcmeShop` and `npx bareship-<v>.tgz BetaShop` → no "BareshipApp" left →
# bundle id set on both platforms → git repository with one commit → pnpm check. Bad input must fail early.
# Takes several minutes; no native build, no pod install. Nothing is published.
set -euo pipefail
cd "$(dirname "$0")/../.."
root="$PWD"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
export LANG="${LANG:-en_US.UTF-8}"

pnpm pack-template
version="$(node -p 'require("./package.json").version')"
template="$root/dist/npm/bareship-$version.tgz"
cli="$root/dist/npm/create-bareship-$version.tgz"
test -f "$template" && test -f "$cli" || { echo "✖ pack-template didn't write both tarballs"; exit 1; }

if tar tzf "$template" | grep -q '^package/template/packages/'; then
  echo "✖ The installer leaked into the template's app files"; exit 1
fi
tar xzf "$template" -O package/package.json | grep -q '"bareship": "bin/create-bareship.mjs"' \
  || { echo "✖ The bareship package has no bin"; exit 1; }
tar xzf "$template" -O package/README.md | head -1 | grep -q 'This is a template, not a library' \
  || { echo "✖ The npm README doesn't start with the template notice"; exit 1; }

cd "$work"
mkdir Taken
expect_fail() { # <message part> <args…>
  local want="$1"; shift
  if output="$(npx --yes --package "$cli" create-bareship "$@" --yes 2>&1)"; then echo "✖ accepted: $*"; exit 1; fi
  grep -q "$want" <<<"$output" || { echo "✖ $* failed without \"$want\":"; echo "$output"; exit 1; }
}
expect_fail "isn't a valid app name" acme
expect_fail "isn't a valid bundle id" Acme --bundle-id Acme.App
expect_fail "already exists" Taken
npx --yes --package "$cli" create-bareship --help | grep -q 'Usage' || { echo "✖ --help"; exit 1; }
npx --yes --package "$cli" create-bareship Acme --dry-run --yes --skip-checks | grep -q "init Acme --template bareship@$version" \
  || { echo "✖ --dry-run doesn't init from bareship@$version"; exit 1; }

verify() { # <package tarball> <bin> <Name> <bundle id> <display name>
  local package="$1" bin="$2" name="$3" bundle="$4" display="$5"
  npx --yes --package "$package" "$bin" "$name" --template "$template" --bundle-id "$bundle" --display-name "$display" \
    --yes --skip-pods
  cd "$work/$name"
  if grep -rIl --exclude-dir=node_modules --exclude-dir=.git -e BareshipApp -e bareshipapp -e bareship-app . ; then
    echo "✖ $name: the template placeholder survived in the files above"; exit 1
  fi
  grep -q "PRODUCT_BUNDLE_IDENTIFIER = \"$bundle\$(BUNDLE_ID_SUFFIX)\"" "ios/$name.xcodeproj/project.pbxproj" \
    || { echo "✖ $name: iOS bundle id isn't $bundle with its environment suffix"; exit 1; }
  grep -q "applicationId \"$bundle\"" android/app/build.gradle \
    || { echo "✖ $name: Android applicationId isn't $bundle"; exit 1; }
  local kotlin="android/app/src/main/java/${bundle//.//}"
  test -f "$kotlin/MainActivity.kt" || { echo "✖ $name: Android package not moved to $kotlin"; exit 1; }
  test -z "$(find android/app/src/main/java -name '*.kt' -not -path "$kotlin/*")" \
    || { echo "✖ $name: Kotlin files left outside $kotlin"; exit 1; }
  grep -q "\"displayName\": \"$display\"" app.json || { echo "✖ $name: display name not set"; exit 1; }
  test -f .gitignore || { echo "✖ $name: .gitignore missing"; exit 1; }
  test "$(git rev-list --count HEAD)" = 1 && test -z "$(git status --porcelain)" \
    || { echo "✖ $name: expected a clean git repository with one commit"; exit 1; }
  pnpm check
  cd "$work"
  echo "✔ $name, created with npx $bin, passes its checks"
}

git config --global user.name >/dev/null || export GIT_AUTHOR_NAME=ci GIT_COMMITTER_NAME=ci \
  GIT_AUTHOR_EMAIL=ci@example.com GIT_COMMITTER_EMAIL=ci@example.com
verify "$cli" create-bareship AcmeShop com.acmeshop.app "Acme Shop"
verify "$template" bareship BetaShop com.beta.shop "Beta"
echo "✔ create-bareship and the bareship bin create apps that pass their checks"
