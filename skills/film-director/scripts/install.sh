#!/usr/bin/env bash
# Installs everything film-director needs, once: the toolchain, the two engine skills pinned to an
# exact commit, their script dependencies from their lockfiles, and the headless Chromium.
# Safe to re-run: every step is skipped when it is already in place.
#   bash <skill>/scripts/install.sh          install or repair
#   bash <skill>/scripts/install.sh --check  report only, change nothing
set -euo pipefail

SKILL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR="$SKILL/vendor"
CHECK_ONLY=false
[ "${1:-}" = "--check" ] && CHECK_ONLY=true

# Engines are pinned by commit SHA, never by branch: a moving branch is a supply chain hole.
# To upgrade, read the upstream diff, then change the SHA here.
EMD_REPO="https://github.com/dev-isaacmello/extreme-motion-design"
EMD_SHA="5ae58839564de9df71b116026f5631b2c0b364e5"
REANIMATE_REPO="https://github.com/NiazMorshed2007/reanimate"
REANIMATE_SHA="3f7a55a2986a84ca2173e86ee9127eefe31d046d"
# The score's instruments: GeneralUser GS 2.0.3 by S. Christian Collins, from the author's own
# repository at a fixed commit, checked by hash so a changed file is refused, not played.
SOUNDFONT_URL="https://raw.githubusercontent.com/mrbumpy409/GeneralUser-GS/684543d5e5efaef08d02be50dcda8d552478fa60/GeneralUser-GS.sf2"
SOUNDFONT_SHA256="9575028c7a1f589f5770fccc8cff2734566af40cd26ed836944e9a5152688cfe"

say() { printf '%s\n' "$*"; }
fail() { say "FAIL: $*"; exit 1; }
has() { command -v "$1" >/dev/null 2>&1; }

need_tool() {
  local tool="$1" brew_name="$2" manual="$3"
  if has "$tool"; then say "ok    $tool"; return; fi
  $CHECK_ONLY && { say "miss  $tool"; MISSING=true; return; }
  # Homebrew only: piping a remote script into a shell is not something to do on someone's behalf.
  if has brew; then
    say "brew  install $brew_name"
    brew install "$brew_name"
  else
    fail "$tool is missing. Install it with: $manual"
  fi
}

node_major() { node -p 'process.versions.node.split(".")[0]'; }

fetch_pinned() {
  local name="$1" repo="$2" sha="$3" dir="$VENDOR/$1"
  if [ -d "$dir/.git" ] && [ "$(git -C "$dir" rev-parse HEAD)" = "$sha" ]; then
    say "ok    $name @ ${sha:0:7}"; return
  fi
  $CHECK_ONLY && { say "miss  $name @ ${sha:0:7}"; MISSING=true; return; }
  say "fetch $name @ ${sha:0:7}"
  rm -rf "$dir"
  git init -q "$dir"
  git -C "$dir" remote add origin "$repo"
  git -C "$dir" fetch -q --depth 1 origin "$sha"
  git -C "$dir" -c advice.detachedHead=false checkout -q FETCH_HEAD
  [ "$(git -C "$dir" rev-parse HEAD)" = "$sha" ] || fail "$name did not resolve to $sha"
}

sha256_of() { shasum -a 256 "$1" 2>/dev/null | cut -d' ' -f1 || sha256sum "$1" | cut -d' ' -f1; }

fetch_soundfont() {
  local file="$VENDOR/soundfont/GeneralUser-GS.sf2"
  if [ -f "$file" ] && [ "$(sha256_of "$file")" = "$SOUNDFONT_SHA256" ]; then
    say "ok    soundfont"; return
  fi
  $CHECK_ONLY && { say "miss  soundfont"; MISSING=true; return; }
  say "fetch soundfont (32 MB)"
  mkdir -p "$VENDOR/soundfont"
  curl -fsSL -o "$file.part" "$SOUNDFONT_URL"
  [ "$(sha256_of "$file.part")" = "$SOUNDFONT_SHA256" ] || { rm -f "$file.part"; fail "soundfont hash mismatch"; }
  mv "$file.part" "$file"
}

warm_python_scripts() {
  # Each engine script declares its own dependencies inline (PEP 723); syncing them now means
  # the first render does not stop halfway to download numpy or librosa.
  local script
  for script in "$VENDOR/extreme-motion-design/skills/extreme-motion-design/scripts/"*.py "$SKILL/scripts/"*.py; do
    grep -q '^# /// script' "$script" || continue
    uv sync -q --script "$script" || fail "could not install the dependencies of $(basename "$script")"
  done
  say "ok    python script dependencies"
}

install_reanimate_scripts() {
  local dir="$VENDOR/reanimate/skills/reanimate/scripts"
  # --frozen-lockfile: install exactly what upstream locked, never re-resolve its ranges.
  (cd "$dir" && bun install --silent --frozen-lockfile)
  bash "$dir/setup.sh" | tail -1
}

MISSING=false
say "film-director install ($SKILL)"
has git || fail "git is missing"
has node || fail "Node 18+ is missing (https://nodejs.org)"
[ "$(node_major)" -ge 18 ] || fail "Node 18+ is required, found $(node -v)"
say "ok    node $(node -v)"
need_tool ffmpeg ffmpeg "https://ffmpeg.org/download.html"
need_tool uv uv "https://docs.astral.sh/uv/getting-started/installation/"
need_tool bun oven-sh/bun/bun "https://bun.sh"
need_tool fluidsynth fluid-synth "https://www.fluidsynth.org"

mkdir -p "$VENDOR"
fetch_pinned extreme-motion-design "$EMD_REPO" "$EMD_SHA"
fetch_pinned reanimate "$REANIMATE_REPO" "$REANIMATE_SHA"
fetch_soundfont

if $CHECK_ONLY; then
  $MISSING && { say "not ready: run without --check"; exit 1; }
  [ -f "$VENDOR/.ready" ] || { say "not ready: run without --check"; exit 1; }
  say "ready"; exit 0
fi

warm_python_scripts
install_reanimate_scripts
printf 'extreme-motion-design %s\nreanimate %s\n' "$EMD_SHA" "$REANIMATE_SHA" > "$VENDOR/.ready"
say "ready: engines in $VENDOR"
