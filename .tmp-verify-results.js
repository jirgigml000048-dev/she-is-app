const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage();
  const origin = 'http://127.0.0.1:4173';
  const seed = async (moduleId, record) => {
    await page.goto(origin + '/index.html');
    await page.evaluate(([k,v]) => localStorage.setItem(k, JSON.stringify(v)), [`she_result_${moduleId}`, record]);
  };
  await seed('ecr', {moduleId:'ecr', summary:'安全型', score:{anxiety:2.5, avoidance:2.1}});
  await seed('hsp', {moduleId:'hsp', summary:'高敏感', score:{sensitivity:5.1}});
  await seed('disc', {moduleId:'disc', summary:'D · 掌舵者', resultType:'D', score:{D:10,I:4,S:3,C:2}});

  await page.goto(origin + '/test-ecr.html?view=result');
  const ecrOk = await page.locator('.r-type').textContent();
  await page.locator('#redoBtn').click();
  const ecrRestart = await page.locator('#qWrap').isVisible();

  await page.goto(origin + '/test-hsp.html');
  const hspButton = await page.locator('#viewLastResultBtn').textContent();
  await page.locator('#viewLastResultBtn').click();
  const hspOk = await page.locator('#rType').textContent();
  await page.locator('#retryBtn').click();
  const hspRestart = await page.locator('#quizPanel').evaluate(el => !el.classList.contains('hide'));

  await page.goto(origin + '/test-disc.html?view=result');
  const discOk = await page.locator('.result-type').textContent();
  await page.locator('#restartBtn').click();
  const discRestart = await page.locator('#introScreen').evaluate(el => el.classList.contains('active'));

  console.log(JSON.stringify({ecrOk,ecrRestart,hspButton,hspOk,hspRestart,discOk,discRestart}, null, 2));
  await browser.close();
})();