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
    return pieces.slice(0, 2).join('').trim() || fallback || text;
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
      scale: 2,
      backgroundColor: '#f5f0eb',
      useCORS: true,
      logging: false
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `she-is-${config.fileName || 'result'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      card.remove();
    }).catch(err => {
      console.error('生成图片失败', err);
      card.remove();
      alert('生成图片时出现问题，请重试');
    });
  }

  window.generateResultCard = generateResultCard;
  window.extractResultCardQuote = extractQuote;
})();
