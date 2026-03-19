const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const base = 'http://127.0.0.1:4173/';
const outDir = '/Users/gigi/.openclaw/workspace/shared/she-is-app';

function htmlWithBase(fileName) {
  const file = path.join(outDir, fileName);
  const html = fs.readFileSync(file, 'utf8');
  return html.replace(/<head>/i, `<head><base href="${base}">`);
}

async function loadLocalHtml(page, fileName) {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.route('https://cdnjs.cloudflare.com/**', route => route.abort());
  await page.setContent(htmlWithBase(fileName), { timeout: 0 });
  await page.waitForTimeout(800);
}

async function clickAllHighest(page) {
  while (true) {
    const submitEnabled = await page.locator('#submitBtn').isEnabled().catch(() => false);
    if (submitEnabled) break;
    await page.locator('#likert .opt').last().click();
    const next = page.locator('#nextBtn');
    if (await next.isEnabled().catch(() => false)) {
      await next.click();
    }
    await page.waitForTimeout(30);
  }
  await page.locator('#submitBtn').click();
}

async function completeEcr(page) {
  for (let i = 0; i < 36; i++) {
    await page.locator('#nextBtn').click();
    await page.waitForTimeout(i === 35 ? 400 : 340);
  }
}

async function capture(page, output) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: output, fullPage: true });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
  const page = await context.newPage();

  await loadLocalHtml(page, 'test-hsp.html');
  await page.click('#startBtn');
  await page.waitForSelector('#testBody', { state: 'visible' });
  await clickAllHighest(page);
  await page.waitForSelector('#resultPanel.show');
  await capture(page, path.join(outDir, 'preview-hsp-result.png'));

  await page.unroute('https://fonts.googleapis.com/**').catch(() => {});
  await page.unroute('https://fonts.gstatic.com/**').catch(() => {});
  await page.unroute('https://cdnjs.cloudflare.com/**').catch(() => {});

  await loadLocalHtml(page, 'test-ecr.html');
  await page.click('#startBtn');
  await page.waitForSelector('#testBody', { state: 'visible' });
  await page.click('#beginQuizBtn');
  await page.waitForSelector('#quiz:not(.hidden)');
  await completeEcr(page);
  await page.waitForSelector('#result:not(.hidden)');
  await capture(page, path.join(outDir, 'preview-ecr-result.png'));

  await browser.close();
  console.log(path.join(outDir, 'preview-hsp-result.png'));
  console.log(path.join(outDir, 'preview-ecr-result.png'));
})().catch(err => {
  console.error(err);
  process.exit(1);
});
