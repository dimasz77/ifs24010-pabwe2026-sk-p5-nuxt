// @ts-nocheck
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (html) => {
    const noscript: string[] = [];

    html.head = html.head.map((chunk) =>
      chunk.replace(
        /<link([^>]*?)rel="stylesheet"([^>]*?href="(\/_nuxt\/[^"]+\.css)"[^>]*)>/g,
        (_match, before, after, href) => {
          noscript.push(`<link rel="stylesheet" href="${href}">`);
          return `<link${before}rel="stylesheet" media="print" onload="this.media='all'"${after}>`;
        }
      )
    );

    if (noscript.length > 0) {
      html.head.push(`<noscript>${noscript.join("")}</noscript>`);
    }
  });
});
// Membuat <link rel="stylesheet"> bawaan Nuxt (entry.*.css) tidak memblokir render.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (html) => {
    const noscript: string[] = [];

    html.head = html.head.map((chunk) =>
      chunk.replace(
        /<link([^>]*?)rel="stylesheet"([^>]*?href="(\/_nuxt\/[^"]+\.css)"[^>]*)>/g,
        (_match, before: string, after: string, href: string) => {
          noscript.push(`<link rel="stylesheet" href="${href}">`);
          return `<link${before}rel="stylesheet" media="print" onload="this.media='all'"${after}>`;
        }
      )
    );

    if (noscript.length > 0) {
      html.head.push(`<noscript>${noscript.join("")}</noscript>`);
    }
  });
});