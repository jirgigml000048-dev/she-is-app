function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function isSectionHeading(text) {
  const plain = String(text || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim()
  return /^(?:0?[1-9]|[一二三四五六七八九十]+)[.．、]\s*\S.{1,42}$/.test(plain)
}

function convertNumberedParagraphs(html) {
  return html.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (match, inner) => (
    isSectionHeading(inner) ? `<h2>${inner.trim()}</h2>` : match
  ))
}

function appendInlineStyle(html, tag, style) {
  const pattern = new RegExp(`<${tag}\\b([^>]*)>`, 'gi')
  return html.replace(pattern, (match, attrs = '') => {
    if (/\sstyle\s*=\s*(["'])/i.test(attrs)) {
      return `<${tag}${attrs.replace(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/i, (styleMatch, quote, current) => ` style=${quote}${current};${style}${quote}`)}>`
    }
    return `<${tag}${attrs} style="${style}">`
  })
}

export function bodyToHtml(value) {
  const body = String(value || '').trim()
  if (!body) return ''
  if (/<\/?(?:p|h[1-6]|section|blockquote|div|ul|ol|li)\b/i.test(body)) return body
  return body
    .split(/\n\s*\n/)
    .map(paragraph => {
      const escaped = escapeHtml(paragraph).replace(/\n/g, '<br>')
      return isSectionHeading(escaped) ? `<h2>${escaped}</h2>` : `<p>${escaped}</p>`
    })
    .join('\n')
}

export function formatArticleHtml(value, { preview = false } = {}) {
  let html = convertNumberedParagraphs(bodyToHtml(value))
  const paragraphMargin = preview ? '20px' : '24px'
  html = appendInlineStyle(
    html,
    'p',
    `font-size:16px;line-height:1.95;color:#2b2430;margin:0 0 ${paragraphMargin};font-weight:300;text-align:justify;`,
  )
  html = appendInlineStyle(
    html,
    'h1',
    'font-size:25px;line-height:1.45;color:#33185c;font-weight:700;margin:44px 0 16px;',
  )
  html = appendInlineStyle(
    html,
    'h2',
    'font-size:22px;line-height:1.55;color:#9c3c62;font-weight:700;margin:44px 0 16px;letter-spacing:0.5px;',
  )
  html = appendInlineStyle(
    html,
    'h3',
    'font-size:20px;line-height:1.55;color:#4a3073;font-weight:700;margin:36px 0 13px;',
  )
  html = appendInlineStyle(
    html,
    'h4',
    'font-size:18px;line-height:1.6;color:#9c3c62;font-weight:600;margin:30px 0 10px;',
  )
  html = appendInlineStyle(
    html,
    'blockquote',
    'font-size:16px;line-height:1.9;color:#4a3073;margin:28px 0;padding:18px 20px;border-left:3px solid #9c3c62;background:#f6eff2;',
  )
  return html.replace(/<span>/gi, '<span style="color:#9c3c62;">')
}
