// 微信云开发用户与探索记录工具。
// 所有云端写入都以用户主动开启“跨设备同步”为前提；未登录时只保存在本机。

import { allTests } from '@/data/tests.js'

const USER_CACHE_KEY = 'sheis-user'
const READ_STORIES_KEY = 'read-story-ids'
const REFLECTIONS_KEY = 'inner-reflections-v1'
const RESULT_META_PREFIX = 'test-result-'

function getStorage(key, fallback = null) {
  try {
    const value = uni.getStorageSync(key)
    return value === '' || value === undefined ? fallback : value
  } catch (_) {
    return fallback
  }
}

function setStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
  } catch (_) {}
}

function callCloud(name, data = {}) {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    if (!wx.cloud) {
      reject(new Error('当前微信版本不支持云开发'))
      return
    }
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        const result = res && res.result
        if (result && result.success === false) {
          const error = new Error(result.message || result.code || `${name} failed`)
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

function isCompleteAnswers(test, answers) {
  if (!test || !Array.isArray(answers) || answers.length !== test.questions.length) return false
  return answers.every(value => value !== null && value !== undefined && value !== '')
}

function getLocalAssessment(test) {
  const answers = getStorage(`test-answers-${test.id}`, [])
  if (!isCompleteAnswers(test, answers)) return null
  const meta = getStorage(`${RESULT_META_PREFIX}${test.id}`, {}) || {}
  return {
    testId: test.id,
    answers,
    resultKey: typeof meta.resultKey === 'string' ? meta.resultKey : '',
    updatedAt: Number(meta.updatedAt) || 0,
  }
}

function saveLocalAssessment(entry) {
  if (!entry || typeof entry.testId !== 'string' || !Array.isArray(entry.answers)) return
  setStorage(`test-answers-${entry.testId}`, entry.answers)
  setStorage(`${RESULT_META_PREFIX}${entry.testId}`, {
    resultKey: typeof entry.resultKey === 'string' ? entry.resultKey : '',
    updatedAt: Number(entry.updatedAt) || Date.now(),
  })
}

export function getUser() {
  return getStorage(USER_CACHE_KEY, null)
}

export function isLoggedIn() {
  return !!getUser()
}

export function clearUser() {
  try { uni.removeStorageSync(USER_CACHE_KEY) } catch (_) {}
}

export function getReadStoryIds() {
  const ids = getStorage(READ_STORIES_KEY, [])
  return Array.isArray(ids) ? [...new Set(ids.filter(id => typeof id === 'string'))] : []
}

function cleanReflection(value) {
  if (!value || typeof value !== 'object' || typeof value.id !== 'string') return null
  const themes = ['boundary', 'desire', 'relationship', 'self', 'emotion', 'body', 'choice', 'change']
  if (!/^reflection-[a-z0-9-]{8,64}$/.test(value.id)) return null
  if (typeof value.promptId !== 'string' || !/^[a-z]+-\d{2}$/.test(value.promptId)) return null
  if (!themes.includes(value.theme)) return null
  const question = typeof value.question === 'string' ? value.question.trim().slice(0, 120) : ''
  const answerText = typeof value.answerText === 'string' ? value.answerText.trim().slice(0, 500) : ''
  const selectedOptions = Array.isArray(value.selectedOptions)
    ? [...new Set(value.selectedOptions
      .filter(option => typeof option === 'string')
      .map(option => option.trim().slice(0, 30))
      .filter(Boolean))]
      .slice(0, 3)
    : []
  if (!question || (!answerText && !selectedOptions.length)) return null
  const now = Date.now()
  return {
    id: value.id,
    promptId: value.promptId,
    theme: value.theme,
    question,
    answerText,
    selectedOptions,
    createdAt: Number(value.createdAt) || now,
    updatedAt: Number(value.updatedAt) || now,
  }
}

function saveLocalReflections(reflections) {
  const clean = (Array.isArray(reflections) ? reflections : [])
    .map(cleanReflection)
    .filter(Boolean)
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 80)
  setStorage(REFLECTIONS_KEY, clean)
  return clean
}

export function getReflections() {
  return saveLocalReflections(getStorage(REFLECTIONS_KEY, []))
}

export function getReflectionCount() {
  return getReflections().length
}

export function getLatestReflection() {
  return getReflections()[0] || null
}

function saveReflectionsToCloud(reflections) {
  if (!isLoggedIn() || !Array.isArray(reflections) || !reflections.length) return Promise.resolve(null)
  return callCloud('saveReflection', { reflections })
}

// 每次回答先写入本机，再尽力同步云端；网络失败不会丢失刚写下的内容。
export function recordReflection(values) {
  const now = Date.now()
  const nonce = Math.random().toString(36).slice(2, 10)
  const entry = cleanReflection({
    ...values,
    id: `reflection-${now.toString(36)}-${nonce}`,
    createdAt: now,
    updatedAt: now,
  })
  if (!entry) return Promise.reject(new Error('回答内容不完整'))
  saveLocalReflections([entry, ...getReflections()])
  return saveReflectionsToCloud([entry]).then(result => ({ entry, result }))
}

export function getCompletedTestCount() {
  return allTests.reduce((count, test) => count + (getLocalAssessment(test) ? 1 : 0), 0)
}

// 只整理用户自己设备上的数据，不包含 OpenID、云函数日志或任何后台统计信息。
export function exportLocalUserData() {
  const user = getUser()
  const portrait = getStorage('ai-portrait-v1', null)
  return {
    product: '女也 She Is',
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    profile: user ? {
      nickname: user.nickname || '',
      avatarUrl: user.avatarUrl || '',
      syncEnabled: true,
      lastSyncAt: Number(user.lastSeenAt) || 0,
    } : { nickname: '', avatarUrl: '', syncEnabled: false, lastSyncAt: 0 },
    assessments: allTests.map(getLocalAssessment).filter(Boolean),
    readStoryIds: getReadStoryIds(),
    reflections: getReflections(),
    portrait: portrait && typeof portrait === 'object' ? portrait : null,
  }
}

// 清除这台设备上的探索记录；登录状态和云端副本不受影响。
export function clearLocalExplorationData() {
  allTests.forEach(test => {
    try { uni.removeStorageSync(`test-answers-${test.id}`) } catch (_) {}
    try { uni.removeStorageSync(`${RESULT_META_PREFIX}${test.id}`) } catch (_) {}
  })
  ;[READ_STORIES_KEY, REFLECTIONS_KEY, 'ai-portrait-v1'].forEach(key => {
    try { uni.removeStorageSync(key) } catch (_) {}
  })
}

// 只在本机整理已完成测评，供组合洞察与个性化推荐使用。
// 原始答案不会因为调用这个方法而上传；云端同步仍只走用户主动登录后的既有流程。
export function getCompletedAssessments() {
  return allTests.map(test => {
    const local = getLocalAssessment(test)
    if (!local) return null
    let resultKey = local.resultKey
    let scores = []
    try {
      if (!resultKey && typeof test.score === 'function') resultKey = test.score(local.answers)
    } catch (_) { resultKey = '' }
    try {
      if (typeof test.computeScores === 'function') scores = test.computeScores(local.answers) || []
    } catch (_) { scores = [] }
    const result = test.results && test.results[resultKey]
    return {
      testId: test.id,
      testTitle: test.title,
      axis: test.axis,
      resultKey: resultKey || '',
      resultLabel: (result && result.label) || '',
      scores,
      answers: [...local.answers],
      updatedAt: local.updatedAt,
    }
  }).filter(Boolean)
}

export function saveAssessmentToCloud(entry) {
  if (!isLoggedIn() || !entry) return Promise.resolve(null)
  return callCloud('saveAssessment', {
    testId: entry.testId,
    answers: entry.answers,
    resultKey: entry.resultKey || '',
  }).then(result => {
    if (result && result.updatedAt) {
      saveLocalAssessment({ ...entry, updatedAt: result.updatedAt })
    }
    return result
  })
}

// 测评完成时先同步写入本机，再尽力写入云端；断网不会阻断结果页。
export function recordAssessment(testId, answers, resultKey = '') {
  const entry = { testId, answers, resultKey, updatedAt: Date.now() }
  saveLocalAssessment(entry)
  return saveAssessmentToCloud(entry)
}

export function markStoryRead(storyId) {
  if (typeof storyId !== 'string' || !storyId) return Promise.resolve(null)
  const ids = getReadStoryIds()
  if (!ids.includes(storyId)) {
    ids.push(storyId)
    setStorage(READ_STORIES_KEY, ids)
  }
  if (!isLoggedIn()) return Promise.resolve(null)
  return callCloud('saveStoryRead', { storyId })
}

async function mergeRemoteState(state) {
  const remoteAssessments = state && state.assessments && typeof state.assessments === 'object'
    ? state.assessments
    : {}
  const uploads = []

  allTests.forEach(test => {
    const local = getLocalAssessment(test)
    const remote = remoteAssessments[test.id]
    const remoteIsValid = remote && isCompleteAnswers(test, remote.answers)

    if (remoteIsValid && (!local || Number(remote.updatedAt) > Number(local.updatedAt))) {
      saveLocalAssessment({
        testId: test.id,
        answers: remote.answers,
        resultKey: remote.resultKey || '',
        updatedAt: remote.updatedAt,
      })
    } else if (local && (!remoteIsValid || Number(local.updatedAt) > Number(remote.updatedAt))) {
      uploads.push(saveAssessmentToCloud(local).catch(() => null))
    }
  })

  const remoteStoryIds = Array.isArray(state && state.readStoryIds) ? state.readStoryIds : []
  const localStoryIds = getReadStoryIds()
  const mergedStoryIds = [...new Set([...remoteStoryIds, ...localStoryIds])]
  setStorage(READ_STORIES_KEY, mergedStoryIds)
  localStoryIds
    .filter(id => !remoteStoryIds.includes(id))
    .forEach(id => uploads.push(callCloud('saveStoryRead', { storyId: id }).catch(() => null)))

  const remoteReflections = Array.isArray(state && state.reflections)
    ? state.reflections.map(cleanReflection).filter(Boolean)
    : []
  const localReflections = getReflections()
  const mergedById = new Map()
  remoteReflections.forEach(item => mergedById.set(item.id, item))
  localReflections.forEach(item => {
    const remote = mergedById.get(item.id)
    if (!remote || Number(item.updatedAt) > Number(remote.updatedAt)) mergedById.set(item.id, item)
  })
  const mergedReflections = saveLocalReflections([...mergedById.values()])
  const localNeedsUpload = localReflections.some(local => {
    const remote = remoteReflections.find(item => item.id === local.id)
    return !remote || Number(local.updatedAt) > Number(remote.updatedAt)
  })
  if (localNeedsUpload) uploads.push(saveReflectionsToCloud(mergedReflections).catch(() => null))

  await Promise.all(uploads)
}

// 登录同时拉取云端状态，并把旧设备上尚未上传的本地记录合并回云端。
export async function cloudLogin(profile = {}) {
  const cleanProfile = {
    nickname: typeof profile.nickname === 'string' ? profile.nickname.trim().slice(0, 24) : '',
    avatarUrl: typeof profile.avatarUrl === 'string' ? profile.avatarUrl.slice(0, 500) : '',
  }
  const result = await callCloud('login', { profile: cleanProfile })
  const user = result && result.user
  if (!user) throw new Error('登录失败：未返回用户信息')
  setStorage(USER_CACHE_KEY, user)
  await mergeRemoteState(result.state || {})
  return user
}

export function uploadAvatar(filePath) {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    if (!wx.cloud || !filePath) {
      reject(new Error('无法上传头像'))
      return
    }
    const extMatch = String(filePath).match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg'
    const nonce = Math.random().toString(36).slice(2, 10)
    wx.cloud.uploadFile({
      cloudPath: `avatars/${Date.now()}-${nonce}.${ext}`,
      filePath,
      success: (res) => resolve(res.fileID),
      fail: reject,
    })
    // #endif
    // #ifndef MP-WEIXIN
    resolve(filePath)
    // #endif
  })
}

export async function deleteCloudUserData() {
  if (!isLoggedIn()) return null
  const result = await callCloud('deleteUserData')
  clearUser()
  return result
}
