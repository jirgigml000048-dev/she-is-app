const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function validAnswers(answers) {
  return Array.isArray(answers)
    && answers.length > 0
    && answers.length <= 100
    && answers.every(value => (
      typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ))
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const testId = event && event.testId
  const answers = event && event.answers
  const resultKey = event && event.resultKey

  if (!OPENID) return { success: false, code: 'NO_OPENID', message: '无法识别当前微信用户' }
  if (typeof testId !== 'string' || !/^[a-z0-9-]{1,40}$/.test(testId) || !validAnswers(answers)) {
    return { success: false, code: 'INVALID_ASSESSMENT', message: '测评数据格式不正确' }
  }

  const now = Date.now()
  const entry = {
    answers,
    resultKey: typeof resultKey === 'string' ? resultKey.slice(0, 80) : '',
    updatedAt: now,
  }
  const collection = db.collection('assessments')
  let existingEntries = {}
  try {
    const current = await collection.doc(OPENID).get()
    existingEntries = current.data && current.data.entries && typeof current.data.entries === 'object'
      ? current.data.entries
      : {}
  } catch (_) {}
  await collection.doc(OPENID).set({
    data: {
      openid: OPENID,
      entries: { ...existingEntries, [testId]: entry },
      updatedAt: now,
    },
  })

  return { success: true, updatedAt: now }
}
