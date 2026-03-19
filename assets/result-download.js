(function () {
  const STYLE_ID = 'she-result-download-style';
  const HTML2CANVAS_CANDIDATES = [
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
    'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js'
  ];

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .result-footer-stack {
        margin-top: 16px;
        padding-bottom: 80px;
      }
      .result-footer-separator {
        height: 1px;
        background: rgba(44, 32, 20, 0.08);
        margin: 0 0 14px;
      }
      .result-download-row {
        display: block;
        margin: 0 0 16px;
      }
      .result-download-row[hidden] {
        display: none !important;
      }
      .save-btn,
      .result-download-btn {
        display: block;
        width: 100%;
        appearance: none;
        font-family: "Noto Serif SC", serif;
        font-size: 12px;
        line-height: 1.2;
        color: #4A3073;
        background: transparent;
        border: 1px solid rgba(74, 48, 115, 0.3);
        padding: 10px 0;
        border-radius: 8px;
        cursor: pointer;
        text-align: center;
        letter-spacing: 0.02em;
        transition: background-color .2s ease, border-color .2s ease, opacity .2s ease;
      }
      .save-btn:hover,
      .result-download-btn:hover {
        background: rgba(74, 48, 115, 0.05);
        border-color: rgba(74, 48, 115, 0.38);
      }
      .save-btn:disabled,
      .result-download-btn:disabled {
        opacity: 0.58;
        cursor: wait;
      }
      .result-guide-text {
        display: block;
        width: 100%;
        font-family: "Noto Serif SC", serif;
        font-size: 12px;
        color: #888 !important;
        text-align: center;
        line-height: 1.6;
        margin: 0 0 12px;
        text-decoration: none;
      }
      .back-btn {
        display: block;
        width: 100%;
        font-family: "Noto Serif SC", serif;
        font-size: 13px;
        color: #2e2e2e !important;
        background: rgba(255,255,255,0.7);
        border: 1px solid rgba(44,32,20,0.1);
        padding: 12px 0;
        border-radius: 10px;
        cursor: pointer;
        text-align: center;
        margin: 0 0 10px;
        text-decoration: none;
      }
      .retry-btn {
        display: block;
        width: 100%;
        font-family: "Noto Serif SC", serif;
        font-size: 12px;
        color: #888 !important;
        background: transparent;
        border: none;
        padding: 8px 0;
        cursor: pointer;
        text-align: center;
        text-decoration: none;
      }
    `;
    document.head.appendChild(style);
  }

  function sanitizeFileName(name) {
    return String(name || '测试')
      .replace(/[\\/:*?"<>|]/g, '-')
      .replace(/\s+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function isVisible(element) {
    if (!element) return false;
    let current = element;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
        return false;
      }
      current = current.parentElement;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function findCaptureTarget(config, button) {
    const directMatch = document.querySelector(config.captureSelector);
    if (directMatch) return directMatch;
    return button.closest('.result-panel, .view, .panel, section, main, .card')?.querySelector('.result-capture-card') || null;
  }

  function updateButtonVisibility(button, capture) {
    const row = button.closest('.result-download-row');
    if (!row) return;
    row.hidden = !isVisible(capture);
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function findResultContainer(button) {
    return button.closest('#resultPanel, #resultView, #result, .result-panel, .view, section, main') || button.parentElement;
  }

  function findActionElement(container, matcher) {
    return Array.from(container.querySelectorAll('a, button')).find(function (element) {
      return matcher((element.textContent || '').replace(/\s+/g, ' ').trim(), element);
    }) || null;
  }

  function normalizeResultLayout(button) {
    const container = findResultContainer(button);
    if (!container) return;

    const row = button.closest('.result-download-row');
    if (!row) return;

    let footer = container.querySelector('.result-footer-stack');
    if (!footer) {
      footer = document.createElement('div');
      footer.className = 'result-footer-stack';
      container.appendChild(footer);
    }

    if (!footer.querySelector('.result-footer-separator')) {
      const separator = document.createElement('div');
      separator.className = 'result-footer-separator';
      footer.appendChild(separator);
    }

    button.classList.add('save-btn');

    let guide = container.querySelector('.result-guide-text');
    if (!guide) {
      guide = findActionElement(container, function (text) {
        return text.includes('这个维度是你画像的一部分');
      });
    }
    if (!guide) {
      guide = document.createElement('a');
      guide.href = 'profile.html';
      guide.textContent = '这个维度是你画像的一部分——查看五个维度的完整模式，看看它们如何相互影响。';
    }
    guide.className = 'result-guide-text';

    let back = findActionElement(container, function (text, element) {
      if (element === guide) return false;
      return /返回/.test(text) || /assessment(?:-more)?\.html/.test(element.getAttribute('href') || '');
    });
    if (!back) {
      back = document.createElement('a');
      back.href = 'assessment-more.html';
    }
    if (back.tagName === 'A' && !(back.getAttribute('href') || '').trim()) {
      back.href = 'assessment-more.html';
    }
    back.textContent = '返回更多测试';
    back.className = 'back-btn';

    let retry = findActionElement(container, function (text, element) {
      if (element === guide || element === back) return false;
      return /再测一次|重新测评|重新开始/.test(text) || /retry|redo|restart/i.test(element.id || '');
    });
    if (!retry) {
      retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = '再测一次';
    }
    retry.className = 'retry-btn';
    if (retry.tagName === 'BUTTON') retry.type = retry.type || 'button';
    retry.textContent = '再测一次';

    const separator = footer.querySelector('.result-footer-separator');
    footer.appendChild(row);
    footer.appendChild(separator);
    footer.appendChild(guide);
    footer.appendChild(back);
    footer.appendChild(retry);
  }

  async function ensureHtml2Canvas() {
    if (typeof window.html2canvas === 'function') return true;

    for (const src of HTML2CANVAS_CANDIDATES) {
      try {
        await loadScript(src);
        if (typeof window.html2canvas === 'function') return true;
      } catch (error) {
        console.warn('Failed to load html2canvas from', src, error);
      }
    }

    return typeof window.html2canvas === 'function';
  }

  window.SheResultDownload = {
    init(config) {
      ensureStyle();
      const button = document.querySelector(config.buttonSelector);
      if (!button) return;

      let capture = findCaptureTarget(config, button);
      normalizeResultLayout(button);
      updateButtonVisibility(button, capture);

      const observer = new MutationObserver(function () {
        capture = findCaptureTarget(config, button);
        normalizeResultLayout(button);
        updateButtonVisibility(button, capture);
      });
      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['class', 'style', 'hidden']
      });

      button.addEventListener('click', async function () {
        capture = findCaptureTarget(config, button);

        if (!capture) {
          window.alert('未找到可保存的结果内容，请先完成测试。');
          return;
        }

        if (!isVisible(capture)) {
          window.alert('结果内容尚未显示，请先生成结果后再保存。');
          return;
        }

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = '保存中…';

        try {
          const ready = await ensureHtml2Canvas();
          if (!ready) {
            window.alert('截图组件加载失败，请刷新后重试。');
            return;
          }

          const canvas = await window.html2canvas(capture, {
            backgroundColor: null,
            scale: Math.min(window.devicePixelRatio || 2, 3),
            useCORS: true,
            logging: false
          });
          const link = document.createElement('a');
          link.download = `she-is-${sanitizeFileName(config.testName)}-结果.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        } catch (error) {
          console.error('Failed to export result image:', error);
          window.alert('保存图片失败，请稍后重试。');
        } finally {
          button.disabled = false;
          button.textContent = originalText;
          updateButtonVisibility(button, capture);
        }
      });
    }
  };
})();
