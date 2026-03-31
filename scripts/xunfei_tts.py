#!/usr/bin/env python3
"""
讯飞 WebSocket TTS 生成脚本
支持长文本分段发送，生成 story-008-xunfei.mp3
"""
import websocket
import hashlib
import base64
import hmac
import json
import threading
from datetime import datetime
from urllib.parse import urlencode
from pathlib import Path
import sys

APPID = "76769fa2"
API_KEY = "61fce16a21ad4df33fd83a725b1fc60e"
API_SECRET = "OTZhZWY0MDQ0NzA4NTAwZTJkMDYxMjA0"

SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
OUTPUT_PATH = PROJECT_DIR / "assets" / "audio" / "story-008-xunfei.mp3"
TEXT_FILE = Path("/tmp/text-008.txt")

CHUNK_SIZE = 7000  # bytes, safe limit per request


def create_url():
    url = "wss://tts-api.xfyun.cn/v2/tts"
    now = datetime.now()
    date = now.strftime("%a, %d %b %Y %H:%M:%S GMT")
    sig_origin = f"host: tts-api.xfyun.cn\ndate: {date}\nGET /v2/tts HTTP/1.1"
    sig_sha = hmac.new(API_SECRET.encode(), sig_origin.encode(), hashlib.sha256).digest()
    sig = base64.b64encode(sig_sha).decode()
    auth_origin = (
        f'api_key="{API_KEY}", algorithm="hmac-sha256", '
        f'headers="host date request-line", signature="{sig}"'
    )
    auth = base64.b64encode(auth_origin.encode()).decode()
    params = {"authorization": auth, "date": date, "host": "tts-api.xfyun.cn"}
    return url + "?" + urlencode(params)


def tts_chunk(text_chunk: str) -> bytes:
    """Convert a single text chunk to MP3 bytes via WebSocket."""
    audio_parts = []
    done = threading.Event()
    errors = []

    def on_message(ws, msg):
        data = json.loads(msg)
        if data.get("code") != 0:
            errors.append(f"code={data.get('code')} msg={data.get('message','')}")
            done.set()
            return
        payload = data.get("data", {})
        if payload.get("audio"):
            audio_parts.append(base64.b64decode(payload["audio"]))
        if payload.get("status") == 2:
            done.set()

    def on_error(ws, error):
        errors.append(str(error))
        done.set()

    def on_close(ws, *args):
        done.set()

    def on_open(ws):
        ws.send(json.dumps({
            "common": {"app_id": APPID},
            "business": {
                "aue": "lame",
                "auf": "audio/L16;rate=16000",
                "vcn": "xiaoyan",
                "speed": 50,
                "volume": 50,
                "pitch": 50,
                "tte": "UTF8",
                "sfl": 1,
            },
            "data": {
                "status": 2,
                "text": base64.b64encode(text_chunk.encode("utf-8")).decode(),
            },
        }))

    ws = websocket.WebSocketApp(
        create_url(),
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
    )
    t = threading.Thread(target=ws.run_forever)
    t.daemon = True
    t.start()
    done.wait(timeout=120)
    ws.close()

    if errors:
        raise RuntimeError(f"TTS errors: {errors}")
    return b"".join(audio_parts)


def split_text(text: str, max_bytes: int = CHUNK_SIZE) -> list:
    """Split text into chunks of at most max_bytes UTF-8 bytes, split at sentence boundaries."""
    chunks = []
    current = []
    current_bytes = 0
    # Split by sentence-ending punctuation
    import re
    sentences = re.split(r'(?<=[。！？\.\!\?])', text)
    for sent in sentences:
        b = sent.encode("utf-8")
        if current_bytes + len(b) > max_bytes and current:
            chunks.append("".join(current))
            current = [sent]
            current_bytes = len(b)
        else:
            current.append(sent)
            current_bytes += len(b)
    if current:
        chunks.append("".join(current))
    return chunks


def main():
    if not TEXT_FILE.exists():
        print(f"ERROR: {TEXT_FILE} not found", file=sys.stderr)
        sys.exit(1)

    text = TEXT_FILE.read_text(encoding="utf-8").strip()
    total_bytes = len(text.encode("utf-8"))
    print(f"总文本大小: {total_bytes:,} 字节")

    chunks = split_text(text)
    print(f"分段数: {len(chunks)}")

    all_audio = []
    for i, chunk in enumerate(chunks, 1):
        print(f"处理第 {i}/{len(chunks)} 段 ({len(chunk.encode())} bytes)...")
        audio = tts_chunk(chunk)
        all_audio.append(audio)
        print(f"  → {len(audio):,} bytes 音频")

    output = b"".join(all_audio)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_bytes(output)
    print(f"\n✅ 完成！总音频大小: {len(output):,} bytes")
    print(f"   保存至: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
