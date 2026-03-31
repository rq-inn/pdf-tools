const MAX_BYTES = 10 * 1024 * 1024;
const INITIAL_CHUNK_PAGES = 30;
const CHUNK_STEP = 2;

const state = {
  languages: [],
  messages: new Map(),
  currentNumber: null,
  currentColumn: "name_L2",
  downloadUrls: [],
  outputs: [],
  originalFileName: "",
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
  outputHeading: document.querySelector("#output-heading"),
  outputList: document.querySelector("#output-list"),
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
    const [file] = event.target.files || [];
    await processFile(file);
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
    const [file] = Array.from(event.dataTransfer?.files || []);
    await processFile(file);
  });

  elements.dropZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      elements.fileInput.click();
    }
  });
}

async function processFile(file) {
  resetOutputs();

  const looksLikePdf = file
    && (file.type === "application/pdf" || /\.pdf$/i.test(file.name || ""));

  if (!looksLikePdf) {
    setStatus("status_invalid_file", "warn");
    return;
  }

  if (file.size < MAX_BYTES) {
    setStatus("status_already_small", "warn");
    return;
  }

  setStatus("status_processing", "success");

  try {
    const bytes = await file.arrayBuffer();
    const sourceDoc = await PDFLib.PDFDocument.load(bytes);

    setStatus("status_processing_page_check", "success");
    const pageCount = sourceDoc.getPageCount();
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      const pagePdfBytes = await createSlicePdfBytes(sourceDoc, pageIndex, 1);
      if (pagePdfBytes.length > MAX_BYTES) {
        resetOutputs();
        setStatus("status_single_page_too_large", "warn");
        return;
      }
    }

    const outputs = [];
    let startIndex = 0;
    while (startIndex < pageCount) {
      setStatus("status_processing_chunk", "success", {
        from: String(startIndex + 1),
      });

      const remaining = pageCount - startIndex;
      let chunkPages = Math.min(INITIAL_CHUNK_PAGES, remaining);
      let acceptedBytes = await createSlicePdfBytes(sourceDoc, startIndex, chunkPages);

      while (acceptedBytes.length > MAX_BYTES && chunkPages > 1) {
        chunkPages -= CHUNK_STEP;
        if (chunkPages < 1) {
          chunkPages = 1;
        }
        acceptedBytes = await createSlicePdfBytes(sourceDoc, startIndex, chunkPages);
      }

      if (acceptedBytes.length > MAX_BYTES) {
        resetOutputs();
        setStatus("status_single_page_too_large", "warn");
        return;
      }

      outputs.push({
        bytes: acceptedBytes,
        startPage: startIndex + 1,
        endPage: startIndex + chunkPages,
      });
      startIndex += chunkPages;
    }

    state.originalFileName = file.name;
    state.outputs = outputs;
    downloadOutputs();
    clearOutputList();
    setStatus("status_split_complete", "success");
  } catch (error) {
    console.error(error);
    resetOutputs();
    const messageKey = /Failed to parse PDF document/i.test(String(error))
      ? "status_invalid_pdf"
      : "status_general_error";
    setStatus(messageKey, "warn");
  }
}

async function createSlicePdfBytes(sourceDoc, startIndex, count) {
  const outputDoc = await PDFLib.PDFDocument.create();
  const pageIndexes = Array.from({ length: count }, (_, offset) => startIndex + offset);
  const pages = await outputDoc.copyPages(sourceDoc, pageIndexes);
  pages.forEach((page) => outputDoc.addPage(page));
  return outputDoc.save();
}

function renderOutputs() {
  clearOutputList();
  if (!state.originalFileName || state.outputs.length === 0) {
    return;
  }

  state.outputs.forEach((output, index) => {
    const blob = new Blob([output.bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    state.downloadUrls.push(url);

    const partName = buildPartName(state.originalFileName, output, index);
    const label = formatMessage("output_file_label", {
      index: String(index + 1),
      name: partName,
      size: formatBytes(output.bytes.length),
    });

    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = url;
    link.download = partName;
    link.textContent = label;
    item.append(link);
    elements.outputList.append(item);
  });
}

function downloadOutputs() {
  state.outputs.forEach((output, index) => {
    const blob = new Blob([output.bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    state.downloadUrls.push(url);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = buildPartName(state.originalFileName, output, index);
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  });
}

function buildPartName(originalName, output, index) {
  const safeBaseName = originalName.replace(/\.pdf$/i, "");
  return `${String(index + 1).padStart(2, "0")}_${safeBaseName}.pdf`;
}

function clearOutputList() {
  state.downloadUrls.forEach((url) => URL.revokeObjectURL(url));
  state.downloadUrls = [];
  elements.outputList.replaceChildren();
}

function resetOutputs() {
  state.outputs = [];
  state.originalFileName = "";
  clearOutputList();
}

function setLanguage(number) {
  state.currentNumber = String(number);
  state.currentColumn = resolveLanguageColumn(state.currentNumber);
  renderLanguageOptions();
  renderStaticTexts();
  renderOutputs();
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
  elements.outputHeading.textContent = formatMessage("output_heading");
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
