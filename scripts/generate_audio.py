import os, sys, re, requests
from pathlib import Path
from html.parser import HTMLParser

API_KEY = os.environ.get('ELEVENLABS_API_KEY', '')
VOICE_ID = 'pFZP5JQG7iQjIQuC4Bku'  # Lily - Velvety Actress (premade, free)
MODEL_ID = 'eleven_multilingual_v2'
OUTPUT_DIR = Path('assets/audio')
OUTPUT_DIR.mkdir(exist_ok=True)

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.texts = []
        self.skip_tags = {'nav', 'footer', 'button', 'script', 'style', 'header'}
        self.skip_depth = 0
        self.in_article = False
        self.article_depth = 0
        self.article_stack = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        cls = attrs_dict.get('class', '')
        if tag in self.skip_tags:
            self.skip_depth += 1
        # detect reader-interaction sections to skip
        if 'reader' in cls or 'comment' in cls or 'share' in cls:
            self.skip_depth += 1
        if tag in ('article', 'main') and self.skip_depth == 0:
            self.in_article = True
        self.article_stack.append(tag)

    def handle_endtag(self, tag):
        if tag in self.skip_tags:
            self.skip_depth = max(0, self.skip_depth - 1)
        if self.article_stack:
            self.article_stack.pop()

    def handle_data(self, data):
        if self.skip_depth > 0:
            return
        text = data.strip()
        if text:
            self.texts.append(text)

def extract_text(html_path):
    content = open(html_path, encoding='utf-8').read()
    # Remove skip sections
    for tag in ['nav', 'footer', 'script', 'style', 'header']:
        content = re.sub(rf'<{tag}[^>]*>.*?</{tag}>', '', content, flags=re.DOTALL|re.IGNORECASE)
    # Remove reader interaction sections by class pattern
    content = re.sub(r'<[^>]+class="[^"]*reader[^"]*"[^>]*>.*?</[^>]+>', '', content, flags=re.DOTALL|re.IGNORECASE)
    # Extract article/main
    m = re.search(r'<article[^>]*>(.*?)</article>', content, re.DOTALL|re.IGNORECASE)
    if not m:
        m = re.search(r'<main[^>]*>(.*?)</main>', content, re.DOTALL|re.IGNORECASE)
    if m:
        content = m.group(1)
    # Strip HTML tags
    text = re.sub(r'<[^>]+>', ' ', content)
    # Collapse whitespace
    text = re.sub(r'\s+', '\n', text).strip()
    return text

def generate_audio(text, out_path):
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}'
    headers = {'xi-api-key': API_KEY, 'Content-Type': 'application/json'}
    payload = {
        'text': text[:4900],
        'model_id': MODEL_ID,
        'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75}
    }
    print(f'Calling ElevenLabs API for {out_path}...')
    r = requests.post(url, json=payload, headers=headers)
    if r.status_code != 200:
        print(f'ERROR {r.status_code}: {r.text[:200]}')
        return False
    out_path.write_bytes(r.content)
    print(f'Generated: {out_path} ({len(r.content)} bytes)')
    return True

# Process specified stories
stories_to_process = sys.argv[1:] if len(sys.argv) > 1 else []
if not stories_to_process:
    stories_to_process = sorted(str(p) for p in Path('.').glob('story-0*.html'))

for html_str in stories_to_process:
    html = Path(html_str)
    if not html.exists():
        print(f'Skip (not found): {html}')
        continue
    stem = html.stem  # e.g. story-008
    out = OUTPUT_DIR / f'{stem}.mp3'
    if out.exists():
        print(f'Skip (exists): {out}')
        continue
    text = extract_text(html)
    if len(text) < 100:
        print(f'Skip (too short): {html} ({len(text)} chars)')
        continue
    print(f'\n=== {html} ({len(text)} chars) ===')
    print(text[:200])
    generate_audio(text, out)

print('\nDone.')
