// select_file_folder.js
// PDFファイル選択・保存先指定のみ（ロジック禁止）

window.FileSelector = {
  pdfFile: null,
  outputDir: null,

  async selectPDF() {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: "PDF files",
        accept: { "application/pdf": [".pdf"] }
      }]
    });

    const file = await fileHandle.getFile();
    this.pdfFile = file;
    return file;
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
