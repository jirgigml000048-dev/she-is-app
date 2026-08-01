const cloud = require('wx-server-sdk')
const https = require('https')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const ID_PATTERN = /^[a-z0-9-]{1,40}$/
const STATUSES = new Set(['draft', 'published', 'archived'])

function getAdminOpenIds() {
  return new Set(String(process.env.ADMIN_OPENIDS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean))
}

function isAdmin(openid) {
  return !!openid && getAdminOpenIds().has(openid)
}

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function cleanTags(value) {
  const source = Array.isArray(value) ? value : String(value || '').split(',')
  return [...new Set(source
    .filter(tag => typeof tag === 'string')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => /^[a-z0-9-]{1,30}$/.test(tag)))]
    .slice(0, 12)
}

function cleanUrl(value, allowLocal = false) {
  const url = cleanString(value, 1000)
  if (!url) return ''
  if (/^https:\/\//i.test(url)) return url
  if (/^cloud:\/\//i.test(url)) return url
  if (allowLocal && /^\/static\/[a-zA-Z0-9/_\-.]+$/.test(url)) return url
  return ''
}

function cleanHtml(value) {
  if (typeof value !== 'string') return ''
  return value
    .trim()
    .slice(0, 240000)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(["'])[^"']*\1/gi, '')
    .replace(/\s(?:href|src)\s*=\s*(["'])\s*javascript:[^"']*\1/gi, '')
}

function publishedSnapshot(value) {
  const snapshot = { ...(value || {}) }
  delete snapshot.publishedVersion
  return snapshot
}

function cleanStory(value, previous = {}) {
  const item = value && typeof value === 'object' ? value : {}
  const id = cleanString(item.id || previous.id || previous._id, 40).toLowerCase()
  if (!ID_PATTERN.test(id)) throw new Error('故事编号只能使用小写字母、数字和短横线')
  const status = STATUSES.has(item.status) ? item.status : (previous.status || 'draft')
  const now = Date.now()
  const story = {
    id,
    slug: cleanString(item.slug, 60),
    page: cleanString(item.page, 60),
    title: cleanString(item.title, 100),
    titleEn: cleanString(item.titleEn, 160),
    name: cleanString(item.name, 50),
    tags: cleanTags(item.tags),
    cover: cleanUrl(item.cover, true),
    bgm: cleanUrl(item.bgm),
    tts: cleanUrl(item.tts),
    summary: cleanString(item.summary, 500),
    readTime: cleanString(item.readTime, 30),
    bodyHtml: cleanHtml(item.bodyHtml),
    sortOrder: Number.isFinite(Number(item.sortOrder)) ? Math.round(Number(item.sortOrder)) : 1000,
    featured: item.featured === true,
    featuredReason: cleanString(item.featuredReason, 160),
    status,
    createdAt: Number(previous.createdAt) || now,
    updatedAt: now,
    publishedAt: status === 'published'
      ? (Number(previous.publishedAt) || now)
      : (Number(previous.publishedAt) || 0),
  }
  if (!story.title || !story.name || !story.summary) {
    throw new Error('标题、女孩名字和摘要不能为空')
  }
  if (status === 'published' && (!story.cover || !story.bodyHtml)) {
    throw new Error('发布前必须填写封面地址和文章正文')
  }
  if (status === 'published') {
    story.publicVisible = true
    story.publishedVersion = publishedSnapshot(story)
  } else if (status === 'archived') {
    story.publicVisible = false
    if (previous.publishedVersion) story.publishedVersion = previous.publishedVersion
    else if (previous.status === 'published') story.publishedVersion = publishedSnapshot(previous)
  } else {
    // 已发布文章继续编辑草稿时，普通用户仍看到上一个正式版本。
    story.publicVisible = previous.publicVisible === true || previous.status === 'published'
    if (previous.publishedVersion) story.publishedVersion = previous.publishedVersion
    else if (previous.status === 'published') story.publishedVersion = publishedSnapshot(previous)
  }
  return story
}

async function getDocument(id) {
  try {
    const result = await db.collection('stories').doc(id).get()
    return result.data || null
  } catch (_) {
    return null
  }
}

function isPrivateHost(hostname) {
  const host = String(hostname || '').toLowerCase()
  if (!host || host === 'localhost' || host.endsWith('.local')) return true
  if (host === '169.254.169.254' || host === 'metadata.google.internal') return true
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return true
  const match = host.match(/^172\.(\d+)\./)
  return !!(match && Number(match[1]) >= 16 && Number(match[1]) <= 31)
}

function requestMedia(url, redirects = 0) {
  return new Promise(resolve => {
    let parsed
    try { parsed = new URL(url) } catch (_) {
      resolve({ status: 'broken', message: '地址格式不正确' })
      return
    }
    if (parsed.protocol !== 'https:' || isPrivateHost(parsed.hostname)) {
      resolve({ status: 'broken', message: '只检查公开的 HTTPS 地址' })
      return
    }
    const request = https.request(parsed, { method: 'HEAD', timeout: 1500 }, response => {
      const code = Number(response.statusCode) || 0
      const location = response.headers.location
      response.resume()
      if (code >= 300 && code < 400 && location && redirects < 3) {
        let nextUrl = location
        try { nextUrl = new URL(location, parsed).toString() } catch (_) {}
        requestMedia(nextUrl, redirects + 1).then(resolve)
        return
      }
      if (code >= 200 && code < 400) {
        resolve({ status: 'ok', code, message: '可以访问' })
      } else {
        resolve({ status: 'broken', code, message: code ? `返回 ${code}` : '无法访问' })
      }
    })
    request.on('timeout', () => request.destroy(new Error('timeout')))
    request.on('error', error => {
      resolve({ status: 'broken', message: error && error.message === 'timeout' ? '访问超时' : '网络连接失败' })
    })
    request.end()
  })
}

async function checkAsset(rawUrl, kind) {
  const url = cleanString(rawUrl, 1000)
  if (!url) return { kind, url: '', status: 'missing', message: '尚未填写' }
  if (/^\/static\//.test(url)) return { kind, url, status: 'ok', message: '随小程序发布' }
  let checkUrl = url
  if (/^cloud:\/\//i.test(url)) {
    try {
      const result = await cloud.getTempFileURL({ fileList: [url] })
      checkUrl = result && result.fileList && result.fileList[0] && result.fileList[0].tempFileURL
      if (!checkUrl) throw new Error('no temp url')
    } catch (_) {
      return { kind, url, status: 'broken', message: '云存储文件不存在或无权限' }
    }
  }
  const result = await requestMedia(checkUrl)
  return { kind, url, ...result }
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  if (!isAdmin(OPENID)) {
    return { success: false, code: 'FORBIDDEN', message: '当前账号没有内容管理权限' }
  }

  const action = cleanString(event && event.action, 30) || 'check'
  if (action === 'check') return { success: true, isAdmin: true }

  if (action === 'list') {
    const result = await db.collection('stories').limit(100).get()
    const stories = (Array.isArray(result.data) ? result.data : [])
      .map(item => ({
        id: cleanString(item.id || item._id, 40),
        title: cleanString(item.title, 100),
        name: cleanString(item.name, 50),
        status: STATUSES.has(item.status) ? item.status : 'draft',
        sortOrder: Number(item.sortOrder) || 1000,
        updatedAt: Number(item.updatedAt) || 0,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder || b.updatedAt - a.updatedAt)
    return { success: true, stories }
  }

  if (action === 'get') {
    const id = cleanString(event && event.id, 40).toLowerCase()
    if (!ID_PATTERN.test(id)) return { success: false, code: 'INVALID_STORY', message: '故事编号不正确' }
    const story = await getDocument(id)
    return { success: true, story }
  }

  if (action === 'health') {
    const id = cleanString(event && event.id, 40).toLowerCase()
    if (!ID_PATTERN.test(id)) return { success: false, code: 'INVALID_STORY', message: '故事编号不正确' }
    const item = await getDocument(id)
    if (!item || (item.status !== 'published' && item.publicVisible !== true)) {
      return { success: true, checkedAt: Date.now(), story: null }
    }
    const snapshot = item.status === 'published' ? item : (item.publishedVersion || item)
    const assets = await Promise.all([
      checkAsset(snapshot.cover, 'cover'),
      checkAsset(snapshot.bgm, 'bgm'),
      checkAsset(snapshot.tts, 'tts'),
    ])
    const issueCount = assets.filter(asset => asset.status !== 'ok').length
    return {
      success: true,
      checkedAt: Date.now(),
      story: {
        id: cleanString(snapshot.id || item.id || item._id, 40),
        title: cleanString(snapshot.title || item.title, 100),
        assets,
        issueCount,
      },
    }
  }

  if (action === 'save') {
    try {
      const requested = event && event.story
      const id = cleanString(requested && requested.id, 40).toLowerCase()
      const previous = ID_PATTERN.test(id) ? await getDocument(id) : null
      const story = cleanStory(requested, previous || {})
      await db.collection('stories').doc(story.id).set({ data: story })
      return {
        success: true,
        story: {
          id: story.id,
          title: story.title,
          status: story.status,
          updatedAt: story.updatedAt,
          publishedAt: story.publishedAt,
        },
      }
    } catch (error) {
      return { success: false, code: 'INVALID_STORY', message: error.message || '文章内容不完整' }
    }
  }

  return { success: false, code: 'INVALID_ACTION', message: '不支持的管理操作' }
}
