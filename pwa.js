(function () {
  "use strict";

  let installPrompt = null;
  const button = () => document.getElementById("installGameButton");
  const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const isAppleMobile = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  function prepareInstallButton() {
    const current = button();
    if (!current) return;
    if (isStandalone()) {
      current.hidden = true;
      return;
    }
    if (isAppleMobile()) {
      current.hidden = false;
      current.textContent = "添加到主屏幕";
      return;
    }
    if (installPrompt) {
      current.hidden = false;
      current.textContent = "安装到桌面";
    }
  }

  function showInstallGuide() {
    const modal = document.getElementById("modal");
    const overlay = document.getElementById("overlay");
    if (!modal || !overlay) return;
    let steps;
    if (isAppleMobile()) {
      steps = "<ol><li>请用 Safari 打开游戏网页。</li><li>点底部或顶部的“分享”按钮。</li><li>选择“添加到主屏幕”，再点“添加”。</li></ol>";
    } else if (/Android/i.test(navigator.userAgent)) {
      steps = "<ol><li>用 Chrome 打开游戏网页。</li><li>点右上角菜单，选择“安装应用”或“添加到主屏幕”。</li><li>确认后，从手机桌面图标进入游戏。</li></ol>";
    } else {
      steps = "<ol><li>用 Chrome 或 Edge 打开 HTTPS 游戏网页。</li><li>在地址栏安装图标或浏览器菜单中选择“安装此网站为应用”。</li><li>安装后可从桌面或应用列表启动。</li></ol>";
    }
    modal.className = "modal install-modal";
    modal.innerHTML = "<h2>把游戏放到桌面</h2><p>这是网页游戏，不用从应用商店下载；添加后会以独立窗口打开。首次加载请保持联网，AI 功能也需要联网。</p>" +
      steps + "<p class=\"sub\">若菜单中没有安装选项，请先用 HTTPS 地址打开网页并重新加载。</p><button class=\"primary\" type=\"button\" onclick=\"closeModal()\">知道了</button>";
    overlay.style.display = "grid";
    if (typeof focusModal === "function") focusModal();
  }

  window.installGame = async function () {
    if (!installPrompt) {
      showInstallGuide();
      return;
    }
    const prompt = installPrompt;
    installPrompt = null;
    prepareInstallButton();
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch (_) {
      showInstallGuide();
    }
    prepareInstallButton();
  };

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    prepareInstallButton();
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    const current = button();
    if (current) current.hidden = true;
  });

  prepareInstallButton();
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
        // PWA 安装失败不得影响普通网页游玩。
      });
    }, { once: true });
  }
})();
