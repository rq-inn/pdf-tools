const state = {
  languages: [],
  messages: new Map(),
  currentNumber: null,
  currentColumn: "name_L2",
  sourceFiles: [],
  mergedBytes: null,
  mergedUrl: "",
  mergedFileName: "",
  draggedFileId: null,
  statusKey: "status_idle",
  statusTone: "",
  statusValues: {},
};

const elements = {
  unsupportedScreen: document.querySelector("#unsupported-screen"),
  appRoot: document.querySelector("#app-root"),
  languageSelect: document.querySelector("#language-select"),
  appTitle: document.querySelector("#app-title"),
  appDescription: document.querySelector("#app-description"),
  languageLabel: document.querySelector("#language-label"),
  dropZone: document.querySelector("#drop-zone"),
  fileInput: document.querySelector("#file-input"),
  dropTitle: document.querySelector("#drop-title"),
  dropGuide: document.querySelector("#drop-guide"),
  selectFileButton: document.querySelector("#select-file-button"),
  statusHeading: document.querySelector("#status-heading"),
  statusMessage: document.querySelector("#status-message"),
  fileListHeading: document.querySelector("#file-list-heading"),
  fileListGuide: document.querySelector("#file-list-guide"),
  fileList: document.querySelector("#file-list"),
  outputHeading: document.querySelector("#output-heading"),
  outputMessage: document.querySelector("#output-message"),
  downloadButton: document.querySelector("#download-button"),
  backToTopLink: document.querySelector("#back-to-top-link"),
};

async function bootstrap() {
  const isMobile = document.documentElement.dataset.mobile === "true";
  document.body.dataset.mobile = isMobile ? "true" : "false";

  if (isMobile) {
    elements.unsupportedScreen.hidden = false;
    return;
  }

  const [languagesCsv, messagesCsv] = await Promise.all([
    fetchText("./language.csv"),
    fetchText("./message.csv"),
  ]);

  state.languages = parseCsv(languagesCsv).map((row) => ({
    number: row.Number,
    label: row.language,
  }));
  state.messages = new Map(parseCsv(messagesCsv).map((row) => [row.key, row]));

  const initialNumber = detectInitialLanguageNumber(state.languages);
  setLanguage(initialNumber);
  bindEvents();
  registerServiceWorker();

  elements.appRoot.hidden = false;
  document.body.dataset.ready = "true";
}

function bindEvents() {
  elements.languageSelect.addEventListener("change", (event) => {
    setLanguage(event.target.value);
  });

  elements.selectFileButton.addEventListener("click", () => {
    elements.fileInput.click();
  });

  elements.fileInput.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []);
    await processFiles(files);
    event.target.value = "";
  });

  ["dragenter", "dragover"].forEach((type) => {
    elements.dropZone.addEventListener(type, (event) => {
      event.preventDefault();
      elements.dropZone.classList.add("is-active");
    });
  });

  ["dragleave", "drop"].forEach((type) => {
    elements.dropZone.addEventListener(type, (event) => {
      event.preventDefault();
      elements.dropZone.classList.remove("is-active");
    });
  });

  elements.dropZone.addEventListener("drop", async (event) => {
    const files = Array.from(event.dataTransfer?.files || []);
    await processFiles(files);
  });

  elements.dropZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      elements.fileInput.click();
    }
  });

  elements.downloadButton.addEventListener("click", () => {
    downloadMergedPdf();
  });
}

async function processFiles(files) {
  const pdfFiles = files
    .filter(isPdfFile)
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }));

  if (pdfFiles.length === 0) {
    setStatus("status_invalid_file", "warn");
    return;
  }

  if (pdfFiles.length !== files.length) {
    setStatus("status_partial_invalid", "warn", {
      count: String(files.length - pdfFiles.length),
    });
  } else {
    setStatus("status_processing", "success", {
      count: String(pdfFiles.length),
    });
  }

  try {
    const newEntries = [];

    for (const file of pdfFiles) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      await PDFLib.PDFDocument.load(bytes);
      newEntries.push({
        id: crypto.randomUUID(),
        name: file.name,
        bytes,
      });
    }

    state.sourceFiles.push(...newEntries);
    await rebuildMergedPdf();
    setStatus("status_merge_ready", "success", {
      count: String(state.sourceFiles.length),
    });
  } catch (error) {
    console.error(error);
    setStatus(
      /Failed to parse PDF document/i.test(String(error)) ? "status_invalid_pdf" : "status_general_error",
      "warn",
    );
  }
}

