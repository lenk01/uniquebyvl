# Patched admin bundle

`sveltia-cms.js` is Sveltia CMS **0.229.0** (MIT licence), served from the site instead of unpkg, with one change:

- Google Gemini API key check: `/^AIza[a-zA-Z0-9_-]{35}$/` → `/^(?:AIza[a-zA-Z0-9_-]{35}|AQ\.[A-Za-z0-9._-]{20,})$/`

Why: since mid-2026 Google AI Studio issues keys starting with `AQ.`; the original check rejected them silently, so the Translate button did nothing.

When Sveltia accepts `AQ.` keys upstream, delete this `vendor` folder and point `admin/index.html` back to
`https://unpkg.com/@sveltia/cms@<version>/dist/sveltia-cms.js`.
