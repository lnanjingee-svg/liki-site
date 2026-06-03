const body = document.body;
const toggle = document.querySelector(".lang-toggle");
const label = document.querySelector("[data-lang-label]");
const storedLanguage = localStorage.getItem("liki-language");
const initialLanguage = storedLanguage === "en" ? "en" : "zh";

function setLanguage(language) {
  body.classList.toggle("lang-en", language === "en");
  body.classList.toggle("lang-zh", language === "zh");
  document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  label.textContent = language === "en" ? "中" : "EN";
  localStorage.setItem("liki-language", language);

  document.querySelectorAll("[data-i18n-zh]").forEach((item) => {
    item.textContent =
      language === "en" ? item.dataset.i18nEn : item.dataset.i18nZh;
  });
}

setLanguage(initialLanguage);

toggle.addEventListener("click", () => {
  const nextLanguage = body.classList.contains("lang-en") ? "zh" : "en";
  setLanguage(nextLanguage);
});

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
