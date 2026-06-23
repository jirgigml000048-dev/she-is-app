// 微信云开发用户工具
// 调用前必须在 App.vue 中已 wx.cloud.init()

const USER_CACHE_KEY = 'sheis-user'

export function getUser() {
  try {
    return uni.getStorageSync(USER_CACHE_KEY) || null
  } catch {
    return null
  }
}

export function isLoggedIn() {
  return !!getUser()
}

export function clearUser() {
  uni.removeStorageSync(USER_CACHE_KEY)
}

// 调用云函数 login，写入/更新 users 集合，缓存到本地
export function cloudLogin() {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    wx.cloud.callFunction({
      name: 'login',
      success: (res) => {
        const { user } = res.result
        if (user) {
          uni.setStorageSync(USER_CACHE_KEY, user)
          resolve(user)
        } else {
          reject(new Error('login: no user returned'))
        }
      },
      fail: reject,
    })
    // #endif
    // #ifndef MP-WEIXIN
    resolve(null)
    // #endif
  })
}

// 保存测评结果到云端（Phase 2）
export function saveAssessmentToCloud(results) {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    if (!isLoggedIn()) { resolve(null); return }
    wx.cloud.callFunction({
      name: 'saveAssessment',
      data: { results },
      success: (res) => resolve(res.result),
      fail: reject,
    })
    // #endif
    // #ifndef MP-WEIXIN
    resolve(null)
    // #endif
  })
}
