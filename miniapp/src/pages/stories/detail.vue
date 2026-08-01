<template>
  <view class="page" v-if="story">
    <view class="top-back" :style="{ top: (statusBarHeight + 8) + 'px' }" @tap="goBack">
      <text class="top-back-icon">←</text>
    </view>

    <!-- Hero -->
    <view class="hero">
      <image :src="story.cover" class="hero-bg" mode="aspectFill" />
      <view class="hero-overlay" />
      <view class="hero-content">
        <text class="hero-vol">Volume {{ story.id }} / 100位女孩</text>
        <text class="hero-title">{{ story.title }}</text>
        <text class="hero-en">{{ story.titleEn }}</text>
      </view>
    </view>

    <!-- Mode Toggle -->
    <view class="mode-bar">
      <view :class="['mode-btn', mode === 'read' ? 'active' : '']" @tap="switchMode('read')">阅读</view>
      <view v-if="story.tts" :class="['mode-btn', mode === 'listen' ? 'active' : '']" @tap="switchMode('listen')">听故事</view>
      <view v-else class="mode-btn mode-btn--soon">听故事 · 筹备中</view>
    </view>

    <!-- BGM Player (read mode) -->
    <view class="player-card" v-if="mode === 'read' && story.bgm">
      <view class="player-row">
        <view class="play-btn" @tap="toggleBgm">
          <text class="play-icon">{{ bgmPlaying ? '⏸' : '▶' }}</text>
        </view>
        <text class="player-label">Background Music</text>
      </view>
    </view>

    <!-- TTS Player (listen mode) -->
    <view class="player-card" v-if="mode === 'listen'">
      <view class="player-row">
        <view class="play-btn play-btn--small" @tap="toggleTts">
          <text class="play-icon">{{ ttsPlaying ? '⏸' : '▶' }}</text>
        </view>
        <text class="player-label" style="font-weight:700;">听故事</text>
        <text class="player-time">{{ ttsTime }}</text>
      </view>
      <view class="speed-row">
        <view v-for="s in [1, 1.5, 2]" :key="s"
          :class="['speed-btn', ttsSpeed === s ? 'active' : '']"
          @tap="setSpeed(s)"
        >{{ s }}x</view>
      </view>
    </view>

    <!-- Article -->
    <view :class="['article', mode === 'listen' ? 'dimmed' : '']">
      <rich-text :nodes="articleHtml" />
    </view>

    <!-- Back -->
    <view class="back-bar">
      <view class="back-btn" @tap="goBack">← 返回故事列表</view>
    </view>
  </view>
  <view class="page story-state" v-else>
    <text class="story-state-title">{{ loadError ? '这篇故事暂时无法打开' : '正在取来这篇故事…' }}</text>
    <text v-if="loadError" class="story-state-sub">{{ loadError }}</text>
    <view v-if="loadError" class="story-state-btn" @tap="goBack">返回故事列表</view>
  </view>
</template>

<script>
import { markStoryRead } from '@/utils/user.js'
import { findInitialStory, loadStoryDetail } from '@/utils/stories.js'
import { formatArticleHtml } from '@/utils/article.js'

function isPlayableAudioUrl(value) {
  return !!value && !/^cloud:\/\//i.test(value)
}

