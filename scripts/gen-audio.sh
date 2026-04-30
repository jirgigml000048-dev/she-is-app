#!/bin/bash
# Generate missing story audio files using Edge TTS (YunjianNeural)
# Usage: cd she-is-app && bash scripts/gen-audio.sh
#
# Prerequisites: pip install edge-tts
# Voice: zh-CN-YunjianNeural (male, warm)

set -e
VOICE="zh-CN-YunjianNeural"
OUT_DIR="assets/audio"
mkdir -p "$OUT_DIR"

# Extract story text from HTML → plain text
extract_text() {
  python3 -c "
import re, html, sys
raw = open(sys.argv[1]).read()
text = re.sub(r'<script[^>]*>.*?</script>', '', raw, flags=re.DOTALL)
text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
match = re.search(r'<article[^>]*>(.*?)</article>', text, re.DOTALL)
if not match:
    match = re.search(r'story-section(.*?)(?=<footer|<div id=\"app-nav|$)', text, re.DOTALL)
content = match.group(1) if match else text
content = re.sub(r'<[^>]+>', ' ', content)
content = html.unescape(content)
content = re.sub(r'\s+', ' ', content).strip()
print(content[:8000])
" "$1"
}

# Stories to generate (output_name → source_html)
declare -A STORIES=(
  ["story-008"]="story-008.html"
  ["story-009"]="story-009.html"
  ["story-tantan"]="story-tantan.html"
  ["story-xiaoming"]="story-xiaoming.html"
  ["story-xiaozhou"]="story-xiaozhou.html"
)

for name in "${!STORIES[@]}"; do
  src="${STORIES[$name]}"
  out="$OUT_DIR/${name}.mp3"

  if [ -f "$out" ]; then
    echo "⏭  $name.mp3 already exists, skipping"
    continue
  fi

  if [ ! -f "$src" ]; then
    echo "⚠  $src not found, skipping"
    continue
  fi

  echo "🎙  Generating $name.mp3 from $src..."
  text=$(extract_text "$src")

  if [ ${#text} -lt 50 ]; then
    echo "⚠  $src has too little text (${#text} chars), skipping"
    continue
  fi

  echo "$text" > "/tmp/tts-${name}.txt"
  edge-tts --voice "$VOICE" --file "/tmp/tts-${name}.txt" --write-media "$out"
  echo "✅  $name.mp3 generated ($(du -h "$out" | cut -f1))"
done

echo ""
echo "Done. Now run:"
echo "  git add assets/audio/*.mp3"
echo "  git commit -m 'feat: generate missing story audio via Edge TTS'"
echo "  git push origin main"
