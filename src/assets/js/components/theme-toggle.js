(() => {
  const STORAGE_KEY = "reviewhub-theme";
  const toggle = document.querySelector("[data-theme-toggle]");

  if (!toggle) {
    return;
  }

  function getTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return savedTheme === "dark" ? "dark" : "light";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    toggle.checked = theme === "dark";
    toggle.setAttribute("aria-checked", String(theme === "dark"));
    localStorage.setItem(STORAGE_KEY, theme);
  }

  setTheme(getTheme());

  toggle.addEventListener("change", () => {
    setTheme(toggle.checked ? "dark" : "light");
  });
})();