export default {
  data() {
    return {
      story: null,
      mode: 'read',
      bgmPlaying: false,
      ttsPlaying: false,
      ttsSpeed: 1,
      ttsTime: '0:00',
      bgmCtx: null,
      ttsCtx: null,
      statusBarHeight: 20,
      articleHtml: '<p style="color:#999;font-size:14px;">加载中…</p>',
      storyId: '',
      loadError: '',
    }
  },
  onLoad(query) {
    try {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 20
    } catch (error) {
      this.statusBarHeight = 20
    }
    this.storyId = String(query && query.id || '').trim().toLowerCase()
    const initial = findInitialStory(this.storyId)
    if (initial) this.applyStory(initial)
    this.fetchStory()
  },
  onUnload() {
    if (this.bgmCtx) { this.bgmCtx.stop(); this.bgmCtx.destroy() }
    if (this.ttsCtx) { this.ttsCtx.stop(); this.ttsCtx.destroy() }
  },
  methods: {
    async fetchStory(force = false) {
      this.loadError = ''
      try {
        const detail = await loadStoryDetail(this.storyId, { force })
        if (!detail || detail.hidden || !detail.story) {
          this.story = null
          this.loadError = detail && detail.hidden ? '这篇故事尚未发布或已经下架。' : '没有找到这篇故事。'
          return
        }
        this.applyStory(detail.story)
        this.loadArticle(detail.bodyHtml)
        markStoryRead(detail.story.id).catch(error => {
          console.warn('[story] cloud sync deferred', error)
        })
      } catch (error) {
        console.error('[story] load failed', error)
        this.loadError = '请检查网络后再试。'
      }
    },
    applyStory(story) {
      const audioChanged = !this.story
        || this.story.bgm !== story.bgm
        || this.story.tts !== story.tts
      this.story = story
      uni.setNavigationBarTitle({ title: story.name + '的故事' })
      if (audioChanged) this.setupAudio(story)
    },
    setupAudio(story) {
      if (this.bgmCtx) { this.bgmCtx.stop(); this.bgmCtx.destroy(); this.bgmCtx = null }
      if (this.ttsCtx) { this.ttsCtx.stop(); this.ttsCtx.destroy(); this.ttsCtx = null }
      this.bgmPlaying = false
      this.ttsPlaying = false
      if (isPlayableAudioUrl(story.bgm)) {
        this.bgmCtx = uni.createInnerAudioContext()
        this.bgmCtx.src = story.bgm
        this.bgmCtx.loop = true
        this.bgmCtx.volume = 0.35
      }
      if (isPlayableAudioUrl(story.tts)) {
        this.ttsCtx = uni.createInnerAudioContext()
        this.ttsCtx.src = story.tts
        this.ttsCtx.onTimeUpdate(() => {
          const c = this.ttsCtx.currentTime || 0
          const m = Math.floor(c / 60)
          const sec = Math.floor(c % 60)
          this.ttsTime = m + ':' + String(sec).padStart(2, '0')
        })
        this.ttsCtx.onEnded(() => { this.ttsPlaying = false })
      }
    },
    loadArticle(bodyHtml) {
      this.articleHtml = formatArticleHtml(bodyHtml || '<p>正文正在整理中。</p>')
    },
    switchMode(m) {
      this.mode = m
      if (m === 'read') { if (this.ttsCtx) this.ttsCtx.pause(); this.ttsPlaying = false }
      if (m === 'listen') { if (this.bgmCtx) this.bgmCtx.pause(); this.bgmPlaying = false }
    },
    toggleBgm() {
      if (!this.bgmCtx) return
      if (this.bgmPlaying) { this.bgmCtx.pause() } else { this.bgmCtx.play() }
      this.bgmPlaying = !this.bgmPlaying
    },
    toggleTts() {
      if (!this.ttsCtx) return
      if (this.ttsPlaying) { this.ttsCtx.pause() } else { this.ttsCtx.play() }
      this.ttsPlaying = !this.ttsPlaying
    },
    setSpeed(s) {
      this.ttsSpeed = s
      if (this.ttsCtx) this.ttsCtx.playbackRate = s
    },
    goBack() {
      const pageStack = getCurrentPages()
      if (pageStack.length > 1) {
        uni.navigateBack()
        return
      }
      uni.switchTab({ url: '/pages/stories/list' })
    },
  },
}
</script>

