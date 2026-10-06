import { defineConfig } from 'astro/config';

// Replace with the real domain at launch (used for canonical URLs and hreflang).
export default defineConfig({
  site: 'https://uniquebyvl.pages.dev',
  trailingSlash: 'always',
  build: { format: 'directory' }
});
