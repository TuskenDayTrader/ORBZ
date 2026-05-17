#!/usr/bin/env python3
import re
import sys
from pathlib import Path


def markdown_to_lines(markdown: str) -> list[str]:
    lines: list[str] = []
    for raw in markdown.splitlines():
        line = raw.rstrip()
        line = re.sub(r"`([^`]*)`", r"\1", line)
        line = line.replace("**", "").replace("*", "")
        line = re.sub(r"^\s*#{1,6}\s*", "", line)
        line = re.sub(r"^\s*[-*]\s+\[.\]\s+", "- ", line)
        line = re.sub(r"^\s*[-*]\s+", "• ", line)
        line = re.sub(r"^\s*\d+\.\s+", "• ", line)
        lines.append(line)
    return lines


def wrap_lines(lines: list[str], width: int = 95) -> list[str]:
    wrapped: list[str] = []
    for line in lines:
        if not line:
            wrapped.append("")
            continue
        current = line
        while len(current) > width:
            idx = current.rfind(" ", 0, width)
            if idx <= 0:
                idx = width
            wrapped.append(current[:idx].rstrip())
            current = current[idx:].lstrip()
        wrapped.append(current)
    return wrapped


def _pdf_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def build_content_stream(lines: list[str], page_height: int = 792, margin: int = 50, leading: int = 14) -> str:
    y = page_height - margin
    stream = ["BT", "/F1 11 Tf", f"{margin} {y} Td"]
    first = True
    for line in lines:
        if not first:
            stream.append(f"0 -{leading} Td")
            y -= leading
        first = False
        if y < margin:
            break
        stream.append(f"({_pdf_escape(line)}) Tj")
    stream.append("ET")
    return "\n".join(stream)


def paginate(lines: list[str], page_height: int = 792, margin: int = 50, leading: int = 14) -> list[list[str]]:
    lines_per_page = (page_height - (2 * margin)) // leading
    return [lines[i : i + lines_per_page] for i in range(0, len(lines), lines_per_page)] or [[]]


def write_simple_pdf(text_lines: list[str], out_path: Path) -> None:
    pages = paginate(text_lines)

    objects: list[bytes] = []

    def add_obj(content: str) -> int:
        objects.append(content.encode("latin-1", errors="replace"))
        return len(objects)

    font_obj = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    page_obj_ids: list[int] = []
    content_obj_ids: list[int] = []

    for page_lines in pages:
        stream = build_content_stream(page_lines)
        content_obj = add_obj(f"<< /Length {len(stream.encode('latin-1', errors='replace'))} >>\nstream\n{stream}\nendstream")
        content_obj_ids.append(content_obj)
        page_obj_ids.append(0)

    pages_kids_placeholder = " ".join(f"{pid} 0 R" for pid in page_obj_ids if pid)
    pages_obj_id = add_obj(f"<< /Type /Pages /Kids [ {pages_kids_placeholder} ] /Count {len(pages)} >>")

    for i, content_obj in enumerate(content_obj_ids):
        page_obj = add_obj(
            f"<< /Type /Page /Parent {pages_obj_id} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 {font_obj} 0 R >> >> /Contents {content_obj} 0 R >>"
        )
        page_obj_ids[i] = page_obj

    kids = " ".join(f"{pid} 0 R" for pid in page_obj_ids)
    objects[pages_obj_id - 1] = f"<< /Type /Pages /Kids [ {kids} ] /Count {len(page_obj_ids)} >>".encode("latin-1")

    catalog_obj_id = add_obj(f"<< /Type /Catalog /Pages {pages_obj_id} 0 R >>")

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for idx, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{idx} 0 obj\n".encode("latin-1"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_pos = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for off in offsets[1:]:
        pdf.extend(f"{off:010d} 00000 n \n".encode("latin-1"))
    pdf.extend(
        (
            "trailer\n"
            f"<< /Size {len(objects) + 1} /Root {catalog_obj_id} 0 R >>\n"
            "startxref\n"
            f"{xref_pos}\n"
            "%%EOF\n"
        ).encode("latin-1")
    )

    out_path.write_bytes(pdf)


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: export_pdf.py <source_markdown> <output_pdf>")
        raise SystemExit(1)

    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    output.parent.mkdir(parents=True, exist_ok=True)

    markdown = source.read_text(encoding="utf-8")
    lines = wrap_lines(markdown_to_lines(markdown))
    write_simple_pdf(lines, output)


if __name__ == "__main__":
    main()
