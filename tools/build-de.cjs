// Builds the German home page (de/index.html) from index.html.
// index.html is the single source: English text lives in the markup, German in its DE dictionary.
// Run after every change to index.html:  node tools/build-de.cjs
const { chromium } = require('playwright');
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

(async () => {
const root = join(__dirname, '..');
const source = readFileSync(join(root, 'index.html'), 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage();
const { html, missing } = await page.evaluate((src) => {
  const BASE = 'https://www.heliximpulse.com/';
  const doc = new DOMParser().parseFromString(src, 'text/html');

  // German dictionary from the inline script
  const code = [...doc.scripts].map(s => s.textContent).find(c => c.includes('const DE = {'));
  const start = code.indexOf('const DE = {');
  const end = code.indexOf('\n    };', start) + '\n    };'.length;
  const DE = new Function(code.slice(start, end) + '\nreturn DE;')();

  // Texts
  const missing = [];
  doc.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n;
    if (k in DE) el.innerHTML = DE[k]; else missing.push(k);
  });
  const ARIA = { 'Language': 'Sprache', 'Main': 'Hauptmenü', 'Menu': 'Menü', 'Play video': 'Video abspielen' };
  doc.querySelectorAll('[aria-label]').forEach(el => {
    const v = el.getAttribute('aria-label');
    el.setAttribute('aria-label', ARIA[v] || v.replace(/ on (LinkedIn|Instagram)$/, ' auf $1'));
  });

  // Head
  doc.documentElement.lang = 'de';
  doc.title = DE['meta.title'];
  const meta = (sel, val) => doc.querySelector(sel).setAttribute('content', val);
  meta('meta[name="description"]', DE['meta.desc']);
  meta('meta[property="og:title"]', DE['meta.title']);
  meta('meta[property="og:description"]', DE['meta.desc']);
  meta('meta[property="og:url"]', BASE + 'de/');
  doc.querySelector('link[rel="canonical"]').href = BASE + 'de/';
  doc.querySelector('script[data-lang-redirect]').remove();

  // Paths: the page lives one folder deeper
  const fix = (v) => /^(https?:|mailto:|#|\.\.\/|data:)/.test(v) ? v : '../' + v;
  doc.querySelectorAll('[src], [href], [poster]').forEach(el => {
    for (const a of ['src', 'href', 'poster']) if (el.hasAttribute(a)) el.setAttribute(a, fix(el.getAttribute(a)));
  });
  doc.querySelectorAll('style').forEach(st => { st.textContent = st.textContent.replace(/url\("assets\//g, 'url("../assets/'); });

  // Language switch shows German as active
  doc.querySelectorAll('.locale button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === 'de')));

  // Structured data in German
  const ld = doc.querySelector('script[type="application/ld+json"]');
  const data = JSON.parse(ld.textContent);
  const metaByName = {};
  doc.querySelectorAll('.person').forEach(p => {
    metaByName[p.querySelector('.person-name').textContent.replace(/^Dr\. /, '')] = p.querySelector('.person-meta').textContent.trim();
  });
  const text = (h) => { const d = doc.createElement('div'); d.innerHTML = h; return d.textContent.trim(); };
  for (const g of data['@graph']) {
    if (g['@type'] === 'Organization') g.founder.forEach(f => { if (metaByName[f.name]) f.description = metaByName[f.name]; });
    if (g['@type'] === 'Service') { g.description = text(DE['ab.p1']) + ' ' + text(DE['ab.p2']); g.serviceType = 'Marketing-Unternehmenssimulation'; }
    if (g['@type'] === 'FAQPage') {
      g.inLanguage = 'de';
      g.mainEntity.forEach((q, i) => { q.name = text(DE['faq.q' + (i + 1)]); q.acceptedAnswer.text = text(DE['faq.a' + (i + 1)]); });
    }
  }
  ld.textContent = '\n' + JSON.stringify(data, null, 1).replace(/<\//g, '<\\/') + '\n  ';

  return { html: '<!doctype html>\n' + doc.documentElement.outerHTML + '\n', missing };
}, source);
await browser.close();

mkdirSync(join(root, 'de'), { recursive: true });
writeFileSync(join(root, 'de', 'index.html'), html);
console.log('de/index.html written' + (missing.length ? ' – no German text for: ' + missing.join(', ') : ''));
})();
