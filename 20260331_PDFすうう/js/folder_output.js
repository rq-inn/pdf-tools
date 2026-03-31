// folder_output.js
// 出力専用：保存のみ（UI禁止）

window.FolderOutput = {
  dirHandle: null,

  async setOutputDir(dirHandle) {
    this.dirHandle = dirHandle;

    // ★ ここが重要：事前に書き込み権限を確保
    const perm = await dirHandle.requestPermission({ mode: "readwrite" });
    if (perm !== "granted") {
      throw new Error("FOLDER_PERMISSION_DENIED");
    }
  },

  async savePdf(bytes, index) {
    const baseName = window.FileSelector.pdfFile.name.replace(/\.pdf$/i, "");
    const filename = `${String(index).padStart(2, "0")}_${baseName}.pdf`;

    const fileHandle = await this.dirHandle.getFileHandle(filename, {
      create: true
    });

    const writable = await fileHandle.createWritable();
    await writable.write(bytes);
    await writable.close();
  }
};
