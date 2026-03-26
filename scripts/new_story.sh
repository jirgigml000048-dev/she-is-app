#!/bin/bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE="$BASE_DIR/story-detail.html"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/new_story.sh \
    --vol 009 \
    --slug story-xiaoming \
    --title-zh "小明：她在深夜学会了告别" \
    --title-en "Learning to Say Goodbye" \
    --cover cover-009-xiaoming \
    --audio story-xiaoming
EOF
}

VOL=""
SLUG=""
TITLE_ZH=""
TITLE_EN=""
COVER=""
AUDIO=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --vol)
      VOL="${2:-}"
      shift 2
      ;;
    --slug)
      SLUG="${2:-}"
      shift 2
      ;;
    --title-zh)
      TITLE_ZH="${2:-}"
      shift 2
      ;;
    --title-en)
      TITLE_EN="${2:-}"
      shift 2
      ;;
    --cover)
      COVER="${2:-}"
      shift 2
      ;;
    --audio)
      AUDIO="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

for value_name in VOL SLUG TITLE_ZH TITLE_EN COVER AUDIO; do
  if [[ -z "${!value_name}" ]]; then
    echo "Missing required argument: ${value_name}" >&2
    usage >&2
    exit 1
  fi
done

if [[ ! -f "$TEMPLATE" ]]; then
  echo "Template not found: $TEMPLATE" >&2
  exit 1
fi

if [[ "$SLUG" == *.html ]]; then
  OUTPUT_NAME="$SLUG"
else
  OUTPUT_NAME="$SLUG.html"
fi
OUTPUT_PATH="$BASE_DIR/$OUTPUT_NAME"

if [[ -f "$OUTPUT_PATH" ]]; then
  read -r -p "File $OUTPUT_NAME already exists. Overwrite? [y/N] " ANSWER
  case "$ANSWER" in
    y|Y|yes|YES)
      ;;
    *)
      echo "Cancelled."
      exit 0
      ;;
  esac
fi

python3 - "$TEMPLATE" "$OUTPUT_PATH" "$VOL" "$TITLE_ZH" "$TITLE_EN" "$COVER" "$AUDIO" <<'PY'
import html
import re
import sys
from pathlib import Path

_, template_arg, output_arg, vol, title_zh, title_en, cover, audio = sys.argv

template_path = Path(template_arg)
output_path = Path(output_arg)
raw = template_path.read_text(encoding='utf-8')

subtitle_zh = title_zh
for sep in ('：', ':'):
    if sep in subtitle_zh:
        subtitle_zh = subtitle_zh.split(sep, 1)[1].strip()
        break
subtitle_zh = subtitle_zh.strip()
if not subtitle_zh:
    raise SystemExit('中文标题副标题为空，请检查 --title-zh')

full_title_escaped = html.escape(title_zh, quote=True)
subtitle_zh_escaped = html.escape(subtitle_zh, quote=True)
title_en_escaped = html.escape(title_en, quote=True)
cover_path = f'assets/covers/{cover}.png'
audio_path = f'audio/{audio}.mp3'

replacements = [
    (
        '<title>曲奇：真空里的野蛮生长 | 女也 She Is</title>',
        f'<title>{full_title_escaped} | 女也 She Is</title>'
    ),
    (
        'alt="曲奇"',
        f'alt="{full_title_escaped}"'
    ),
    (
        'src="assets/covers/cover-007-quqi.png"',
        f'src="{cover_path}"'
    ),
    (
        'Volume 007 / 100位女孩',
        f'Volume {html.escape(vol, quote=True)} / 100位女孩'
    ),
    (
        '真空里的野蛮生长',
        subtitle_zh_escaped
    ),
    (
        'Feral Growth in a Vacuum',
        title_en_escaped
    ),
]

for old, new in replacements:
    if old not in raw:
        raise SystemExit(f'模板缺少预期内容，无法替换: {old}')
    raw = raw.replace(old, new, 1)

