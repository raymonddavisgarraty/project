(() => {
  const header = document.querySelector("[data-site-header]");

  if (!header) {
    return;
  }

  const menu = header.querySelector("[data-site-menu]");
  const menuToggle = header.querySelector("[data-menu-toggle]");
  const dropdownToggles = Array.from(
    header.querySelectorAll("[data-dropdown-toggle]"),
  );

  menuToggle?.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const item = toggle.closest(".site-header__item");
      const isOpen = item.classList.toggle("is-open");

      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  });

  document.addEventListener("click", (event) => {
    if (header.contains(event.target)) {
      return;
    }

    menu?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");

    dropdownToggles.forEach((toggle) => {
      toggle.closest(".site-header__item")?.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();
