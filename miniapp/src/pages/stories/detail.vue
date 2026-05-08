<template>
  <view class="page" v-if="story">
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
      <view :class="['mode-btn', mode === 'listen' ? 'active' : '']" @tap="switchMode('listen')">听故事</view>
    </view>

    <!-- BGM Player (read mode) -->
    <view class="player-card" v-if="mode === 'read'">
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
</template>

<script>
import { stories } from '@/data/stories.js'

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
      articleHtml: '<p style="color:#999;font-size:14px;">加载中…</p>',
    }
  },
  onLoad(query) {
    const s = stories.find(item => item.id === query.id)
    if (s) {
      this.story = s
      uni.setNavigationBarTitle({ title: s.name + '的故事' })
      this.loadArticle(s)
      this.bgmCtx = uni.createInnerAudioContext()
      this.bgmCtx.src = s.bgm
      this.bgmCtx.loop = true
      this.bgmCtx.volume = 0.35
      this.ttsCtx = uni.createInnerAudioContext()
      this.ttsCtx.src = s.tts
      this.ttsCtx.onTimeUpdate(() => {
        const c = this.ttsCtx.currentTime || 0
        const m = Math.floor(c / 60)
        const sec = Math.floor(c % 60)
        this.ttsTime = m + ':' + String(sec).padStart(2, '0')
      })
      this.ttsCtx.onEnded(() => { this.ttsPlaying = false })
    }
  },
  onUnload() {
    if (this.bgmCtx) { this.bgmCtx.stop(); this.bgmCtx.destroy() }
    if (this.ttsCtx) { this.ttsCtx.stop(); this.ttsCtx.destroy() }
  },
  methods: {
    async loadArticle(story) {
      const url = `https://she-is-app.netlify.app/story-${story.id === '007' ? 'detail' : story.id}.html`
      try {
        const [err, res] = await uni.request({ url })
        if (err || !res?.data) { this.articleHtml = '<p>暂时无法加载</p>'; return }
        const html = res.data
        const match = html.match(/<article[^>]*>([\s\S]*?)<\/article>/)
        if (match) {
          let content = match[1]
            .replace(/<section class="mt-24[\s\S]*$/, '')
            .replace(/class="[^"]*"/g, '')
            .replace(/style="[^"]*"/g, '')
          content = content.replace(/<p>/g, '<p style="font-size:16px;line-height:1.9;color:#1c1c1a;margin-bottom:24px;font-weight:300;">')
          content = content.replace(/<h3>/g, '<h3 style="font-size:22px;color:#33185c;font-weight:700;margin:40px 0 12px;">')
          content = content.replace(/<span>/g, '<span style="color:#9c3c62;">')
          this.articleHtml = content
        }
      } catch (e) {
        this.articleHtml = '<p>加载失败，请检查网络</p>'
      }
    },
    switchMode(m) {
      this.mode = m
      if (m === 'read') { if (this.ttsCtx) this.ttsCtx.pause(); this.ttsPlaying = false }
      if (m === 'listen') { if (this.bgmCtx) this.bgmCtx.pause(); this.bgmPlaying = false }
    },
    toggleBgm() {
      if (this.bgmPlaying) { this.bgmCtx.pause() } else { this.bgmCtx.play() }
      this.bgmPlaying = !this.bgmPlaying
    },
    toggleTts() {
      if (this.ttsPlaying) { this.ttsCtx.pause() } else { this.ttsCtx.play() }
      this.ttsPlaying = !this.ttsPlaying
    },
    setSpeed(s) {
      this.ttsSpeed = s
      if (this.ttsCtx) this.ttsCtx.playbackRate = s
    },
    goBack() { uni.navigateBack() },
  },
}
</script>

<style scoped>
.page { background: #fcf9f6; min-height: 100vh; }
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
