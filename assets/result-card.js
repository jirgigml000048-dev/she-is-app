// assets/result-card.js
// 动态生成结果图片卡片并下载
(function () {
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function extractPlainText(value) {
    const temp = document.createElement('div');
    temp.innerHTML = value ?? '';
    return (temp.textContent || temp.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function extractQuote(value, fallback) {
    const text = extractPlainText(value);
    if (!text) return fallback || '';
    const pieces = text.match(/[^。！？!?]+[。！？!?]?/g) || [text];
    return pieces.join('').trim() || fallback || text;
  }

  function removeExistingCard() {
    const existing = document.getElementById('__result-card-export__');
    if (existing) existing.remove();
  }

  function generateResultCard(config) {
    removeExistingCard();

    const card = document.createElement('div');
    card.id = '__result-card-export__';
    card.style.cssText = `
      position: fixed; top: -9999px; left: -9999px;
      width: 390px; height: 693px;
      background: #f5f0eb;
      overflow: hidden;
      display: flex; flex-direction: column;
      padding: 48px 36px;
      font-family: "Noto Serif SC", serif;
      box-sizing: border-box;
    `;

    const testName = escapeHtml(config.testName);
    const resultType = escapeHtml(config.resultType);
    const resultSubtitle = escapeHtml(config.resultSubtitle);
    const quote = escapeHtml(config.quote);
    const score = config.score ? escapeHtml(config.score) : '';

    card.innerHTML = `
      <div style="position:absolute;top:-60px;left:-60px;width:280px;height:280px;background:radial-gradient(ellipse,rgba(74,48,115,0.13),transparent 70%);pointer-events:none;"></div>
      <div style="position:absolute;bottom:-60px;right:-60px;width:280px;height:280px;background:radial-gradient(ellipse,rgba(74,48,115,0.10),transparent 70%);pointer-events:none;"></div>
      
      <div style="position:relative;z-index:1;">
        <div style="font-size:12px;color:#4A3073;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:12px;">${testName}</div>
        <div style="height:1px;background:rgba(74,48,115,0.15);margin-bottom:28px;"></div>
      </div>
      
      <div style="flex:1;"></div>
      
      <div style="position:relative;z-index:1;">
        <div style="font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:600;color:#4A3073;line-height:1.1;margin-bottom:10px;">${resultType}</div>
        ${resultSubtitle ? `<div style="font-family:'Noto Serif SC',serif;font-size:18px;color:#2e2e2e;line-height:1.5;margin-bottom:20px;">${resultSubtitle}</div>` : ''}
        ${quote ? `<div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:16px;color:#888;line-height:1.7;margin-bottom:16px;">${quote}</div>` : ''}
        ${score ? `<div style="font-size:11px;color:#aaa;margin-top:4px;">${score}</div>` : ''}
      </div>
      
      <div style="flex:1;"></div>
      
      <div style="display:flex;justify-content:space-between;align-items:flex-end;position:relative;z-index:1;">
        <span style="font-family:'Courier New',monospace;font-size:9px;color:#bbb;">she-is-app.netlify.app</span>
        <span style="font-family:'Courier New',monospace;font-size:12px;color:#4A3073;letter-spacing:0.05em;">she is ______.</span>
      </div>
    `;

    document.body.appendChild(card);

    html2canvas(card, {
      width: 390,
      height: 693,
      scale: Math.min(window.devicePixelRatio * 2, 4),
      backgroundColor: '#f5f0eb',
      useCORS: true,
      logging: false
    }).then(canvas => {
      const dataUrl = canvas.toDataURL('image/png');
      card.remove();
      showShareModal(dataUrl);
    }).catch(err => {
      console.error('生成图片失败', err);
      card.remove();
      alert('生成图片时出现问题，请重试');
    });
  }

  async function generateLongCard(config) {
    const sourceEl = document.querySelector(config.captureSelector);
    if (!sourceEl) {
      alert('未找到结果内容，请先完成测试。');
      return;
    }

    const existing = document.getElementById('__long-card-wrapper__');
    if (existing) existing.remove();

    const wrapper = document.createElement('div');
    wrapper.id = '__long-card-wrapper__';
    wrapper.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 390px;
      background: #f5f0eb;
      font-family: "Noto Serif SC", serif;
      box-sizing: border-box;
      padding: 0;
      overflow: hidden;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      padding: 28px 28px 16px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      position: relative;
    `;
    header.innerHTML = `
      <div style="position:absolute;top:-40px;left:-40px;width:200px;height:200px;background:radial-gradient(ellipse,rgba(74,48,115,0.12),transparent 70%);pointer-events:none;"></div>
      <span style="font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:600;color:#1c1c1c;letter-spacing:0.1em;line-height:1;">女也</span>
      <span style="font-size:10px;color:#888;letter-spacing:0.1em;margin-top:2px;">she is ______.</span>
      <div style="margin-top:14px;font-size:11px;color:#4A3073;letter-spacing:0.18em;text-transform:uppercase;">${config.testName || ''}</div>
      <div style="height:1px;background:rgba(74,48,115,0.15);width:100%;margin-top:10px;"></div>
    `;

    const contentClone = sourceEl.cloneNode(true);
    contentClone.style.cssText = `
      padding: 16px 28px 8px;
      background: transparent;
      border: none;
      box-shadow: none;
      border-radius: 0;
      width: 100%;
      box-sizing: border-box;
    `;

    ['#result-actions', '.result-actions', '#storyRec', '.story-rec', '#storyRecSection'].forEach((sel) => {
      try {
        contentClone.querySelectorAll(sel).forEach((el) => el.remove());
      } catch (e) {}
    });

    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 16px 28px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    `;
    footer.innerHTML = `
      <div style="height:1px;background:rgba(74,48,115,0.12);position:absolute;top:0;left:28px;right:28px;"></div>
      <span style="font-family:'Courier New',monospace;font-size:9px;color:#bbb;">she-is-app.vercel.app</span>
      <span style="font-family:'Cormorant Garamond',serif;font-size:11px;color:#4A3073;letter-spacing:0.05em;">she is ______.</span>
    `;

    wrapper.appendChild(header);
    wrapper.appendChild(contentClone);
    wrapper.appendChild(footer);
    document.body.appendChild(wrapper);

    try {
      const canvas = await html2canvas(wrapper, {
        width: 390,
        backgroundColor: '#f5f0eb',
        scale: Math.min(window.devicePixelRatio * 2, 4),
        useCORS: true,
        logging: false,
        windowWidth: 390
      });
      const dataUrl = canvas.toDataURL('image/png');
      wrapper.remove();
      showShareModal(dataUrl);
    } catch (err) {
      console.error('长图生成失败', err);
      wrapper.remove();
      alert('生成图片时出现问题，请重试');
    }
  }

  function showShareModal(dataUrl) {
    let modal = document.getElementById('__share-modal__');
    if (modal) modal.remove();

    const isDesktop = window.innerWidth > 600;

    modal = document.createElement('div');
    modal.id = '__share-modal__';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      padding:24px;box-sizing:border-box;
    `;

    modal.innerHTML = `
      <div style="position:relative;max-width:360px;width:100%;text-align:center;">
        <img src="${dataUrl}" style="
          width:100%;border-radius:16px;
          box-shadow:0 20px 60px rgba(0,0,0,0.45);
          display:block;
        " />
        <p style="
          margin:16px 0 0;color:rgba(255,255,255,0.82);
          font-size:13px;line-height:1.7;
          font-family:'Noto Serif SC',serif;
        ">${isDesktop ? '右键图片另存为，或点击下方下载' : '长按图片保存到相册'}</p>
        ${isDesktop ? `<a href="${dataUrl}" download="she-is-result.png" style="
          display:block;margin:12px 0 0;
          padding:11px;border-radius:10px;
          background:rgba(74,48,115,0.8);color:white;
          font-family:'Noto Serif SC',serif;font-size:13px;
          text-decoration:none;
        ">点击下载图片</a>` : ''}
        <button id="__share-modal-close__" style="
          display:block;width:100%;margin-top:12px;
          background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);
          color:white;border-radius:10px;padding:12px;
          font-family:'Noto Serif SC',serif;font-size:13px;cursor:pointer;
        ">关闭</button>
      </div>
    `;

    modal.querySelector('#__share-modal-close__').addEventListener('click', function() {
      modal.remove();
    });
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
  }

  window.generateResultCard = generateResultCard;
  window.generateLongCard = generateLongCard;
  window.extractResultCardQuote = extractQuote;
})();
