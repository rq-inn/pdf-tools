window.UI = {
  isRunning: false,
  statusTone: "neutral",
  statusMessage: "",
  statusDetail: "",
  lastResult: null,
  outputBaseName: "",
  isFileDragActive: false,

  render() {
    const title = document.getElementById("appTitle");
    const description = document.getElementById("appDescription");
    document.title = window.Language.t("APP_TITLE");
    if (title) title.textContent = window.Language.t("APP_TITLE");
    if (description) description.textContent = window.Language.t("APP_DESC");

    this.renderLanguageSelect();
    this.renderControls();
    this.renderStatus();
    this.renderBackLink();
  },

  renderLanguageSelect() {
    const area = document.getElementById("languageArea");
    area.innerHTML = "";

    const label = document.createElement("label");
    label.className = "language-panel";

    const caption = document.createElement("span");
    caption.textContent = window.Language.t("LANG_LABEL");
    label.appendChild(caption);

    const select = document.createElement("select");
    select.setAttribute("aria-label", window.Language.t("LANG_LABEL"));

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

    label.appendChild(select);
    area.appendChild(label);
  },

  renderControls() {
    const area = document.getElementById("controlArea");
    area.innerHTML = "";

    const panel = document.createElement("section");
    panel.className = "panel-stack";

    panel.appendChild(
      this.createFileCard({
        title: window.Language.t("FILE_TITLE"),
        help: window.Language.t("FILE_HELP"),
        buttonLabel: window.Language.t("SELECT_FILE"),
        valueLabel: window.Language.t("FILE_SELECTED"),
        onClick: async () => {
          if (this.isRunning) return;
          const file = await window.FileSelector.selectPDF();
          if (file) {
            this.syncOutputBaseNameFromFile(true);
            this.setStatus("neutral", window.Language.t("READY"), "");
            this.render();
          }
        }
      })
    );

    panel.appendChild(
      this.createFolderCard()
    );

    panel.appendChild(this.createFormatCard());
    panel.appendChild(this.createStartCard());

    area.appendChild(panel);
  },

  createActionCard({ title, help, buttonLabel, valueLabel, value, buttonClassName, onClick }) {
    const card = document.createElement("section");
    card.className = "panel action-card";

    const copy = document.createElement("div");
    copy.className = "panel-copy";

    const heading = document.createElement("h2");
    heading.textContent = title;
    copy.appendChild(heading);

    const description = document.createElement("p");
    description.textContent = help;
    copy.appendChild(description);

    const button = document.createElement("button");
    button.type = "button";
    button.className = buttonClassName;
    button.textContent = buttonLabel;
    button.disabled = this.isRunning;
    button.addEventListener("click", async () => {
      try {
        await onClick();
      } catch (error) {
        if (error?.name === "AbortError") return;
        const key = error?.message ? `ERROR_${error.message}` : "ERROR_GENERIC";
        this.showError(window.Language.t(key));
      }
    });

    const valueBox = document.createElement("div");
    valueBox.className = `selection-value${value ? "" : " is-empty"}`;
    valueBox.innerHTML = value
      ? `<span>${valueLabel}</span><strong>${this.escapeHTML(value)}</strong>`
      : `<span>${valueLabel}</span><strong>---</strong>`;

    card.appendChild(copy);
    card.appendChild(button);
    card.appendChild(valueBox);

    return card;
  },

  createFileCard({ title, help, buttonLabel, valueLabel, onClick }) {
    const card = document.createElement("section");
    card.className = `panel action-card file-card${this.isFileDragActive ? " is-drag-active" : ""}`;

    const copy = document.createElement("div");
    copy.className = "panel-copy";

    const heading = document.createElement("h2");
    heading.textContent = title;
    copy.appendChild(heading);

    const description = document.createElement("p");
    description.textContent = help;
    copy.appendChild(description);

    const dropHint = document.createElement("p");
    dropHint.className = "drop-hint";
    dropHint.textContent = "PDF Drop";
    copy.appendChild(dropHint);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "primary-button";
    button.textContent = buttonLabel;
    button.disabled = this.isRunning;
    button.addEventListener("click", async () => {
      try {
        await onClick();
      } catch (error) {
        if (error?.name === "AbortError") return;
        const key = error?.message ? `ERROR_${error.message}` : "ERROR_GENERIC";
        this.showError(window.Language.t(key));
      }
    });

    const value = window.FileSelector?.pdfFile?.name || "";
    const valueBox = document.createElement("div");
    valueBox.className = `selection-value${value ? "" : " is-empty"}`;
    valueBox.innerHTML = value
      ? `<span>${valueLabel}</span><strong>${this.escapeHTML(value)}</strong>`
      : `<span>${valueLabel}</span><strong>---</strong>`;

    this.attachFileDropEvents(card);

    card.appendChild(copy);
    card.appendChild(button);
    card.appendChild(valueBox);
    return card;
  },

  createFolderCard() {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "panel folder-card";
    card.disabled = this.isRunning;
    card.addEventListener("click", async () => {
      try {
        if (this.isRunning) return;
        await window.FileSelector.selectOutputFolder();
        this.setStatus("neutral", window.Language.t("READY"), "");
        this.render();
      } catch (error) {
        if (error?.name === "AbortError") return;
        const key = error?.message ? `ERROR_${error.message}` : "ERROR_GENERIC";
        this.showError(window.Language.t(key));
      }
    });

    const selectedName =
      window.FileSelector?.outputDir?.name || window.Language.t("FOLDER_DEFAULT_NAME");

    card.innerHTML = `
      <span class="folder-card-label">${this.escapeHTML(window.Language.t("FOLDER_TITLE"))}</span>
      <strong class="folder-card-value">${this.escapeHTML(selectedName)}</strong>
      <span class="folder-card-help">${this.escapeHTML(window.Language.t("FOLDER_HELP"))}</span>
    `;

    return card;
  },

  createFormatCard() {
    const card = document.createElement("section");
    card.className = "panel format-card";

    const heading = document.createElement("h2");
    heading.textContent = window.Language.t("OUTPUT_TITLE");
    card.appendChild(heading);

    const description = document.createElement("p");
    description.textContent = window.Language.t("OUTPUT_HELP");
    card.appendChild(description);

    const list = document.createElement("ul");
    list.className = "feature-list";

    ["OUTPUT_POINT_1", "OUTPUT_POINT_2", "OUTPUT_POINT_3"].forEach((key) => {
      const item = document.createElement("li");
      item.textContent = window.Language.t(key);
      list.appendChild(item);
    });

    const filename = document.createElement("div");
    filename.className = "filename-preview";
    filename.innerHTML = `<span>${window.Language.t("OUTPUT_FILENAME_LABEL")}</span>`;

    const editor = document.createElement("div");
    editor.className = "filename-editor";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "filename-input";
    input.value = this.getEditableBaseName();
    input.placeholder = window.Language.t("OUTPUT_FILENAME_PLACEHOLDER");
    input.disabled = this.isRunning;
    input.setAttribute("aria-label", window.Language.t("OUTPUT_FILENAME_LABEL"));
    input.addEventListener("input", (event) => {
      this.outputBaseName = this.sanitizeBaseName(event.target.value);
      if (event.target.value !== this.outputBaseName) {
        event.target.value = this.outputBaseName;
      }
      this.renderStatus();
    });
    input.addEventListener("blur", (event) => {
      if (!event.target.value.trim()) {
        this.syncOutputBaseNameFromFile(true);
        this.render();
      }
    });

    const suffix = document.createElement("strong");
    suffix.className = "filename-suffix";
    suffix.textContent = ".txt";

    editor.appendChild(input);
    editor.appendChild(suffix);
    filename.appendChild(editor);

    card.appendChild(list);
    card.appendChild(filename);
    return card;
  },

  createStartCard() {
    const card = document.createElement("section");
    card.className = "panel start-card";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "start-button";
    button.textContent = this.isRunning
      ? window.Language.t("RUNNING")
      : window.Language.t("START");

    const canStart =
      Boolean(window.FileSelector?.pdfFile) &&
      Boolean(window.FileSelector?.outputDir) &&
      !this.isRunning;

    button.disabled = !canStart;
    button.addEventListener("click", async () => {
      await this.run();
    });

    card.appendChild(button);

    const progressWrap = document.createElement("div");
    progressWrap.className = "progress-wrap";
    progressWrap.innerHTML = `
      <div class="progress-meta">
        <span>${window.Language.t("PROGRESS_LABEL")}</span>
        <strong id="progressValue">0%</strong>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill"></div>
      </div>
    `;
    card.appendChild(progressWrap);

    return card;
  },

  renderStatus() {
    const area = document.getElementById("statusArea");
    area.innerHTML = "";

    const grid = document.createElement("section");
    grid.className = "status-grid";

    const statusCard = document.createElement("article");
    statusCard.className = "panel status-card";
    statusCard.innerHTML = `
      <h2>${this.escapeHTML(window.Language.t("STATUS_TITLE"))}</h2>
      <p class="status-message" data-tone="${this.escapeHTML(this.statusTone)}">${this.escapeHTML(
        this.statusMessage || window.Language.t("READY")
      )}</p>
      <p class="status-detail">${this.escapeHTML(this.statusDetail || "")}</p>
    `;

    const resultCard = document.createElement("article");
    resultCard.className = "panel result-card";

    const title = document.createElement("h2");
    title.textContent = window.Language.t("RESULT_TITLE");
    resultCard.appendChild(title);

    const list = document.createElement("ul");
    list.className = "output-list";

    if (this.lastResult) {
      [
        `${window.Language.t("OUTPUT_FILENAME_LABEL")}: ${this.lastResult.filename}`,
        `${window.Language.t("FOLDER_SELECTED")}: ${this.lastResult.directoryName}`,
        `Pages: ${this.lastResult.totalPages}`
      ].forEach((text) => {
        const item = document.createElement("li");
        item.textContent = text;
        list.appendChild(item);
      });
    } else {
      const item = document.createElement("li");
      item.textContent = this.getPlannedFilename();
      list.appendChild(item);
    }

    resultCard.appendChild(list);
    grid.appendChild(statusCard);
    grid.appendChild(resultCard);
    area.appendChild(grid);
  },

  renderBackLink() {
    const area = document.getElementById("backArea");
    if (!area) return;

    const labels = {
      L1: "Back to TOP",
      L2: "TOPへ戻る",
      L3: "返回 TOP"
    };
    const hubNumber = window.Language.current === "L2"
      ? "1"
      : window.Language.current === "L3"
        ? "3"
        : "2";

    area.innerHTML = "";
    const link = document.createElement("a");
    link.className = "secondary-link-button";
    link.href = `../index.html?lang=${encodeURIComponent(hubNumber)}`;
    link.textContent = labels[window.Language.current] || labels.L1;
    area.appendChild(link);
  },

  async run() {
    if (!window.FileSelector?.pdfFile) {
      this.showError(window.Language.t("ERROR_FILE_REQUIRED"));
      return;
    }

    if (!window.FileSelector?.outputDir) {
      this.showError(window.Language.t("ERROR_FOLDER_REQUIRED"));
      return;
    }

    this.isRunning = true;
    this.lastResult = null;
    this.syncOutputBaseNameFromFile(false);
    this.setStatus("neutral", window.Language.t("RUNNING"), "");
    this.render();
    this.renderProgress(5);

    try {
      const extracted = await window.PDFExtractor.extract(window.FileSelector.pdfFile);
      this.renderProgress(45);

      const normalized = window.TextNormalizer.normalizeDocument(extracted);
      const exportText = window.TextNormalizer.buildExportText(normalized);
      this.renderProgress(80);

      const result = await window.TxtGenerator.generate(exportText);
      this.renderProgress(100);

      this.lastResult = {
        ...result,
        totalPages: normalized.totalPages
      };
      this.setStatus(
        "success",
        window.Language.t("COMPLETE"),
        window.Language.t("COMPLETE_DETAIL")
      );
    } catch (error) {
      const key = error?.message ? `ERROR_${error.message}` : "ERROR_GENERIC";
      this.showError(window.Language.t(key));
      this.renderProgress(0);
    } finally {
      this.isRunning = false;
      this.render();
      this.renderProgress(this.lastResult ? 100 : 0);
    }
  },

  renderProgress(percent) {
    const fill = document.getElementById("progressFill");
    const label = document.getElementById("progressValue");
    const value = Math.max(0, Math.min(100, Math.round(percent)));

    if (fill) fill.style.width = `${value}%`;
    if (label) label.textContent = `${value}%`;
  },

  setStatus(tone, message, detail) {
    this.statusTone = tone;
    this.statusMessage = message;
    this.statusDetail = detail;
  },

  showError(message) {
    this.setStatus("warn", message, "");
    this.renderStatus();
  },

  attachFileDropEvents(card) {
    const activate = (event) => {
      if (this.isRunning) return;
      event.preventDefault();
      this.isFileDragActive = true;
      card.classList.add("is-drag-active");
    };

    const clear = (event) => {
      if (event) event.preventDefault();
      this.isFileDragActive = false;
      card.classList.remove("is-drag-active");
    };

    card.addEventListener("dragenter", activate);
    card.addEventListener("dragover", activate);
    card.addEventListener("dragleave", (event) => {
      if (event.currentTarget.contains(event.relatedTarget)) return;
      clear(event);
    });
    card.addEventListener("drop", async (event) => {
      clear(event);
      if (this.isRunning) return;

      const file = event.dataTransfer?.files?.[0];
      if (!file || !/\.pdf$/i.test(file.name)) {
        this.showError(window.Language.t("ERROR_INVALID_PDF_DROP"));
        return;
      }

      window.FileSelector.pdfFile = file;
      this.syncOutputBaseNameFromFile(true);
      this.setStatus("neutral", window.Language.t("READY"), "");
      this.render();
    });
  },

  getPlannedFilename() {
    const baseName = this.getEditableBaseName();
    return baseName ? `${baseName}.txt` : ".txt";
  },

  getEditableBaseName() {
    this.syncOutputBaseNameFromFile(false);
    return this.outputBaseName || "";
  },

  syncOutputBaseNameFromFile(force) {
    const fileBaseName = (window.FileSelector?.pdfFile?.name || "").replace(/\.pdf$/i, "");
    const sanitized = this.sanitizeBaseName(fileBaseName);
    if (force || !this.outputBaseName) {
      this.outputBaseName = sanitized;
    }
  },

  sanitizeBaseName(value) {
    return String(value || "")
      .replace(/\.txt$/i, "")
      .replace(/[\\/:*?"<>|]/g, "")
      .trim();
  },

  escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
};
