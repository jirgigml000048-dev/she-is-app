const { chromium } = require('playwright');
const path = require('path');

const baseDir = '/Users/gigi/.openclaw/workspace/shared/she-is-app';
const outFile = path.join(baseDir, 'preview-result-ecr-fearful.png');
const url = 'http://127.0.0.1:4173/test-ecr.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const page = await context.newPage();

  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  await page.route('https://cdnjs.cloudflare.com/**', r => r.abort());

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    const intro = document.querySelector('.test-intro');
    const body = document.getElementById('testBody');
    if (intro) intro.style.display = 'none';
    if (body) body.style.display = 'block';

    const introEl = document.getElementById('intro');
    const quizEl = document.getElementById('quiz');
    const resultEl = document.getElementById('result');
    if (introEl) introEl.classList.add('hidden');
    if (quizEl) quizEl.classList.add('hidden');
    if (resultEl) resultEl.classList.remove('hidden');

    const r = DATA.results.fearful;
    const matchRows = [
      { label: '安全型', percent: 18 },
      { label: '恐惧型', percent: 100 },
      { label: '专注型', percent: 72 },
      { label: '冷漠型', percent: 44 },
    ];

    const buildScoreRows = (items) => items.map((item) => `
      <div class="score-row">
        <span class="score-label">${item.label}</span>
        <div class="score-bar-bg"><div class="score-bar-fill" style="width:${item.percent.toFixed(0)}%"></div></div>
        <span class="score-val">${item.percent.toFixed(0)}%</span>
      </div>
    `).join('');

    resultEl.innerHTML = `
      <div id="result-capture" class="result-capture-card">
        <div class="result-viz">${buildScoreRows(matchRows)}</div>
        <h2 class="r-type" data-subtitle="${r.subtitle || r.tagline || ''}">${r.label}</h2>
        <p class="r-score-line">回避 5.92 ｜ 焦虑 5.84</p>
        <div class="r-divider"></div>
        <div class="r-desc">${r.desc}<p>这是你当下的模式，不是诊断，也不是定论。</p></div>
      </div>
      <div class="result-actions">
        <button class="result-save-btn" type="button">保存结果图片</button>
        <p class="result-guide">这是你心理画像的一部分 · <a href="index.html#assessment">查看全部测评</a></p>
        <a href="index.html" class="result-back-btn">返回首页</a>
        <button class="result-retry-btn" type="button">再做一次</button>
      </div>
    `;

    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    if (progressBar) progressBar.style.width = '100%';
    if (progressText) progressText.textContent = '完成';

    window.scrollTo(0, 0);
  });

  await page.waitForSelector('#result-capture');
  await page.waitForTimeout(400);
  await page.screenshot({ path: outFile, fullPage: true });
  await browser.close();
  console.log(outFile);
})();
