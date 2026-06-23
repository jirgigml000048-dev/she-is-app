const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  const userColl = db.collection('users')

  try {
    const res = await userColl.doc(OPENID).get()
    await userColl.doc(OPENID).update({ data: { lastSeenAt: Date.now() } })
    return { success: true, user: res.data, isNew: false }
  } catch (e) {
    // User doesn't exist yet — create
    const now = Date.now()
    const newUser = {
      _id: OPENID,
      openid: OPENID,
      nickname: '',
      avatarUrl: '',
      createdAt: now,
      lastSeenAt: now,
    }
    await userColl.add({ data: newUser })
    return { success: true, user: newUser, isNew: true }
  }
}