async function rebuildMergedPdf() {
  disposeMergedUrl();

  if (state.sourceFiles.length === 0) {
    state.mergedBytes = null;
    state.mergedFileName = "";
    renderFileList();
    renderOutput();
    return;
  }

  const outputDoc = await PDFLib.PDFDocument.create();

  for (const file of state.sourceFiles) {
    const sourceDoc = await PDFLib.PDFDocument.load(file.bytes);
    const pageIndexes = sourceDoc.getPageIndices();
    const pages = await outputDoc.copyPages(sourceDoc, pageIndexes);
    pages.forEach((page) => outputDoc.addPage(page));
  }

  state.mergedBytes = await outputDoc.save();
  state.mergedFileName = buildMergedFileName(state.sourceFiles);
  state.mergedUrl = URL.createObjectURL(new Blob([state.mergedBytes], { type: "application/pdf" }));

  renderFileList();
  renderOutput();
}

function renderFileList() {
  elements.fileList.replaceChildren();

  if (state.sourceFiles.length === 0) {
    const item = document.createElement("li");
    item.className = "file-list-empty";
    item.textContent = formatMessage("file_list_empty");
    elements.fileList.append(item);
    return;
  }

  state.sourceFiles.forEach((file, index) => {
    const item = document.createElement("li");
    item.className = "file-list-item";
    item.draggable = true;
    item.dataset.fileId = file.id;

    item.addEventListener("dragstart", (event) => {
      state.draggedFileId = file.id;
      item.classList.add("is-dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", file.id);
      }
    });

    item.addEventListener("dragend", () => {
      state.draggedFileId = null;
      clearFileHoverState();
      renderFileList();
    });

    item.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (state.draggedFileId && state.draggedFileId !== file.id) {
        clearFileHoverState();
        item.classList.add("is-hover");
        item.classList.toggle("is-hover-after", isPointerInLowerHalf(event, item));
      }
    });

    item.addEventListener("dragleave", () => {
      item.classList.remove("is-hover");
      item.classList.remove("is-hover-after");
    });

    item.addEventListener("drop", async (event) => {
      event.preventDefault();
      const draggedFileId = state.draggedFileId || event.dataTransfer?.getData("text/plain");
      const placeAfter = isPointerInLowerHalf(event, item);
      clearFileHoverState();
      if (!draggedFileId || draggedFileId === file.id) {
        return;
      }
      moveFileAround(draggedFileId, file.id, placeAfter);
      await rebuildMergedPdf();
      setStatus("status_reordered", "success");
    });

    const indexBadge = document.createElement("span");
    indexBadge.className = "file-index";
    indexBadge.textContent = String(index + 1).padStart(2, "0");

    const name = document.createElement("span");
    name.className = "file-name";
    name.textContent = file.name;

    item.append(indexBadge, name);
    elements.fileList.append(item);
  });
}

function clearFileHoverState() {
  elements.fileList.querySelectorAll(".is-hover").forEach((element) => {
    element.classList.remove("is-hover");
    element.classList.remove("is-hover-after");
  });
}

function moveFileAround(draggedFileId, targetFileId, placeAfter = false) {
  const draggedIndex = state.sourceFiles.findIndex((file) => file.id === draggedFileId);
  const targetIndex = state.sourceFiles.findIndex((file) => file.id === targetFileId);

  if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) {
    return;
  }

  const [draggedFile] = state.sourceFiles.splice(draggedIndex, 1);
  const nextTargetIndex = state.sourceFiles.findIndex((file) => file.id === targetFileId);
  const insertIndex = placeAfter ? nextTargetIndex + 1 : nextTargetIndex;
  state.sourceFiles.splice(insertIndex, 0, draggedFile);
}

function isPointerInLowerHalf(event, element) {
  const rect = element.getBoundingClientRect();
  return event.clientY >= rect.top + rect.height / 2;
}

function renderOutput() {
  if (!state.mergedBytes || !state.mergedFileName) {
    elements.outputMessage.textContent = formatMessage("output_empty");
    elements.downloadButton.disabled = true;
    return;
  }

  elements.outputMessage.textContent = formatMessage("output_ready", {
    name: state.mergedFileName,
    count: String(state.sourceFiles.length),
    size: formatBytes(state.mergedBytes.length),
  });
  elements.downloadButton.disabled = false;
}

