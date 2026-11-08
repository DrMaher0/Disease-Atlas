#!/usr/bin/env python3
"""Split the embedded Disease Atlas CSS and JavaScript out of index.html.

Run from the repository root:
    python3 scripts/split-app.py

The script writes disease-atlas.css and disease-atlas.js, updates index.html to
reference them, and keeps an exact index.html.bak copy. It refuses to overwrite
existing output or backup files unless --force is supplied.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


STYLE_RE = re.compile(r"<style\b[^>]*>(.*?)</style\s*>", re.IGNORECASE | re.DOTALL)
SCRIPT_RE = re.compile(r"<script\b([^>]*)>(.*?)</script\s*>", re.IGNORECASE | re.DOTALL)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--html", default="index.html", help="HTML entry file (default: index.html)")
    parser.add_argument("--css", default="disease-atlas.css", help="CSS output path")
    parser.add_argument("--js", default="disease-atlas.js", help="JavaScript output path")
    parser.add_argument("--force", action="store_true", help="allow replacing existing outputs and backup")
    args = parser.parse_args()

    html_path = Path(args.html)
    css_path = Path(args.css)
    js_path = Path(args.js)
    backup_path = html_path.with_suffix(html_path.suffix + ".bak")

    for path in (html_path, css_path, js_path):
        if not path.is_file() and path == html_path:
            parser.error(f"HTML file not found: {path}")

    source = html_path.read_text(encoding="utf-8")
    style_matches = list(STYLE_RE.finditer(source))
    script_matches = list(SCRIPT_RE.finditer(source))
    if len(style_matches) != 1:
        parser.error(f"Expected exactly one embedded <style> block; found {len(style_matches)}")
    if len(script_matches) != 1:
        parser.error(f"Expected exactly one inline <script> block; found {len(script_matches)}")

    script_attrs = script_matches[0].group(1).strip()
    if re.search(r"\bsrc\s*=", script_attrs, re.IGNORECASE):
        parser.error("The script block already has a src attribute; refusing to alter it")
    if script_attrs:
        parser.error("The inline script has attributes; inspect and adapt this helper before running")

    existing = [path for path in (css_path, js_path, backup_path) if path.exists()]
    if existing and not args.force:
        parser.error("Refusing to overwrite existing files: " + ", ".join(map(str, existing)) + ". Use --force after backing them up.")

    css = style_matches[0].group(1)
    javascript = script_matches[0].group(2)

    updated = STYLE_RE.sub('<link rel="stylesheet" href="' + css_path.name + '">', source, count=1)
    updated = SCRIPT_RE.sub('<script src="' + js_path.name + '"></script>', updated, count=1)

    # Keep the original file byte-for-byte as a backup before replacing it.
    if not backup_path.exists() or args.force:
        backup_path.write_text(source, encoding="utf-8")
    css_path.write_text(css, encoding="utf-8")
    js_path.write_text(javascript, encoding="utf-8")
    html_path.write_text(updated, encoding="utf-8")

    print(f"Split complete: {html_path}, {css_path}, {js_path}")
    print(f"Original preserved at: {backup_path}")
    print("The existing style.css was not touched.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
