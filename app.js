const state = {
  languages: [],
  messages: new Map(),
  currentNumber: null,
  currentColumn: "name_L2",
};

const apps = [
  {
    titleKey: "app_pdf_conveni_title",
    descKey: "app_pdf_conveni_desc",
    href: "./20260330_PDFコンビニUSBv2/index.html",
    icon: "./20260330_PDFコンビニUSBv2/images/icon-64.png",
  },
  {
    titleKey: "app_pdf_choki_title",
    descKey: "app_pdf_choki_desc",
    href: "./20260329_PDFちょきv2/index.html",
    icon: "./20260329_PDFちょきv2/images/icon-64.png",
  },
  {
    titleKey: "app_pdf_guuu_title",
    descKey: "app_pdf_guuu_desc",
    href: "./20260331_PDFぐううv2/index.html",
    icon: "./20260331_PDFぐううv2/images/icon-64.png",
  },
  {
    titleKey: "app_pdf_pakka_title",
    descKey: "app_pdf_pakka_desc",
    href: "./20260331_PDFぱっかv2/index.html",
    icon: "./20260331_PDFぱっかv2/images/icon-64.png",
  },
  {
    titleKey: "app_pdf_suuu_title",
    descKey: "app_pdf_suuu_desc",
    href: "./20260331_PDFすうう/index.html",
    icon: "./20260331_PDFすうう/images/icon-64.png",
  },
];

const elements = {
  unsupportedScreen: document.querySelector("#unsupported-screen"),
  appRoot: document.querySelector("#app-root"),
  appKicker: document.querySelector("#app-kicker"),
  appTitle: document.querySelector("#app-title"),
  appDescriptionLine1: document.querySelector("#app-description-line-1"),
  appDescriptionLine2: document.querySelector("#app-description-line-2"),
  languageLabel: document.querySelector("#language-label"),
  languageSelect: document.querySelector("#language-select"),
  launcherGrid: document.querySelector("#launcher-grid"),
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

  elements.languageSelect.addEventListener("change", (event) => {
    setLanguage(event.target.value);
  });

  elements.appRoot.hidden = false;
  document.body.dataset.ready = "true";
}

function setLanguage(number) {
  state.currentNumber = String(number);
  state.currentColumn = resolveLanguageColumn(state.currentNumber);
  renderLanguageOptions();
  renderTexts();
  renderCards();
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

function renderTexts() {
  elements.appKicker.textContent = formatMessage("app_kicker");
  elements.appTitle.textContent = formatMessage("app_title");
  elements.appDescriptionLine1.textContent = formatMessage("app_description_line_1");
  elements.appDescriptionLine2.textContent = formatMessage("app_description_line_2");
  elements.languageLabel.textContent = formatMessage("language_label");
  elements.languageSelect.setAttribute("aria-label", formatMessage("language_label"));
  document.title = formatMessage("app_title");
}

function renderCards() {
  elements.launcherGrid.replaceChildren();

  apps.forEach((app) => {
    const link = document.createElement("a");
    link.className = "app-link-card";
    link.href = `${app.href}?lang=${encodeURIComponent(state.currentNumber)}`;

    const icon = document.createElement("img");
    icon.className = "card-icon";
    icon.src = app.icon;
    icon.alt = "";

    const title = document.createElement("h2");
    title.className = "card-title";
    title.textContent = formatMessage(app.titleKey);

    const description = document.createElement("p");
    description.className = "card-description";
    description.textContent = formatMessage(app.descKey);

    const jump = document.createElement("span");
    jump.className = "card-jump";
    jump.textContent = formatMessage("card_jump");

    link.append(icon, title, description, jump);
    elements.launcherGrid.append(link);
  });
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
  const availableNumbers = new Set(languages.map((language) => String(language.number)));
  if (paramNumber && availableNumbers.has(String(paramNumber))) {
    return String(paramNumber);
  }

  const browserLanguage = (navigator.language || "").toLowerCase();
  let detected = "2";

  if (browserLanguage === "ja" || browserLanguage === "ja-jp") {
    detected = "1";
  } else if (["zh-tw", "zh-hk", "zh-cn", "zh-sg"].includes(browserLanguage)) {
    detected = "3";
  }

  return availableNumbers.has(detected) ? detected : "2";
}

function formatMessage(key) {
  const row = state.messages.get(key);
  return row?.[state.currentColumn] || row?.name_L2 || key;
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

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        current += "\"";
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

bootstrap().catch((error) => {
  console.error(error);
  elements.appRoot.hidden = false;
  document.body.dataset.ready = "true";
});
