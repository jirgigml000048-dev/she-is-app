import { stories as localStories } from '@/data/stories.js'
import { storyContents } from '@/data/story-contents.js'

const CATALOG_CACHE_KEY = 'sheis-story-catalog-v1'
const CONTENT_CACHE_PREFIX = 'sheis-story-content-v1-'
const CACHE_TTL = 2 * 60 * 1000
const CLOUD_FILE_PATTERN = /^cloud:\/\//i
const cloudUrlCache = new Map()
const localCoverFallbacks = {
  '012': '/static/covers-mini/cover-012-anan.jpg',
  '013': '/static/covers-mini/cover-013-tangtang.jpg',
  '014': '/static/covers-mini/cover-014-xiaolan.jpg',
}

function getStorage(key, fallback = null) {
  try {
    const value = uni.getStorageSync(key)
    return value === '' || value === undefined ? fallback : value
  } catch (_) {
    return fallback
  }
}

function setStorage(key, value) {
  try { uni.setStorageSync(key, value) } catch (_) {}
}

function removeStorage(key) {
  try { uni.removeStorageSync(key) } catch (_) {}
}

function callCloud(data = {}) {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    if (!wx.cloud) {
      reject(new Error('当前微信版本不支持云开发'))
      return
    }
    wx.cloud.callFunction({
      name: 'getStories',
      data,
      success: (res) => {
        const result = res && res.result
        if (result && result.success === false) {
          const error = new Error(result.message || result.code || '文章加载失败')
          error.code = result.code
          reject(error)
          return
        }
        resolve(result || null)
      },
      fail: reject,
    })
    // #endif
    // #ifndef MP-WEIXIN
    resolve(null)
    // #endif
  })
}

function cleanString(value, maxLength = 1000) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function normalizeStory(value, fallback = {}, fallbackOrder = 1000) {
  const item = value && typeof value === 'object' ? value : {}
  const base = fallback && typeof fallback === 'object' ? fallback : {}
  const id = cleanString(item.id || base.id, 40).toLowerCase()
  if (!/^[a-z0-9-]{1,40}$/.test(id)) return null
  const tags = Array.isArray(item.tags)
    ? item.tags.filter(tag => typeof tag === 'string').slice(0, 12)
    : (Array.isArray(base.tags) ? base.tags : [])
  return {
    id,
    slug: cleanString(item.slug || base.slug, 60),
    page: cleanString(item.page || base.page, 60),
    title: cleanString(item.title || base.title, 100),
    titleEn: cleanString(item.titleEn || base.titleEn, 160),
    name: cleanString(item.name || base.name, 50),
    tags,
    cover: cleanString(item.cover || base.cover, 1000),
    bgm: cleanString(item.bgm || base.bgm, 1000),
    tts: cleanString(item.tts || base.tts, 1000),
    summary: cleanString(item.summary || base.summary, 500),
    readTime: cleanString(item.readTime || base.readTime, 30),
    sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : fallbackOrder,
    featured: item.featured === true,
    featuredReason: cleanString(item.featuredReason, 160),
    publishedAt: Number(item.publishedAt) || 0,
    updatedAt: Number(item.updatedAt) || 0,
    remote: item.remote === true,
  }
}

function normalizedLocalStories() {
  return localStories
    .map((story, index) => normalizeStory(story, {}, (index + 1) * 10))
    .filter(Boolean)
}

function sortStories(items) {
  return [...items].sort((a, b) => (
    Number(a.sortOrder) - Number(b.sortOrder)
    || Number(b.publishedAt) - Number(a.publishedAt)
    || b.id.localeCompare(a.id)
  ))
}

function getCloudTempFileUrls(fileIDs) {
  const unique = [...new Set(fileIDs.filter(fileID => CLOUD_FILE_PATTERN.test(fileID)))]
  if (!unique.length) return Promise.resolve(new Map())
  return new Promise(resolve => {
    // #ifdef MP-WEIXIN
    if (!wx.cloud || typeof wx.cloud.getTempFileURL !== 'function') {
      resolve(new Map())
      return
    }
    wx.cloud.getTempFileURL({
      fileList: unique,
      success: result => {
        const resolved = new Map()
        const items = result && Array.isArray(result.fileList) ? result.fileList : []
        items.forEach(item => {
          if (item && item.fileID && item.tempFileURL && Number(item.status) === 0) {
            resolved.set(item.fileID, item.tempFileURL)
            cloudUrlCache.set(item.fileID, item.tempFileURL)
          }
        })
        resolve(resolved)
      },
      fail: () => resolve(new Map()),
    })
    // #endif
    // #ifndef MP-WEIXIN
    resolve(new Map())
    // #endif
  })
}

export async function resolveStoryAssets(items) {
  const stories = (Array.isArray(items) ? items : [items]).filter(Boolean)
  const fields = ['cover', 'bgm', 'tts']
  const unresolved = []
  stories.forEach(story => {
    fields.forEach(field => {
      const value = cleanString(story[field], 1000)
      if (CLOUD_FILE_PATTERN.test(value) && !cloudUrlCache.has(value)) unresolved.push(value)
    })
  })
  const resolved = await getCloudTempFileUrls(unresolved)
  const output = stories.map(story => {
    const next = { ...story }
    fields.forEach(field => {
      const value = cleanString(next[field], 1000)
      if (CLOUD_FILE_PATTERN.test(value)) next[field] = resolved.get(value) || cloudUrlCache.get(value) || value
    })
    if (CLOUD_FILE_PATTERN.test(next.cover) && localCoverFallbacks[next.id]) {
      next.cover = localCoverFallbacks[next.id]
    }
    return next
  })
  return Array.isArray(items) ? output : (output[0] || null)
}

