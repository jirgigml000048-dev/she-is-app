const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function isAdmin(openid) {
  const allowed = String(process.env.ADMIN_OPENIDS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
  return !!openid && allowed.includes(openid)
}

async function readAll(collectionName) {
  const rows = []
  const pageSize = 100
  for (let skip = 0; skip < 10000; skip += pageSize) {
    const result = await db.collection(collectionName).skip(skip).limit(pageSize).get()
    const page = Array.isArray(result.data) ? result.data : []
    rows.push(...page)
    if (page.length < pageSize) break
  }
  return rows
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  if (!isAdmin(OPENID)) {
    return { success: false, code: 'FORBIDDEN', message: '当前账号没有数据查看权限' }
  }

  try {
    const [users, assessments, activities] = await Promise.all([
      readAll('users'),
      readAll('assessments'),
      readAll('activity'),
    ])
    const now = Date.now()
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const testCompletions = {}
    let completedAssessments = 0
    assessments.forEach(doc => {
      const entries = doc && doc.entries && typeof doc.entries === 'object' ? doc.entries : {}
      Object.keys(entries).forEach(testId => {
        completedAssessments += 1
        testCompletions[testId] = (testCompletions[testId] || 0) + 1
      })
    })
    const storyReads = {}
    let reflections = 0
    activities.forEach(doc => {
      const ids = Array.isArray(doc && doc.readStoryIds) ? [...new Set(doc.readStoryIds)] : []
      ids.forEach(id => { storyReads[id] = (storyReads[id] || 0) + 1 })
      reflections += Array.isArray(doc && doc.reflections) ? doc.reflections.length : 0
    })

    return {
      success: true,
      generatedAt: now,
      summary: {
        users: users.length,
        active7d: users.filter(user => Number(user.lastSeenAt) >= sevenDaysAgo).length,
        active30d: users.filter(user => Number(user.lastSeenAt) >= thirtyDaysAgo).length,
        completedAssessments,
        storyReaders: activities.filter(doc => Array.isArray(doc.readStoryIds) && doc.readStoryIds.length).length,
        reflections,
      },
      testCompletions,
      storyReads,
    }
  } catch (error) {
    console.error('[adminStats] failed', error)
    return { success: false, code: 'STATS_FAILED', message: '暂时无法生成统计数据' }
  }
}
