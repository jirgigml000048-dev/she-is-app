function callCloud(name, data = {}) {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    if (!wx.cloud) {
      reject(new Error('当前微信版本不支持云开发'))
      return
    }
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        const result = res && res.result
        if (result && result.success === false) {
          const error = new Error(result.message || result.code || `${name} failed`)
          error.code = result.code
          reject(error)
          return
        }
        resolve(result || null)
      },
      fail: reject,
    })
    // #endif
    // #ifndef MP-WEIXIN
    reject(new Error('内容后台仅支持微信小程序'))
    // #endif
  })
}

export function checkAdminAccess() {
  return callCloud('adminStories', { action: 'check' })
}

export function getManagedStories() {
  return callCloud('adminStories', { action: 'list' })
}

export function getManagedStory(id) {
  return callCloud('adminStories', { action: 'get', id })
}

export function saveManagedStory(story) {
  return callCloud('adminStories', { action: 'save', story })
}

export function checkManagedStoryMedia(id) {
  return callCloud('adminStories', { action: 'health', id })
}

export function getAnonymousStats() {
  return callCloud('adminStats')
}
