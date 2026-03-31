window.AppConfig = {
  outputMode: "view",
};

const UI_TEXT = {
  L1: {
    appTitle: "PDFpakka 1.0",
    heroDescription: "Join left and right PDFs in alternating order, then download the merged file in your browser.",
    workflowEyebrow: "Workflow",
    workflowText: "Select left PDFs and right PDFs, then run the existing merge workflow.",
    languageAria: "Language",
    outputMode: "Output mode",
    viewCaption: "Cover page is not added.",
    printCaption: "Adds the mirror book cover before download.",
    leftTone: "Left",
    rightTone: "Right",
    noPdfSelected: "No PDF selected.",
    dropGuide: "You can also drop PDF files into this area.",
    reorderGuide: "Initially sorted by filename. Drag and drop to reorder.",
    statusHeading: "Status",
    readyMessage: "Ready to join the selected PDFs.",
    leftPdfs: "Left PDFs",
    rightPdfs: "Right PDFs",
    downloadMethod: "Download",
    downloadAuto: "Browser download",
    chooseFolderGuide: "Click here to choose a folder.",
    mode: "Mode",
    readyGuide: "The merged PDF will be saved to the chosen folder, or downloaded by your browser if no folder is selected.",
    blockedGuide: "Select left PDFs and right PDFs to enable start.",
    progressHeading: "Progress",
    progressRunning: "Processing pages in left/right order.",
    progressIdle: "Progress resets when the next run starts.",
    mirrorBookAlt: "Mirror Book",
    doneMessage: "Done. The merged PDF has been saved or downloaded.",
  },
  L2: {
    appTitle: "PDFぱっか 1.0",
    heroDescription: "左PDFと右PDFを交互に結合し、結合後のPDFをブラウザからダウンロードします。",
    workflowEyebrow: "作業手順",
    workflowText: "左PDFと右PDFを選択して、既存ロジックの流れで結合を実行します。",
    languageAria: "言語",
    outputMode: "出力モード",
    viewCaption: "表紙PDFは追加しません。",
    printCaption: "ダウンロード前に mirror book の表紙PDFを追加します。",
    leftTone: "左",
    rightTone: "右",
    noPdfSelected: "PDFが選択されていません。",
    reorderGuide: "初期表示はファイル名昇順です。ドラッグ＆ドロップで並べ替えできます。",
    statusHeading: "状態",
    readyMessage: "結合するPDFの準備ができています。",
    leftPdfs: "左PDF",
    rightPdfs: "右PDF",
    downloadMethod: "受け取り方法",
    downloadAuto: "ブラウザのダウンロード",
    chooseFolderGuide: "ここをクリックするとフォルダ選択が開きます。",
    mode: "モード",
    readyGuide: "フォルダを選んだ場合はそこへ保存し、未選択ならブラウザのダウンロードに入ります。",
    blockedGuide: "左PDFと右PDFを選ぶとスタートできます。",
    progressHeading: "進捗",
    progressRunning: "左ページと右ページを交互順で処理しています。",
    progressIdle: "次回スタート時に進捗はリセットされます。",
    mirrorBookAlt: "ミラーブック",
    doneMessage: "完了しました。結合後のPDFを保存またはダウンロードしました。",
  },
  L3: {
    appTitle: "PDFpakka 1.0",
    heroDescription: "將左側與右側 PDF 交互合併，完成後由瀏覽器直接下載合併檔案。",
    workflowEyebrow: "操作流程",
    workflowText: "選擇左側 PDF 與右側 PDF 後，即可依照現有邏輯執行合併。",
    languageAria: "語言",
    outputMode: "輸出模式",
    viewCaption: "不加入封面 PDF。",
    printCaption: "下載前會加入 mirror book 的封面 PDF。",
    leftTone: "左側",
    rightTone: "右側",
    noPdfSelected: "尚未選擇 PDF。",
    reorderGuide: "初始會依檔名升冪排列，也可用拖放重新排序。",
    statusHeading: "狀態",
    readyMessage: "已完成合併前的準備。",
    leftPdfs: "左側 PDF",
    rightPdfs: "右側 PDF",
    downloadMethod: "取得方式",
    downloadAuto: "瀏覽器下載",
    chooseFolderGuide: "點這裡可開啟資料夾選擇。",
    mode: "模式",
    readyGuide: "若已選擇資料夾就儲存到該處，否則由瀏覽器直接下載。",
    blockedGuide: "請先選擇左側 PDF 與右側 PDF，才能開始。",
    progressHeading: "進度",
    progressRunning: "正在依照左右交互順序處理頁面。",
    progressIdle: "下次開始時會重新設定進度。",
    mirrorBookAlt: "鏡像書",
    doneMessage: "已完成，合併後的 PDF 已儲存或開始下載。",
  },
};

