window.TxtGenerator = {
  async generate(text) {
    const dir = window.FolderOutput.dirHandle;
    const filename = window.UI.getPlannedFilename();

    const handle = await dir.getFileHandle(filename, { create: true });
    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();

    return {
      filename,
      directoryName: dir.name
    };
  }
};
