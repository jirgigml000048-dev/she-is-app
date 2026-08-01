const DRAFTS_KEY = 'assessment-drafts-v1'

function readDrafts() {
  try {
    const value = uni.getStorageSync(DRAFTS_KEY)
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch (_) {
    return {}
  }
}

function writeDrafts(value) {
  try { uni.setStorageSync(DRAFTS_KEY, value) } catch (_) {}
}

function cleanDraft(value, expectedTotal = 0) {
  if (!value || typeof value !== 'object' || typeof value.testId !== 'string') return null
  const total = Number(expectedTotal) || Number(value.total) || 0
  if (!Number.isInteger(total) || total < 1 || !Array.isArray(value.answers)) return null
  if (value.answers.length !== total) return null

  const answers = value.answers.map(answer => (
    answer === undefined || answer === '' ? null : answer
  ))
  const answeredCount = answers.filter(answer => answer !== null).length
  if (!answeredCount) return null

  return {
    testId: value.testId,
    answers,
    cursor: Math.min(Math.max(Number(value.cursor) || 0, 0), total - 1),
    total,
    answeredCount,
    updatedAt: Number(value.updatedAt) || Date.now(),
  }
}

export function saveAssessmentDraft(testId, answers, cursor = 0) {
  if (typeof testId !== 'string' || !testId || !Array.isArray(answers) || !answers.length) return null
  const drafts = readDrafts()
  const draft = cleanDraft({
    testId,
    answers: [...answers],
    cursor,
    total: answers.length,
    updatedAt: Date.now(),
  })
  if (!draft) {
    delete drafts[testId]
    writeDrafts(drafts)
    return null
  }
  drafts[testId] = draft
  writeDrafts(drafts)
  return draft
}

export function getAssessmentDraft(testId, expectedTotal = 0) {
  if (typeof testId !== 'string' || !testId) return null
  const drafts = readDrafts()
  const draft = cleanDraft(drafts[testId], expectedTotal)
  if (!draft && drafts[testId]) {
    delete drafts[testId]
    writeDrafts(drafts)
  }
  return draft
}

export function getLatestAssessmentDraft(validTests = {}) {
  const drafts = readDrafts()
  return Object.keys(drafts)
    .map(testId => {
      const test = validTests && validTests[testId]
      if (!test || !Array.isArray(test.questions)) return null
      return cleanDraft(drafts[testId], test.questions.length)
    })
    .filter(Boolean)
    .sort((a, b) => b.updatedAt - a.updatedAt)[0] || null
}

export function clearAssessmentDraft(testId) {
  if (typeof testId !== 'string' || !testId) return
  const drafts = readDrafts()
  if (!drafts[testId]) return
  delete drafts[testId]
  writeDrafts(drafts)
}

export function clearAllAssessmentDrafts() {
  try { uni.removeStorageSync(DRAFTS_KEY) } catch (_) {}
}

