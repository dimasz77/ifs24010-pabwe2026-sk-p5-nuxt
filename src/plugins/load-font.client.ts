import { defineNuxtPlugin } from "nuxt/app";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";

export default defineNuxtPlugin(() => {
  const addFont = () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  };

  if (document.readyState === "complete") {
    addFont();
  } else {
    window.addEventListener("load", addFont, { once: true });
  }
});