const { chromium } = require('playwright');
const path = require('path');

const base = 'http://127.0.0.1:4173';
const outDir = '/Users/gigi/.openclaw/workspace/shared/she-is-app';

async function captureBoundary(page) {
  await page.goto(`${base}/test-boundary-sense.html`, { waitUntil: 'networkidle' });
  await page.click('#startBtn');
  for (let i = 0; i < 8; i++) {
    await page.locator('#options .option').first().click();
    await page.waitForTimeout(260);
  }
  await page.locator('#resultView').waitFor({ state: 'visible' });
  await page.screenshot({ path: path.join(outDir, 'preview-result-boundary.png'), fullPage: true });
}

async function captureAbm(page) {
  await page.goto(`${base}/test-abm-love-animal.html`, { waitUntil: 'networkidle' });
  await page.click('#startBtn');
  await page.click('#beginQuizBtn');
  for (let i = 0; i < 12; i++) {
    await page.locator('#answerSlider').evaluate(el => el.value = '7');
    await page.locator('#answerSlider').dispatchEvent('input');
    await page.click('#nextBtn');
    await page.waitForTimeout(360);
  }
  await page.locator('#result').waitFor({ state: 'visible' });
  await page.screenshot({ path: path.join(outDir, 'preview-result-abm.png'), fullPage: true });
}

async function captureHsp(page) {
  await page.goto(`${base}/test-hsp.html`, { waitUntil: 'networkidle' });
  await page.click('#startBtn');
  for (let i = 0; i < 27; i++) {
    await page.locator('#likert .opt').nth(6).click();
    if (i < 26) await page.click('#nextBtn');
  }
  await page.click('#submitBtn');
  await page.locator('#resultPanel.show').waitFor({ state: 'visible' });
  await page.screenshot({ path: path.join(outDir, 'preview-result-hsp-latest.png'), fullPage: true });
}

(async() => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  try {
    await captureBoundary(page);
    await captureAbm(page);
    await captureHsp(page);
    console.log('DONE');
  } finally {
    await browser.close();
  }
})();
