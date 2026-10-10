// Site behaviour: galleries + lightbox, collection filters, form validation and sending.
const UI = JSON.parse(document.getElementById('ui-strings')?.textContent || '{}');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------- past dates disappear even between two publications ---------------- */
const today = new Date().toISOString().slice(0, 10);
$$('[data-end]').forEach((el) => { const d = el.getAttribute('data-end'); if (d && d < today) el.remove(); });
$$('[data-upcoming]').forEach((sec) => { if (!$('.evcard', sec)) sec.remove(); });

/* ---------------- gallery + lightbox ---------------- */
let lbList = null, lbIdx = 0;
const lbBox = $('#lb');
function renderLB() {
  if (!lbBox) return;
  if (!lbList || !lbList.length) { lbBox.innerHTML = ''; document.body.style.overflow = ''; return; }
  const src = lbList[lbIdx], many = lbList.length > 1;
  lbBox.innerHTML =
    `<div class="lb" role="dialog" aria-modal="true">
      <div class="lb-bg" style="background-image:url('${esc(src)}')"></div><div class="lb-scrim"></div>
      <button class="lb-x" data-lb-close aria-label="Close">×</button>
      ${many ? '<button class="lb-nav lb-prev" data-lb-step="-1" aria-label="Previous">‹</button><button class="lb-nav lb-next" data-lb-step="1" aria-label="Next">›</button>' : ''}
      <figure class="lb-fig" style="margin:0"><img src="${esc(src)}" alt="">
        <figcaption class="lb-cap"><b>${lbIdx + 1}</b> ${esc(UI.photoOf || '/')} <b>${lbList.length}</b>
        ${many ? '<span class="lb-dots">' + lbList.map((_, i) => `<i class="${i === lbIdx ? 'on' : ''}"></i>`).join('') + '</span>' : ''}
        </figcaption></figure></div>`;
  document.body.style.overflow = 'hidden';
  $('[data-lb-close]', lbBox)?.focus();
}
const openLB = (list, i) => { lbList = list; lbIdx = i || 0; renderLB(); };
const closeLB = () => { lbList = null; renderLB(); };
const stepLB = (d) => { if (!lbList) return; lbIdx = (lbIdx + d + lbList.length) % lbList.length; renderLB(); };

document.addEventListener('click', (e) => {
  const t = e.target;
  // thumbnails swap the main photo
  const thumb = t.closest('[data-thumb]');
  if (thumb) {
    const gal = thumb.closest('[data-gallery]'); const list = JSON.parse(gal.dataset.gallery); const i = +thumb.dataset.thumb;
    const main = $('.gal-main', gal); $('img', main).src = list[i]; main.dataset.lbOpen = i;
    $$('[data-thumb]', gal).forEach((b) => b.setAttribute('aria-current', String(b === thumb)));
    return;
  }
  const opener = t.closest('[data-lb-open]');
  if (opener) { const gal = opener.closest('[data-gallery]'); openLB(JSON.parse(gal.dataset.gallery), +opener.dataset.lbOpen); return; }
  if (t.closest('[data-lb-close]')) { closeLB(); return; }
  const step = t.closest('[data-lb-step]');
  if (step) { stepLB(+step.dataset.lbStep); return; }
  if (lbList && t.closest('.lb') && !t.closest('.lb-fig')) { closeLB(); return; }

  // "Order this piece" reveals the form
  const rev = t.closest('[data-reveal]');
  if (rev) { const box = document.getElementById(rev.dataset.reveal); if (box) { box.hidden = false; $('input:not([type=hidden])', box)?.focus(); } return; }
});
document.addEventListener('keydown', (e) => {
  if (!lbList) return;
  if (e.key === 'Escape') closeLB();
  else if (e.key === 'ArrowLeft') stepLB(-1);
  else if (e.key === 'ArrowRight') stepLB(1);
});

