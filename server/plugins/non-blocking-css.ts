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

    html.head = html.head.map(rewrite);
    html.headAppend = html.headAppend.map(rewrite);

    if (noscript.length > 0) {
      html.head.push(`<noscript>${noscript.join("")}</noscript>`);
    }
  });
});