article_placeholder = '''<article class="px-8 max-w-3xl mx-auto space-y-16">
<section>
<p class="text-on-surface text-lg leading-[1.9] font-light mb-6"><!-- 在此粘贴正文内容 --></p>
</section>

<!-- 心灵寄语 + 留言区 -->
<section class="mt-24 p-8 bg-surface-container rounded-lg editorial-shadow">
<div class="mb-8">
<h5 class="font-headline text-2xl text-primary font-bold mb-1">A Moment for You</h5>
<p class="font-headline text-sm text-primary/40 mb-3">心灵寄语</p>
<div class="w-12 h-1 bg-secondary rounded-full"></div>
</div>
<!-- TODO: 心灵寄语中文引导语 -->
<!-- TODO: 心灵寄语英文引导语 -->
<!-- TODO: 留言提示文字 -->
<div class="relative mb-4">
<textarea class="w-full bg-surface-container-low border-0 border-b border-outline-variant/30 focus:ring-0 focus:bg-surface-container-highest transition-all duration-300 rounded-none py-4 px-0 min-h-[120px] text-on-surface placeholder:text-outline/40 font-body" placeholder="写点什么..."></textarea>
</div>
<div class="flex items-center gap-3">
  <button class="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-3 rounded-full bg-primary text-on-primary text-[10px] font-label font-bold uppercase tracking-wide whitespace-nowrap transition-colors" onclick="this.dataset.public = this.dataset.public === 'true' ? 'false' : 'true'; const isPublic = this.dataset.public === 'true'; this.querySelector('.icon').textContent = isPublic ? 'public' : 'lock'; this.querySelector('.label-text').textContent = isPublic ? 'Public / 公开' : 'Private / 仅自己'; this.classList.toggle('bg-primary', isPublic); this.classList.toggle('text-on-primary', isPublic); this.classList.toggle('bg-surface-container-high', !isPublic); this.classList.toggle('text-on-surface-variant', !isPublic);" data-public="true">
    <span class="material-symbols-outlined text-sm icon">public</span>
    <span class="label-text whitespace-nowrap">Public / 公开</span>
  </button>
  <button class="flex-1 min-w-0 py-3 px-3 bg-surface-container-high text-on-surface rounded-full font-label uppercase tracking-wide text-[10px] font-bold shadow-sm active:scale-95 transition-transform text-center whitespace-nowrap border border-outline/20">
    Save / 留下感悟
  </button>
</div>
</section>

<!-- Reader Comments -->
<section class="mt-12 space-y-6">
<h5 class="font-headline text-xl text-primary font-bold mb-2">Reflections <span class="text-base font-normal text-primary/40">/ 读者感悟</span></h5>

<article class="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
<div class="flex items-center gap-3 mb-3">
<div class="w-7 h-7 rounded-full bg-primary-container/20 flex items-center justify-center">
<span class="text-[10px] font-bold text-primary">?</span>
</div>
<span class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">Waiting for you</span>
</div>
<p class="font-body text-sm text-on-surface-variant leading-relaxed">你的感受，也许会照亮下一个读到这里的人。</p>
</article>
</section>

</article>'''

start_tag = '<article class="px-8 max-w-3xl mx-auto space-y-16">'
start_idx = raw.find(start_tag)
if start_idx == -1:
    raise SystemExit('未找到故事 article 区块，无法写入占位内容')

# Walk forward tracking nesting depth to find the matching </article>
depth = 0
i = start_idx
while i < len(raw):
    if raw[i:].startswith('<article'):
        depth += 1
        i += len('<article')
    elif raw[i:].startswith('</article>'):
        depth -= 1
        if depth == 0:
            end_idx = i + len('</article>')
            break
        i += len('</article>')
    else:
        i += 1
else:
    raise SystemExit('未找到 article 闭合标签，无法写入占位内容')

raw = raw[:start_idx] + article_placeholder + raw[end_idx:]
count = 1
if count != 1:
    raise SystemExit('未能替换 article 区块')

if 'id="bgAudio"' in raw:
    raw, count = re.subn(
        r'<audio id="bgAudio" loop>\s*<source src="[^"]+" type="audio/mpeg">\s*</audio>',
        f'<audio id="bgAudio" loop>\n  <source src="{audio_path}" type="audio/mpeg">\n</audio>',
        raw,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise SystemExit('检测到现有音频标签，但未能替换音频路径')
else:
    audio_block = f'''
<audio id="bgAudio" loop>
  <source src="{audio_path}" type="audio/mpeg">
</audio>
<script>
(function() {{
  const audio = document.getElementById('bgAudio');
  if (!audio) return;
  audio.volume = 0.35;
  audio.muted = true;
  audio.play().catch(function(){{}});
  let unmuted = false;
  function unmute() {{
    if (!unmuted) {{
      audio.muted = false;
      unmuted = true;
    }}
    document.removeEventListener('click', unmute);
    document.removeEventListener('touchstart', unmute);
  }}
  document.addEventListener('click', unmute);
  document.addEventListener('touchstart', unmute);
}})();
</script>
'''
    if '</body>' not in raw:
        raise SystemExit('模板缺少 </body>，无法注入音频模块')
    raw = raw.replace('</body>', f'{audio_block}\n</body>', 1)

output_path.write_text(raw, encoding='utf-8')
PY

echo "Created $OUTPUT_NAME"