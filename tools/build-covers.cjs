// Renders one cover image per tutorial video from tools/covers.html.
// Needs a local server in the repo root:  python3 -m http.server 8769   then:  node tools/build-covers.cjs
const { chromium } = require('playwright');
const { join } = require('node:path');

const TUTORIALS = [
  ['welcome-to-helix-impulse', 'Welcome', 'An overview of the simulation', '01', '4:39'],
  ['target-groups', 'Target groups', 'The five customer groups', '02', '3:41'],
  ['marketing', 'Marketing', 'The Marketing tab', '03', '2:01'],
  ['production', 'Production', 'The Production tab', '04', '1:56'],
  ['sales', 'Sales', 'The Sales tab', '05', '1:56'],
  ['lab', 'Lab', 'The Lab tab', '06', '2:15'],
  ['research', 'Research', 'The Research tab', '07', '1:49'],
  ['controlling', 'Controlling', 'The Controlling tab', '08', '2:35'],
  ['finance', 'Finance', 'The Finance tab', '09', '2:57'],
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  for (const [slug, title, sub, n, d] of TUTORIALS) {
    const q = new URLSearchParams({ t: title, s: sub, n, d });
    await page.goto('http://localhost:8769/tools/covers.html?' + q, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const out = join(__dirname, '..', 'assets', 'video', 'tutorials', slug + '-cover.jpg');
    await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
    console.log('written', out);
  }
  await browser.close();
})();
