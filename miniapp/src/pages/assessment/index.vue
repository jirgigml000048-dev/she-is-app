<template>
  <view class="page">
    <view class="map-banner" @tap="goMap">
      <view class="mb-blob mb-blob-1" />
      <view class="mb-blob mb-blob-2" />
      <view class="mb-blob mb-blob-3" />
      <view class="mb-blob mb-blob-4" />
      <view class="mb-content">
        <text class="mb-label">INNER MAP</text>
        <text class="mb-title">查看我的内在图谱</text>
        <text class="mb-sub">4 维度综合 · AI 解读</text>
      </view>
      <text class="mb-arrow">→</text>
    </view>

    <view class="hero">
      <text class="hero-label">PERSONAL DISCOVERY · 自我图鉴</text>
      <text class="hero-title">Discover Your{{'\n'}}Inner Landscape</text>
      <text class="hero-sub">探索你的内在</text>
      <text class="hero-desc">通过四个维度的深度测评，开启你的内在探索之旅：你是谁，你怎么感受，你怎么行动，以及你为什么会成为现在的你。</text>
    </view>

    <view class="axes">
      <view
        v-for="axis in axes" :key="axis.id"
        :class="['axis-card', open[axis.id] ? 'open' : '']"
      >
        <view class="axis-header" @tap="toggle(axis.id)">
          <text class="axis-num">{{ axis.num }}</text>
          <view class="axis-info">
            <view class="axis-title-row">
              <text class="axis-name">{{ axis.name }}</text>
              <text class="axis-name-en">· {{ axis.nameEn }}</text>
            </view>
            <text class="axis-desc">{{ axis.desc }}</text>
          </view>
          <text class="chevron">{{ open[axis.id] ? '−' : '+' }}</text>
        </view>

        <view class="axis-body" v-if="open[axis.id]">
          <view
            v-for="testId in axis.tests" :key="testId"
            class="test-item"
            @tap="goTest(testId)"
          >
            <view class="test-info">
              <text class="test-name">{{ testsById[testId].title }}</text>
              <text class="test-name-en">{{ testsById[testId].titleEn }}</text>
              <text class="test-sub">{{ testsById[testId].subtitle }}</text>
              <view class="test-meta">
                <text class="meta-tag">{{ testsById[testId].itemCount }} 题</text>
                <text class="meta-dot">·</text>
                <text class="meta-tag">{{ testsById[testId].duration }}</text>
              </view>
            </view>
            <text class="arrow">→</text>
          </view>

          <view
            v-for="(p, i) in axis.placeholders" :key="'p-' + i"
            class="test-item test-item--soon"
          >
            <view class="test-info">
              <text class="test-name">{{ p.name }}</text>
              <text class="test-name-en">{{ p.nameEn }}</text>
              <text class="test-sub">{{ p.desc }}</text>
            </view>
            <text class="badge">筹备中</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { axes, testsById } from '@/data/tests.js'

export default {
  data() {
    return {
      axes,
      testsById,
      open: { trait: false, emotion: true, behavior: false, motivation: false },
    }
  },
  methods: {
    toggle(id) {
      this.open = { ...this.open, [id]: !this.open[id] }
    },
    goTest(id) {
      uni.navigateTo({ url: `/pages/assessment/test?id=${id}` })
    },
    goMap() {
      uni.navigateTo({ url: '/pages/map/index' })
    },
  },
}
</script>

