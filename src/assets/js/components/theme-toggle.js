(() => {
  const STORAGE_KEY = "reviewhub-theme";
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;
  function getTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "light" || saved === "dark" ? saved : "dark";
    } catch { return "dark"; }
  }
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    toggle.checked = theme === "dark";
    toggle.setAttribute("aria-checked", String(toggle.checked));
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* private browsing */ }
  }
  setTheme(getTheme());
  toggle.addEventListener("change", () => setTheme(toggle.checked ? "dark" : "light"));
})();
