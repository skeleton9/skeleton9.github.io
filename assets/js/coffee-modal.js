(() => {
  const overlay = document.getElementById("coffeeModal");
  const openBtn = document.querySelector("[data-coffee-open]");

  if (!overlay || !openBtn) return;

  const open = () => {
    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("coffee-modal-open");
    overlay.querySelector("[data-coffee-close]")?.focus();
  };

  const close = () => {
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("coffee-modal-open");
    openBtn.focus();
  };

  openBtn.addEventListener("click", open);

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
})();
