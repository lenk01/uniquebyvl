import { LANGS, publicPieces, classes, workshops, legal } from '../lib/content.js';

export function GET({ site }) {
  const pages = ['', 'collection/', 'custom/', 'classes/', 'workshops/', 'about/', 'contact/'];
  const urls = [];
  for (const l of LANGS) {
    pages.forEach((p) => urls.push(`/${l}/${p}`));
    publicPieces().forEach((p) => urls.push(`/${l}/collection/${p.slug}/`));
    classes.forEach((c) => urls.push(`/${l}/classes/${c.slug}/`));
    workshops.forEach((w) => urls.push(`/${l}/workshops/${w.slug}/`));
    legal.forEach((x) => urls.push(`/${l}/legal/${x.slug}/`));
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${new URL(u, site).href}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
