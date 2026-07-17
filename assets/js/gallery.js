(() => {
  if (!document.getElementById("gallery-grid")) return;

  const cssId = "gallery-glightbox-css";
  if (!document.getElementById(cssId)) {
    const link = document.createElement("link");
    link.id = cssId;
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/npm/glightbox@3/dist/css/glightbox.min.css";
    document.head.appendChild(link);
  }

  const boot = () => {
    // eslint-disable-next-line no-undef
    GLightbox({
      selector: "#gallery-grid .gallery-link",
      touchNavigation: true,
      loop: true,
    });
  };

  if (window.GLightbox) {
    boot();
    return;
  }

  const script = document.createElement("script");
  script.src =
    "https://cdn.jsdelivr.net/npm/glightbox@3/dist/js/glightbox.min.js";
  script.defer = true;
  script.onload = boot;
  document.body.appendChild(script);
})();
