// Pure-function converters from the canonical complete-package markdown
// into other delivery formats. No I/O — safe to use on client or server.

/**
 * Strip Markdown syntax for plain-text output suitable for pasting into
 * any input/textarea/email field. Preserves paragraph spacing and basic
 * list structure.
 */
export function markdownToPlainText(md: string): string {
  let text = md;

  // Drop fenced code blocks but keep their content
  text = text.replace(/^~~~[^\n]*\n([\s\S]*?)\n~~~\s*$/gm, "$1");
  text = text.replace(/^```[^\n]*\n([\s\S]*?)\n```\s*$/gm, "$1");

  // Inline code: `foo` -> foo
  text = text.replace(/`([^`]+)`/g, "$1");

  // Images ![alt](url) -> alt (url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1 ($2)");
  // Links [text](url) -> text (url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");

  // Headings: drop leading #, keep text
  text = text.replace(/^#{1,6}\s+/gm, "");

  // Blockquote markers
  text = text.replace(/^>\s?/gm, "");

  // Bold/italic markers: **x**, *x*, __x__, _x_
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/(^|[^_])_([^_]+)_/g, "$1$2");

  // List bullets: -, *, + at line start -> "• "
  text = text.replace(/^\s*[-*+]\s+/gm, "• ");
  // Ordered lists: keep "1. " style as is

  // Tables: drop separator rows like | --- | --- |
  text = text.replace(/^\s*\|?\s*:?-{3,}.*$/gm, "");
  // Tables: turn "| a | b | c |" into "a — b — c"
  text = text.replace(/^\s*\|(.+)\|\s*$/gm, (_m, inner: string) =>
    inner
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .join(" — "),
  );

  // Horizontal rules
  text = text.replace(/^\s*---\s*$/gm, "");

  // Collapse 3+ blank lines into 2
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim() + "\n";
}

// Detect the heading level of a markdown line, or 0 if not a heading.
function headingLevel(line: string): number {
  const m = line.match(/^(#{1,6})\s+/);
  return m ? m[1].length : 0;
}

// ---------- DOCX ----------

/**
 * Build a .docx Uint8Array from the canonical complete-package markdown.
 * Uses the `docx` package (pure JS, Worker-compatible).
 */
export async function buildCompletePackageDocx(md: string): Promise<Uint8Array> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    PageOrientation,
  } = await import("docx");

  const lines = md.split("\n");
  const paragraphs: InstanceType<typeof Paragraph>[] = [];

  // Inline formatter: turns a markdown line into TextRun[] respecting **bold** and *italic*.
  const runs = (raw: string): InstanceType<typeof TextRun>[] => {
    const out: InstanceType<typeof TextRun>[] = [];
    // Strip link syntax: [text](url) -> "text (url)"
    let s = raw
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1 ($2)")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
      .replace(/`([^`]+)`/g, "$1");

    // Tokenise on **...** and *...*
    const tokens: { text: string; bold?: boolean; italic?: boolean }[] = [];
    const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s)) !== null) {
      if (m.index > last) tokens.push({ text: s.slice(last, m.index) });
      if (m[2] !== undefined) tokens.push({ text: m[2], bold: true });
      else if (m[3] !== undefined) tokens.push({ text: m[3], italic: true });
      last = re.lastIndex;
    }
    if (last < s.length) tokens.push({ text: s.slice(last) });
    if (tokens.length === 0) tokens.push({ text: s });
    for (const t of tokens) {
      out.push(new TextRun({ text: t.text, bold: t.bold, italics: t.italic }));
    }
    return out;
  };

  let inFence = false;
  const fenceBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced code blocks (``` or ~~~) -> monospace paragraphs
    if (/^(```|~~~)/.test(line)) {
      if (inFence) {
        for (const fl of fenceBuffer) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: fl, font: "Courier New", size: 18 })],
              spacing: { after: 60 },
            }),
          );
        }
        fenceBuffer.length = 0;
        inFence = false;
      } else {
        inFence = true;
      }
      continue;
    }
    if (inFence) {
      fenceBuffer.push(line);
      continue;
    }

    // Horizontal rule
    if (/^\s*---\s*$/.test(line)) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun("────────────────────────────────")],
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
        }),
      );
      continue;
    }

    // Headings
    const lvl = headingLevel(line);
    if (lvl > 0) {
      const text = line.replace(/^#{1,6}\s+/, "");
      const heading =
        lvl === 1
          ? HeadingLevel.HEADING_1
          : lvl === 2
          ? HeadingLevel.HEADING_2
          : lvl === 3
          ? HeadingLevel.HEADING_3
          : HeadingLevel.HEADING_4;
      paragraphs.push(
        new Paragraph({
          heading,
          children: runs(text),
          spacing: { before: 200, after: 120 },
        }),
      );
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const text = line.replace(/^>\s?/, "");
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text, italics: true })],
          indent: { left: 360 },
          spacing: { after: 100 },
        }),
      );
      continue;
    }

    // Bullet list
    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    if (bullet) {
      paragraphs.push(
        new Paragraph({
          children: runs(bullet[1]),
          bullet: { level: 0 },
        }),
      );
      continue;
    }

    // Table rows -> render as a plain " — " separated paragraph; skip separator rows.
    if (/^\s*\|/.test(line)) {
      if (/^\s*\|?\s*:?-{3,}/.test(line)) continue;
      const cells = line
        .replace(/^\s*\|/, "")
        .replace(/\|\s*$/, "")
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(cells.join("  —  "))],
          spacing: { after: 60 },
        }),
      );
      continue;
    }

    // Blank line -> paragraph break
    if (line.trim() === "") {
      paragraphs.push(new Paragraph({ children: [new TextRun("")] }));
      continue;
    }

    // Default paragraph
    paragraphs.push(
      new Paragraph({
        children: runs(line),
        spacing: { after: 100 },
      }),
    );
  }

  // Flush any unterminated fence
  if (fenceBuffer.length > 0) {
    for (const fl of fenceBuffer) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: fl, font: "Courier New", size: 18 })],
        }),
      );
    }
  }

  const doc = new Document({
    creator: "Brand Experts",
    title: "Brand Brief — Complete Package",
    styles: {
      default: { document: { run: { font: "Calibri", size: 22 } } },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840, orientation: PageOrientation.PORTRAIT },
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  return new Uint8Array(buf);
}

// ---------- PDF ----------

/**
 * Build a .pdf Uint8Array from the canonical complete-package markdown.
 * Uses pdf-lib (pure JS, Worker-compatible). Lays out plain text with
 * basic heading styling.
 */
export async function buildCompletePackagePdf(md: string): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

  // We render the plain-text form so we don't have to parse inline markdown
  // a second time. Headings are still detectable by stripped prefix using
  // the original markdown lines.
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  // US Letter, 0.75" margins
  const pageWidth = 612;
  const pageHeight = 792;
  const marginX = 54;
  const marginTop = 54;
  const marginBottom = 54;
  const contentWidth = pageWidth - marginX * 2;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - marginTop;

  const newPage = () => {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - marginTop;
  };

  const ensure = (needed: number) => {
    if (y - needed < marginBottom) newPage();
  };

  // Wrap a single line of text to contentWidth using a given font/size.
  const wrap = (text: string, f: typeof font, size: number): string[] => {
    if (text.length === 0) return [""];
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = "";
    for (const w of words) {
      const probe = current ? current + " " + w : w;
      if (f.widthOfTextAtSize(probe, size) <= contentWidth) {
        current = probe;
      } else {
        if (current) lines.push(current);
        // Word longer than the line: hard-break by characters.
        if (f.widthOfTextAtSize(w, size) > contentWidth) {
          let chunk = "";
          for (const ch of w) {
            if (f.widthOfTextAtSize(chunk + ch, size) <= contentWidth) {
              chunk += ch;
            } else {
              if (chunk) lines.push(chunk);
              chunk = ch;
            }
          }
          current = chunk;
        } else {
          current = w;
        }
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const drawLine = (
    text: string,
    f: typeof font,
    size: number,
    color = rgb(0.1, 0.1, 0.12),
    leading = size * 1.35,
  ) => {
    const wrapped = wrap(text, f, size);
    for (const w of wrapped) {
      ensure(leading);
      page.drawText(w, { x: marginX, y: y - size, size, font: f, color });
      y -= leading;
    }
  };

  const lines = md.split("\n");
  let inFence = false;

  for (const raw of lines) {
    if (/^(```|~~~)/.test(raw)) {
      inFence = !inFence;
      y -= 4;
      continue;
    }
    if (inFence) {
      drawLine(raw, fontItalic, 9, rgb(0.25, 0.25, 0.3), 11);
      continue;
    }

    if (/^\s*---\s*$/.test(raw)) {
      ensure(16);
      page.drawLine({
        start: { x: marginX, y: y - 6 },
        end: { x: marginX + contentWidth, y: y - 6 },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.75),
      });
      y -= 16;
      continue;
    }

    const lvl = headingLevel(raw);
    if (lvl > 0) {
      const text = raw.replace(/^#{1,6}\s+/, "");
      const size = lvl === 1 ? 20 : lvl === 2 ? 15 : lvl === 3 ? 12 : 11;
      y -= lvl === 1 ? 12 : 8; // breathing room above heading
      drawLine(text, fontBold, size, rgb(0.06, 0.06, 0.1), size * 1.3);
      y -= 4;
      continue;
    }

    // Convert inline markdown to plain for line rendering
    const plain = raw
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1 ($2)")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1$2")
      .replace(/__([^_]+)__/g, "$1");

    if (/^>\s?/.test(plain)) {
      drawLine("    " + plain.replace(/^>\s?/, ""), fontItalic, 10, rgb(0.3, 0.3, 0.35));
      continue;
    }

    const bullet = plain.match(/^\s*[-*+]\s+(.*)$/);
    if (bullet) {
      drawLine("• " + bullet[1], font, 10);
      continue;
    }

    if (/^\s*\|/.test(plain)) {
      if (/^\s*\|?\s*:?-{3,}/.test(plain)) continue;
      const cells = plain
        .replace(/^\s*\|/, "")
        .replace(/\|\s*$/, "")
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      drawLine(cells.join("   —   "), font, 10);
      continue;
    }

    if (plain.trim() === "") {
      y -= 6;
      continue;
    }

    drawLine(plain, font, 10);
  }

  // Footer page numbers
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    const label = `Page ${i + 1} of ${pages.length}`;
    const w = font.widthOfTextAtSize(label, 8);
    p.drawText(label, {
      x: (pageWidth - w) / 2,
      y: 24,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.55),
    });
  });

  return await pdf.save();
}
