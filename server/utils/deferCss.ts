const CSS_LINK = /<link\b[^>]*\brel="stylesheet"[^>]*\bhref="(\/_nuxt\/[^"]+\.css)"[^>]*>/g;

export function deferNuxtCss(html: string): string {
  return html.replace(CSS_LINK, (tag, href: string) => {
    if (tag.includes("media=")) return tag;
    const crossorigin = tag.includes("crossorigin") ? " crossorigin" : "";
    return (
      `<link rel="stylesheet" href="${href}"${crossorigin} media="print" onload="this.media='all'">` +
      `<noscript><link rel="stylesheet" href="${href}"${crossorigin}></noscript>`
    );
  });
} 