function downloadMergedPdf() {
  if (!state.mergedUrl || !state.mergedFileName) {
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = state.mergedUrl;
  anchor.download = state.mergedFileName;
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

function disposeMergedUrl() {
  if (!state.mergedUrl) {
    return;
  }
  URL.revokeObjectURL(state.mergedUrl);
  state.mergedUrl = "";
}

function buildMergedFileName(files) {
  const firstName = files[0]?.name?.replace(/\.pdf$/i, "") || "merged";
  return `${firstName}_merged.pdf`;
}

function isPdfFile(file) {
  return Boolean(
    file && (file.type === "application/pdf" || /\.pdf$/i.test(file.name || "")),
  );
}

function setLanguage(number) {
  state.currentNumber = String(number);
  state.currentColumn = resolveLanguageColumn(state.currentNumber);
  renderLanguageOptions();
  renderStaticTexts();
  renderFileList();
  renderOutput();
  setStatus(state.statusKey, state.statusTone, state.statusValues);
}

function renderLanguageOptions() {
  elements.languageSelect.replaceChildren();
  state.languages.forEach((language) => {
    const option = document.createElement("option");
    option.value = language.number;
    option.textContent = language.label;
    option.selected = String(language.number) === state.currentNumber;
    elements.languageSelect.append(option);
  });
}

function renderStaticTexts() {
  elements.appTitle.textContent = formatMessage("app_title");
  elements.appDescription.textContent = formatMessage("app_description");
  elements.languageLabel.textContent = formatMessage("language_label");
  elements.languageSelect.setAttribute("aria-label", formatMessage("language_label"));
  elements.dropTitle.textContent = formatMessage("drop_title");
  elements.dropGuide.textContent = formatMessage("drop_guide");
  elements.selectFileButton.textContent = formatMessage("select_file_button");
  elements.statusHeading.textContent = formatMessage("status_heading");
  elements.fileListHeading.textContent = formatMessage("file_list_heading");
  elements.fileListGuide.textContent = formatMessage("file_list_guide");
  elements.outputHeading.textContent = formatMessage("output_heading");
  elements.downloadButton.textContent = formatMessage("download_button");
  elements.backToTopLink.textContent = formatBackToTopLabel();
  elements.backToTopLink.href = `../index.html?lang=${encodeURIComponent(state.currentNumber)}`;
}

function setStatus(key, tone = "", values = {}) {
  state.statusKey = key;
  state.statusTone = tone;
  state.statusValues = values;
  elements.statusMessage.textContent = formatMessage(key, values);
  if (tone) {
    elements.statusMessage.dataset.tone = tone;
  } else {
    delete elements.statusMessage.dataset.tone;
  }
}

function resolveLanguageColumn(number) {
  if (String(number) === "1") {
    return "name_L1";
  }
  if (String(number) === "3") {
    return "name_L3";
  }
  return "name_L2";
}

function detectInitialLanguageNumber(languages) {
  const paramNumber = new URLSearchParams(window.location.search).get("lang");
  const browserLanguage = (navigator.language || "").toLowerCase();
  const availableNumbers = new Set(languages.map((language) => String(language.number)));

  if (paramNumber && availableNumbers.has(String(paramNumber))) {
    return String(paramNumber);
  }

  let detected = "2";
  if (browserLanguage === "ja" || browserLanguage === "ja-jp") {
    detected = "1";
  } else if (["zh-tw", "zh-hk", "zh-cn", "zh-sg"].includes(browserLanguage)) {
    detected = "3";
  }

  return availableNumbers.has(detected) ? detected : "2";
}

function formatMessage(key, values = {}) {
  const row = state.messages.get(key);
  const template = row?.[state.currentColumn] || row?.name_L2 || key;
  return Object.entries(values).reduce(
    (text, [token, value]) => text.replaceAll(`{${token}}`, value),
    template,
  );
}

function formatBackToTopLabel() {
  if (state.currentNumber === "1") {
    return "TOPへ戻る";
  }
  if (state.currentNumber === "3") {
    return "返回 TOP";
  }
  return "Back to TOP";
}

async function fetchText(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.text();
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(current);
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  const [header, ...body] = rows;
  return body.map((cells) =>
    header.reduce((record, column, index) => {
      record[column] = cells[index] ?? "";
      return record;
    }, {}),
  );
}

function formatBytes(bytes) {
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(2)} MB`;
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("./service-worker.js");
  } catch (error) {
    console.error("Service worker registration failed", error);
  }
}

bootstrap().catch((error) => {
  console.error(error);
  elements.appRoot.hidden = false;
  document.body.dataset.ready = "true";
  setStatus("status_general_error", "warn");
});
