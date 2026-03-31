window.Language = {
  current: "L2",
  languages: [],
  messages: {},

  fallbackLanguages: [
    { number: "L1", name: "English" },
    { number: "L2", name: "日本語" },
    { number: "L3", name: "中文" }
  ],

  fallbackMessages: {
    APP_TITLE: {
      L1: "PDFsuuu",
      L2: "PDFすうう",
      L3: "PDFsuuu"
    },
    APP_DESC: {
      L1: "Extract clean text from PDF files with page markers that are easy for both people and AI to read.",
      L2: "PDFから、AIにも人にも読みやすいページ付きTXTを出力します。",
      L3: "从PDF提取便于AI与人工阅读、带页码标记的TXT。"
    },
    LANG_LABEL: {
      L1: "Language",
      L2: "言語",
      L3: "语言"
    },
    FILE_TITLE: {
      L1: "PDF file",
      L2: "PDFファイル",
      L3: "PDF文件"
    },
    FILE_HELP: {
      L1: "Choose the source PDF or drop it into this area.",
      L2: "読み取るPDFを選択、またはこのエリアへドロップします。",
      L3: "选择要读取的PDF，或拖放到此区域。"
    },
    FOLDER_TITLE: {
      L1: "Output folder",
      L2: "受け取り方法",
      L3: "输出文件夹"
    },
    FOLDER_HELP: {
      L1: "Click here to open the folder picker.",
      L2: "ここをクリックするとフォルダ選択が開きます。",
      L3: "点击这里打开文件夹选择。"
    },
    OUTPUT_TITLE: {
      L1: "TXT format",
      L2: "TXT出力内容",
      L3: "TXT输出内容"
    },
    OUTPUT_HELP: {
      L1: "The output includes page headers and stable markers for AI parsing.",
      L2: "ページ見出しとAIが拾いやすい固定マーカーを同時に入れます。",
      L3: "同时输出页标题与便于AI解析的固定标记。"
    },
    OUTPUT_POINT_1: {
      L1: "Page units are separated clearly.",
      L2: "ページ単位で明確に区切ります。",
      L3: "按页面清晰分隔。"
    },
    OUTPUT_POINT_2: {
      L1: "Blank pages are labeled explicitly.",
      L2: "文字のないページも明示します。",
      L3: "无文字页面也会明确标注。"
    },
    OUTPUT_POINT_3: {
      L1: "Line noise is reduced for easier LLM input.",
      L2: "不要な改行ノイズを抑えてLLMへ渡しやすくします。",
      L3: "减少多余换行，便于输入LLM。"
    },
    SELECT_FILE: {
      L1: "Select PDF",
      L2: "PDFを選ぶ",
      L3: "选择PDF"
    },
    SELECT_FOLDER: {
      L1: "Select folder",
      L2: "保存先を選ぶ",
      L3: "选择文件夹"
    },
    START: {
      L1: "Create TXT",
      L2: "TXTを書き出す",
      L3: "生成TXT"
    },
    RUNNING: {
      L1: "Extracting text from the PDF...",
      L2: "PDFからテキストを抽出しています...",
      L3: "正在从PDF提取文字..."
    },
    READY: {
      L1: "Select a PDF and output folder, then create the TXT file.",
      L2: "PDFと保存先を選ぶと、ページ付きTXTを作成できます。",
      L3: "选择PDF和保存位置后即可生成带页标记的TXT。"
    },
    FILE_SELECTED: {
      L1: "Selected file",
      L2: "選択中のファイル",
      L3: "当前文件"
    },
    FOLDER_SELECTED: {
      L1: "Save to",
      L2: "受け取り方法",
      L3: "保存位置"
    },
    FOLDER_DEFAULT_NAME: {
      L1: "Browser download",
      L2: "ブラウザのダウンロード",
      L3: "浏览器下载"
    },
    OUTPUT_FILENAME_LABEL: {
      L1: "Output filename",
      L2: "出力ファイル名",
      L3: "输出文件名"
    },
    OUTPUT_FILENAME_PLACEHOLDER: {
      L1: "Auto-filled from the PDF filename",
      L2: "PDFを選ぶと自動入力",
      L3: "选择PDF后自动填入"
    },
    COMPLETE: {
      L1: "TXT file created successfully.",
      L2: "TXTの作成が完了しました。",
      L3: "TXT生成完成。"
    },
    COMPLETE_DETAIL: {
      L1: "Created a page-structured TXT file optimized for AI input.",
      L2: "AI入力向けに整えたページ構造つきTXTを保存しました。",
      L3: "已保存适合AI输入的分页TXT。"
    },
    EMPTY_PAGE_TEXT: {
      L1: "(No extractable text detected on this page.)",
      L2: "（このページでは抽出できるテキストが見つかりませんでした。）",
      L3: "（此页未检测到可提取文字。）"
    },
    ERROR_GENERIC: {
      L1: "The TXT file could not be created.",
      L2: "TXTを作成できませんでした。",
      L3: "无法生成TXT。"
    },
    ERROR_FILE_REQUIRED: {
      L1: "Please choose a PDF file first.",
      L2: "先にPDFファイルを選択してください。",
      L3: "请先选择PDF文件。"
    },
    ERROR_FOLDER_REQUIRED: {
      L1: "Please choose an output folder first.",
      L2: "先に保存先フォルダを選択してください。",
      L3: "请先选择输出文件夹。"
    },
    ERROR_FOLDER_PERMISSION_DENIED: {
      L1: "Write permission for the output folder was not granted.",
      L2: "保存先フォルダへの書き込み権限が許可されませんでした。",
      L3: "未获得输出文件夹写入权限。"
    },
    ERROR_INVALID_PDF_DROP: {
      L1: "Please drop a PDF file.",
      L2: "PDFファイルをドロップしてください。",
      L3: "请拖放PDF文件。"
    },
    STATUS_TITLE: {
      L1: "Status",
      L2: "状態",
      L3: "状态"
    },
    RESULT_TITLE: {
      L1: "Result",
      L2: "出力結果",
      L3: "输出结果"
    },
    PROGRESS_LABEL: {
      L1: "Progress",
      L2: "進行状況",
      L3: "进度"
    }
  },

  async init() {
    try {
      const [langCSV, msgCSV] = await Promise.all([
        fetch("./data/language.csv").then((r) => r.text()),
        fetch("./data/message_button.csv").then((r) => r.text())
      ]);

      this.languages = this.mergeLanguages(this.parseLanguageCSV(langCSV));
      this.messages = {
        ...this.fallbackMessages,
        ...this.parseMessageCSV(msgCSV)
      };
    } catch (error) {
      console.warn("Language data fallback in use:", error);
      this.languages = [...this.fallbackLanguages];
      this.messages = { ...this.fallbackMessages };
    }
  },

  mergeLanguages(csvLanguages) {
    if (!csvLanguages.length) return [...this.fallbackLanguages];

    const merged = [...csvLanguages];
    this.fallbackLanguages.forEach((fallback) => {
      if (!merged.some((language) => language.number === fallback.number)) {
        merged.push(fallback);
      }
    });

    return merged;
  },

  parseLanguageCSV(text) {
    const lines = (text || "").trim().split("\n").slice(1);
    return lines
      .map((line) => {
        const cols = line.split(",").map((cell) => cell.trim());
        return {
          number: cols[0],
          name: cols[1]
        };
      })
      .filter((language) => language.number && language.name);
  },

  parseMessageCSV(text) {
    const lines = (text || "").trim().split("\n").map((line) => line.replace(/\r/g, ""));
    if (!lines.length) return {};

    const header = lines[0].split(",").map((cell) => cell.trim());
    const map = {};

    lines.slice(1).forEach((line) => {
      const cols = line.split(",").map((cell) => cell.trim());
      const key = cols[0];
      if (!key) return;

      map[key] = {
        ...(this.fallbackMessages[key] || {})
      };

      header.slice(1).forEach((langKey, index) => {
        if (cols[index + 1]) {
          map[key][langKey] = cols[index + 1];
        }
      });
    });

    return map;
  },

  t(key) {
    return (
      this.messages[key]?.[this.current] ||
      this.messages[key]?.L2 ||
      this.messages[key]?.L1 ||
      key
    );
  },

  setLanguage(lang) {
    this.current = lang;
    window.UI.render();
  }
};
