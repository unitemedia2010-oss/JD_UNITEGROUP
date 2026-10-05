"""Assign stable CMS keys to visible, static copy without reformatting HTML."""

import csv
import html
import io
import re
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGES = ("index", "nha-nguyen-can", "tpa")
TAGS = {"a", "b", "button", "div", "em", "h3", "label", "option", "p", "small", "span", "strong", "summary", "time"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
SKIP_IDS = {"toastTitle", "toastMessage", "themeIcon", "themeLabel", "dealValue", "avgValue", "incomeOutput", "quizResult", "cvFileName", "formNote"}
SKIP_CLASSES = {"page-intro", "submit-toast", "training-board", "selected-branch", "global-watermark", "journey-arrow"}
SKIP_TAGS = {"script", "style", "svg"}
SYMBOLS = {"✓", "→", "↗", "◐", "↑"}


class CopyParser(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.source = source
        self.lines = [0]
        for match in re.finditer("\n", source):
            self.lines.append(match.end())
        self.stack = []
        self.nodes = []

    def source_offset(self):
        line, column = self.getpos()
        return self.lines[line - 1] + column

    def handle_starttag(self, tag, attrs):
        node = {"tag": tag, "attrs": dict(attrs), "parent": self.stack[-1] if self.stack else None,
                "children": [], "text": [], "offset": self.source_offset(), "raw": self.get_starttag_text()}
        if self.stack:
            self.stack[-1]["children"].append(node)
        self.nodes.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.stack.pop()

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index]["tag"] == tag:
                del self.stack[index:]
                return

    def handle_data(self, data):
        if self.stack:
            self.stack[-1]["text"].append(data)


def area_of(node):
    current = node
    while current:
        if current["tag"] == "section":
            classes = (current["attrs"].get("class") or "").split()
            return classes[-1] if classes else "section"
        if current["tag"] in {"header", "footer"}:
            return current["tag"]
        current = current["parent"]
    return "global"


def eligible(node):
    if node["tag"] not in TAGS or node["attrs"].get("data-cms"):
        return False
    copy = " ".join(" ".join(node["text"]).split())
    if not copy or copy in SYMBOLS:
        return False
    current = node
    in_body = False
    while current:
        attrs = current["attrs"]
        if current["tag"] == "body":
            in_body = True
        if current["tag"] in SKIP_TAGS or attrs.get("data-cms") or attrs.get("aria-hidden") == "true":
            return False
        if attrs.get("id") in SKIP_IDS or set((attrs.get("class") or "").split()) & SKIP_CLASSES:
            return False
        current = current["parent"]
    return in_body


def process_page(page):
    path = ROOT / (page + ".html")
    source = path.read_text(encoding="utf-8")
    parser = CopyParser(source)
    parser.feed(source)
    existing = {node["attrs"].get("data-cms") for node in parser.nodes}
    number = 1
    edits = []
    rows = []
    for node in parser.nodes:
        is_placeholder = node["tag"] == "input" and bool(node["attrs"].get("placeholder")) and not node["attrs"].get("data-cms")
        if not eligible(node) and not is_placeholder:
            continue
        while f"text_{number:03d}" in existing:
            number += 1
        key = f"text_{number:03d}"
        number += 1
        raw = node["raw"]
        mode = ' data-cms-target="placeholder"' if is_placeholder else ' data-cms-target="text"' if node["children"] else ""
        insertion = f' data-cms="{key}"{mode}'
        position = node["offset"] + len(raw) - (2 if raw.endswith("/>") else 1)
        edits.append((position, insertion))
        copy = node["attrs"]["placeholder"] if is_placeholder else " ".join(" ".join(node["text"]).split())
        rows.append([page, key, html.unescape(copy), f"{area_of(node)} · {node['tag']} · {copy[:70]}"])
    for position, insertion in reversed(edits):
        source = source[:position] + insertion + source[position:]
    path.write_text(source, encoding="utf-8", newline="")
    return rows


def main():
    template = ROOT / "CMS_Template.csv"
    with template.open(encoding="utf-8-sig", newline="") as file:
        current = list(csv.reader(file))
    added = []
    for page in PAGES:
        added.extend(process_page(page))
    with template.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.writer(file)
        writer.writerows(current + added)
    for page in PAGES:
        print(page, sum(row[0] == page for row in added))


if __name__ == "__main__":
    main()
