// All site content lives in /content as JSON files written by the admin (Sveltia CMS).
// Each file holds the three languages: { "en": {...}, "fr": {...}, "cs": {...} }.
// Fields that are not translated are stored under "en" only.

export const LANGS = ['en', 'fr', 'cs'];
export const DEFAULT_LANG = 'en';

const load = (glob) =>
  Object.entries(glob).map(([file, data]) => ({
    slug: file.split('/').pop().replace(/\.json$/, ''),
    data
  }));

/** Read a field in the requested language, falling back to English when it is empty. */
export function v(entry, lang, key) {
  const d = entry && entry.data ? entry.data : entry;
  if (!d) return undefined;
  const empty = (x) => x === undefined || x === null || x === '' || (Array.isArray(x) && x.length === 0);
  const a = d[lang] && d[lang][key];
  if (!empty(a)) return a;
  const b = d.en && d.en[key];
  if (!empty(b)) return b;
  return d[key];
}

const byOrder = (a, b) => (Number(v(a, 'en', 'order')) || 999) - (Number(v(b, 'en', 'order')) || 999);
const byDate = (k) => (a, b) => String(v(a, 'en', k) || '').localeCompare(String(v(b, 'en', k) || ''));

export const pieces = load(import.meta.glob('/content/pieces/*.json', { eager: true, import: 'default' })).sort(byOrder);
export const categories = load(import.meta.glob('/content/categories/*.json', { eager: true, import: 'default' })).sort(byOrder);
export const subcategories = load(import.meta.glob('/content/subcategories/*.json', { eager: true, import: 'default' })).sort(byOrder);
export const seasons = load(import.meta.glob('/content/seasons/*.json', { eager: true, import: 'default' })).sort(byOrder);
export const events = load(import.meta.glob('/content/events/*.json', { eager: true, import: 'default' })).sort(byDate('end_date'));
export const classes = load(import.meta.glob('/content/classes/*.json', { eager: true, import: 'default' })).sort(byDate('date'));
export const workshops = load(import.meta.glob('/content/workshops/*.json', { eager: true, import: 'default' })).sort(byOrder);
export const formats = load(import.meta.glob('/content/formats/*.json', { eager: true, import: 'default' })).sort(byOrder);
export const custom = load(import.meta.glob('/content/custom/*.json', { eager: true, import: 'default' })).sort(byOrder);
export const stockists = load(import.meta.glob('/content/stockists/*.json', { eager: true, import: 'default' })).sort(byOrder);
export const legal = load(import.meta.glob('/content/legal/*.json', { eager: true, import: 'default' })).sort(byOrder);

const pageFiles = import.meta.glob('/content/pages/*.json', { eager: true, import: 'default' });
export const page = (name) => pageFiles[`/content/pages/${name}.json`] || {};

const settingsFiles = import.meta.glob('/content/settings/*.json', { eager: true, import: 'default' });
export const site = settingsFiles['/content/settings/site.json'] || {};

export const find = (list, slug) => list.find((x) => x.slug === slug);

/** Price in Czech crowns, formatted the Czech way. */
export const kc = (n) => (n || n === 0) ? Number(n).toLocaleString('cs-CZ').replace(/ /g, ' ') + ' Kč' : '';
export const eur = (n) => (n ? '≈ ' + Math.round(Number(n) / 24.5) + ' €' : '');

/** Pieces visible on the site (drafts never are). */
export const publicPieces = () => pieces.filter((p) => v(p, 'en', 'status') !== 'draft');

/** Today's date as YYYY-MM-DD, used at build time to drop past dates. */
export const today = () => new Date().toISOString().slice(0, 10);

export const mapUrl = (address) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address || '');
