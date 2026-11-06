"""Builds the BUDE logo SVGs with all text converted to outlines.

Usage: python3 build_logos.py <serif-bold.ttf> <sans-semibold.ttf> <out-dir>
Fonts: Noto Serif Georgian Bold, Noto Sans Georgian SemiBold (Google Fonts, OFL).
"""
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

PINE, GLOW, MOSS, WHITE = "#1F3A2E", "#E4A33A", "#6F8466", "#F4F6F1"


def text_path(font, text, size, x, y, tracking=0.0):
    """Return (svg path d, width) for text with baseline at (x, y)."""
    gs, cmap = font.getGlyphSet(), font.getBestCmap()
    scale = size / font["head"].unitsPerEm
    pen = SVGPathPen(gs)
    cursor = 0.0
    for ch in text:
        name = cmap[ord(ch)]
        tp = TransformPen(pen, (scale, 0, 0, -scale, x + cursor, y))
        gs[name].draw(tp)
        cursor += gs[name].width * scale + tracking * size
    if tracking:
        cursor -= tracking * size
    return pen.getCommands(), cursor


def mark(ink, glow, ox=0, oy=0, s=1.0):
    """The nest mark: A-frame roof, lit arched window, two nest strokes. 120x120 grid."""
    g = f'<g transform="translate({ox} {oy}) scale({s})" fill="none" stroke-linecap="round" stroke-linejoin="round">'
    g += f'<path d="M20 90 L60 20 L100 90" stroke="{ink}" stroke-width="11"/>'
    g += f'<path d="M51 90 V75 a9 9 0 0 1 18 0 V90 Z" fill="{glow}" stroke="none"/>'
    g += f'<path d="M10 99 Q60 116 110 99" stroke="{ink}" stroke-width="7"/>'
    g += f'<path d="M30 109 Q60 118 90 109" stroke="{ink}" stroke-width="5"/>'
    return g + "</g>"


def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" '
            f'width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}">'
            f"<title>{title}</title>{body}</svg>\n")


def main(serif_path, sans_path, out):
    serif, sans = TTFont(serif_path), TTFont(sans_path)
    title = "ბუდე — BUDE cottages"

    # Horizontal lockup: mark (120) + gap + wordmark + tagline
    def horizontal(ink, glow, tag_ink):
        word, ww = text_path(serif, "ბუდე", 78, 150, 74)
        tag, tw = text_path(sans, "კოტეჯები · COTTAGES", 15, 152, 108, tracking=0.12)
        w = 150 + max(ww, tw) + 14
        body = mark(ink, glow) + f'<path d="{word}" fill="{ink}"/><path d="{tag}" fill="{tag_ink}"/>'
        return svg(w, 124, body, title)

    open(f"{out}/bude-logo.svg", "w").write(horizontal(PINE, GLOW, MOSS))
    open(f"{out}/bude-logo-white.svg", "w").write(horizontal(WHITE, GLOW, "#B9C7B2"))

    # Vertical lockup
    word, ww = text_path(serif, "ბუდე", 72, 0, 0)
    tag, tw = text_path(sans, "კოტეჯები · COTTAGES", 14, 0, 0, tracking=0.12)
    W = max(ww, tw, 140) + 40
    word, _ = text_path(serif, "ბუდე", 72, (W - ww) / 2, 200)
    tag, _ = text_path(sans, "კოტეჯები · COTTAGES", 14, (W - tw) / 2, 236, tracking=0.12)
    body = mark(PINE, GLOW, (W - 120) / 2, 8) + f'<path d="{word}" fill="{PINE}"/><path d="{tag}" fill="{MOSS}"/>'
    open(f"{out}/bude-logo-vertical.svg", "w").write(svg(W, 252, body, title))

    # Mark alone, and an app/favicon tile
    open(f"{out}/bude-mark.svg", "w").write(svg(120, 124, mark(PINE, GLOW), "ბუდე"))
    tile = f'<rect width="128" height="128" rx="28" fill="{PINE}"/>' + mark(WHITE, GLOW, 14, 10, 0.83)
    open(f"{out}/favicon.svg", "w").write(svg(128, 128, tile, "ბუდე"))


if __name__ == "__main__":
    main(*sys.argv[1:4])
