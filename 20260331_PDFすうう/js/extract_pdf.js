window.PDFExtractor = {
  async extract(file) {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const lines = this.buildLines(content.items || []);
      pages.push({
        pageNumber,
        lines,
        text: this.linesToText(lines)
      });
    }

    return {
      fileName: file.name,
      totalPages: pdf.numPages,
      pages
    };
  },

  buildLines(items) {
    const normalizedItems = items
      .map((item, index) => {
        const str = (item.str || "").replace(/\s+/g, " ").trim();
        if (!str) return null;

        const x = item.transform?.[4] ?? 0;
        const y = item.transform?.[5] ?? 0;
        const width = Math.max(item.width || 0, 0);
        const height = Math.abs(item.height || item.transform?.[0] || 0) || 10;

        return {
          index,
          str,
          x,
          y,
          width,
          height,
          endX: x + width
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (Math.abs(b.y - a.y) > 2) return b.y - a.y;
        if (Math.abs(a.x - b.x) > 1) return a.x - b.x;
        return a.index - b.index;
      });

    const lines = [];

    normalizedItems.forEach((item) => {
      const tolerance = Math.max(3, item.height * 0.45);
      const existing = lines.find((line) => Math.abs(line.y - item.y) <= tolerance);

      if (existing) {
        existing.items.push(item);
        existing.top = Math.max(existing.top, item.y);
        existing.bottom = Math.min(existing.bottom, item.y);
        existing.height = Math.max(existing.height, item.height);
        return;
      }

      lines.push({
        y: item.y,
        top: item.y,
        bottom: item.y,
        height: item.height,
        items: [item]
      });
    });

    return lines
      .sort((a, b) => b.y - a.y)
      .map((line) => {
        const orderedItems = line.items.sort((a, b) => a.x - b.x || a.index - b.index);
        const text = orderedItems.reduce((acc, current, index) => {
          if (index === 0) return current.str;

          const previous = orderedItems[index - 1];
          const gap = current.x - previous.endX;
          const avgCharWidth = previous.str.length > 0
            ? previous.width / previous.str.length
            : 0;
          const needsSpace = this.shouldInsertSpace(previous.str, current.str, gap, avgCharWidth);

          return `${acc}${needsSpace ? " " : ""}${current.str}`;
        }, "");

        return {
          text: text
            .replace(/\s+([,.;:!?])/g, "$1")
            .replace(/([([{])\s+/g, "$1")
            .replace(/\s+([)\]}])/g, "$1")
            .trim(),
          y: line.y,
          height: line.height
        };
      })
      .filter((line) => line.text);
  },

  shouldInsertSpace(previous, current, gap, avgCharWidth) {
    if (/\s$/.test(previous) || /^\s/.test(current)) return false;
    if (/[\u3040-\u30ff\u3400-\u9fff]$/.test(previous) || /^[\u3040-\u30ff\u3400-\u9fff]/.test(current)) {
      return gap > Math.max(avgCharWidth * 1.8, 10);
    }
    if (/[-\/]$/.test(previous)) return false;
    return gap > Math.max(avgCharWidth * 0.45, 3.5);
  },

  linesToText(lines) {
    if (!lines.length) return "";

    const output = [];

    lines.forEach((line, index) => {
      output.push(line.text);

      const next = lines[index + 1];
      if (!next) return;

      const gap = line.y - next.y;
      if (gap > Math.max(line.height, next.height) * 1.45) {
        output.push("");
      }
    });

    return output.join("\n").trim();
  }
};
