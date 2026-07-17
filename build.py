#!/usr/bin/env python3
"""Build the shareable single-file demo (index.html) from the app/ source.

The app in app/ is a normal multi-file ES-module project. This flattens it into ONE
self-contained index.html (inline CSS + JS, no imports, no server needed) so it can be
opened by double-click or served by GitHub Pages.

Each module is wrapped in its own IIFE scope — that matters: app.js declares `let members`
and mock-data.js exports `const members`, so a naive concatenation collides and the whole
script dies with "Identifier 'members' has already been declared".

Run:  python3 build.py     -> writes ./index.html
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
APP = ROOT / "app"


def read(name: str) -> str:
    return (APP / name).read_text(encoding="utf-8")


def exported_names(src: str) -> list[str]:
    names = re.findall(r"^export\s+const\s+([A-Za-z0-9_]+)", src, re.M)
    names += re.findall(r"^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)", src, re.M)
    return names


def strip_module_syntax(src: str) -> str:
    """Drop import lines and the `export` keyword; the IIFE wrapper replaces them."""
    out = []
    for line in src.splitlines():
        if re.match(r"^\s*import\s.*from\s.*;?\s*$", line):
            continue
        out.append(re.sub(r"^export\s+", "", line))
    return "\n".join(out)


def scoped(src: str, names: list[str]) -> str:
    """Wrap a module in an IIFE that returns its exports."""
    return "(() => {\n" + strip_module_syntax(src) + "\nreturn { " + ", ".join(names) + " };\n})();"


def main() -> int:
    mock, data, app = read("mock-data.js"), read("data.js"), read("app.js")

    js = "/* ---- mock data ---- */\nconst db = " + scoped(mock, exported_names(mock)) + "\n\n"
    js += "/* ---- data layer (the Supabase seam) ---- */\nconst data = " + scoped(data, exported_names(data)) + "\n\n"
    js += "/* ---- app ---- */\n(() => {\n" + strip_module_syntax(app) + "\n})();\n"

    html = read("index.html")
    html = html.replace('<link rel="stylesheet" href="./styles.css" />', "<style>\n" + read("styles.css") + "\n</style>")
    html = html.replace('<script type="module" src="./app.js"></script>', "<script>\n" + js + "\n</script>")
    html = html.replace('Three<span class="dot">·</span>house', 'The Tree<span class="dot">·</span>house')
    html = html.replace("local scaffold · sample content · no data saved",
                        "DEMO · sample content · nothing you do here is saved")
    html = html.replace("a private clubhouse for three · local scaffold", "a private clubhouse for three")

    out = ROOT / "index.html"
    out.write_text(html, encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
