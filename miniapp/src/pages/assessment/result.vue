<template>
  <view class="page" v-if="result">
    <!-- Hero -->
    <view class="hero">
      <text class="hero-emoji">{{ result.emoji }}</text>
      <text class="hero-type">{{ result.label }}</text>
      <text class="hero-tagline">{{ result.tagline }}</text>
    </view>

    <!-- Divider -->
    <view class="divider" />

    <!-- Description -->
    <view class="desc-card">
      <text class="desc-text">{{ result.desc }}</text>
    </view>

    <!-- Test info badge -->
    <view class="badge-row">
      <view class="badge">
        <text class="badge-text">{{ test.title }} · {{ test.titleEn }}</text>
      </view>
    </view>

    <!-- Actions -->
    <view class="actions">
      <view class="btn-retry" @tap="retry">
        <text class="btn-retry-text">重新测试</text>
      </view>
      <view class="btn-back" @tap="backToList">
        <text class="btn-back-text">探索更多测评 →</text>
      </view>
    </view>
  </view>
</template>

<script>
import { tests } from '@/data/tests.js'

export default {
  data() {
    return {
      test: null,
      result: null,
      resultKey: '',
    }
  },
  onLoad(query) {
    const t = tests.find(t => t.id === query.id)
    if (t) {
      this.test = t
      this.resultKey = query.result
      this.result = t.results[query.result]
      uni.setNavigationBarTitle({ title: '你的结果' })
    }
  },
  methods: {
    retry() {
      uni.redirectTo({ url: `/pages/assessment/test?id=${this.test.id}` })
    },
    backToList() {
      uni.navigateBack({ delta: 10 })
    },
  },
}
</script>

<style scoped>
.page { background: #faf7f4; min-height: 100vh; padding: 0 40rpx 120rpx; }

.hero { padding: 80rpx 0 48rpx; text-align: center; }
.hero-emoji { display: block; font-size: 96rpx; margin-bottom: 24rpx; }
.hero-type { display: block; font-size: 56rpx; font-weight: 700; color: #33185c; line-height: 1.2; margin-bottom: 16rpx; }
.hero-tagline { display: block; font-size: 28rpx; color: #9c3c62; font-style: italic; line-height: 1.5; }

.divider { height: 2rpx; background: rgba(74,48,115,0.08); margin: 0 0 40rpx; border-radius: 2rpx; }

.desc-card { background: #fff; border-radius: 24rpx; padding: 40rpx; box-shadow: 0 4px 24px rgba(51,24,92,0.05); margin-bottom: 32rpx; }
.desc-text { font-size: 28rpx; color: #46433f; line-height: 1.9; display: block; }

.badge-row { margin-bottom: 48rpx; }
.badge { display: inline-flex; background: rgba(74,48,115,0.07); border-radius: 999rpx; padding: 10rpx 24rpx; }
.badge-text { font-size: 18rpx; color: rgba(74,48,115,0.5); letter-spacing: 2rpx; }

.actions { display: flex; flex-direction: column; gap: 20rpx; }
.btn-retry { border: 2rpx solid rgba(74,48,115,0.2); border-radius: 999rpx; padding: 28rpx 0; text-align: center; }
.btn-retry-text { font-size: 26rpx; color: #33185c; font-weight: 600; }
.btn-back { background: #33185c; border-radius: 999rpx; padding: 28rpx 0; text-align: center; }
.btn-back-text { font-size: 26rpx; color: #fff; font-weight: 700; letter-spacing: 2rpx; }
</style>
