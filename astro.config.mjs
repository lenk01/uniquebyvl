import { defineConfig } from 'astro/config';

// Replace with the real domain at launch (used for canonical URLs and hreflang).
export default defineConfig({
  site: 'https://uniquebyvl.klara-lenek05.workers.dev',
  trailingSlash: 'always',
  build: { format: 'directory' }
});