/* ---------------- collection filters ---------------- */
const coll = $('[data-collection]');
if (coll) {
  let pane = 'now', cat = 'all', sub = 'all';
  const apply = () => {
    $$('[data-pane]', coll).forEach((p) => { p.hidden = p.dataset.pane !== pane; });
    $$('[data-pane-btn]', coll).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.paneBtn === pane)));
    $$('[data-cat-btn]', coll).forEach((b) => b.classList.toggle('blue', b.dataset.catBtn === cat));
    $$('[data-subs-for]', coll).forEach((r) => { r.hidden = r.dataset.subsFor !== cat; });
    $$('[data-sub-btn]', coll).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.subBtn === sub)));
    $$('.piece', coll).forEach((p) => {
      p.hidden = !((cat === 'all' || p.dataset.cat === cat) && (sub === 'all' || p.dataset.sub === sub));
    });
    $$('.seasongroup', coll).forEach((g) => { g.hidden = !$$('.piece', g).some((p) => !p.hidden); });
  };
  coll.addEventListener('click', (e) => {
    const p = e.target.closest('[data-pane-btn]'); if (p) { pane = p.dataset.paneBtn; cat = 'all'; sub = 'all'; apply(); return; }
    const c = e.target.closest('[data-cat-btn]'); if (c) { cat = c.dataset.catBtn; sub = 'all'; apply(); return; }
    const s = e.target.closest('[data-sub-btn]'); if (s) { sub = s.dataset.subBtn; apply(); }
  });
  apply();
}

/* ---------------- e-mail checks ---------------- */
const DOMAINS = ['gmail.com', 'seznam.cz', 'email.cz', 'centrum.cz', 'hotmail.com', 'hotmail.cz', 'outlook.com', 'outlook.cz',
  'yahoo.com', 'yahoo.fr', 'icloud.com', 'volny.cz', 'post.cz', 'atlas.cz', 'tiscali.cz', 'orange.fr', 'free.fr', 'wanadoo.fr',
  'laposte.net', 'sfr.fr', 'gmx.com', 'gmx.cz', 'proton.me', 'protonmail.com', 'live.com', 'me.com', 'mail.com', 'seznam.sk', 'azet.sk'];
const TLDS = ['com', 'net', 'org', 'info', 'biz', 'edu', 'gov', 'int', 'io', 'me', 'co', 'app', 'dev', 'xyz', 'art', 'design', 'studio',
  'shop', 'store', 'online', 'site', 'agency', 'fashion', 'email', 'cloud', 'tech', 'eu', 'cz', 'sk', 'at', 'de', 'pl', 'hu', 'fr', 'be',
  'nl', 'lu', 'ch', 'it', 'es', 'pt', 'gb', 'uk', 'ie', 'dk', 'se', 'no', 'fi', 'is', 'ee', 'lv', 'lt', 'si', 'hr', 'ro', 'bg', 'gr', 'ua',
  'ru', 'tr', 'il', 'us', 'ca', 'mx', 'br', 'ar', 'au', 'nz', 'jp', 'cn', 'kr', 'in', 'za', 'ma', 'tn', 'sg', 'hk', 'ae'];
const TLDFIX = { con: 'com', cmo: 'com', comm: 'com', coom: 'com', clm: 'com', cim: 'com', xom: 'com', vom: 'com', ocm: 'com', cs: 'cz', cx: 'cz', vz: 'cz', fe: 'fr', nte: 'net', ogr: 'org' };
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function checkEmail(v) {
  if (!v || !/^[^\s@]{1,64}@[^\s@]{1,255}$/.test(v)) return { msg: UI.vEmail };
  const [user, domRaw] = v.split('@'); const dom = domRaw.toLowerCase();
  if (!/^([a-z0-9](-?[a-z0-9])*\.)+[a-z]{2,}$/.test(dom)) return { msg: UI.vEmail };
  if (!DOMAINS.includes(dom)) {
    const near = DOMAINS.find((x) => dom.length > 4 && lev(x, dom) <= 2);
    if (near) return { msg: `${UI.vEmailTypo} ${user}@${near} ?`, fix: `${user}@${near}` };
  }
  const labels = dom.split('.'); const tld = labels[labels.length - 1];
  if (!TLDS.includes(tld)) {
    const nt = TLDFIX[tld] || TLDS.find((x) => x.length > 2 && lev(x, tld) === 1);
    if (nt) { labels[labels.length - 1] = nt; const fixed = `${user}@${labels.join('.')}`; return { msg: `${UI.vEmailTypo} ${fixed} ?`, fix: fixed }; }
    return { msg: (UI.vEmailTld || '{X}').replace('{X}', '.' + tld) };
  }
  return null;
}

