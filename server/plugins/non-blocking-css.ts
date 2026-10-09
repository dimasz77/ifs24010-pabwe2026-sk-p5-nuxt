// @ts-nocheck
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (html) => {
    const noscript: string[] = [];
    const rewrite = (chunk: string) =>
      chunk.replace(
        /<link([^>]*?)rel="stylesheet"([^>]*?href="([^"]*\/_nuxt\/[^"]+\.css)"[^>]*)>/g,
        (_match, before, after, href) => {
          noscript.push(`<link rel="stylesheet" href="${href}">`);
          return `<link${before}rel="stylesheet" media="print" onload="this.media='all'"${after}>`;
        }
      );

    if (Array.isArray(html.head)) {
      html.head = html.head.map(rewrite);
    }

    if (noscript.length > 0 && Array.isArray(html.head)) {
      html.head.push(`<noscript>${noscript.join("")}</noscript>`);
    }
  });
});