window.PDFLogic = {
  async joinPdfs(leftFiles, rightFiles) {
    if (!leftFiles?.length || !rightFiles?.length) {
      throw new Error("PDF_FILES_NOT_SELECTED");
    }

    const leftSorted = [...leftFiles];
    const rightSorted = [...rightFiles];

    const mergedPdf = await PDFLib.PDFDocument.create();

    if (window.AppConfig?.outputMode === "print") {
      try {
        const coverRes = await fetch("./pdf/mirror_book_cover.pdf");
        const coverBuf = await coverRes.arrayBuffer();
        const coverPdf = await PDFLib.PDFDocument.load(coverBuf);
        const [coverPage] = await mergedPdf.copyPages(coverPdf, [0]);
        mergedPdf.addPage(coverPage);
      } catch (error) {
        console.warn("Cover PDF not added:", error);
      }
    }

    const leftPages = [];
    for (const file of leftSorted) {
      const buf = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(buf);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      leftPages.push(...pages);
    }

    const rightPages = [];
    for (const file of rightSorted) {
      const buf = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(buf);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      rightPages.push(...pages);
    }

    const max = Math.min(leftPages.length, rightPages.length);
    if (max === 0) {
      throw new Error("NO_PAGES_TO_JOIN");
    }

    for (let i = 0; i < max; i += 1) {
      mergedPdf.addPage(leftPages[i]);
      mergedPdf.addPage(rightPages[i]);

      const percent = Math.floor(((i + 1) / max) * 100);
      window.UI?.renderProgress(percent);
    }

    const bytes = await mergedPdf.save();
    let base = String(leftSorted[0]?.name || "");
    base = base.replace(/^\d+_/, "");
    base = base.replace(/\.pdf.*$/i, "");
    if (!base) {
      base = "joined";
    }

    return {
      bytes,
      filename: `join_${base}.pdf`,
    };
  },
};
