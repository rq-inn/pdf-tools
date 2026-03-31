document.addEventListener("DOMContentLoaded", async () => {
  const unsupportedScreen = document.getElementById("unsupportedScreen");
  const appRoot = document.getElementById("appRoot");
  const isMobile = document.documentElement.dataset.mobile === "true";

  document.body.dataset.mobile = isMobile ? "true" : "false";

  if (isMobile) {
    if (unsupportedScreen) {
      unsupportedScreen.hidden = false;
    }
    return;
  }

  try {
    await window.Language.init();
  } catch (error) {
    console.warn("Language init failed:", error);
  }

  const title = document.getElementById("appTitle");
  const description = document.getElementById("appDescription");

  if (title) title.textContent = window.Language.t("APP_TITLE");
  if (description) description.textContent = window.Language.t("APP_DESC");

  window.UI.setStatus("neutral", window.Language.t("READY"), "");
  window.UI.render();
  if (appRoot) {
    appRoot.hidden = false;
  }
  document.body.dataset.ready = "true";

  const noticeKey = window.OSDetect?.getNoticeKey();
  if (!noticeKey) return;

  const footer = document.getElementById("osNotice");
  if (!footer) return;

  footer.textContent = "iOS / Android : Not supported";
  footer.classList.remove("hidden");
});
