const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    await page.goto('http://127.0.0.1:4173/test-hsp.html', { waitUntil: 'networkidle' });
    await page.click('#startBtn');

    for (let i = 0; i < 27; i++) {
      await page.locator('#likert .opt').nth(6).click();
      if (i < 26) await page.click('#nextBtn');
    }

    await page.click('#submitBtn');
    await page.locator('#resultPanel.show').waitFor({ state: 'visible', timeout: 10000 });

    const out = path.resolve('preview-result-hsp-v3.png');
    await page.screenshot({ path: out, fullPage: true });
    console.log(out);
  } finally {
    await browser.close();
  }
})();
