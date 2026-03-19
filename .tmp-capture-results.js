const { chromium } = require('playwright');
const path = require('path');

const baseDir = '/Users/gigi/.openclaw/workspace/shared/she-is-app';
const baseUrl = 'http://127.0.0.1:4173';
const wait = ms => new Promise(r => setTimeout(r, ms));

async function showTestBody(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(() => {
    const intro = document.querySelector('.test-intro');
    const body = document.getElementById('testBody');
    if (intro) intro.style.display = 'none';
    if (body) body.style.display = 'block';
  });
}

async function ensureStoryRec(page) {
  await page.evaluate(() => {
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

async function captureHSP(page) {
  await page.goto(`${baseUrl}/test-hsp.html`, { waitUntil: 'networkidle' });
  await showTestBody(page);
  await page.waitForSelector('#quizPanel');
  const total = await page.locator('#counter').textContent().then(t => Number((t.match(/\/\s*(\d+)/) || [])[1]));
  for (let i = 0; i < total; i++) {
    await page.locator('#likert .opt').last().click();
    if (i < total - 1) await page.click('#nextBtn');
  }
  await page.click('#submitBtn');
  await page.waitForSelector('#resultPanel.show');
  await wait(300);
  await page.locator('.result-capture-card').screenshot({ path: path.join(baseDir, 'preview-result-hsp.png') });
}

async function captureSliderTest(page, file, outFile) {
  await page.goto(`${baseUrl}/${file}`, { waitUntil: 'networkidle' });
  await showTestBody(page);
  await ensureStoryRec(page);
  await page.evaluate(() => {
    if (typeof startQuiz === 'function') startQuiz();
    else document.getElementById('beginQuizBtn')?.click();
  });
  await page.waitForFunction(() => !document.getElementById('quiz')?.classList.contains('hidden'));
  await page.waitForSelector('#answerSlider');

  while (true) {
    await page.$eval('#answerSlider', el => {
      el.value = '7';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const nextText = ((await page.locator('#nextBtn').textContent()) || '').trim();
    await page.evaluate(() => document.getElementById('nextBtn')?.click());
    if (nextText.includes('查看结果')) break;
    await wait(50);
  }

  await page.waitForSelector('#result-capture');
  await page.waitForFunction(() => !document.getElementById('result')?.classList.contains('hidden'));
  await wait(300);
  await page.locator('#result-capture').screenshot({ path: path.join(baseDir, outFile) });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  try {
    await captureHSP(page);
    await captureSliderTest(page, 'test-ecr.html', 'preview-result-ecr.png');
    await captureSliderTest(page, 'test-erq.html', 'preview-result-erq.png');
    console.log('DONE');
  } finally {
    await browser.close();
  }
})().catch(err => { console.error(err); process.exit(1); });
