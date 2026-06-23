const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { results } = event // { axisId: { score, completedIds } }

  const now = Date.now()
  const coll = db.collection('assessments')

  try {
    await coll.doc(OPENID).update({ data: { results, updatedAt: now } })
  } catch (e) {
    await coll.add({ data: { _id: OPENID, openid: OPENID, results, updatedAt: now } })
  }

  return { success: true }
}
