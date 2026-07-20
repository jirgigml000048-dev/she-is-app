const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getDocument(collection, id) {
  try {
    const result = await db.collection(collection).doc(id).get()
    return result.data || null
  } catch (_) {
    return null
  }
}

function cleanProfile(profile) {
  const value = profile && typeof profile === 'object' ? profile : {}
  const avatarUrl = typeof value.avatarUrl === 'string' && value.avatarUrl.startsWith('cloud://')
    ? value.avatarUrl.slice(0, 500)
    : ''
  return {
    nickname: typeof value.nickname === 'string' ? value.nickname.trim().slice(0, 24) : '',
    avatarUrl,
  }
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { success: false, code: 'NO_OPENID', message: '无法识别当前微信用户' }

  const now = Date.now()
  const profile = cleanProfile(event && event.profile)
  const existingUser = await getDocument('users', OPENID)
  const storedUser = {
    openid: OPENID,
    nickname: profile.nickname || (existingUser && existingUser.nickname) || '',
    avatarUrl: profile.avatarUrl || (existingUser && existingUser.avatarUrl) || '',
    createdAt: (existingUser && existingUser.createdAt) || now,
    lastSeenAt: now,
  }

  if (profile.avatarUrl && existingUser && existingUser.avatarUrl
    && existingUser.avatarUrl !== profile.avatarUrl && existingUser.avatarUrl.startsWith('cloud://')) {
    try { await cloud.deleteFile({ fileList: [existingUser.avatarUrl] }) } catch (_) {}
  }

  await db.collection('users').doc(OPENID).set({ data: storedUser })

  const assessmentDoc = await getDocument('assessments', OPENID)
  const activityDoc = await getDocument('activity', OPENID)

  return {
    success: true,
    user: {
      nickname: storedUser.nickname,
      avatarUrl: storedUser.avatarUrl,
      createdAt: storedUser.createdAt,
      lastSeenAt: storedUser.lastSeenAt,
    },
    isNew: !existingUser,
    state: {
      assessments: (assessmentDoc && assessmentDoc.entries) || {},
      readStoryIds: (activityDoc && activityDoc.readStoryIds) || [],
    },
  }
}