/* ---------------- forms ---------------- */
function clearErr(f) { $$('.field.bad', f).forEach((x) => x.classList.remove('bad')); $$('.err,.formerr', f).forEach((x) => x.remove()); }
function markErr(el, msg, fix) {
  const w = el.closest('.field'); if (!w) return;
  w.classList.add('bad');
  const s = document.createElement('span'); s.className = 'err'; s.textContent = msg;
  if (fix) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'fixit'; b.textContent = UI.vUse;
    b.addEventListener('click', () => { el.value = fix; w.classList.remove('bad'); $$('.err', w).forEach((x) => x.remove()); el.focus(); });
    s.append(' ', b);
  }
  w.appendChild(s);
}
function validate(f) {
  let ok = true, first = null;
  clearErr(f);
  $$('[data-check]', f).forEach((el) => {
    const v = (el.value || '').trim();
    if (el.dataset.check === 'name' && v.length < 2) { markErr(el, UI.vName); ok = false; first ||= el; }
    if (el.dataset.check === 'email') { const r = checkEmail(v); if (r) { markErr(el, r.msg, r.fix); ok = false; first ||= el; } }
  });
  if (!ok) {
    const box = document.createElement('div'); box.className = 'formerr'; box.textContent = UI.vFix; f.prepend(box);
    first?.focus(); first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  return ok;
}
function done(f, html, cls = 'sent') { const box = document.createElement('div'); box.className = cls; box.innerHTML = html; f.replaceWith(box); }

$$('form[data-form]').forEach((f) => f.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate(f)) return;
  const endpoint = f.dataset.endpoint;
  if (!endpoint) {
    const box = document.createElement('div'); box.className = 'formerr'; box.textContent = UI.formNotReady; clearErr(f); f.prepend(box); return;
  }
  const data = {};
  new FormData(f).forEach((val, key) => { if (val !== '') data[key] = val; });
  if (data._gotcha) { done(f, `<span class="eyebrow">✓</span><p style="font-size:16px">${esc(UI.sentShort)}</p>`); return; } // bot
  delete data._gotcha;
  const reply = $('[data-check="email"]', f)?.value; if (reply) data._replyto = reply;
  if (f.dataset.booking) {
    // A link for VL: confirms the booking (updates the seats) and prepares the e-mail to the client.
    const rnd = new Uint32Array(2); crypto.getRandomValues(rnd);
    const id = (rnd[0].toString(36) + rnd[1].toString(36)).slice(0, 10);
    const q = new URLSearchParams({
      c: f.dataset.booking, id, l: document.documentElement.lang || 'en',
      n: ($('[data-check="name"]', f)?.value || '').trim(), e: (reply || '').trim(),
      s: $('#b-s', f)?.value || '1', p: ($('#b-p', f)?.value || '').trim()
    });
    data['Booking ID'] = id;
    data['→ Confirmer la réservation'] = `${location.origin}/admin/booking/#${q}`;
  }
  if (f.dataset.service === 'formsubmit') { data._captcha = 'false'; data._template = 'table'; }
  f.classList.add('sending');
  const fail = (msg) => {
    f.classList.remove('sending'); clearErr(f);
    const box = document.createElement('div'); box.className = 'formerr';
    box.innerHTML = msg || `${esc(UI.sendError)} <a href="mailto:${esc(UI.email)}">${esc(UI.email)}</a>`;
    f.prepend(box);
  };
  let r, body = {};
  try {
    r = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    try { body = await r.json(); } catch (_) { body = {}; }
  } catch (err) { console.warn('[form] network error', err); fail(); return; }
  const message = String(body.message || (body.errors && body.errors.map((x) => x.message).join(' ')) || '');
  // FormSubmit answers 200 with success "false" until the address is confirmed by e-mail.
  if (/activat/i.test(message)) { console.warn('[form]', message); fail(esc(UI.formActivate)); return; }
  const ok = r.ok && body.success !== false && String(body.success) !== 'false' && !body.errors;
  if (!ok) { console.warn('[form] refused', r.status, message); fail(); return; }
  done(f, `<span class="eyebrow">✓</span><p style="font-size:16px">${esc(UI.sentShort)}</p>`);
}));
