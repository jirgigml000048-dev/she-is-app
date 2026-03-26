#!/bin/bash
# Stitch conversion helper - reads original HTML and rewrites with Stitch template
BASE="/Users/gigi/.openclaw/workspace/shared/she-is-app"

convert_story() {
  local FILE="$1" VOL="$2" COVER="$3" AUDIO="$4" EN="$5"
  local TITLE=$(grep -o '<title>[^<]*' "$BASE/$FILE" | head -1 | sed 's/<title>//' | sed 's/ | .*//')
  echo "Processing $FILE -> $TITLE"
  # Extract article body text between <article and </article>
  local BODY=$(sed -n '/<article/,/<\/article>/p' "$BASE/$FILE" | sed 's/<article[^>]*>//;s/<\/article>//')
  echo "  body extracted: $(echo "$BODY" | wc -c) chars"
}

convert_story "story-tuanzi-v3.html" "001" "cover-001-tuanzi" "story-tuanzi" "Wrong Equations"
convert_story "story-xiaochen.html" "002" "cover-002-xiaochen" "story-xiaochen" "The Angry Girl"
convert_story "story-zixingche.html" "003" "cover-003-zixingche" "story-zixingche" "The Cyborg at 30"
convert_story "story-xiaoli.html" "004" "cover-004-xiaoli" "story-xiaoli" "Her Own Star"
convert_story "story-bingbing.html" "005" "cover-005-bingbing" "story-bingbing" "Mecha in a Pleated Skirt"
convert_story "story-xiuxiu.html" "006" "cover-006-xiuxiu" "story-xiuxiu" "Permission Not to Grow Up"
echo "Done"