function resolveStoryAssetsSync(items) {
  const arrayInput = Array.isArray(items)
  const output = (arrayInput ? items : [items]).filter(Boolean).map(story => {
    const next = { ...story }
    ;['cover', 'bgm', 'tts'].forEach(field => {
      const value = cleanString(next[field], 1000)
      if (CLOUD_FILE_PATTERN.test(value) && cloudUrlCache.has(value)) next[field] = cloudUrlCache.get(value)
    })
    if (CLOUD_FILE_PATTERN.test(next.cover) && localCoverFallbacks[next.id]) {
      next.cover = localCoverFallbacks[next.id]
    }
    return next
  })
  return arrayInput ? output : (output[0] || null)
}

function mergeCatalog(remoteStories = [], hiddenIds = []) {
  const hidden = new Set(Array.isArray(hiddenIds) ? hiddenIds : [])
  const merged = new Map()
  normalizedLocalStories().forEach(story => {
    if (!hidden.has(story.id)) merged.set(story.id, story)
  })
  ;(Array.isArray(remoteStories) ? remoteStories : []).forEach((story, index) => {
    const local = merged.get(story && story.id)
    const normalized = normalizeStory(
      { ...story, remote: true },
      local || {},
      Number.isFinite(Number(story && story.sortOrder)) ? Number(story.sortOrder) : index,
    )
    if (normalized && !hidden.has(normalized.id)) merged.set(normalized.id, normalized)
  })
  return sortStories([...merged.values()])
}

function cachedCatalog() {
  const cached = getStorage(CATALOG_CACHE_KEY, null)
  if (!cached || !Array.isArray(cached.stories)) return null
  return cached
}

export function getInitialStories() {
  const cached = cachedCatalog()
  return resolveStoryAssetsSync(cached && cached.stories.length ? cached.stories : normalizedLocalStories())
}

export async function loadStoryCatalog({ force = false } = {}) {
  const cached = cachedCatalog()
  if (!force && cached && Date.now() - Number(cached.fetchedAt) < CACHE_TTL) {
    return resolveStoryAssets(cached.stories)
  }
  try {
    const result = await callCloud({ action: 'list' })
    if (!result) return cached ? cached.stories : normalizedLocalStories()
    const stories = await resolveStoryAssets(mergeCatalog(result.stories, result.hiddenIds))
    setStorage(CATALOG_CACHE_KEY, { stories, fetchedAt: Date.now() })
    return stories
  } catch (error) {
    console.warn('[stories] using cached catalog', error)
    return cached ? cached.stories : normalizedLocalStories()
  }
}

export function findInitialStory(id) {
  const cleanId = cleanString(id, 40).toLowerCase()
  return getInitialStories().find(story => story.id === cleanId)
    || normalizedLocalStories().find(story => story.id === cleanId)
    || null
}

function getLocalDetail(id) {
  const story = normalizedLocalStories().find(item => item.id === id)
  if (!story) return null
  return { story, bodyHtml: storyContents[id] || '' }
}

export async function loadStoryDetail(id, { force = false } = {}) {
  const cleanId = cleanString(id, 40).toLowerCase()
  if (!/^[a-z0-9-]{1,40}$/.test(cleanId)) return null
  const cacheKey = CONTENT_CACHE_PREFIX + cleanId
  const cached = getStorage(cacheKey, null)
  if (!force && cached && cached.story && Date.now() - Number(cached.fetchedAt) < CACHE_TTL) {
    return { ...cached, story: await resolveStoryAssets(cached.story) }
  }
  try {
    const result = await callCloud({ action: 'detail', id: cleanId })
    if (result && result.hidden) {
      removeStorage(cacheKey)
      return { story: null, bodyHtml: '', hidden: true }
    }
    if (result && result.story) {
      const fallback = findInitialStory(cleanId) || {}
      const story = await resolveStoryAssets(normalizeStory({ ...result.story, remote: true }, fallback, fallback.sortOrder || 1000))
      const detail = {
        story,
        bodyHtml: cleanString(result.story.bodyHtml, 240000),
        fetchedAt: Date.now(),
        hidden: false,
      }
      setStorage(cacheKey, detail)
      return detail
    }
    const local = getLocalDetail(cleanId)
    return local ? { ...local, fetchedAt: Date.now(), hidden: false } : null
  } catch (error) {
    console.warn('[stories] using cached story', error)
    if (cached && cached.story) return cached
    const local = getLocalDetail(cleanId)
    return local ? { ...local, fetchedAt: Date.now(), hidden: false } : null
  }
}

export function clearStoryCache(id = '') {
  removeStorage(CATALOG_CACHE_KEY)
  if (id) removeStorage(CONTENT_CACHE_PREFIX + cleanString(id, 40).toLowerCase())
}

// 只供管理员首次迁移使用：把安装包里的旧文章复制到云端，之后即可在线编辑。
export function getLegacyStoryDrafts() {
  return normalizedLocalStories().map(story => ({
    ...story,
    bodyHtml: storyContents[story.id] || '',
    status: 'published',
    remote: undefined,
  }))
}