<style scoped>
.page { background: #faf7f4; min-height: 100vh; padding-bottom: 120rpx; }

.hero { padding: 60rpx 40rpx 56rpx; }
.hero-label { display: block; font-size: 18rpx; letter-spacing: 8rpx; color: #9c3c62; text-transform: uppercase; margin-bottom: 20rpx; font-weight: 700; }
.hero-title { display: block; font-size: 64rpx; font-weight: 700; color: #33185c; line-height: 1.25; font-style: italic; margin-bottom: 12rpx; }
.hero-sub { display: block; font-size: 28rpx; color: rgba(51,24,92,0.4); letter-spacing: 8rpx; margin-bottom: 28rpx; }
.hero-desc { display: block; font-size: 24rpx; color: #6c6862; line-height: 1.85; max-width: 90%; }

.map-banner { position: relative; overflow: hidden; margin: 32rpx 32rpx 0; background: #1a0f2e; border-radius: 24rpx; padding: 32rpx 32rpx; display: flex; align-items: center; }
.mb-blob { position: absolute; width: 200rpx; height: 200rpx; border-radius: 50%; opacity: 0.4; }
.mb-blob-1 { background: radial-gradient(circle, #7c5cbf 0%, transparent 70%); top: -60rpx; left: -40rpx; }
.mb-blob-2 { background: radial-gradient(circle, #d4607e 0%, transparent 70%); top: -60rpx; right: -40rpx; }
.mb-blob-3 { background: radial-gradient(circle, #3fa882 0%, transparent 70%); bottom: -60rpx; left: 30%; opacity: 0.28; }
.mb-blob-4 { background: radial-gradient(circle, #c9a05c 0%, transparent 70%); bottom: -60rpx; right: -40rpx; opacity: 0.25; }
.mb-content { position: relative; z-index: 1; flex: 1; }
.mb-label { display: block; font-size: 18rpx; letter-spacing: 6rpx; color: rgba(255,255,255,0.55); margin-bottom: 10rpx; }
.mb-title { display: block; font-size: 32rpx; font-weight: 700; color: #fff; letter-spacing: 2rpx; margin-bottom: 6rpx; }
.mb-sub { display: block; font-size: 22rpx; color: rgba(255,255,255,0.55); letter-spacing: 1rpx; }
.mb-arrow { position: relative; z-index: 1; font-size: 32rpx; color: rgba(255,255,255,0.7); margin-left: 16rpx; }

.axes { padding: 0 32rpx; display: flex; flex-direction: column; gap: 20rpx; }

.axis-card { background: #fff; border-radius: 28rpx; border: 2rpx solid rgba(74,48,115,0.1); box-shadow: 0 4px 18rpx rgba(74,48,115,0.05); overflow: hidden; transition: all 0.25s; }
.axis-card.open { border-color: rgba(74,48,115,0.25); box-shadow: 0 8px 28rpx rgba(74,48,115,0.1); }

.axis-header { display: flex; align-items: center; gap: 24rpx; padding: 32rpx 32rpx; position: relative; }
.axis-card.open .axis-header::before { content: ''; position: absolute; left: 0; top: 16rpx; bottom: 16rpx; width: 6rpx; background: #4A3073; border-radius: 0 4rpx 4rpx 0; }

.axis-num { font-size: 56rpx; font-weight: 900; color: #9c3c62; line-height: 1; flex-shrink: 0; font-style: italic; }
.axis-info { flex: 1; }
.axis-title-row { display: flex; align-items: baseline; gap: 12rpx; margin-bottom: 8rpx; flex-wrap: wrap; }
.axis-name { font-size: 32rpx; font-weight: 700; color: #33185c; letter-spacing: 2rpx; }
.axis-name-en { font-size: 22rpx; color: rgba(74,48,115,0.4); font-style: italic; }
.axis-desc { font-size: 22rpx; color: #8b8279; line-height: 1.6; }
.chevron { font-size: 36rpx; color: #4A3073; opacity: 0.5; flex-shrink: 0; font-weight: 300; }

.axis-body { padding: 0 32rpx 16rpx; border-top: 2rpx solid rgba(74,48,115,0.08); }

.test-item { display: flex; align-items: center; gap: 20rpx; padding: 28rpx 0; border-bottom: 2rpx solid rgba(74,48,115,0.06); }
.test-item:last-child { border-bottom: none; }
.test-item--soon { opacity: 0.55; }

.test-info { flex: 1; }
.test-name { display: block; font-size: 28rpx; font-weight: 700; color: #33185c; margin-bottom: 4rpx; }
.test-name-en { display: block; font-size: 18rpx; color: rgba(74,48,115,0.4); letter-spacing: 2rpx; font-style: italic; margin-bottom: 12rpx; }
.test-sub { display: block; font-size: 22rpx; color: #6c6862; line-height: 1.6; margin-bottom: 12rpx; }
.test-meta { display: flex; gap: 12rpx; align-items: center; }
.meta-tag { font-size: 20rpx; color: rgba(74,48,115,0.5); letter-spacing: 1rpx; }
.meta-dot { font-size: 20rpx; color: rgba(74,48,115,0.25); }

.arrow { font-size: 32rpx; color: #4A3073; opacity: 0.45; flex-shrink: 0; }
.badge { font-size: 18rpx; padding: 6rpx 16rpx; background: rgba(30,22,40,0.05); color: rgba(30,22,40,0.4); border-radius: 999rpx; flex-shrink: 0; letter-spacing: 1rpx; }
</style>
