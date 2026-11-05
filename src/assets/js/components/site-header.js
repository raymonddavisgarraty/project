// Stage 45.1: mobile menu enhancement. Primary links remain real anchors.
(() => {
  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  const menu = header.querySelector("[data-site-menu]");
  const toggle = header.querySelector("[data-menu-toggle]");
  if (!menu || !toggle) return;

  function setOpen(open) {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
})();
