import { defineNuxtConfig } from "nuxt/config";
import tailwindcss from "@tailwindcss/vite";
import { deferNuxtCss } from "./server/utils/deferCss";

const customPort = Number(process.env.APP_PORT || process.env.PORT) || 3000;
const delcomBaseUrl =
  process.env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";

// Browser memanggil API lewat proxy same-origin (server/api/delcom/[...path].ts).
// Set VITE_DELCOM_DIRECT=true (lalu build ulang) untuk memanggil Delcom langsung.
const useDirectApi = process.env.VITE_DELCOM_DIRECT === "true";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  telemetry: false,
  ssr: false,
  srcDir: "src/",
  pages: true,
  spaLoadingTemplate: true,
  experimental: { appManifest: false },
  css: ["~/index.css"],
  modules: ["@pinia/nuxt"],
  vite: {
    plugins: [tailwindcss()],
    define: {
      DELCOM_BASEURL: JSON.stringify(useDirectApi ? delcomBaseUrl : "/api/delcom"),
      DELCOM_ORIGIN: JSON.stringify(new URL(delcomBaseUrl).origin),
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
  },
  devServer: {
    port: customPort,
  },
  // HTML tidak boleh "no-store" agar bisa dipulihkan dari bfcache; aset build di-cache lama.
  routeRules: {
    "/": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/auth/**": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/users": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/profile": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/cash-flows/**": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/_nuxt/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
  },
  nitro: {
    devPort: customPort,
    hooks: {
      // Untuk HTML yang di-prerender saat build (200.html / index.html)
      "prerender:generate"(route) {
        if (typeof route.contents === "string" && route.fileName?.endsWith(".html")) {
          route.contents = deferNuxtCss(route.contents);
        }
      },
    },
    externals: {
      inline: ["@vue/shared"],
    },
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
      ],
      // CSS kritis minimal agar tidak ada flash putih sebelum stylesheet utama aktif
      style: [{ innerHTML: "body{background-color:#f8fafc;color:#0f172a}" }],
      bodyAttrs: {
        class: "bg-slate-50 text-slate-900 font-sans antialiased min-h-screen",
      },
    },
  },
});