<template>
  <view class="page">
    <view class="header">
      <text class="logo">女也</text>
      <text class="logo-en">She Is</text>
    </view>

    <view v-if="!user" class="card">
      <view class="avatar-placeholder">
        <text class="avatar-icon">○</text>
      </view>
      <text class="hint-title">跨设备保存你的探索记录</text>
      <text class="hint-sub">登录后会合并本机与云端的测评、阅读和“内在一问”回答</text>
      <view class="login-btn" @tap="doLogin">
        <text class="login-btn-text">{{ logging ? '正在同步…' : '开启微信同步' }}</text>
      </view>
      <text class="consent-tip">点击即表示你同意按下方说明保存探索记录</text>
      <text v-if="loginErr" class="err-tip">{{ loginErr }}</text>
    </view>

    <view v-else class="card card--loggedin">
      <button class="avatar-picker" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image v-if="avatarPreview" :src="avatarPreview" class="avatar" mode="aspectFill" />
        <view v-else class="avatar-placeholder avatar-placeholder--sm">
          <text class="avatar-icon">♀</text>
        </view>
        <text class="avatar-edit">更换头像</text>
      </button>

      <input
        class="nickname-input"
        type="nickname"
        :value="draftNickname"
        maxlength="24"
        placeholder="给自己一个称呼"
        @input="onNicknameInput"
      />

      <view class="profile-save" @tap="saveProfile">
        <text class="profile-save-text">{{ savingProfile ? '保存中…' : '保存个人资料' }}</text>
      </view>
      <text class="sync-hint">{{ syncing ? '正在合并云端记录…' : syncStatusText }}</text>

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
        <view class="stat-item">
          <text class="stat-num">{{ reflectionCount }}</text>
          <text class="stat-label">内在回答</text>
        </view>
      </view>

      <view class="action-btn action-btn--question" @tap="goQuestion">
        <text class="action-btn-text action-btn-text--question">回答新的内在一问 →</text>
      </view>
      <view class="action-btn" @tap="goMap">
        <text class="action-btn-text">查看我的内在图谱 →</text>
      </view>
      <view v-if="isAdmin" class="action-btn action-btn--admin" @tap="goAdmin">
        <text class="action-btn-text action-btn-text--admin">内容与数据后台 →</text>
      </view>
      <view class="logout-btn" @tap="doLogout">
        <text class="logout-text">退出同步</text>
      </view>
    </view>

    <view class="privacy-card">
      <view class="privacy-head" @tap="showPrivacy = !showPrivacy">
        <view>
          <text class="privacy-title">隐私与数据</text>
          <text class="privacy-sub">你可以随时了解或删除云端记录</text>
        </view>
        <text class="privacy-toggle">{{ showPrivacy ? '−' : '+' }}</text>
      </view>

      <view v-if="showPrivacy" class="privacy-body">
        <text class="privacy-text">开启同步后，我们会保存你的微信匿名身份标识、测评答案与结果、读过的故事、你主动写下的“内在一问”回答，以及你选择的昵称和头像，仅用于跨设备同步、回答回顾和生成个人图谱。</text>
        <text class="privacy-text">只有在你点击“同意并生成画像”后，测评名称、结果标签和分数才会发送给 DeepSeek；不会发送昵称、微信身份、原始测评答案或“内在一问”的文字回答。</text>
        <text class="privacy-text">测评和内在画像只用于自我探索，不构成医学、心理诊断或治疗建议。请不要据此替代专业帮助。</text>
        <text class="privacy-text">退出同步不会删除本机记录。删除云端数据后，本机测评仍会保留，你可以继续离线使用。</text>

        <view class="data-btn" @tap="copyMyData">
          <text class="data-btn-text">复制我的数据</text>
        </view>
        <view class="data-btn" @tap="clearLocalData">
          <text class="data-btn-text">清除这台设备上的记录</text>
        </view>

        <view v-if="user" class="delete-btn" @tap="deleteCloudData">
          <text class="delete-text">{{ deleting ? '正在删除…' : '删除我的全部云端数据' }}</text>
        </view>
      </view>
    </view>

    <view class="footer">
      <text class="footer-text">女也 She Is · 真实女孩的非虚构故事</text>
    </view>
  </view>
</template>

<script>
import {
  getUser,
  cloudLogin,
  clearUser,
  getCompletedTestCount,
  getReflectionCount,
  getReadStoryIds,
  uploadAvatar,
  deleteCloudUserData,
  exportLocalUserData,
  clearLocalExplorationData,
} from '@/utils/user.js'
import { checkAdminAccess } from '@/utils/admin.js'