window.UI = {
  isRunning: false,
  progressPercent: 0,
  statusOverrideKey: "",
  draggedFileId: "",
  dropTargetFileKey: "",

  render() {
    this.renderStaticTexts();
    this.renderLanguageSelect();
    this.renderControls();
    this.renderStatus();
    this.renderProgress(this.progressPercent);
    this.renderBackLink();
  },

  text(key) {
    const dict = UI_TEXT[window.Language.current] || UI_TEXT.L1;
    return dict[key] || UI_TEXT.L1[key] || key;
  },

  renderStaticTexts() {
    const appTitle = document.getElementById("appTitle");
    const heroDescription = document.getElementById("heroDescription");
    const workflowEyebrow = document.getElementById("workflowEyebrow");
    const workflowText = document.getElementById("workflowText");
    const languageArea = document.getElementById("languageArea");

    if (appTitle) appTitle.textContent = this.text("appTitle");
    if (heroDescription) heroDescription.textContent = this.text("heroDescription");
    if (workflowEyebrow) workflowEyebrow.textContent = this.text("workflowEyebrow");
    if (workflowText) workflowText.textContent = this.text("workflowText");
    if (languageArea) languageArea.setAttribute("aria-label", this.text("languageAria"));
    document.title = this.text("appTitle");
  },

  renderLanguageSelect() {
    const area = document.getElementById("languageArea");
    if (!area) return;

    area.innerHTML = "";
    const select = document.createElement("select");
    select.setAttribute("aria-label", this.text("languageAria"));

    window.Language.languages.forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang.number;
      option.textContent = lang.name;
      if (lang.number === window.Language.current) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener("change", (event) => {
      window.Language.setLanguage(event.target.value);
    });

    area.appendChild(select);
  },

  renderControls() {
    const leftArea = document.getElementById("pdfLeftArea");
    const rightArea = document.getElementById("pdfRightArea");
    const modeArea = document.getElementById("modeArea");

    if (!leftArea || !rightArea || !modeArea) return;

    leftArea.innerHTML = "";
    rightArea.innerHTML = "";
    modeArea.innerHTML = "";

    modeArea.appendChild(this.buildModeSelector());

    this.renderPdfSelector({
      area: leftArea,
      labelKey: "MB10",
      fileKey: "pdfLeftFiles",
      tone: this.text("leftTone"),
    });

    this.renderPdfSelector({
      area: rightArea,
      labelKey: "MB11",
      fileKey: "pdfRightFiles",
      tone: this.text("rightTone"),
    });
  },

  buildModeSelector() {
    const box = document.createElement("div");
    box.className = "mode-box";

    const title = document.createElement("p");
    title.className = "eyebrow";
    title.textContent = this.text("outputMode");
    box.appendChild(title);

    box.appendChild(this.createModeOption({
      value: "view",
      title: window.Language.t("MB13"),
      caption: this.text("viewCaption"),
    }));

    box.appendChild(this.createModeOption({
      value: "print",
      title: window.Language.t("MB14"),
      caption: this.text("printCaption"),
    }));

    return box;
  },

  createModeOption({ value, title, caption }) {
    const label = document.createElement("label");
    label.className = "mode-label";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "outputMode";
    radio.value = value;
    radio.checked = window.AppConfig.outputMode === value;
    radio.disabled = this.isRunning;
    radio.addEventListener("change", () => {
      window.AppConfig.outputMode = value;
      this.statusOverrideKey = "";
      this.renderStatus();
    });

    const textWrap = document.createElement("span");
    textWrap.className = "mode-text";

    const titleSpan = document.createElement("span");
    titleSpan.className = "mode-title";
    titleSpan.textContent = title;

    const captionSpan = document.createElement("span");
    captionSpan.className = "mode-caption";
    captionSpan.textContent = caption;

    textWrap.append(titleSpan, captionSpan);
    label.append(radio, textWrap);
    return label;
  },

  normalizeFiles(files) {
    return [...files]
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
      }));
  },

  extractPdfFiles(fileList) {
    return [...(fileList || [])].filter((file) => {
      if (!file) return false;
      if (file.type === "application/pdf") return true;
      return /\.pdf$/i.test(file.name || "");
    });
  },

  isExternalFileDrag(event) {
    const types = [...(event.dataTransfer?.types || [])];
    return types.includes("Files");
  },

  setDropTarget(fileKey) {
    this.dropTargetFileKey = fileKey;
  },

  clearDropTarget(fileKey = "") {
    if (!fileKey || this.dropTargetFileKey === fileKey) {
      this.dropTargetFileKey = "";
    }
  },

  handleDroppedFiles(fileKey, fileList) {
    if (this.isRunning) return false;
    const files = this.extractPdfFiles(fileList);
    if (!files.length) return false;
    window.FileSelector[fileKey] = this.normalizeFiles(files);
    this.statusOverrideKey = "";
    this.clearDropTarget(fileKey);
    this.renderControls();
    this.renderStatus();
    return true;
  },

  renderPdfSelector({ area, labelKey, fileKey, tone }) {
    const card = document.createElement("section");
    card.className = "selector-card";
    if (this.dropTargetFileKey === fileKey) {
      card.classList.add("is-drop-target");
    }

    card.addEventListener("dragover", (event) => {
      if (!this.isExternalFileDrag(event) || this.isRunning) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      this.setDropTarget(fileKey);
      if (!card.classList.contains("is-drop-target")) {
        card.classList.add("is-drop-target");
      }
    });

    card.addEventListener("dragleave", (event) => {
      if (!card.contains(event.relatedTarget)) {
        this.clearDropTarget(fileKey);
        card.classList.remove("is-drop-target");
      }
    });

    card.addEventListener("drop", (event) => {
      if (!this.isExternalFileDrag(event)) return;
      event.preventDefault();
      this.handleDroppedFiles(fileKey, event.dataTransfer?.files);
    });

    const copy = document.createElement("div");
    copy.className = "selector-copy";

    const title = document.createElement("h2");
    title.className = "selector-title";
    title.textContent = window.Language.t(labelKey);

    const guide = document.createElement("p");
    guide.className = "selector-guide";
    guide.textContent = `${window.Language.t("MB8")} ${window.Language.t("MB9")}`;

    const reorder = document.createElement("p");
    reorder.className = "selector-guide";
    reorder.textContent = this.text("reorderGuide");

    const dropGuide = document.createElement("p");
    dropGuide.className = "selector-guide";
    dropGuide.textContent = this.text("dropGuide");

    copy.append(title, guide, dropGuide, reorder);

    const button = document.createElement("button");
    button.className = "action-button";
    button.textContent = window.Language.t(labelKey);
    button.disabled = this.isRunning;
    button.addEventListener("click", async () => {
      if (this.isRunning) return;
      try {
        const files = await window.FileSelector.selectPDF();
        window.FileSelector[fileKey] = this.normalizeFiles(files);
        this.statusOverrideKey = "";
        this.renderControls();
        this.renderStatus();
      } catch (error) {
        if (error.name !== "AbortError") console.error(error);
      }
    });

    const list = document.createElement("div");
    list.className = "file-list";
    const entries = window.FileSelector?.[fileKey];

    if (entries?.length) {
      entries.forEach((entry, index) => {
        const item = document.createElement("div");
        item.className = "file-item";
        item.draggable = !this.isRunning;

        item.addEventListener("dragstart", (event) => {
          this.draggedFileId = entry.id;
          item.classList.add("is-dragging");
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", entry.id);
          }
        });

        item.addEventListener("dragend", () => {
          this.draggedFileId = "";
          this.clearFileHoverState(list);
          this.renderControls();
        });

        item.addEventListener("dragover", (event) => {
          event.preventDefault();
          if (!this.draggedFileId || this.draggedFileId === entry.id) return;
          this.clearFileHoverState(list);
          item.classList.add("is-hover");
          item.classList.toggle("is-hover-after", this.isPointerInLowerHalf(event, item));
        });

        item.addEventListener("dragleave", () => {
          item.classList.remove("is-hover");
          item.classList.remove("is-hover-after");
        });

        item.addEventListener("drop", (event) => {
          event.preventDefault();
          const draggedId = this.draggedFileId || event.dataTransfer?.getData("text/plain");
          const placeAfter = this.isPointerInLowerHalf(event, item);
          this.clearFileHoverState(list);
          if (!draggedId || draggedId === entry.id) return;
          this.moveFileAround(fileKey, draggedId, entry.id, placeAfter);
          this.statusOverrideKey = "";
          this.renderControls();
          this.renderStatus();
        });

        const name = document.createElement("div");
        name.className = "file-item-name";
        name.textContent = entry.file.name;

        const meta = document.createElement("div");
        meta.className = "file-item-meta";
        meta.textContent = `${tone} ${String(index + 1).padStart(2, "0")}`;

        item.append(name, meta);
        list.appendChild(item);
      });
    } else {
      const empty = document.createElement("div");
      empty.className = "empty-item";
      empty.textContent = this.text("noPdfSelected");
      list.appendChild(empty);
    }

    card.append(copy, button, list);
    area.appendChild(card);
  },

  clearFileHoverState(container) {
    container.querySelectorAll(".is-hover").forEach((element) => {
      element.classList.remove("is-hover");
      element.classList.remove("is-hover-after");
    });
  },

  moveFileAround(fileKey, draggedFileId, targetFileId, placeAfter) {
    const files = window.FileSelector?.[fileKey];
    if (!files?.length) return;

    const draggedIndex = files.findIndex((entry) => entry.id === draggedFileId);
    const targetIndex = files.findIndex((entry) => entry.id === targetFileId);
    if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) return;

    const [draggedFile] = files.splice(draggedIndex, 1);
    const nextTargetIndex = files.findIndex((entry) => entry.id === targetFileId);
    const insertIndex = placeAfter ? nextTargetIndex + 1 : nextTargetIndex;
    files.splice(insertIndex, 0, draggedFile);
  },

  isPointerInLowerHalf(event, element) {
    const rect = element.getBoundingClientRect();
    return event.clientY >= rect.top + rect.height / 2;
  },

  async chooseOutputFolder() {
    try {
      await window.FileSelector.selectOutputFolder();
      this.statusOverrideKey = "";
      this.renderStatus();
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    }
  },

  renderStatus() {
    const area = document.getElementById("statusArea");
    if (!area) return;

    area.innerHTML = "";

    const heading = document.createElement("h2");
    heading.className = "section-heading";
    heading.textContent = this.text("statusHeading");

    const message = document.createElement("p");
    message.className = "status-message";
    if (this.isRunning) {
      message.textContent = window.Language.t("MB5");
    } else if (this.statusOverrideKey) {
      message.textContent = this.text(this.statusOverrideKey);
    } else {
      message.textContent = this.text("readyMessage");
    }

    const summary = document.createElement("div");
    summary.className = "status-summary";
    summary.append(
      this.buildSummaryRow(this.text("leftPdfs"), String(window.FileSelector?.pdfLeftFiles?.length || 0)),
      this.buildSummaryRow(this.text("rightPdfs"), String(window.FileSelector?.pdfRightFiles?.length || 0)),
      this.buildSummaryRow(
        this.text("downloadMethod"),
        window.FileSelector?.outputDir?.name || this.text("downloadAuto"),
        {
          actionable: true,
          note: this.text("chooseFolderGuide"),
          onClick: () => this.chooseOutputFolder(),
        },
      ),
      this.buildSummaryRow(
        this.text("mode"),
        window.AppConfig.outputMode === "print" ? window.Language.t("MB14") : window.Language.t("MB13"),
      ),
    );

    const runPanel = document.createElement("div");
    runPanel.className = "run-panel";

    const button = document.createElement("button");
    button.className = "primary-button";
    button.textContent = window.Language.t("MB4");

    const canStart = Boolean(
      window.FileSelector?.pdfLeftFiles?.length &&
      window.FileSelector?.pdfRightFiles?.length &&
      !this.isRunning
    );

    button.disabled = !canStart;
    button.addEventListener("click", async () => {
      if (!canStart) return;

      this.isRunning = true;
      this.statusOverrideKey = "";
      this.progressPercent = 0;
      this.renderControls();
      this.renderStatus();
      this.renderProgress(0);

      try {
        const result = await window.PDFLogic.joinPdfs(
          window.FileSelector.pdfLeftFiles.map((entry) => entry.file),
          window.FileSelector.pdfRightFiles.map((entry) => entry.file),
        );

        if (window.FileSelector?.outputDir) {
          await window.FolderOutput.saveJoinedPdf(result.bytes, result.filename);
        } else {
          this.downloadJoinedPdf(result);
        }

        this.statusOverrideKey = "doneMessage";
      } finally {
        this.isRunning = false;
        this.renderControls();
        this.renderStatus();
      }
    });

    const statusGuide = document.createElement("p");
    statusGuide.className = "status-guide";
    statusGuide.textContent = canStart ? this.text("readyGuide") : this.text("blockedGuide");

    const image = document.createElement("img");
    image.className = "status-illustration";
    image.src = "./images/mirror_book.png";
    image.alt = this.text("mirrorBookAlt");

    runPanel.append(button, statusGuide, image);
    area.append(heading, message, summary, runPanel);
  },

  downloadJoinedPdf(result) {
    if (!result?.bytes?.length || !result?.filename) return;

    const blob = new Blob([result.bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  buildSummaryRow(label, value, options = {}) {
    const row = document.createElement("div");
    row.className = "summary-row";
    if (options.actionable) {
      row.classList.add("is-actionable");
      row.tabIndex = 0;
      row.role = "button";
      row.addEventListener("click", options.onClick);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          options.onClick?.();
        }
      });
    }

    const labelWrap = document.createElement("div");
    const labelNode = document.createElement("span");
    labelNode.className = "summary-label";
    labelNode.textContent = label;
    labelWrap.appendChild(labelNode);

    if (options.note) {
      const note = document.createElement("div");
      note.className = "file-item-meta";
      note.textContent = options.note;
      labelWrap.appendChild(note);
    }

    const valueNode = document.createElement("span");
    valueNode.className = "summary-value";
    valueNode.textContent = value;

    row.append(labelWrap, valueNode);
    return row;
  },

  renderProgress(percent) {
    const area = document.getElementById("progressArea");
    if (!area) return;

    this.progressPercent = Math.max(0, Math.min(100, Math.floor(percent)));
    area.innerHTML = "";

    const heading = document.createElement("h2");
    heading.className = "section-heading";
    heading.textContent = this.text("progressHeading");

    const wrap = document.createElement("div");
    wrap.className = "progress-wrap";

    const value = document.createElement("p");
    value.className = "progress-value";
    value.textContent = `${this.progressPercent}%`;

    const bar = document.createElement("div");
    bar.className = "progress-bar";

    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = `${this.progressPercent}%`;

    const caption = document.createElement("p");
    caption.className = "progress-caption";
    caption.textContent = this.isRunning ? this.text("progressRunning") : this.text("progressIdle");

    bar.appendChild(fill);
    wrap.append(value, bar, caption);
    area.append(heading, wrap);
  },

  renderBackLink() {
    const area = document.getElementById("backArea");
    if (!area) return;

    area.innerHTML = "";
    const link = document.createElement("a");
    link.className = "secondary-link-button";
    link.href = `../index.html?lang=${encodeURIComponent(window.Language.getHubNumber())}`;
    link.textContent = window.Language.t("MB15");
    area.appendChild(link);
  },
};
