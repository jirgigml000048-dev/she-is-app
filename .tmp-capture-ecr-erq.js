const { chromium } = require('playwright');
const path = require('path');

const baseDir = '/Users/gigi/.openclaw/workspace/shared/she-is-app';
const baseUrl = 'http://127.0.0.1:4173';
const wait = ms => new Promise(r => setTimeout(r, ms));

async function prep(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(() => {
    const intro = document.querySelector('.test-intro');
    const body = document.getElementById('testBody');
    if (intro) intro.style.display = 'none';
    if (body) body.style.display = 'block';
    let el = document.getElementById('storyRec');
    if (!el) {
      el = document.createElement('div');
      el.id = 'storyRec';
      el.style.display = 'none';
      document.body.appendChild(el);
    }
    try { storyRec = el; } catch (_) {}
  });
}

async function captureByState(page, file, outFile) {
  await page.goto(`${baseUrl}/${file}`, { waitUntil: 'networkidle' });
  await prep(page);
  await page.evaluate(() => {
    state.index = 0;
    state.answers = Array(DATA.questions.length).fill(7);
    const introEl = document.getElementById('intro');
    const quizEl = document.getElementById('quiz');
    const resultEl = document.getElementById('result');
    if (introEl) introEl.classList.add('hidden');
    if (quizEl) quizEl.classList.add('hidden');
    if (resultEl) resultEl.classList.remove('hidden');
    showResult();
  });
  await page.waitForSelector('#result-capture');
  await wait(300);
  await page.locator('#result-capture').screenshot({ path: path.join(baseDir, outFile) });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  try {
    await captureByState(page, 'test-ecr.html', 'preview-result-ecr.png');
    await captureByState(page, 'test-erq.html', 'preview-result-erq.png');
    console.log('DONE');
  } finally {
    await browser.close();
  }
})().catch(err => { console.error(err); process.exit(1); });
