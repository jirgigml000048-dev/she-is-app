from __future__ import annotations

import shutil
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent

STORIES = [
    {
        "file": "story-tuanzi-v3.html",
        "volume": "Vol.001",
        "title": "团子：她身体里住着一道错误的方程",
        "subtitle": "Wrong Equations",
    },
    {
        "file": "story-xiaochen.html",
        "volume": "Vol.002",
        "title": "小陈：世界需要\"愤怒\"的女孩",
        "subtitle": "The Angry Girl",
    },
    {
        "file": "story-zixingche.html",
        "volume": "Vol.003",
        "title": "自行车：30岁却像15岁的赛博格",
        "subtitle": "The Cyborg at 30",
    },
    {
        "file": "story-xiaoli.html",
        "volume": "Vol.004",
        "title": "小李：她决定在精密结构里，自己养一颗星星",
        "subtitle": "Her Own Star",
    },
    {
        "file": "story-bingbing.html",
        "volume": "Vol.005",
        "title": "冰冰：穿百褶裙的机甲驾驶员",
        "subtitle": "Mecha in a Pleated Skirt",
    },
    {
        "file": "story-xiuxiu.html",
        "volume": "Vol.006",
        "title": "嗅嗅：在北京，允许不长大",
        "subtitle": "Permission Not to Grow Up",
    },
]


