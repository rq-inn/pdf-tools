window.TextNormalizer = {
  normalizeDocument(documentData) {
    const pages = documentData.pages.map((page) => {
      const text = this.normalizePageText(page.text);
      return {
        pageNumber: page.pageNumber,
        text
      };
    });

    return {
      ...documentData,
      pages
    };
  },

  normalizePageText(text) {
    return (text || "")
      .split(/\r?\n/)
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .reduce((lines, line, index, source) => {
        const previous = lines[lines.length - 1];
        const next = source[index + 1];
        const isBlank = !line;

        if (isBlank) {
          if (previous !== "") lines.push("");
          return lines;
        }

        if (previous && previous !== "" && this.shouldMergeLine(previous, line, next)) {
          lines[lines.length - 1] = `${previous} ${line}`.replace(/\s+/g, " ").trim();
          return lines;
        }

        lines.push(line);
        return lines;
      }, [])
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  },

  shouldMergeLine(previous, current, next) {
    if (!previous || !current) return false;
    if (/[.!?\u3002\uFF01\uFF1F:\uFF1A]$/u.test(previous)) return false;
    if (/^[\u2022\u25CF\u25A0\u25C6-]/u.test(current)) return false;
    if (/^[0-9\uFF10-\uFF19]+[.)\]\u3001\u3002\uFF09]/u.test(current)) return false;
    if (next === "") return false;
    return true;
  },

  buildExportText(documentData) {
    const totalPages = documentData.totalPages || documentData.pages.length;
    const sourceName = documentData.fileName || "";
    const generatedAt = new Date().toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    const blocks = [
      "# PDF_TEXT_EXPORT",
      `SOURCE_FILE: ${sourceName}`,
      `TOTAL_PAGES: ${totalPages}`,
      `GENERATED_AT: ${generatedAt}`,
      "",
      "# FORMAT_GUIDE",
      "- Each page starts with [PAGE n / total].",
      "- PAGE_MARKER values are stable markers for AI parsing.",
      "- Blank pages are labeled explicitly.",
      ""
    ];

    documentData.pages.forEach((page) => {
      const marker = `PAGE_${String(page.pageNumber).padStart(3, "0")}`;
      const pageText = page.text || window.Language.t("EMPTY_PAGE_TEXT");

      blocks.push(`[PAGE ${page.pageNumber} / ${totalPages}]`);
      blocks.push(`PAGE_MARKER: ${marker}`);
      blocks.push("");
      blocks.push(pageText);
      blocks.push("");
      blocks.push(`[END_PAGE ${page.pageNumber}]`);
      blocks.push("");
    });

    return blocks.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  }
};
