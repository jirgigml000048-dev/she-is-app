const cloud = require('wx-server-sdk')

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
