const MAX_BYTES = 10 * 1024 * 1024;
const INITIAL_CHUNK_PAGES = 90;
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

const EMBEDDED_LANGUAGES = [
  { number: "1", label: "\u65e5\u672c\u8a9e" },
  { number: "2", label: "English" },
  { number: "3", label: "\u7e41\u9ad4\u4e2d\u6587" },
];

const EMBEDDED_MESSAGES = new Map([
  ["app_title", {
    name_L1: "PDF\u30b3\u30f3\u30d3\u30cbUSB",
    name_L2: "PDFconveniUSB",
    name_L3: "PDFconveniUSB",
  }],
  ["app_description", {
    name_L1: "PDF\u30921\u30d5\u30a1\u30a4\u30eb90\u679a\u306e\u8907\u6570\u30d5\u30a1\u30a4\u30eb\u3078\u30da\u30fc\u30b8\u5358\u4f4d\u3067\u5b89\u5168\u306b\u5206\u5272\u3057\u307e\u3059\u3002",
    name_L2: "Safely split a PDF into page-based files of up to 90 pages each.",
    name_L3: "\u5c07 PDF \u5b89\u5168\u5730\u4f9d\u9801\u9762\u5207\u5206\u6210\u6bcf\u500b\u6a94\u6848\u6700\u591a 90 \u9801\u7684\u591a\u500b\u6a94\u6848\u3002",
  }],
  ["language_label", {
    name_L1: "\u8868\u793a\u8a00\u8a9e",
    name_L2: "Language",
    name_L3: "\u986f\u793a\u8a9e\u8a00",
  }],
  ["drop_title", {
    name_L1: "PDF\u3092\u3053\u3053\u306b\u30c9\u30ed\u30c3\u30d7\u3057\u3066\u304f\u3060\u3055\u3044",
    name_L2: "Drop your PDF here",
    name_L3: "\u8acb\u5c07 PDF \u62d6\u653e\u5230\u9019\u88e1",
  }],
  ["drop_guide", {
    name_L1: "\u307e\u305f\u306f\u4e0b\u306e\u30dc\u30bf\u30f3\u304b\u3089PDF\u30d5\u30a1\u30a4\u30eb\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    name_L2: "Or choose a PDF file with the button below.",
    name_L3: "\u6216\u4f7f\u7528\u4e0b\u65b9\u6309\u9215\u9078\u64c7 PDF \u6a94\u6848\u3002",
  }],
  ["select_file_button", {
    name_L1: "PDF\u3092\u9078\u629e",
    name_L2: "Choose PDF",
    name_L3: "\u9078\u64c7 PDF",
  }],
  ["status_heading", {
    name_L1: "\u72b6\u614b",
    name_L2: "Status",
    name_L3: "\u72c0\u614b",
  }],
  ["output_heading", {
    name_L1: "\u51fa\u529b\u30d5\u30a1\u30a4\u30eb",
    name_L2: "Output Files",
    name_L3: "\u8f38\u51fa\u6a94\u6848",
  }],
  ["status_idle", {
    name_L1: "PDF\u30d5\u30a1\u30a4\u30eb\u3092\u304a\u5f85\u3061\u3057\u3066\u3044\u307e\u3059\u3002",
    name_L2: "Waiting for a PDF file.",
    name_L3: "\u7b49\u5f85 PDF \u6a94\u6848\u3002",
  }],
  ["status_processing", {
    name_L1: "PDF\u3092\u89e3\u6790\u3057\u3066\u5206\u5272\u3057\u3066\u3044\u307e\u3059\u3002\u3057\u3070\u3089\u304f\u304a\u5f85\u3061\u304f\u3060\u3055\u3044\u3002",
    name_L2: "Analyzing and splitting the PDF. Please wait.",
    name_L3: "\u6b63\u5728\u5206\u6790\u4e26\u5207\u5206 PDF\uff0c\u8acb\u7a0d\u5019\u3002",
  }],
  ["status_already_small", {
    name_L1: "\u3053\u306e\u30d5\u30a1\u30a4\u30eb\u306f\u3059\u3067\u306b10MB\u4ee5\u4e0b\u3067\u3059\u3002",
    name_L2: "This file is already 10 MB or smaller.",
    name_L3: "\u6b64\u6a94\u6848\u5df2\u7d93\u662f 10MB \u4ee5\u4e0b\u3002",
  }],
  ["status_single_page_too_large", {
    name_L1: "10MB\u3092\u8d85\u3048\u308b\u30da\u30fc\u30b8\u3092\u542b\u307f\u307e\u3059\u300210MB\u4ee5\u4e0b\u306b\u5206\u5272\u3059\u308b\u3053\u3068\u306f\u3067\u304d\u307e\u305b\u3093\u3002",
    name_L2: "This PDF contains a page larger than 10 MB and cannot be split under 10 MB.",
    name_L3: "\u6b64 PDF \u542b\u6709\u8d85\u904e 10MB \u7684\u9801\u9762\uff0c\u7121\u6cd5\u5207\u5206\u70ba 10MB \u4ee5\u4e0b\u3002",
  }],
  ["status_split_complete", {
    name_L1: "\u5b8c\u4e86\u3057\u307e\u3057\u305f\u3002\u6b21\u306e\u30d5\u30a1\u30a4\u30eb\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    name_L2: "Completed. Please choose the next file.",
    name_L3: "\u5df2\u5b8c\u6210\u3002\u8acb\u9078\u64c7\u4e0b\u4e00\u500b\u6a94\u6848\u3002",
  }],
  ["status_invalid_file", {
    name_L1: "PDF\u30d5\u30a1\u30a4\u30eb\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    name_L2: "Please choose a PDF file.",
    name_L3: "\u8acb\u9078\u64c7 PDF \u6a94\u6848\u3002",
  }],
  ["status_invalid_pdf", {
    name_L1: "PDF\u3092\u8aad\u307f\u8fbc\u3081\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u6709\u52b9\u306aPDF\u304b\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    name_L2: "Unable to read the PDF. Please confirm the file is valid.",
    name_L3: "\u7121\u6cd5\u8b80\u53d6 PDF\u3002\u8acb\u78ba\u8a8d\u6a94\u6848\u6709\u6548\u3002",
  }],
  ["status_processing_page_check", {
    name_L1: "\u30da\u30fc\u30b8\u3054\u3068\u306e\u5bb9\u91cf\u3092\u78ba\u8a8d\u3057\u3066\u3044\u307e\u3059\u3002",
    name_L2: "Checking the size of each page.",
    name_L3: "\u6b63\u5728\u6aa2\u67e5\u6bcf\u4e00\u9801\u7684\u5927\u5c0f\u3002",
  }],
  ["status_processing_chunk", {
    name_L1: "{from}\u30da\u30fc\u30b8\u76ee\u304b\u3089\u5206\u5272\u30b5\u30a4\u30ba\u3092\u8a08\u6e2c\u3057\u3066\u3044\u307e\u3059\u3002",
    name_L2: "Measuring split sizes starting from page {from}.",
    name_L3: "\u6b63\u5728\u5f9e\u7b2c {from} \u9801\u958b\u59cb\u6e2c\u91cf\u5207\u5206\u5927\u5c0f\u3002",
  }],
  ["output_file_label", {
    name_L1: "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9 {index}: {name} ({size})",
    name_L2: "Download {index}: {name} ({size})",
    name_L3: "\u4e0b\u8f09 {index}: {name} ({size})",
  }],
  ["status_general_error", {
    name_L1: "\u51e6\u7406\u4e2d\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002\u3082\u3046\u4e00\u5ea6\u304a\u8a66\u3057\u304f\u3060\u3055\u3044\u3002",
    name_L2: "An error occurred during processing. Please try again.",
    name_L3: "\u8655\u7406\u6642\u767c\u751f\u932f\u8aa4\u3002\u8acb\u518d\u8a66\u4e00\u6b21\u3002",
  }],
  ["back_to_top", {
    name_L1: "TOP\u3078\u623b\u308b",
    name_L2: "Back to TOP",
    name_L3: "\u8fd4\u56de TOP",
  }],
]);

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

  state.languages = EMBEDDED_LANGUAGES.map((language) => ({ ...language }));
  state.messages = new Map(EMBEDDED_MESSAGES);

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
  document.title = formatMessage("app_title");
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
