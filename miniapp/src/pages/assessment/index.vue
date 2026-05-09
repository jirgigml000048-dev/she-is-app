<template>
  <view class="page">
    <view class="hero">
      <text class="hero-label">PERSONAL DISCOVERY · 自我图鉴</text>
      <text class="hero-title">Discover Your{{'\n'}}Inner Landscape</text>
      <text class="hero-sub">探索你的内在</text>
      <text class="hero-desc">通过三个维度的深度测评，开启你的内在探索之旅。</text>
    </view>

    <view class="list">
      <view
        v-for="(test, i) in tests" :key="test.id"
        :class="['card', i === 0 ? 'card--featured' : '']"
        @tap="go(test)"
      >
        <text class="card-en">{{ test.titleEn }}</text>
        <text class="card-title">{{ test.title }}</text>
        <text class="card-sub">{{ test.subtitle }}</text>
        <view class="card-meta">
          <text class="meta-item">{{ test.itemCount }} 题</text>
          <text class="meta-dot">·</text>
          <text class="meta-item">{{ test.duration }}</text>
        </view>
        <view class="card-btn">
          <text class="btn-text">{{ i === 0 ? 'Start / 开始' : 'Discover / 探索' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { tests } from '@/data/tests.js'

export default {
  data() {
    return { tests }
  },
  methods: {
    go(test) {
      uni.navigateTo({ url: `/pages/assessment/test?id=${test.id}` })
    },
  },
}
</script>

<style scoped>
.page { background: #faf7f4; min-height: 100vh; padding-bottom: 120rpx; }

.hero { padding: 60rpx 40rpx 48rpx; }
.hero-label { display: block; font-size: 18rpx; letter-spacing: 8rpx; color: #9c3c62; text-transform: uppercase; margin-bottom: 20rpx; }
.hero-title { display: block; font-size: 64rpx; font-weight: 700; color: #33185c; line-height: 1.25; font-style: italic; margin-bottom: 12rpx; }
.hero-sub { display: block; font-size: 28rpx; color: rgba(51,24,92,0.4); letter-spacing: 8rpx; margin-bottom: 24rpx; }
.hero-desc { display: block; font-size: 24rpx; color: #6c6862; line-height: 1.8; }

.list { padding: 0 32rpx; display: flex; flex-direction: column; gap: 24rpx; }

.card { background: #fff; border-radius: 24rpx; padding: 40rpx 36rpx 32rpx; box-shadow: 0 4px 24px rgba(51,24,92,0.05); }
.card--featured { background: #33185c; }

.card-en { display: block; font-size: 18rpx; font-weight: 700; letter-spacing: 6rpx; color: rgba(255,255,255,0.5); margin-bottom: 12rpx; }
.card:not(.card--featured) .card-en { color: rgba(74,48,115,0.35); }
.card-title { display: block; font-size: 38rpx; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 8rpx; }
.card:not(.card--featured) .card-title { color: #33185c; }
.card-sub { display: block; font-size: 24rpx; color: rgba(255,255,255,0.65); line-height: 1.6; margin-bottom: 24rpx; }
.card:not(.card--featured) .card-sub { color: #6c6862; }

.card-meta { display: flex; align-items: center; gap: 12rpx; margin-bottom: 32rpx; }
.meta-item { font-size: 20rpx; color: rgba(255,255,255,0.5); letter-spacing: 2rpx; }
.card:not(.card--featured) .meta-item { color: rgba(74,48,115,0.4); }
.meta-dot { font-size: 20rpx; color: rgba(255,255,255,0.3); }
.card:not(.card--featured) .meta-dot { color: rgba(74,48,115,0.25); }

.card-btn { background: rgba(255,255,255,0.15); border-radius: 999rpx; padding: 18rpx 0; text-align: center; }
.card--featured .card-btn { background: rgba(255,255,255,0.18); }
.card:not(.card--featured) .card-btn { background: rgba(74,48,115,0.08); }
.btn-text { font-size: 22rpx; font-weight: 700; letter-spacing: 6rpx; color: #fff; text-transform: uppercase; }
.card:not(.card--featured) .btn-text { color: #4a3073; }
</style>
