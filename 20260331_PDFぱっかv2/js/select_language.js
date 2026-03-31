// select_language.js

window.Language = {
  current: "L2", // 日本語を初期値

  languages: [],
  messages: {},

  async init() {
    const [langCSV, msgCSV] = await Promise.all([
      fetch("./data/language.csv").then(r => r.text()),
      fetch("./data/message_button.csv").then(r => r.text())
    ]);

    this.languages = this.parseLanguageCSV(langCSV);
    this.messages = this.parseMessageCSV(msgCSV);
    this.current = this.detectInitialLanguage();
  },

  parseLanguageCSV(text) {
    const lines = text.trim().split("\n").slice(1);
    return lines.map(line => {
      const cols = line.split(",").map(c => c.trim());
      return {
        number: cols[0],
        name: cols[1]
      };
    });
  },

  parseMessageCSV(text) {
    const lines = text.trim().split("\n").map(l => l.replace(/\r/g, ""));
    const header = lines[0].split(",").map(h => h.trim());
    const map = {};

    lines.slice(1).forEach(line => {
      const cols = line.split(",").map(c => c.trim());
      const key = cols[0];
      map[key] = {};

      header.slice(1).forEach((langKey, i) => {
        map[key][langKey] = cols[i + 1] ?? "";
      });
    });

    return map;
  },

  t(key) {
    return this.messages[key]?.[this.current] || key;
  },

  detectInitialLanguage() {
    const requested = this.normalizeRequestedLanguage(
      new URLSearchParams(window.location.search).get("lang")
    );
    if (requested && this.languages.some((language) => language.number === requested)) {
      return requested;
    }

    const browserLanguage = (navigator.language || "").toLowerCase();
    if (browserLanguage === "ja" || browserLanguage === "ja-jp") {
      return "L2";
    }
    if (["zh-tw", "zh-hk", "zh-cn", "zh-sg"].includes(browserLanguage)) {
      return "L3";
    }
    return "L1";
  },

  normalizeRequestedLanguage(value) {
    if (value === "1") return "L2";
    if (value === "2") return "L1";
    if (value === "3") return "L3";
    if (["L1", "L2", "L3"].includes(value)) return value;
    return "";
  },

  getHubNumber() {
    if (this.current === "L2") return "1";
    if (this.current === "L3") return "3";
    return "2";
  },

  setLanguage(lang) {
    this.current = lang;
    window.UI.render();
  }
};
