"""Builds the PITSRULI logo SVGs with all text converted to outlines.

Usage: python3 build_logos.py <wordmark-font> <tagline-font> <out-dir> [<intl-wordmark-font> <intl-tagline-font>]
Fonts: BPG Tech 05 Caps (fonts/bpg-tech-05-caps.woff2) for the wordmark,
Noto Sans Georgian SemiBold (Google Fonts, OFL) for the tagline.
Optional English/Russian lockups: Oswald SemiBold + Noto Sans SemiBold (Google Fonts, OFL).
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
    """The pitsruli mark: an A-frame roof filled with boards; the top board is lit. 120x120 grid."""
    g = f'<g transform="translate({ox} {oy}) scale({s})" fill="none" stroke-linecap="round" stroke-linejoin="round">'
    g += f'<path d="M14 100 L60 18 L106 100" stroke="{ink}" stroke-width="11"/>'
    g += f'<path d="M54 58 H66" stroke="{glow}" stroke-width="8"/>'
    g += f'<path d="M46 73 H74 M38 88 H82" stroke="{ink}" stroke-width="8"/>'
    g += f'<path d="M4 112 H116" stroke="{ink}" stroke-width="7"/>'
    return g + "</g>"


def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" '
            f'width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}">'
            f"<title>{title}</title>{body}</svg>\n")


def main(serif_path, sans_path, out, intl_word_path=None, intl_tag_path=None):
    serif, sans = TTFont(serif_path), TTFont(sans_path)
    title = "ფიცრული — PITSRULI cottages"

    # Horizontal lockup: mark (120) + gap + wordmark + tagline
    def horizontal(ink, glow, tag_ink):
        word, ww = text_path(serif, "ფიცრული", 78, 150, 74)
        tag, tw = text_path(sans, "კოტეჯები · COTTAGES", 15, 152, 112, tracking=0.12)
        w = 150 + max(ww, tw) + 14
        body = mark(ink, glow) + f'<path d="{word}" fill="{ink}" stroke="{ink}" stroke-width="2.2" stroke-linejoin="round"/><path d="{tag}" fill="{tag_ink}"/>'
        return svg(w, 128, body, title)

    open(f"{out}/pitsruli-logo.svg", "w").write(horizontal(PINE, GLOW, MOSS))
    open(f"{out}/pitsruli-logo-white.svg", "w").write(horizontal(WHITE, GLOW, "#B9C7B2"))

    # Vertical lockup
    word, ww = text_path(serif, "ფიცრული", 72, 0, 0)
    tag, tw = text_path(sans, "კოტეჯები · COTTAGES", 14, 0, 0, tracking=0.12)
    W = max(ww, tw, 140) + 40
    word, _ = text_path(serif, "ფიცრული", 72, (W - ww) / 2, 200)
    tag, _ = text_path(sans, "კოტეჯები · COTTAGES", 14, (W - tw) / 2, 236, tracking=0.12)
    body = mark(PINE, GLOW, (W - 120) / 2, 8) + f'<path d="{word}" fill="{PINE}" stroke="{PINE}" stroke-width="2" stroke-linejoin="round"/><path d="{tag}" fill="{MOSS}"/>'
    open(f"{out}/pitsruli-logo-vertical.svg", "w").write(svg(W, 252, body, title))

    # Mark alone, and an app/favicon tile
    open(f"{out}/pitsruli-mark.svg", "w").write(svg(120, 124, mark(PINE, GLOW), "ფიცრული"))
    tile = f'<rect width="128" height="128" rx="28" fill="{PINE}"/>' + mark(WHITE, GLOW, 14, 10, 0.83)
    open(f"{out}/favicon.svg", "w").write(svg(128, 128, tile, "ფიცრული"))

    # English and Russian lockups (the Georgian heading font has no Cyrillic).
    if intl_word_path and intl_tag_path:
        iw, it = TTFont(intl_word_path), TTFont(intl_tag_path)
        for code, name, tagline in (("en", "PITSRULI", "WOODEN COTTAGES"), ("ru", "ПИЦРУЛИ", "ДЕРЕВЯННЫЕ КОТТЕДЖИ")):
            for suffix, ink, tag_ink in (("", PINE, MOSS), ("-white", WHITE, "#B9C7B2")):
                word, ww = text_path(iw, name, 70, 150, 76, tracking=0.03)
                tag, tw = text_path(it, tagline, 14, 152, 108, tracking=0.16)
                w = 150 + max(ww, tw) + 14
                body = mark(ink, GLOW) + f'<path d="{word}" fill="{ink}"/><path d="{tag}" fill="{tag_ink}"/>'
                open(f"{out}/pitsruli-logo-{code}{suffix}.svg", "w").write(svg(w, 128, body, f"{name} — {tagline.lower()}"))


if __name__ == "__main__":
    main(*sys.argv[1:6])