def esc(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def p_html(text: str, extra: str = "mb-8") -> str:
    return f'<p class="text-lg leading-[1.9] font-light text-[#1c1c1a] {extra}">{esc(text)}</p>'


def quote_html(text: str, extra: str = "mb-8") -> str:
    return (
        f'<blockquote class="border-l-[3px] border-[#9c3c62] pl-5 italic text-lg '
        f'leading-[1.9] font-light text-[#33185c] {extra}">{esc(text)}</blockquote>'
    )


def image_html(src: str, alt: str) -> str:
    return (
        '<figure class="my-10 overflow-hidden rounded-[2rem] bg-white/60 shadow-[0_24px_80px_rgba(51,24,92,0.08)] border border-[#33185c]/10">'
        f'<img src="{esc(src)}" alt="{esc(alt)}" class="w-full h-auto object-cover">'
        '</figure>'
    )


def convert_section(node: Tag) -> str:
    num = node.select_one('.story-section-num')
    label = node.select_one('.sec-label')
    formula = node.select_one('.story-formula')
    label_text = label.get_text(' ', strip=True) if label else ''
    formula_text = formula.get_text(' ', strip=True) if formula else ''
    return (
        '<section class="pt-6 mt-14">'
        '<div class="flex items-baseline gap-4 mb-6">'
        f'<span class="text-6xl md:text-7xl font-headline text-[#9c3c62] leading-none">{esc(num.get_text(strip=True) if num else "")}</span>'
        '<div class="min-w-0">'
        f'<h3 class="font-headline text-2xl md:text-3xl text-[#33185c] font-bold leading-tight">{esc(label_text)}</h3>'
        f'<p class="mt-2 text-sm uppercase tracking-[0.22em] text-[#33185c]/55">{esc(formula_text)}</p>'
        '</div>'
        '</div>'
        '</section>'
    )


def extract_first_image(soup: BeautifulSoup) -> str | None:
    for img in soup.select('img'):
        src = (img.get('src') or '').strip()
        if src:
            return src
    return None


def build_body(article: Tag) -> str:
    chunks: list[str] = []
    first_text_block = True
    for child in article.children:
        if isinstance(child, NavigableString):
            continue
        if not isinstance(child, Tag):
            continue
        classes = child.get('class', [])
        text = child.get_text(' ', strip=True)
        if child.name == 'p' and text:
            chunks.append(p_html(text, "mb-8" if first_text_block else "mb-7"))
            first_text_block = False
        elif child.name == 'blockquote' and text:
            chunks.append(quote_html(text, "mb-8"))
        elif child.name == 'section' and 'story-section' in classes:
            chunks.append(convert_section(child))
        elif child.name == 'div' and 'story-illus' in classes:
            img = child.find('img')
            if img and img.get('src'):
                chunks.append(image_html(img['src'], img.get('alt') or ''))
        elif child.name == 'div' and 'equation' in classes and text:
            chunks.append(
                f'<div class="my-8 rounded-[1.5rem] border border-[#33185c]/15 bg-white/70 px-5 py-4 text-base md:text-lg font-medium tracking-[0.02em] text-[#33185c] shadow-sm">{esc(text)}</div>'
            )
        elif text:
            chunks.append(p_html(text))
    return '\n'.join(chunks)


def build_html(meta: dict, original_html: str) -> str:
    soup = BeautifulSoup(original_html, 'html.parser')
    story_body = soup.select_one('.story-body')
    if story_body is None:
        raise ValueError(f".story-body not found in {meta['file']}")

    hero_img = extract_first_image(soup)
    body_html = build_body(story_body)
    hero_media = ''
    if hero_img:
        hero_media = f'<img src="{esc(hero_img)}" alt="{esc(meta["title"])}" class="absolute inset-0 h-full w-full object-cover opacity-30">'

    title = meta['title']
    subtitle = meta['subtitle']
    volume = meta['volume']
    return f'''<!DOCTYPE html>
<html class="light" lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{esc(title)} | 女也 She Is</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Noto+Serif+SC:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {{
      theme: {{
        extend: {{
          colors: {{
            primary: '#33185c',
            secondary: '#9c3c62',
            surface: '#fcf9f6'
          }},
          fontFamily: {{
            headline: ['Noto Serif', 'Noto Serif SC', 'serif'],
            body: ['Plus Jakarta Sans', 'Noto Serif SC', 'sans-serif']
          }}
        }}
      }}
    }}
  </script>
  <style>
    body {{ -webkit-font-smoothing: antialiased; background: #fcf9f6; }}
    .material-symbols-outlined {{ font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }}
  </style>
</head>
<body class="bg-surface text-[#1c1c1a] font-body selection:bg-[#33185c]/20">
  <header class="fixed inset-x-0 top-0 z-50 border-b border-[#33185c]/10 bg-[#fcf9f6]/85 backdrop-blur-xl">
    <div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-6">
      <a href="/stories" class="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#33185c] transition hover:bg-[#33185c]/5" aria-label="返回故事列表">
        <span class="material-symbols-outlined">arrow_back</span>
      </a>
      <div class="text-center text-[#33185c]">
        <div class="font-headline text-xl font-bold leading-none">女也</div>
        <div class="mt-1 text-[10px] uppercase tracking-[0.28em] text-[#33185c]/55">She Is</div>
      </div>
      <button id="shareButton" class="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#33185c] transition hover:bg-[#33185c]/5" aria-label="分享故事">
        <span class="material-symbols-outlined">share</span>
      </button>
    </div>
  </header>

  <main class="pb-32 pt-16">
    <section class="relative isolate flex h-[70vh] min-h-[520px] items-end overflow-hidden">
      <div class="absolute inset-0 bg-[linear-gradient(135deg,#33185c_0%,#5c2c73_36%,#9c3c62_72%,#f0d6d8_100%)]"></div>
      {hero_media}
      <div class="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#fcf9f6]"></div>
      <div class="relative z-10 mx-auto w-full max-w-5xl px-6 pb-12 sm:px-8 md:pb-14">
        <p class="mb-4 text-sm uppercase tracking-[0.35em] text-white/80">{esc(volume)} / Stitch Edition</p>
        <h1 class="max-w-4xl font-headline text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">{esc(title)}</h1>
        <p class="mt-4 font-headline text-xl italic text-white/78 sm:text-2xl">{esc(subtitle)}</p>
      </div>
    </section>

    <article class="mx-auto max-w-3xl px-6 py-12 sm:px-8">
      <div class="rounded-[2rem] border border-[#33185c]/10 bg-white/60 p-6 shadow-[0_30px_80px_rgba(51,24,92,0.07)] sm:p-8 md:p-10">
        {body_html}
      </div>
    </article>
  </main>

  <div class="fixed bottom-6 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
    <a href="/stories" class="flex items-center justify-center gap-2 rounded-full bg-[#33185c] px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_20px_60px_rgba(51,24,92,0.28)] transition hover:bg-[#44206f]">
      <span class="material-symbols-outlined text-[20px]">arrow_back</span>
      返回故事列表
    </a>
  </div>

  <script>
    document.getElementById('shareButton')?.addEventListener('click', async () => {{
      const shareData = {{ title: document.title, text: '{esc(title)} | 女也 She Is', url: window.location.href }};
      try {{
        if (navigator.share) {{
          await navigator.share(shareData);
          return;
        }}
        await navigator.clipboard.writeText(window.location.href);
        alert('链接已复制');
      }} catch (error) {{
        console.error(error);
      }}
    }});
  </script>
</body>
</html>
'''


def convert_story(meta: dict) -> tuple[str, str]:
    path = ROOT / meta['file']
    if not path.exists():
        return meta['file'], 'missing'
    original = path.read_text(encoding='utf-8')
    backup = path.with_suffix(path.suffix + '.bak')
    shutil.copy2(path, backup)
    new_html = build_html(meta, original)
    path.write_text(new_html, encoding='utf-8')
    return meta['file'], 'converted'


if __name__ == '__main__':
    for meta in STORIES:
        name, status = convert_story(meta)
        print(f'{name}: {status}')
