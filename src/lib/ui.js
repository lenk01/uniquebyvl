import UI from '../i18n/ui.json';
import { LANGS } from './content.js';

export const ui = (lang) => UI[lang] || UI.en;
export const NAV = ['home', 'collection', 'custom', 'classes', 'workshops', 'about', 'contact'];
export const path = (lang, key, slug) => {
  const base = key === 'home' ? `/${lang}/` : `/${lang}/${key}/`;
  return slug ? `${base}${slug}/` : base;
};
export const staticLangPaths = () => LANGS.map((lang) => ({ params: { lang } }));
