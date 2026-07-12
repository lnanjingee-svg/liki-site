const body = document.body;
const toggle = document.querySelector(".lang-toggle");
const label = document.querySelector("[data-lang-label]");
const storedLanguage = localStorage.getItem("liki-language");

function setLanguage(language) {
  body.classList.toggle("lang-en", language === "en");
  body.classList.toggle("lang-zh", language !== "en");
  document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  if (label) label.textContent = language === "en" ? "中文" : "EN";
  localStorage.setItem("liki-language", language);

  document.querySelectorAll("[data-i18n-zh]").forEach((item) => {
    item.textContent = language === "en" ? item.dataset.i18nEn : item.dataset.i18nZh;
  });
}

setLanguage(storedLanguage === "en" ? "en" : "zh");
toggle?.addEventListener("click", () => {
  setLanguage(body.classList.contains("lang-en") ? "zh" : "en");
});

const revealItems = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll("[data-swap-image]").forEach((card) => {
  const image = card.querySelector("img");
  const alternate = card.dataset.swapImage;
  if (!image || !alternate || !window.matchMedia("(hover: hover)").matches) return;
  const original = image.currentSrc || image.src;
  card.addEventListener("pointerenter", () => { image.src = alternate; });
  card.addEventListener("pointerleave", () => { image.src = original; });
});

const filters = document.querySelectorAll(".archive-filter");
const archiveCards = document.querySelectorAll(".archive-card");
const archiveCount = document.querySelector("[data-archive-count]");
filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const value = filter.dataset.filter;
    filters.forEach((item) => item.setAttribute("aria-pressed", String(item === filter)));
    let visible = 0;
    archiveCards.forEach((card) => {
      const show = value === "all" || card.dataset.category?.includes(value);
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });
    if (archiveCount) archiveCount.textContent = `${String(visible).padStart(2, "0")} / 04`;
  });
});

const gallery = document.querySelector("[data-gallery]");
if (gallery) {
  const strip = gallery.querySelector(".gallery-strip");
  const figures = [...strip.querySelectorAll("figure")];
  const progress = gallery.querySelector(".gallery-progress span");
  const current = gallery.querySelector("[data-gallery-current]");
  const total = gallery.querySelector("[data-gallery-total]");
  const prev = gallery.querySelector("[data-gallery-prev]");
  const next = gallery.querySelector("[data-gallery-next]");
  let activeIndex = 0;

  if (total) total.textContent = String(figures.length).padStart(2, "0");
  strip.tabIndex = 0;

  figures.forEach((figure) => {
    const image = figure.querySelector("img");
    const setImageRatio = () => {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const ratio = image.naturalWidth / image.naturalHeight;
      figure.style.setProperty("--image-ratio", String(ratio));
      figure.classList.toggle("is-ultra-wide", ratio >= 2.3);
    };
    if (image.complete) setImageRatio();
    else image.addEventListener("load", setImageRatio, { once: true });
  });

  function updateGallery() {
    const stripLeft = strip.getBoundingClientRect().left;
    activeIndex = figures.reduce((closest, figure, index) => {
      const candidate = Math.abs(figure.getBoundingClientRect().left - stripLeft);
      const closestDistance = Math.abs(figures[closest].getBoundingClientRect().left - stripLeft);
      return candidate < closestDistance ? index : closest;
    }, 0);
    if (current) current.textContent = String(activeIndex + 1).padStart(2, "0");
    if (progress) progress.style.width = `${((activeIndex + 1) / figures.length) * 100}%`;
  }

  function moveGallery(direction) {
    const target = figures[Math.max(0, Math.min(figures.length - 1, activeIndex + direction))];
    target?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }

  strip.addEventListener("scroll", updateGallery, { passive: true });
  strip.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      strip.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  }, { passive: false });
  strip.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); moveGallery(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); moveGallery(-1); }
  });
  prev?.addEventListener("click", () => moveGallery(-1));
  next?.addEventListener("click", () => moveGallery(1));
  updateGallery();

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.hidden = true;
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.innerHTML = `<button class="lightbox-close" type="button" aria-label="Close image">×</button><button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image">←</button><img alt=""><button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">→</button><p class="lightbox-caption"></p>`;
  document.body.append(lightbox);
  const lightboxImage = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".lightbox-caption");

  function showLightbox(index) {
    activeIndex = (index + figures.length) % figures.length;
    const source = figures[activeIndex].querySelector("img");
    lightboxImage.src = source.currentSrc || source.src;
    lightboxImage.alt = source.alt;
    lightboxCaption.textContent = figures[activeIndex].querySelector("figcaption")?.textContent || "";
    lightbox.hidden = false;
    lightbox.querySelector(".lightbox-close").focus();
  }
  function closeLightbox() { lightbox.hidden = true; strip.focus(); }
  figures.forEach((figure, index) => figure.addEventListener("click", () => showLightbox(index)));
  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showLightbox(activeIndex - 1));
  lightbox.querySelector(".lightbox-next").addEventListener("click", () => showLightbox(activeIndex + 1));
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") showLightbox(activeIndex + 1);
    if (event.key === "ArrowLeft") showLightbox(activeIndex - 1);
  });
}

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const cursor = document.createElement("div");
  cursor.className = "site-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = "<span>LIKI</span>";
  document.body.append(cursor);

  document.querySelectorAll(".story-card, .archive-card, .field-list a, .detail-nav a, .action-link, .outline-link").forEach((element) => {
    element.dataset.cursor = "OPEN";
  });
  document.querySelectorAll(".gallery-strip").forEach((element) => { element.dataset.cursor = "DRAG"; });
  document.querySelectorAll(".gallery-strip figure").forEach((element) => { element.dataset.cursor = "VIEW"; });
  document.querySelectorAll(".gallery-button").forEach((element) => { element.dataset.cursor = "MOVE"; });

  document.addEventListener("pointermove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.classList.add("is-visible");
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-cursor]");
    cursor.querySelector("span").textContent = target?.dataset.cursor || "LIKI";
    cursor.classList.toggle("is-intense", Boolean(target));
  });
  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest("[data-cursor]");
    cursor.querySelector("span").textContent = target?.dataset.cursor || "LIKI";
    cursor.classList.toggle("is-intense", Boolean(target));
  });
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
}
