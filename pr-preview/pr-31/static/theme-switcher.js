/**
 * Theme Switcher — toggles between the default cyberpunk theme and the
 * retro-cyber (Cyberpunk 2077-inspired) theme.
 *
 * Usage: include this script at the end of <body>. It reads the saved
 * preference from localStorage and swaps the stylesheet href accordingly.
 * A small toggle button is injected in the bottom-right corner.
 */
(function () {
  var STORAGE_KEY = "tools-theme";
  var THEMES = {
    default: { css: "common.css", label: "RETRO" },
    retro: { css: "retro-cyber.css", label: "NEON" },
  };

  // Find the main stylesheet link (common.css or retro-cyber.css)
  var link = document.querySelector(
    'link[href*="common.css"], link[href*="retro-cyber.css"]'
  );
  if (!link) return;

  var basePath = link.href.replace(/[^/]+\.css.*$/, "");

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || "default";
  }

  function applyTheme(theme) {
    var file = THEMES[theme] ? THEMES[theme].css : THEMES["default"].css;
    link.href = basePath + file;
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function nextTheme() {
    return getTheme() === "default" ? "retro" : "default";
  }

  // Apply saved theme immediately
  applyTheme(getTheme());

  // Create toggle button
  var btn = document.createElement("button");
  btn.className = "theme-switcher";
  btn.textContent = THEMES[nextTheme()].label;
  btn.title = "Switch theme";
  btn.addEventListener("click", function () {
    var next = nextTheme();
    applyTheme(next);
    // Update button text to show the *other* theme name
    btn.textContent = THEMES[nextTheme()].label;
  });

  // Inject button styles inline so they work regardless of which theme is active
  btn.style.cssText =
    "position:fixed;bottom:16px;right:16px;z-index:10000;" +
    "margin:0;padding:6px 14px;font-size:11px;letter-spacing:2px;" +
    "font-family:'Share Tech Mono',monospace;font-weight:700;" +
    "text-transform:uppercase;cursor:pointer;border-radius:0;" +
    "background:#0a0a08;color:#fcee09;border:1px solid #fcee09;" +
    "opacity:0.5;transition:opacity 0.2s;box-shadow:none;clip-path:none;";

  btn.addEventListener("mouseenter", function () {
    btn.style.opacity = "1";
  });
  btn.addEventListener("mouseleave", function () {
    btn.style.opacity = "0.5";
  });

  document.body.appendChild(btn);
})();
