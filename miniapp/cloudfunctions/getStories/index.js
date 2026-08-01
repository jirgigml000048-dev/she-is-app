const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const ID_PATTERN = /^[a-z0-9-]{1,40}$/

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function cleanTags(value) {
  return Array.isArray(value)
    ? [...new Set(value
      .filter(tag => typeof tag === 'string')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => /^[a-z0-9-]{1,30}$/.test(tag)))]
      .slice(0, 12)
    : []
}

// 正文只由管理员写入，但读取时仍做一次防御性清理，避免误粘贴脚本或事件属性。
function cleanHtml(value) {
  if (typeof value !== 'string') return ''
  return value
    .slice(0, 240000)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(["'])[^"']*\1/gi, '')
    .replace(/\s(?:href|src)\s*=\s*(["'])\s*javascript:[^"']*\1/gi, '')
}

function publicStory(value, includeBody = false) {
  const item = value && typeof value === 'object' ? value : {}
  const id = cleanString(item.id || item._id, 40).toLowerCase()
  if (!ID_PATTERN.test(id)) return null
  const story = {
    id,
    slug: cleanString(item.slug, 60),
    page: cleanString(item.page, 60),
    title: cleanString(item.title, 100),
    titleEn: cleanString(item.titleEn, 160),
    name: cleanString(item.name, 50),
    tags: cleanTags(item.tags),
    cover: cleanString(item.cover, 1000),
    bgm: cleanString(item.bgm, 1000),
    tts: cleanString(item.tts, 1000),
    summary: cleanString(item.summary, 500),
    readTime: cleanString(item.readTime, 30),
    sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : 1000,
    featured: item.featured === true,
    featuredReason: cleanString(item.featuredReason, 160),
    publishedAt: Number(item.publishedAt) || 0,
    updatedAt: Number(item.updatedAt) || 0,
  }
  if (includeBody) story.bodyHtml = cleanHtml(item.bodyHtml)
  return story
}

async function getAllStories() {
  try {
    const result = await db.collection('stories').limit(100).get()
    return Array.isArray(result.data) ? result.data : []
  } catch (error) {
    console.warn('[getStories] catalog unavailable', error)
    return []
  }
}

function publishedRecord(item) {
  if (!item || item.status === 'archived') return null
  if (item.status === 'published') return item
  if (item.publicVisible === true && item.publishedVersion && typeof item.publishedVersion === 'object') {
    return item.publishedVersion
  }
  return null
}

exports.main = async (event) => {
  const action = event && event.action === 'detail' ? 'detail' : 'list'

  if (action === 'detail') {
    const id = cleanString(event && event.id, 40).toLowerCase()
    if (!ID_PATTERN.test(id)) {
      return { success: false, code: 'INVALID_STORY', message: '故事编号不正确' }
    }
    try {
      const result = await db.collection('stories').doc(id).get()
      const visible = publishedRecord(result.data)
      if (!visible) {
        return { success: true, story: null, hidden: result.data && result.data.status === 'archived' }
      }
      return { success: true, story: publicStory(visible, true), hidden: false }
    } catch (_) {
      return { success: true, story: null, hidden: false }
    }
  }

  const records = await getAllStories()
  const published = records
    .map(publishedRecord)
    .filter(Boolean)
    .map(item => publicStory(item, false))
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder || b.publishedAt - a.publishedAt || b.id.localeCompare(a.id))
  const hiddenIds = records
    .filter(item => item && item.status === 'archived')
    .map(item => cleanString(item.id || item._id, 40).toLowerCase())
    .filter(id => ID_PATTERN.test(id))

  return {
    success: true,
    stories: published,
    hiddenIds: [...new Set(hiddenIds)],
    fetchedAt: Date.now(),
  }
}
