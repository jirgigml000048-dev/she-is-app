const { chromium } = require('playwright');
const path = require('path');
(async()=>{
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
  const base = 'file://' + path.resolve('.');
  await page.goto(base + '/.tmp-hsp-result.html', { waitUntil: 'commit', timeout: 10000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'preview-hsp-result.png', fullPage: true });
  await page.goto(base + '/.tmp-ecr-result.html', { waitUntil: 'commit', timeout: 10000 });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'preview-ecr-result.png', fullPage: true });
  await browser.close();
})();
