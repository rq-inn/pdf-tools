document.addEventListener("DOMContentLoaded", async () => {
  const unsupportedScreen = document.getElementById("unsupportedScreen");
  const appRoot = document.getElementById("appRoot");
  const footer = document.getElementById("osNotice");

  try {
    await window.Language.init();
  } catch (error) {
    console.warn("Language init failed:", error);
  }

  const noticeKey = window.OSDetect?.getNoticeKey();
  if (noticeKey) {
    if (unsupportedScreen) {
      unsupportedScreen.hidden = false;
    }
    if (footer) {
      footer.textContent = "iOS / Android : Not supported";
      footer.classList.add("hidden");
    }
    return;
  }

  window.UI.render();

  if (appRoot) {
    appRoot.hidden = false;
  }

  if (footer) {
    footer.classList.add("hidden");
  }
});
