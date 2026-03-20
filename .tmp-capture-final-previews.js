const { chromium } = require('playwright');
const path = require('path');

const baseDir = '/Users/gigi/.openclaw/workspace/shared/she-is-app';
const baseUrl = 'http://127.0.0.1:4173';

async function captureHsp(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${baseUrl}/test-hsp.html`, { waitUntil: 'networkidle' });
  await page.click('#startBtn');
  for (let i = 0; i < 27; i++) {
    await page.locator('#likert .opt').nth(6).click();
    if (i < 26) await page.click('#nextBtn');
  }
  await page.click('#submitBtn');
  await page.locator('#resultPanel.show').waitFor({ state: 'visible', timeout: 10000 });
  const out = path.join(baseDir, 'preview-final-hsp-high.png');
  await page.screenshot({ path: out, fullPage: true });
  return out;
}

async function captureEcr(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  await page.route('https://cdnjs.cloudflare.com/**', r => r.abort());
  await page.goto(`${baseUrl}/test-ecr.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
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
  const out = path.join(baseDir, 'preview-final-ecr-fearful.png');
  await page.screenshot({ path: out, fullPage: true });
  return out;
}

async function captureCognitive(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  await page.route('https://cdnjs.cloudflare.com/**', r => r.abort());
  await page.goto(`${baseUrl}/test-cognitive.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(600);
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

    const scores = [
      { id: 'Ni', name: '内倾直觉 Ni', total: 48, average: 4.8, percent: 96, desc: '你会先看到趋势、模式和更深层的意义，擅长从碎片中提炼长期判断。' },
      { id: 'Te', name: '外倾思维 Te', total: 46, average: 4.6, percent: 92, desc: '你重视效率、结构与可验证结果，习惯把问题变成可执行路径。' },
      { id: 'Fi', name: '内倾情感 Fi', total: 39, average: 3.9, percent: 78, desc: '你对个人价值和真实感受有稳定内核，会先确认什么对自己真正重要。' },
      { id: 'Se', name: '外倾感觉 Se', total: 28, average: 2.8, percent: 56, desc: '你能感知现实中的细节与变化，但通常不会把它作为最优先的决策依据。' },
      { id: 'Ne', name: '外倾直觉 Ne', total: 26, average: 2.6, percent: 52, desc: '你能发散联想、看到多个可能性，但更倾向聚焦而不是持续扩张。' },
      { id: 'Ti', name: '内倾思维 Ti', total: 24, average: 2.4, percent: 48, desc: '你会追求逻辑自洽，但通常不会停留在纯分析里，而是更快转向应用。' },
      { id: 'Fe', name: '外倾情感 Fe', total: 21, average: 2.1, percent: 42, desc: '你理解关系氛围的重要性，但不会总是把外部期待放在第一位。' },
      { id: 'Si', name: '内倾感觉 Si', total: 19, average: 1.9, percent: 38, desc: '你会参考经验和熟悉路径，但更容易被未来方向而不是既有惯例驱动。' }
    ];

    const buildVizRows = (items) => items.map((item) => `
      <div class="score-row">
        <span class="score-label">${item.id}</span>
        <div class="score-bar-bg"><div class="score-bar-fill" style="width:${item.percent}%"></div></div>
        <span class="score-val">${item.total}</span>
      </div>`).join('');

    resultEl.innerHTML = `
      <div id="result-capture" class="result-capture-card">
        <div class="result-viz">${buildVizRows(scores.slice(0, 4))}</div>
        <h2 class="r-type">你的认知功能画像</h2>
        <p class="r-score-line">最突出功能：内倾直觉 Ni / 外倾思维 Te</p>
        <div class="r-divider"></div>
        <div class="r-desc"><p>以下是你在日常中用得更顺手的心理加工方式——不是标签，而是你认知模式的入口。</p><p>你更擅长先看到模式与方向，再把它组织成可执行的决策路径。</p><p>这是你当下的模式，不是诊断，也不是定论。</p></div>
        <div id="mbti-probable-card" class="highlight" style="margin-top:18px;background:rgba(212,145,122,.08);border-color:rgba(212,145,122,.28)">
          <strong style="display:block;font-size:1.08rem;margin-bottom:6px;">可能的 MBTI 倾向：INTJ</strong>
          <div style="font-size:.92rem;color:rgba(44,44,44,.78);line-height:1.8;">从当前分布看，Ni / Te 更突出，Fi 次之、Se 相对靠后，整体更接近 <b>INTJ</b> 的认知功能排序。这只是基于功能分数的近似映射，用来帮助理解，不等于正式 MBTI 结论。</div>
        </div>
        <div class="highlight">
          <strong>8 个功能分数</strong>
          <div class="result-list">
            ${scores.map(item => `
              <article class="result-card${item.id === 'Ni' ? ' top' : ''}">
                <div class="result-head">
                  <div class="result-name">${item.name}${item.id === 'Ni' ? ' · 最高分' : ''}</div>
                  <div class="result-score">${item.total}/50 · 均分 ${item.average.toFixed(1)}</div>
                </div>
                <div class="result-bar"><span style="width:${item.percent}%"></span></div>
                <div><p>${item.desc}</p><span class="disclaimer-note">这是你当下的模式，不是诊断，也不是定论。</span></div>
              </article>`).join('')}
          </div>
          <p class="footer-note">如果你想看更细的差异，可以留意第二高分与第三高分维度，它们往往一起构成你更具体的思考与决策风格。</p>
          <div class="result-actions"><button class="result-save-btn" type="button">保存结果图片</button><p class="result-guide">这是你心理画像的一部分 · <a href="index.html#assessment">查看全部测评</a></p><a href="index.html" class="result-back-btn">返回首页</a><button class="result-retry-btn ghost" type="button">再做一次</button></div>
        </div>
      </div>`;

    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    if (progressBar) progressBar.style.width = '100%';
    if (progressText) progressText.textContent = '已完成';
    window.scrollTo(0, 0);
  });
  await page.waitForSelector('#result-capture');
  await page.waitForTimeout(800);
  const out = path.join(baseDir, 'preview-final-cognitive.png');
  await page.screenshot({ path: out, fullPage: true });
  return out;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const hsp = await captureHsp(browser);
    const ecr = await captureEcr(browser);
    const cognitive = await captureCognitive(browser);
    console.log(JSON.stringify({ hsp, ecr, cognitive }, null, 2));
  } finally {
    await browser.close();
  }
})();
