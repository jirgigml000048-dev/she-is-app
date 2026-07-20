const cloud = require('wx-server-sdk')
const crypto = require('crypto')
const https = require('https')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function cleanText(value, maxLength) {
  return typeof value === 'string'
    ? value.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength)
    : ''
}

function cleanPortraitText(value, maxLength) {
  return typeof value === 'string'
    ? value
      .replace(/\r\n?/g, '\n')
      .replace(/\*\*/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, maxLength)
    : ''
}

// 只接受去标识化的结果摘要；不接收昵称、OpenID 或原始答案。
function cleanResults(results) {
  if (!Array.isArray(results)) return []
  return results.slice(0, 20).map(item => ({
    id: cleanText(item && item.id, 40),
    axisName: cleanText(item && item.axisName, 20),
    testTitle: cleanText(item && item.testTitle, 40),
    resultLabel: cleanText(item && item.resultLabel, 60),
    scores: Array.isArray(item && item.scores)
      ? item.scores.slice(0, 12).map(value => cleanText(value, 40)).filter(Boolean)
      : [],
  })).filter(item => item.id && item.testTitle)
}

function requestDeepSeek(apiKey, model, prompt) {
  const body = JSON.stringify({
    model,
    max_tokens: 700,
    temperature: 0.75,
    messages: [
      {
        role: 'system',
        content: '你是一名非临床的自我探索写作者。避免医学诊断、绝对化结论和制造焦虑；内容应尊重、多元、克制且具有共情。',
      },
      { role: 'user', content: prompt },
    ],
  })

  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: 'api.deepseek.com',
      path: '/chat/completions',
      method: 'POST',
      timeout: 20000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, response => {
      let raw = ''
      response.setEncoding('utf8')
      response.on('data', chunk => {
        raw += chunk
        if (raw.length > 200000) response.destroy(new Error('AI response too large'))
      })
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`AI HTTP ${response.statusCode}`))
          return
        }
        try {
          const data = JSON.parse(raw)
          const text = data && data.choices && data.choices[0]
            && data.choices[0].message && data.choices[0].message.content
          resolve(cleanPortraitText(text, 1000))
        } catch (error) {
          reject(error)
        }
      })
    })
    request.on('timeout', () => request.destroy(new Error('AI request timeout')))
    request.on('error', reject)
    request.write(body)
    request.end()
  })
}

async function getCache(openid) {
  try {
    const result = await db.collection('portraits').doc(openid).get()
    return result.data || null
  } catch (_) {
    return null
  }
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { success: false, code: 'NO_OPENID', message: '无法识别当前微信用户' }

  const results = cleanResults(event && event.completedResults)
  if (results.length < 2) {
    return { success: false, code: 'NOT_ENOUGH_RESULTS', message: '至少完成两项测评后才能生成画像' }
  }

  const fingerprint = crypto.createHash('sha256').update(JSON.stringify(results)).digest('hex')
  const cached = await getCache(OPENID)
  const force = !!(event && event.force)

  if (cached && cached.fingerprint === fingerprint && cached.text && !force) {
    return { success: true, text: cached.text, fingerprint, cached: true }
  }

  const now = Date.now()
  if (force && cached && now - Number(cached.generatedAt || 0) < 60000) {
    return { success: true, text: cached.text || '', fingerprint: cached.fingerprint || fingerprint, cached: true }
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return { success: false, code: 'AI_NOT_CONFIGURED', message: 'AI 解读服务尚未配置' }
  }
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'

  const summary = results.map(item => {
    const scoreText = item.scores.length ? `（${item.scores.join('，')}）` : ''
    return `- ${item.axisName} · ${item.testTitle}：${item.resultLabel || '已完成'}${scoreText}`
  }).join('\n')
  const prompt = `请根据以下自我探索测评结果，写一份中文内在画像：\n\n${summary}\n\n要求：总字数严格控制在 220—320 个汉字，共 3 段；第 1 段写核心底色，第 2 段写不同特质间的张力及情境变化，第 3 段只写一个温和、可实践的自我观察问题；段落之间换行。找到不同结果之间的联系，不逐条复述；使用第二人称；语言克制、冷静、有共情；不要写标题，不要使用 Markdown 标记（包括 **、#、-），不要作医学或心理诊断。`

  try {
    const text = await requestDeepSeek(apiKey, model, prompt)
    if (!text) throw new Error('Empty AI response')
    await db.collection('portraits').doc(OPENID).set({
      data: { openid: OPENID, text, fingerprint, generatedAt: now },
    })
    return { success: true, text, fingerprint, cached: false }
  } catch (error) {
    console.error('generatePortrait failed', error)
    return { success: false, code: 'AI_UNAVAILABLE', message: '解读服务暂时不可用，请稍后再试' }
  }
}
