(() => {
  const overlay = document.getElementById("coffeeModal");
  const openBtn = document.querySelector("[data-coffee-open]");
  const COFFEE_HASH = "#coffee";

  if (!overlay || !openBtn) return;

  const hasCoffeeHash = () =>
    location.hash === COFFEE_HASH || location.hash === "#buy-me-a-coffee";

  const isCoffeePath = () => {
    const path = location.pathname.replace(/\/+$/, "");
    return path.endsWith("/coffee");
  };

  const open = ({ syncHash = true } = {}) => {
    overlay.hidden = false;
    overlay.inert = false;
    document.body.classList.add("coffee-modal-open");

    if (syncHash && !hasCoffeeHash()) {
      history.replaceState(
        null,
        "",
        `${location.pathname}${location.search}${COFFEE_HASH}`
      );
    }

    requestAnimationFrame(() => {
      overlay.querySelector("[data-coffee-close]")?.focus();
    });
  };

  const close = ({ syncHash = true } = {}) => {
    openBtn.focus();
    overlay.inert = true;
    overlay.hidden = true;
    document.body.classList.remove("coffee-modal-open");

    if (syncHash && hasCoffeeHash()) {
      history.replaceState(null, "", `${location.pathname}${location.search}`);
    }
  };

  openBtn.addEventListener("click", () => open());

  overlay.addEventListener("click", (event) => {
    if (
      event.target === overlay ||
      event.target.closest("[data-coffee-close]")
    ) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) {
      close();
    }
  });

  window.addEventListener("hashchange", () => {
    if (hasCoffeeHash()) {
      open({ syncHash: false });
    } else if (!overlay.hidden) {
      close({ syncHash: false });
    }
  });

  if (hasCoffeeHash() || isCoffeePath()) {
    open({ syncHash: !hasCoffeeHash() });
  }
})();
