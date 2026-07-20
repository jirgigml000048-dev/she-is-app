const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function removeDocument(collection, id) {
  try {
    await db.collection(collection).doc(id).remove()
  } catch (_) {}
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { success: false, code: 'NO_OPENID', message: '无法识别当前微信用户' }

  let user = null
  try {
    const result = await db.collection('users').doc(OPENID).get()
    user = result.data
  } catch (_) {}

  if (user && typeof user.avatarUrl === 'string' && user.avatarUrl.startsWith('cloud://')) {
    try { await cloud.deleteFile({ fileList: [user.avatarUrl] }) } catch (_) {}
  }

  await Promise.all([
    removeDocument('users', OPENID),
    removeDocument('assessments', OPENID),
    removeDocument('activity', OPENID),
    removeDocument('portraits', OPENID),
  ])

  return { success: true }
}
