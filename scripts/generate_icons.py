#!/usr/bin/env python3
"""Generates the Tauri app icon set (Pengu's face on a soft aqua circle).

Writes src-tauri/icons/{32x32,128x128,128x128@2x}.png, icon.png, icon.ico, icon.icns.
Requires: pillow
"""
from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src-tauri" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

BODY = (126, 179, 245)  # blue Pengu
BELLY = (255, 255, 255)
BEAK = (255, 178, 70)
INK = (45, 49, 66)
BG = (223, 240, 255)


def pengu_icon(size: int) -> Image.Image:
    s = size * 4  # supersample
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = s / 2

    # soft rounded-square background
    d.rounded_rectangle([s * 0.02, s * 0.02, s * 0.98, s * 0.98], s * 0.24, fill=BG)

    # head
    d.ellipse([s * 0.14, s * 0.12, s * 0.86, s * 0.90], fill=BODY)
    # face patch
    d.ellipse([s * 0.22, s * 0.30, s * 0.78, s * 0.86], fill=BELLY)

    # eyes
    ew, ey = s * 0.075, s * 0.46
    for sx in (-1, 1):
        ex = cx + sx * s * 0.15
        d.ellipse([ex - ew, ey - ew * 1.2, ex + ew, ey + ew * 1.2], fill=INK)
        d.ellipse([ex - ew * 0.45, ey - ew * 0.8, ex - ew * 0.05, ey - ew * 0.2],
                  fill=(255, 255, 255))

    # blush
    for sx in (-1, 1):
        ex = cx + sx * s * 0.26
        d.ellipse([ex - s * 0.05, s * 0.56, ex + s * 0.05, s * 0.62],
                  fill=(255, 160, 170, 160))

    # beak
    d.polygon([(cx - s * 0.06, s * 0.56), (cx + s * 0.06, s * 0.56), (cx, s * 0.64)],
              fill=BEAK)

    return img.resize((size, size), Image.LANCZOS)


base = pengu_icon(1024)
base.save(OUT / "icon.png")
pengu_icon(32).save(OUT / "32x32.png")
pengu_icon(128).save(OUT / "128x128.png")
pengu_icon(256).save(OUT / "128x128@2x.png")
base.save(OUT / "icon.ico", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (256, 256)])
try:
    base.save(OUT / "icon.icns")
    print("wrote icns")
except Exception as e:
    print("icns skipped (run `npx tauri icon src-tauri/icons/icon.png` instead):", e)
print("icons written to", OUT)
