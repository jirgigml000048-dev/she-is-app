#!/bin/bash
uv run /opt/homebrew/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "A delicate, poetic, and restrained watercolor/light illustration of a young 19-year-old girl standing alone at night on a Seoul city street. View from behind/silhouette, no face shown. She feels overgrown but wishes to be small. The atmosphere is lonely but peaceful ('alone is okay too'). Strict color palette: deep purple (#532058) and rose purple (#a8408b) as the base/shadows, cold blue (#0b8ba4) acting as neon or street light source, pink purple (#f9bff2) for soft highlights/glow, and tiny specks of lemon yellow (#efe957) for distant city lights. Texture: film grain, watercolor feel, realistic and artistic, absolutely no AI plastic/glossy look." \
  --filename "/Users/gigi/.openclaw/workspace/shared/she-is-app/illustrations/story-queqie.png" \
  --aspect-ratio 4:5 \
  --resolution 1K
