const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const THEMES = new Set(['boundary', 'desire', 'relationship', 'self', 'emotion', 'body', 'choice', 'change'])

function cleanReflection(value) {
  const item = value && typeof value === 'object' ? value : {}
  if (typeof item.id !== 'string' || !/^reflection-[a-z0-9-]{8,64}$/.test(item.id)) return null
  if (typeof item.promptId !== 'string' || !/^[a-z]+-\d{2}$/.test(item.promptId)) return null
  if (!THEMES.has(item.theme)) return null
  const question = typeof item.question === 'string' ? item.question.trim().slice(0, 120) : ''
  const answerText = typeof item.answerText === 'string' ? item.answerText.trim().slice(0, 500) : ''
  const selectedOptions = Array.isArray(item.selectedOptions)
    ? [...new Set(item.selectedOptions
      .filter(option => typeof option === 'string')
      .map(option => option.trim().slice(0, 30))
      .filter(Boolean))]
      .slice(0, 3)
    : []
  if (!question || (!answerText && !selectedOptions.length)) return null
  const now = Date.now()
  return {
    id: item.id,
    promptId: item.promptId,
    theme: item.theme,
    question,
    answerText,
    selectedOptions,
    createdAt: Number(item.createdAt) || now,
    updatedAt: Number(item.updatedAt) || now,
  }
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { success: false, code: 'NO_OPENID', message: '无法识别当前微信用户' }

  const source = Array.isArray(event && event.reflections)
    ? event.reflections.slice(0, 80)
    : [event && event.reflection]
  const incoming = source.map(cleanReflection).filter(Boolean)
  if (!incoming.length) {
    return { success: false, code: 'INVALID_REFLECTION', message: '回答内容不完整' }
  }

  const now = Date.now()
  const collection = db.collection('activity')
  let currentData = {}
  let documentExists = false
  try {
    const current = await collection.doc(OPENID).get()
    currentData = current.data || {}
    documentExists = true
  } catch (_) {}

  const byId = new Map()
  const existing = Array.isArray(currentData.reflections) ? currentData.reflections : []
  existing.map(cleanReflection).filter(Boolean).forEach(item => byId.set(item.id, item))
  incoming.forEach(item => {
    const current = byId.get(item.id)
    if (!current || Number(item.updatedAt) >= Number(current.updatedAt)) byId.set(item.id, item)
  })
  const reflections = [...byId.values()]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 80)

  if (documentExists) {
    await collection.doc(OPENID).update({ data: { reflections, updatedAt: now } })
  } else {
    await collection.doc(OPENID).set({
      data: { openid: OPENID, readStoryIds: [], reflections, updatedAt: now },
    })
  }
  return { success: true, updatedAt: now, reflections }
}

