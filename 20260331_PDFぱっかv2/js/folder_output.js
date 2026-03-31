window.FolderOutput = {
  dirHandle: null,

  async setOutputDir(dirHandle) {
    this.dirHandle = dirHandle;

    const perm = await dirHandle.requestPermission({ mode: "readwrite" });
    if (perm !== "granted") {
      throw new Error("FOLDER_PERMISSION_DENIED");
    }
  },

  async saveJoinedPdf(bytes, firstFileName) {
    let filename = String(firstFileName || "").trim();

    if (!/\.pdf$/i.test(filename)) {
      let base = filename;
      base = base.replace(/^\d+_/, "");
      base = base.replace(/\.pdf.*$/i, "");
      if (!base) {
        base = "joined";
      }
      filename = `join_${base}.pdf`;
    }

    const fileHandle = await this.dirHandle.getFileHandle(filename, {
      create: true
    });

    const writable = await fileHandle.createWritable();
    await writable.write(bytes);
    await writable.close();
  }
};
