const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const storyId = event && event.storyId
  if (!OPENID) return { success: false, code: 'NO_OPENID', message: '无法识别当前微信用户' }
  if (typeof storyId !== 'string' || !/^[a-z0-9-]{1,40}$/.test(storyId)) {
    return { success: false, code: 'INVALID_STORY', message: '故事编号不正确' }
  }

  const now = Date.now()
  const collection = db.collection('activity')
  try {
    const current = await collection.doc(OPENID).get()
    const ids = Array.isArray(current.data.readStoryIds) ? current.data.readStoryIds : []
    const nextIds = ids.includes(storyId) ? ids : [...ids, storyId]
    await collection.doc(OPENID).update({ data: { readStoryIds: nextIds, updatedAt: now } })
  } catch (_) {
    await collection.doc(OPENID).set({
      data: { openid: OPENID, readStoryIds: [storyId], updatedAt: now },
    })
  }
  return { success: true, updatedAt: now }
}
