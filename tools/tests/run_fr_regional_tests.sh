#!/usr/bin/env sh
# Regional (US/FR) support test suite for the Gen1Recomp Web/PWA build.
#
#   tools/tests/run_fr_regional_tests.sh [path/to/game.love]
#
# Unpacks the .love (default: the experimental FR build, then the stable one)
# into a temporary directory and runs the checks against the engine sources it
# actually ships, so the suite tests the artifact rather than a checkout.
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
love_file=${1:-}
if [ -z "$love_file" ]; then
  for candidate in "$root/game-v13.3-fr-regional-test.love" \
                   "$root/game-v13.3-viewport-final.love"; do
    [ -f "$candidate" ] && love_file="$candidate" && break
  done
fi
[ -n "$love_file" ] || { echo "no .love found; pass one as \$1" >&2; exit 2; }

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
unzip -q "$love_file" -d "$work"

lua=${LUA:-}
if [ -z "$lua" ]; then
  for candidate in luajit lua5.1 lua; do
    command -v "$candidate" >/dev/null 2>&1 && lua=$candidate && break
  done
fi
[ -n "$lua" ] || { echo "no lua interpreter found" >&2; exit 2; }

echo "suite   : regional US/FR"
echo "artifact: $love_file"
echo "lua     : $lua"
cd "$work"
exec "$lua" "$root/tools/tests/fr_regional_test.lua" "$work"
