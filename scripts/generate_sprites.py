#!/usr/bin/env python3
"""
Generates the Pengu character sprite sheets (reference-accurate chibi penguins).

  boy  → blue Pengu     girl → pink Pengu

Rendering pipeline (for clean cartoon outlines like the reference art):
  * every body part is drawn as a grayscale MASK (union of ellipses/polygons)
  * the mask is painted in ink, then eroded (MinFilter) and painted in the
    part's fill colour → a perfectly uniform outline around arbitrary unions
  * parts are alpha-composited back-to-front; flippers are rotated layers

Output: public/characters/{boy,girl}/{walk,idle,blink,wave,happy,sad}.png
Sheets are horizontal strips of 256x256 frames (see src/animations/manifest.ts),
drawn in a 128-unit space at 8x supersampling, Lanczos-downscaled, on a fully
transparent background.

Requires: pillow  (pip install pillow)
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

UNIT = 128
SS = 8
CANVAS = UNIT * SS
OUT_F = 256
ROOT = Path(__file__).resolve().parent.parent / "public" / "characters"

INK = (38, 40, 48, 255)
WHITE = (255, 255, 255, 255)
CREASE = (216, 221, 230, 255)
BEAK = (255, 190, 70, 255)
BEAK_OPEN = (235, 120, 90, 255)
FEET = (255, 200, 70, 255)

PALETTES = {
    "boy": (130, 175, 243, 255),   # blue Pengu
    "girl": (247, 198, 217, 255),  # pink Pengu
}

OW_BODY = 1.9   # outline width (128-space units)
OW_SMALL = 1.4


def S(v):
    return v * SS


def erode(mask: Image.Image, units: float) -> Image.Image:
    k = 2 * int(round(S(units))) + 1
    return mask.filter(ImageFilter.MinFilter(k))


def part(shapes, fill, outline_units=OW_BODY, size=(CANVAS, CANVAS)) -> Image.Image:
    """Render shapes (callables drawing white on an L mask) as one outlined part."""
    mask = Image.new("L", size, 0)
    md = ImageDraw.Draw(mask)
    for shape in shapes:
        shape(md)
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    if outline_units:
        layer.paste(INK, (0, 0), mask)
        layer.paste(fill, (0, 0), erode(mask, outline_units))
    else:
        layer.paste(fill, (0, 0), mask)
    return layer


def ellipse(box):
    return lambda d: d.ellipse([S(v) for v in box], fill=255)


def polygon(pts):
    return lambda d: d.polygon([(S(x), S(y)) for x, y in pts], fill=255)


def flipper(body, length=42, width=15, angle=20, outline=OW_BODY) -> Image.Image:
    """A tapered flipper drawn tip-down, then rotated (deg, CCW)."""
    w, h = int(S(width)), int(S(length))
    mask = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(mask)
    # teardrop: rounded shoulder tapering to a rounded tip
    md.ellipse([0, 0, w, h * 0.48], fill=255)                                # shoulder
    md.polygon([(w * 0.02, h * 0.24), (w * 0.98, h * 0.24),
                (w * 0.74, h * 0.93), (w * 0.26, h * 0.93)], fill=255)       # taper
    md.ellipse([w * 0.22, h * 0.80, w * 0.78, h * 1.0], fill=255)            # tip
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    layer.paste(INK, (0, 0), mask)
    layer.paste(body, (0, 0), erode(mask, outline))
    return layer.rotate(angle, resample=Image.BICUBIC, expand=True)


def paste_center(base: Image.Image, layer: Image.Image, cx, cy):
    base.alpha_composite(layer, (int(S(cx)) - layer.width // 2,
                                 int(S(cy)) - layer.height // 2))


def draw_pengu(body, *, bob=0, leg_phase=0, eyes="open", mouth="closed",
               arm="down", brows="soft") -> Image.Image:
    """One 1024px frame of a reference-style chibi penguin (128-space)."""
    img = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    cx = 64
    top = 12 + bob
    bottom = 114 + bob

    # ---- raised flipper (behind the body, tip pointing up-and-out) ----------
    if arm == "wave":
        paste_center(img, flipper(body, angle=140), cx + 40, top + 18)
    elif arm == "up":
        paste_center(img, flipper(body, angle=140), cx + 39, top + 18)
        paste_center(img, flipper(body, angle=-140), cx - 39, top + 18)

    # ---- body: pear = head circle ∪ lower egg -------------------------------
    img.alpha_composite(part(
        [ellipse([cx - 27, top, cx + 27, top + 52]),          # head
         ellipse([cx - 34, top + 22, cx + 34, bottom])],       # belly egg
        body,
    ))

    # ---- white face + belly (one big inner pear, no outline) ----------------
    img.alpha_composite(part(
        [ellipse([cx - 21, top + 9, cx + 21, top + 50]),       # face
         ellipse([cx - 28, top + 28, cx + 28, bottom - 5])],   # belly
        WHITE, outline_units=0,
    ))

    # ---- belly crease (soft grey smile across the chest) ---------------------
    crease = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    ImageDraw.Draw(crease).arc(
        [S(cx - 21), S(top + 38), S(cx + 21), S(top + 66)],
        25, 155, fill=CREASE, width=int(S(1.5)),
    )
    img.alpha_composite(crease)

    # ---- hanging flippers (in front, tips flare slightly outward) ------------
    if arm == "down":
        paste_center(img, flipper(body, angle=-12), cx - 31, top + 58)
        paste_center(img, flipper(body, angle=12), cx + 31, top + 58)
    elif arm == "wave":
        paste_center(img, flipper(body, angle=-12), cx - 31, top + 58)

    # ---- feet (peeking out in front at the bottom) ---------------------------
    img.alpha_composite(part(
        [ellipse([cx - 25 + leg_phase, bottom - 7, cx - 3 + leg_phase, bottom + 6]),
         ellipse([cx + 3 - leg_phase, bottom - 7, cx + 25 - leg_phase, bottom + 6])],
        FEET, outline_units=OW_SMALL,
    ))

    # ---- face ----------------------------------------------------------------
    d = ImageDraw.Draw(img)
    ey = top + 30

    # brows — soft (idle) or worried (sad), thin short arcs
    bw = int(S(1.2))
    if brows == "worried":
        d.arc([S(cx - 19), S(ey - 12), S(cx - 6), S(ey - 3)], 240, 350, fill=INK, width=bw)
        d.arc([S(cx + 6), S(ey - 12), S(cx + 19), S(ey - 3)], 190, 300, fill=INK, width=bw)
    else:
        d.arc([S(cx - 18), S(ey - 11), S(cx - 6), S(ey - 3)], 210, 320, fill=INK, width=bw)
        d.arc([S(cx + 6), S(ey - 11), S(cx + 18), S(ey - 3)], 220, 330, fill=INK, width=bw)

    # eyes — rounded teardrops with a glint
    if eyes == "open":
        d.ellipse([S(cx - 16), S(ey - 4), S(cx - 8), S(ey + 7)], fill=INK)
        d.ellipse([S(cx + 8), S(ey - 4), S(cx + 16), S(ey + 7)], fill=INK)
        d.ellipse([S(cx - 14.2), S(ey - 2.4), S(cx - 11.4), S(ey + 1)], fill=WHITE)
        d.ellipse([S(cx + 9.8), S(ey - 2.4), S(cx + 12.6), S(ey + 1)], fill=WHITE)
    elif eyes == "half":
        d.rounded_rectangle([S(cx - 16), S(ey), S(cx - 8), S(ey + 6)], S(1.8), fill=INK)
        d.rounded_rectangle([S(cx + 8), S(ey), S(cx + 16), S(ey + 6)], S(1.8), fill=INK)
    else:  # closed — happy ^^
        aw = int(S(1.9))
        d.arc([S(cx - 17), S(ey - 3), S(cx - 7), S(ey + 7)], 190, 350, fill=INK, width=aw)
        d.arc([S(cx + 7), S(ey - 3), S(cx + 17), S(ey + 7)], 190, 350, fill=INK, width=aw)

    # beak — small rounded kite with a flat top seam (open when delighted)
    by = ey + 7
    if mouth == "big":
        img.alpha_composite(part(
            [ellipse([cx - 6.5, by - 1, cx + 6.5, by + 9])],
            BEAK_OPEN, outline_units=OW_SMALL,
        ))
        d.ellipse([S(cx - 4.5), S(by), S(cx + 4.5), S(by + 4)], fill=BEAK)
    else:
        img.alpha_composite(part(
            [polygon([(cx - 8.5, by + 1.5), (cx - 4, by - 2), (cx + 4, by - 2),
                      (cx + 8.5, by + 1.5), (cx + 2.5, by + 9.5), (cx - 2.5, by + 9.5)])],
            BEAK, outline_units=OW_SMALL,
        ))
        d.line([S(cx - 8), S(by + 1.5), S(cx + 8), S(by + 1.5)], fill=INK, width=int(S(0.9)))

    # sad little mouth under the beak
    if mouth == "sad":
        d.arc([S(cx - 5), S(by + 12), S(cx + 5), S(by + 19)], 200, 340,
              fill=INK, width=int(S(1.3)))

    # ---- hair tuft: three short strokes on the crown -------------------------
    hw = int(S(1.3))
    d.line([S(cx - 3), S(top + 1.5), S(cx - 5), S(top - 5)], fill=INK, width=hw)
    d.line([S(cx + 1), S(top + 0.5), S(cx + 2), S(top - 6.5)], fill=INK, width=hw)
    d.line([S(cx + 5), S(top + 1.5), S(cx + 8), S(top - 4.5)], fill=INK, width=hw)

    return img


def render_frame(char, kw) -> Image.Image:
    return draw_pengu(PALETTES[char], **kw).resize((OUT_F, OUT_F), Image.LANCZOS)


def sheet(name, char, frames):
    img = Image.new("RGBA", (OUT_F * len(frames), OUT_F), (0, 0, 0, 0))
    for i, kw in enumerate(frames):
        img.paste(render_frame(char, kw), (i * OUT_F, 0))
    out = ROOT / char / f"{name}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    print("wrote", out)


def main():
    for char in ("boy", "girl"):
        sheet("walk", char, [
            dict(leg_phase=lp, bob=b)
            for lp, b in [(-7, 0), (-4, -2), (0, 0), (7, 0), (4, -2), (0, 0)]
        ])
        sheet("idle", char, [dict(bob=b) for b in (0, -2, -3, -2)])
        sheet("blink", char, [dict(eyes=e) for e in ("open", "half", "closed")])
        sheet("wave", char, [
            dict(arm="wave", bob=b, mouth="big",
                 eyes="closed" if i % 3 == 2 else "open")
            for i, b in enumerate((0, -2, 0, -2, 0, -2))
        ])
        sheet("happy", char, [dict(arm="up", mouth="big", eyes="closed", bob=b)
                              for b in (0, -4, -6, -3)])
        sheet("sad", char, [dict(mouth="sad", eyes="open", brows="worried", bob=b)
                            for b in (2, 3)])


if __name__ == "__main__":
    main()