export default {
  data() {
    return {
      user: null,
      logging: false,
      syncing: false,
      savingProfile: false,
      deleting: false,
      loginErr: '',
      completedTests: 0,
      readStories: 0,
      reflectionCount: 0,
      draftNickname: '',
      pendingAvatarPath: '',
      showPrivacy: false,
      isAdmin: false,
    }
  },
  computed: {
    avatarPreview() {
      return this.pendingAvatarPath || (this.user && this.user.avatarUrl) || ''
    },
    syncStatusText() {
      const timestamp = Number(this.user && this.user.lastSeenAt)
      if (!timestamp) return '已开启跨设备同步'
      const date = new Date(timestamp)
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `最近同步 · ${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${minute}`
    },
  },
  onShow() {
    this.user = getUser()
    this.draftNickname = (this.user && this.user.nickname) || ''
    this.loadStats()
    this.checkAdmin()
  },
  methods: {
    loadStats() {
      this.completedTests = getCompletedTestCount()
      this.readStories = getReadStoryIds().length
      this.reflectionCount = getReflectionCount()
    },
    async checkAdmin() {
      this.isAdmin = false
      if (!this.user) return
      try {
        const result = await checkAdminAccess()
        this.isAdmin = !!(result && result.isAdmin)
      } catch (_) {}
    },
    async doLogin() {
      if (this.logging) return
      this.logging = true
      this.syncing = true
      this.loginErr = ''
      try {
        this.user = await cloudLogin()
        this.draftNickname = this.user.nickname || ''
        this.loadStats()
        this.checkAdmin()
        uni.showToast({ title: '同步已开启', icon: 'success' })
      } catch (error) {
        console.error('login err', error)
        this.loginErr = '暂时无法同步，请检查网络后重试'
      } finally {
        this.logging = false
        this.syncing = false
      }
    },
    onChooseAvatar(event) {
      this.pendingAvatarPath = event && event.detail && event.detail.avatarUrl
        ? event.detail.avatarUrl
        : ''
    },
    onNicknameInput(event) {
      this.draftNickname = event && event.detail ? event.detail.value : ''
    },
    async saveProfile() {
      if (this.savingProfile || !this.user) return
      this.savingProfile = true
      try {
        let avatarUrl = this.user.avatarUrl || ''
        if (this.pendingAvatarPath) avatarUrl = await uploadAvatar(this.pendingAvatarPath)
        this.user = await cloudLogin({ nickname: this.draftNickname, avatarUrl })
        this.pendingAvatarPath = ''
        uni.showToast({ title: '资料已保存', icon: 'success' })
      } catch (error) {
        console.error('profile save err', error)
        uni.showToast({ title: '保存失败，请重试', icon: 'none' })
      } finally {
        this.savingProfile = false
      }
    },
    doLogout() {
      uni.showModal({
        title: '退出同步',
        content: '本机的测评、阅读和内在回答会保留，下次开启同步时会重新合并。',
        confirmText: '退出',
        cancelText: '取消',
        success: result => {
          if (result.confirm) {
            clearUser()
            this.user = null
            this.pendingAvatarPath = ''
            this.draftNickname = ''
            this.isAdmin = false
          }
        },
      })
    },
    deleteCloudData() {
      if (this.deleting || !this.user) return
      uni.showModal({
        title: '删除云端数据？',
        content: '昵称、头像、云端测评、阅读、内在回答和内在画像将永久删除；本机记录不受影响。',
        confirmText: '确认删除',
        confirmColor: '#b13b5c',
        success: async result => {
          if (!result.confirm) return
          this.deleting = true
          try {
            await deleteCloudUserData()
            this.user = null
            this.pendingAvatarPath = ''
            this.draftNickname = ''
            uni.showToast({ title: '云端数据已删除', icon: 'success' })
          } catch (error) {
            console.error('delete data err', error)
            uni.showToast({ title: '删除失败，请重试', icon: 'none' })
          } finally {
            this.deleting = false
          }
        },
      })
    },
    copyMyData() {
      const text = JSON.stringify(exportLocalUserData(), null, 2)
      uni.setClipboardData({
        data: text,
        success: () => uni.showToast({ title: '数据已复制', icon: 'success' }),
        fail: () => uni.showToast({ title: '复制失败，请重试', icon: 'none' }),
      })
    },
    clearLocalData() {
      uni.showModal({
        title: '清除本机记录？',
        content: this.user
          ? '这台设备上的测评、阅读和内在回答会被清除；云端副本仍会保留，之后同步可能再次下载。'
          : '这台设备上的测评、阅读和内在回答会被清除，且无法恢复。',
        confirmText: '清除',
        confirmColor: '#b13b5c',
        success: result => {
          if (!result.confirm) return
          clearLocalExplorationData()
          this.loadStats()
          uni.showToast({ title: '本机记录已清除', icon: 'success' })
        },
      })
    },
    goAdmin() {
      if (this.isAdmin) uni.navigateTo({ url: '/pages/admin/index' })
    },
    goMap() {
      uni.navigateTo({ url: '/pages/map/index' })
    },
    goQuestion() {
      uni.navigateTo({ url: '/pages/journey/question' })
    },
  },
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  background: #fcf9f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 48rpx 120rpx;
}
.header { display: flex; flex-direction: column; align-items: center; margin-bottom: 56rpx; }
.logo { font-size: 64rpx; font-weight: 700; color: #33185c; letter-spacing: 8rpx; }
.logo-en { font-size: 28rpx; color: rgba(51,24,92,0.45); letter-spacing: 6rpx; margin-top: 4rpx; font-style: italic; }
.card, .privacy-card {
  box-sizing: border-box;
  width: 100%;
  background: #fff;
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 40rpx rgba(51,24,92,0.06);
}
.avatar-placeholder { width: 128rpx; height: 128rpx; border-radius: 50%; background: rgba(51,24,92,0.06); display: flex; align-items: center; justify-content: center; margin-bottom: 32rpx; }
.avatar-placeholder--sm { width: 112rpx; height: 112rpx; background: linear-gradient(135deg, #7c5cbf, #d4607e); margin-bottom: 0; }
.avatar-icon { font-size: 52rpx; color: rgba(51,24,92,0.3); }
.avatar-placeholder--sm .avatar-icon { color: #fff; font-size: 48rpx; }
.avatar-picker { padding: 0; margin: 0 0 20rpx; border: 0; background: transparent; display: flex; flex-direction: column; align-items: center; line-height: 1; }
.avatar-picker::after { border: none; }
.avatar { width: 112rpx; height: 112rpx; border-radius: 50%; }
.avatar-edit { margin-top: 14rpx; font-size: 20rpx; color: rgba(51,24,92,0.45); }
.hint-title { font-size: 30rpx; font-weight: 600; color: #33185c; text-align: center; margin-bottom: 12rpx; line-height: 1.5; }
.hint-sub { font-size: 24rpx; color: rgba(51,24,92,0.45); text-align: center; line-height: 1.7; margin-bottom: 40rpx; }
.login-btn { box-sizing: border-box; width: 100%; padding: 28rpx; background: #33185c; border-radius: 999rpx; display: flex; align-items: center; justify-content: center; }
.login-btn-text { font-size: 30rpx; font-weight: 600; color: #fff; letter-spacing: 2rpx; }
.consent-tip { margin-top: 20rpx; font-size: 20rpx; color: rgba(51,24,92,0.35); text-align: center; }
.err-tip { margin-top: 20rpx; font-size: 24rpx; color: #d4607e; }
.nickname-input { box-sizing: border-box; width: 100%; text-align: center; font-size: 34rpx; font-weight: 700; color: #33185c; padding: 18rpx 24rpx; background: rgba(51,24,92,0.04); border-radius: 18rpx; }
.profile-save { margin-top: 18rpx; padding: 18rpx 36rpx; border-radius: 999rpx; background: #33185c; }
.profile-save-text { color: #fff; font-size: 24rpx; font-weight: 600; }
.sync-hint { font-size: 21rpx; color: rgba(51,24,92,0.4); margin-top: 18rpx; }
.divider { width: 100%; height: 1rpx; background: rgba(51,24,92,0.08); margin: 36rpx 0; }
.stat-row { width: 100%; display: flex; justify-content: space-around; gap: 20rpx; margin-bottom: 40rpx; }
.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-num { font-size: 52rpx; font-weight: 700; color: #33185c; line-height: 1; margin-bottom: 8rpx; }
.stat-label { font-size: 22rpx; color: rgba(51,24,92,0.45); }
.action-btn { box-sizing: border-box; width: 100%; padding: 24rpx; background: rgba(51,24,92,0.06); border-radius: 999rpx; display: flex; align-items: center; justify-content: center; margin-bottom: 18rpx; }
.action-btn-text { font-size: 28rpx; font-weight: 600; color: #33185c; }
.action-btn--question { background: #33185c; }
.action-btn-text--question { color: #fff; }
.action-btn--admin { background: rgba(156,60,98,0.09); border: 1rpx solid rgba(156,60,98,0.15); }
.action-btn-text--admin { color: #9c3c62; }
.logout-btn { padding: 16rpx 40rpx; }
.logout-text { font-size: 24rpx; color: rgba(51,24,92,0.38); }
.privacy-card { margin-top: 28rpx; padding: 32rpx 36rpx; align-items: stretch; }
.privacy-head { display: flex; align-items: center; justify-content: space-between; }
.privacy-title { display: block; font-size: 27rpx; font-weight: 700; color: #33185c; }
.privacy-sub { display: block; margin-top: 8rpx; font-size: 21rpx; color: rgba(51,24,92,0.42); }
.privacy-toggle { font-size: 36rpx; color: rgba(51,24,92,0.45); }
.privacy-body { border-top: 1rpx solid rgba(51,24,92,0.08); margin-top: 28rpx; padding-top: 28rpx; }
.privacy-text { display: block; font-size: 23rpx; color: #6c6862; line-height: 1.8; margin-bottom: 20rpx; }
.data-btn { margin-top: 12rpx; padding: 22rpx; border-radius: 999rpx; background: rgba(51,24,92,0.055); text-align: center; }
.data-btn-text { font-size: 23rpx; color: #4a3073; }
.delete-btn { margin-top: 12rpx; padding: 22rpx; border: 1rpx solid rgba(177,59,92,0.28); border-radius: 999rpx; text-align: center; }
.delete-text { font-size: 23rpx; color: #b13b5c; }
.footer { margin-top: 56rpx; }
.footer-text { font-size: 22rpx; color: rgba(51,24,92,0.25); text-align: center; }
</style>
