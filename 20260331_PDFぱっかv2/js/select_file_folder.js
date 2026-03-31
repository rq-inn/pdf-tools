window.FileSelector = {
  pdfFiles: [],
  outputDir: null,

  async selectPDF() {
    const fileHandles = await window.showOpenFilePicker({
      multiple: true,
      types: [{
        description: "PDF files",
        accept: { "application/pdf": [".pdf"] }
      }]
    });

    const files = [];
    for (const handle of fileHandles) {
      files.push(await handle.getFile());
    }

    this.pdfFiles = files;
    return files;
  },

  async selectOutputFolder() {
    const dirHandle = await window.showDirectoryPicker();
    this.outputDir = dirHandle;

    if (window.FolderOutput) {
      await window.FolderOutput.setOutputDir(dirHandle);
    }

    return dirHandle;
  }
};
