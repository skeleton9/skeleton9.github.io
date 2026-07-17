(() => {
  const overlay = document.getElementById("coffeeModal");
  const openBtn = document.querySelector("[data-coffee-open]");

  if (!overlay || !openBtn) return;

  const open = () => {
    overlay.hidden = false;
    overlay.inert = false;
    document.body.classList.add("coffee-modal-open");
    // Focus after the dialog becomes visible/interactive.
    requestAnimationFrame(() => {
      overlay.querySelector("[data-coffee-close]")?.focus();
    });
  };

  const close = () => {
    // Move focus out before hiding, so assistive tech never sees
    // a focused element inside an inaccessible ancestor.
    openBtn.focus();
    overlay.inert = true;
    overlay.hidden = true;
    document.body.classList.remove("coffee-modal-open");
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
