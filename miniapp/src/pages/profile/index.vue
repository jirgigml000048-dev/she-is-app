<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="logo">女也</text>
      <text class="logo-en">She Is</text>
    </view>

    <!-- Not logged in -->
    <view v-if="!user" class="card">
      <view class="avatar-placeholder">
        <text class="avatar-icon">○</text>
      </view>
      <text class="hint-title">登录后可跨设备保存你的探索记录</text>
      <text class="hint-sub">你的测评结果、内在图谱将安全同步</text>
      <view class="login-btn" @tap="doLogin">
        <text class="login-btn-text">{{ logging ? '登录中…' : '微信一键登录' }}</text>
      </view>
      <text v-if="loginErr" class="err-tip">{{ loginErr }}</text>
    </view>

    <!-- Logged in -->
    <view v-if="user" class="card card--loggedin">
      <view class="avatar-wrap">
        <image v-if="user.avatarUrl" :src="user.avatarUrl" class="avatar" mode="aspectFill" />
        <view v-else class="avatar-placeholder avatar-placeholder--sm">
          <text class="avatar-icon">♀</text>
        </view>
      </view>
      <text class="username">{{ user.nickname || '女也用户' }}</text>
      <text class="openid-hint">已登录 · 数据同步中</text>

      <view class="divider"></view>

      <view class="stat-row">
        <view class="stat-item">
          <text class="stat-num">{{ completedTests }}</text>
          <text class="stat-label">完成测评</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ readStories }}</text>
          <text class="stat-label">读过故事</text>
        </view>
      </view>

      <view class="action-btn" @tap="goMap">
        <text class="action-btn-text">查看我的内在图谱 →</text>
      </view>

      <view class="logout-btn" @tap="doLogout">
        <text class="logout-text">退出登录</text>
      </view>
    </view>

    <!-- Footer -->
    <view class="footer">
      <text class="footer-text">女也 She Is · 100位真实女孩的非虚构故事</text>
    </view>
  </view>
</template>

<script>
import { getUser, cloudLogin, clearUser, isLoggedIn } from '@/utils/user.js'

export default {
  data() {
    return {
      user: null,
      logging: false,
      loginErr: '',
      completedTests: 0,
      readStories: 0,
    }
  },
  onShow() {
    this.user = getUser()
    if (this.user) this.loadStats()
  },
  methods: {
    loadStats() {
      try {
        const axes = ['trait', 'emotion', 'behavior', 'motivation']
        let done = 0
        axes.forEach(ax => {
          const data = uni.getStorageSync('axis-' + ax)
          if (data && data.items) {
            done += data.items.filter(i => i.done).length
          }
        })
        this.completedTests = done
        // Story reads tracked by readStoryIds set
        const ids = uni.getStorageSync('read-story-ids')
        this.readStories = ids ? ids.length : 0
      } catch (e) {}
    },
    doLogin() {
      if (this.logging) return
      this.logging = true
      this.loginErr = ''
      cloudLogin()
        .then(user => {
          this.user = user
          this.loadStats()
          uni.showToast({ title: '登录成功', icon: 'success' })
        })
        .catch(err => {
          console.error('login err', err)
          this.loginErr = '登录失败，请重试'
        })
        .finally(() => { this.logging = false })
    },
    doLogout() {
      uni.showModal({
        title: '退出登录',
        content: '退出后本地数据依然保留，下次登录会重新同步。',
        confirmText: '退出',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            clearUser()
            this.user = null
          }
        }
      })
    },
    goMap() {
      uni.navigateTo({ url: '/pages/map/index' })
    },
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #fcf9f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 48rpx 120rpx;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 64rpx;
}
.logo {
  font-size: 64rpx;
  font-weight: 700;
  color: #33185c;
  letter-spacing: 8rpx;
}
.logo-en {
  font-size: 28rpx;
  color: rgba(51,24,92,0.45);
  letter-spacing: 6rpx;
  margin-top: 4rpx;
  font-style: italic;
}

.card {
  width: 100%;
  background: #fff;
  border-radius: 32rpx;
  padding: 56rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 40rpx rgba(51,24,92,0.06);
}

.avatar-placeholder {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  background: rgba(51,24,92,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}
.avatar-placeholder--sm {
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #7c5cbf, #d4607e);
  margin-bottom: 24rpx;
}
.avatar-icon {
  font-size: 52rpx;
  color: rgba(51,24,92,0.3);
}
.avatar-placeholder--sm .avatar-icon {
  color: #fff;
  font-size: 48rpx;
}

.avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  margin-bottom: 24rpx;
}

.hint-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #33185c;
  text-align: center;
  margin-bottom: 12rpx;
  line-height: 1.5;
}
.hint-sub {
  font-size: 24rpx;
  color: rgba(51,24,92,0.45);
  text-align: center;
  margin-bottom: 48rpx;
}

.login-btn {
  width: 100%;
  padding: 28rpx;
  background: #33185c;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 2rpx;
}

.err-tip {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #d4607e;
}

/* logged in card */
.card--loggedin {
  gap: 0;
}

.avatar-wrap {
  margin-bottom: 20rpx;
}

.username {
  font-size: 36rpx;
  font-weight: 700;
  color: #33185c;
  margin-bottom: 8rpx;
}
.openid-hint {
  font-size: 22rpx;
  color: rgba(51,24,92,0.4);
  margin-bottom: 40rpx;
}

.divider {
  width: 100%;
  height: 1rpx;
  background: rgba(51,24,92,0.08);
  margin-bottom: 40rpx;
}

.stat-row {
  display: flex;
  justify-content: center;
  gap: 64rpx;
  margin-bottom: 48rpx;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 52rpx;
  font-weight: 700;
  color: #33185c;
  line-height: 1;
  margin-bottom: 8rpx;
}
.stat-label {
  font-size: 22rpx;
  color: rgba(51,24,92,0.45);
}

.action-btn {
  width: 100%;
  padding: 24rpx;
  background: rgba(51,24,92,0.06);
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}
.action-btn-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #33185c;
}

.logout-btn {
  padding: 16rpx 40rpx;
}
.logout-text {
  font-size: 24rpx;
  color: rgba(51,24,92,0.35);
}

.footer {
  margin-top: 64rpx;
}
.footer-text {
  font-size: 22rpx;
  color: rgba(51,24,92,0.25);
  text-align: center;
}
</style>
