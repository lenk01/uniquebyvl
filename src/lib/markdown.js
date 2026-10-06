// Tiny, safe markdown for the legal pages: ## headings, - lists, paragraphs, **bold**, links.
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const inline = (s) => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g, '<a href="$2" rel="noopener">$1</a>')
  .replace(/(^|[\s(])(www\.[a-z0-9.-]+\.[a-z]{2,}[^\s)]*)/gi, '$1<a href="https://$2" rel="noopener" target="_blank">$2</a>');
export function md(src) {
  return src.replace(/\r\n/g, '\n').split(/\n{2,}/).map((block) => {
    const b = block.trim();
    if (!b) return '';
    if (/^#{1,3}\s/.test(b)) return `<h2>${inline(b.replace(/^#{1,3}\s+/, ''))}</h2>`;
    if (/^[-*]\s/m.test(b) && b.split('\n').every((l) => /^[-*]\s/.test(l.trim())))
      return '<ul>' + b.split('\n').map((l) => `<li>${inline(l.trim().replace(/^[-*]\s+/, ''))}</li>`).join('') + '</ul>';
    return `<p>${inline(b).replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
}