<style scoped>
.page { background: #fcf9f6; min-height: 100vh; }
.story-state { box-sizing: border-box; padding: 280rpx 64rpx 100rpx; text-align: center; }
.story-state-title { display: block; color: #33185c; font-size: 34rpx; font-weight: 700; line-height: 1.6; }
.story-state-sub { display: block; margin-top: 18rpx; color: rgba(51,24,92,0.45); font-size: 24rpx; }
.story-state-btn { margin: 48rpx auto 0; padding: 24rpx 42rpx; border-radius: 999rpx; background: #33185c; color: #fff; font-size: 25rpx; }
.top-back { position: fixed; left: 24rpx; z-index: 30; width: 68rpx; height: 68rpx; border-radius: 50%; background: rgba(252,249,246,0.9); border: 2rpx solid rgba(51,24,92,0.08); box-shadow: 0 8rpx 24rpx rgba(51,24,92,0.12); display: flex; align-items: center; justify-content: center; }
.top-back-icon { font-size: 30rpx; line-height: 1; color: #33185c; font-weight: 600; }
.hero { position: relative; height: 560rpx; overflow: hidden; }
.hero-bg { position: absolute; width: 100%; height: 100%; }
.hero-overlay { position: absolute; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(252,249,246,1)); }
.hero-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 40rpx; }
.hero-vol { font-size: 22rpx; letter-spacing: 6rpx; color: #33185c; text-transform: uppercase; display: block; margin-bottom: 16rpx; }
.hero-title { font-size: 52rpx; font-weight: 700; color: #33185c; display: block; line-height: 1.3; }
.hero-en { font-size: 28rpx; color: rgba(51,24,92,0.6); display: block; margin-top: 8rpx; font-style: italic; }

.mode-bar { display: flex; justify-content: center; gap: 0; padding: 32rpx 40rpx; }
.mode-btn { padding: 16rpx 48rpx; font-size: 26rpx; font-weight: 600; color: rgba(51,24,92,0.4); background: transparent; border: 2rpx solid rgba(51,24,92,0.15); }
.mode-btn:first-child { border-radius: 999rpx 0 0 999rpx; }
.mode-btn:last-child { border-radius: 0 999rpx 999rpx 0; border-left: none; }
.mode-btn.active { background: rgba(51,24,92,0.08); color: #33185c; }
.mode-btn--soon { color: rgba(51,24,92,0.25); border-color: rgba(51,24,92,0.08); font-size: 22rpx; }

.player-card { margin: 0 40rpx 24rpx; padding: 24rpx 32rpx; background: rgba(255,255,255,0.7); border-radius: 24rpx; border: 2rpx solid rgba(51,24,92,0.06); }
.player-row { display: flex; align-items: center; gap: 20rpx; }
.play-btn { width: 72rpx; height: 72rpx; border-radius: 50%; background: #4A3073; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.play-btn--small { width: 64rpx; height: 64rpx; background: rgba(74,48,115,0.12); }
.play-btn--small .play-icon { color: #4A3073; }
.play-icon { color: #fff; font-size: 28rpx; }
.player-label { font-size: 22rpx; letter-spacing: 2rpx; color: #4A3073; text-transform: uppercase; flex: 1; }
.player-time { font-size: 24rpx; color: rgba(51,24,92,0.4); flex-shrink: 0; }
.speed-row { display: flex; gap: 12rpx; margin-top: 16rpx; }
.speed-btn { padding: 8rpx 20rpx; border-radius: 999rpx; font-size: 22rpx; font-weight: 600; border: 2rpx solid #ccc4d1; color: #4a454f; }
.speed-btn.active { border-color: #4A3073; background: #4A3073; color: #fff; }

.article { padding: 40rpx; }
.article.dimmed { opacity: 0.35; }

.back-bar { padding: 40rpx; padding-bottom: 120rpx; }
.back-btn { text-align: center; padding: 28rpx; border-radius: 999rpx; background: #33185c; color: #fff; font-size: 28rpx; font-weight: 600; letter-spacing: 4rpx; }
</style>
