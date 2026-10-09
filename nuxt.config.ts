import { defineNuxtConfig } from "nuxt/config";
import tailwindcss from "@tailwindcss/vite";

const customPort = Number(process.env.APP_PORT || process.env.PORT) || 3000;
const delcomBaseUrl =
  process.env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  telemetry: false,
  // SPA mode: routing dan penyimpanan token sepenuhnya di sisi klien
  ssr: false,
  // Kode sumber aplikasi berada di dalam src/
  srcDir: "src/",
  // Rute disuplai oleh src/router.options.ts (yang membaca src/routes.ts)
  pages: true,
  // Template pemuat statis (berisi <h1>) yang tampil sebelum aplikasi SPA ter-mount
  spaLoadingTemplate: true,
  css: ["~/index.css"],
  modules: ["@pinia/nuxt"],
  vite: {
    plugins: [tailwindcss()],
    define: {
      DELCOM_BASEURL: JSON.stringify(delcomBaseUrl),
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
  },
  devServer: {
    port: customPort,
  },
  nitro: {
    devPort: customPort,
  },
  app: {
    head: {
      title: "Delcom Cash Flow",
      htmlAttrs: {
        lang: "id",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Delcom Cash Flow adalah aplikasi pencatatan arus kas: catat pemasukan dan pengeluaran, pantau saldo tunai, tabungan, dan pinjaman dalam satu dasbor.",
        },
        { name: "robots", content: "index, follow" },
        { name: "theme-color", content: "#4f46e5" },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        // Font dimuat non-blocking (media="print" -> "all" saat selesai diunduh)
        {
          rel: "stylesheet",
          href: FONT_URL,
          media: "print",
          onload: "this.media='all'",
        },
      ],
      noscript: [{ innerHTML: `<link rel="stylesheet" href="${FONT_URL}">` }],
      bodyAttrs: {
        class: "bg-slate-50 text-slate-900 font-sans antialiased min-h-screen",
      },
    },
  },
});