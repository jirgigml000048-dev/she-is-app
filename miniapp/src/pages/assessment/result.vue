<template>
  <view class="page" v-if="test">
    <!-- Hero -->
    <view class="hero">
      <text class="hero-emoji">{{ heroEmoji }}</text>
      <text class="hero-type">{{ heroLabel }}</text>
      <text class="hero-tagline" v-if="heroTagline">{{ heroTagline }}</text>
    </view>

    <view class="divider" />

    <!-- Cognitive profile (custom result) -->
    <view v-if="test.customResult === 'cognitive' && cognitiveProfile" class="cog-card">
      <text class="cog-title">你的 8 维认知功能画像</text>
      <view class="cog-list">
        <view
          v-for="(d, i) in cognitiveProfile" :key="d.id"
          :class="['cog-row', i < 2 ? 'cog-row--top' : '']"
        >
          <view class="cog-row-head">
            <text class="cog-rank">{{ i < 2 ? 'TOP ' + (i + 1) : '#' + (i + 1) }}</text>
            <text class="cog-name">{{ d.name }}</text>
            <text class="cog-pct">{{ Math.round(d.avg / 5 * 100) }}%</text>
          </view>
          <view class="cog-bar-bg">
            <view class="cog-bar-fill" :style="{ width: (d.avg / 5 * 100) + '%' }" />
          </view>
          <text class="cog-desc" v-if="i < 2">{{ d.desc }}</text>
        </view>
      </view>
    </view>

    <!-- Standard description -->
    <view v-else-if="result" class="desc-card">
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
import { testsById } from '@/data/tests.js'

export default {
  data() {
    return {
      test: null,
      result: null,
      resultKey: '',
      cognitiveProfile: null,
    }
  },
  onLoad(query) {
    const t = testsById[query.id]
    if (t) {
      this.test = t
      this.resultKey = decodeURIComponent(query.result || '')
      this.result = t.results[this.resultKey] || null

      if (t.customResult === 'cognitive') {
        const answers = uni.getStorageSync(`test-answers-${t.id}`) || []
        this.cognitiveProfile = this.computeCognitiveProfile(t, answers)
      }
      uni.setNavigationBarTitle({ title: '你的结果' })
    }
  },
  computed: {
    heroEmoji() {
      if (this.test?.customResult === 'cognitive') return '🧭'
      return this.result?.emoji || '🌿'
    },
    heroLabel() {
      if (this.test?.customResult === 'cognitive' && this.cognitiveProfile) {
        return this.cognitiveProfile[0].name
      }
      return this.result?.label || ''
    },
    heroTagline() {
      if (this.test?.customResult === 'cognitive' && this.cognitiveProfile) {
        return '你最突出的认知偏好'
      }
      return this.result?.tagline || ''
    },
  },
  methods: {
    computeCognitiveProfile(test, answers) {
      const sums = {}
      test.dimensions.forEach(d => { sums[d.id] = { total: 0, count: 0 } })
      test.questions.forEach((q, i) => {
        const v = answers[i] ?? 3
        sums[q.dimension].total += v
        sums[q.dimension].count += 1
      })
      return test.dimensions.map(d => ({
        id: d.id, name: d.name, desc: d.desc,
        avg: sums[d.id].total / sums[d.id].count,
      })).sort((a, b) => b.avg - a.avg)
    },
    retry() {
      uni.redirectTo({ url: `/pages/assessment/test?id=${this.test.id}` })
    },
    backToList() {
      uni.switchTab({ url: '/pages/assessment/index' })
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

.desc-card { background: #fff; border-radius: 24rpx; padding: 40rpx; box-shadow: 0 4px 24rpx rgba(51,24,92,0.05); margin-bottom: 32rpx; }
.desc-text { font-size: 28rpx; color: #46433f; line-height: 1.9; display: block; }

/* Cognitive */
.cog-card { background: #fff; border-radius: 24rpx; padding: 36rpx 32rpx; box-shadow: 0 4px 24rpx rgba(51,24,92,0.05); margin-bottom: 32rpx; }
.cog-title { display: block; font-size: 26rpx; font-weight: 700; color: #33185c; margin-bottom: 28rpx; letter-spacing: 2rpx; }
.cog-list { display: flex; flex-direction: column; gap: 24rpx; }
.cog-row {}
.cog-row-head { display: flex; align-items: baseline; gap: 16rpx; margin-bottom: 12rpx; }
.cog-rank { font-size: 18rpx; color: #9c3c62; letter-spacing: 2rpx; font-weight: 700; min-width: 80rpx; }
.cog-row:not(.cog-row--top) .cog-rank { color: rgba(74,48,115,0.4); font-weight: 500; }
.cog-name { flex: 1; font-size: 26rpx; color: #33185c; font-weight: 600; }
.cog-row:not(.cog-row--top) .cog-name { font-weight: 400; color: #46433f; }
.cog-pct { font-size: 24rpx; color: #4A3073; font-weight: 700; font-style: italic; }
.cog-bar-bg { height: 8rpx; background: rgba(74,48,115,0.08); border-radius: 4rpx; overflow: hidden; }
.cog-bar-fill { height: 100%; background: linear-gradient(90deg, rgba(74,48,115,0.6), #4A3073); border-radius: 4rpx; }
.cog-desc { display: block; margin-top: 14rpx; font-size: 22rpx; color: #6c6862; line-height: 1.7; }

.badge-row { margin-bottom: 48rpx; }
.badge { display: inline-flex; background: rgba(74,48,115,0.07); border-radius: 999rpx; padding: 10rpx 24rpx; }
.badge-text { font-size: 18rpx; color: rgba(74,48,115,0.5); letter-spacing: 2rpx; }

.actions { display: flex; flex-direction: column; gap: 20rpx; }
.btn-retry { border: 2rpx solid rgba(74,48,115,0.2); border-radius: 999rpx; padding: 28rpx 0; text-align: center; }
.btn-retry-text { font-size: 26rpx; color: #33185c; font-weight: 600; }
.btn-back { background: #33185c; border-radius: 999rpx; padding: 28rpx 0; text-align: center; }
.btn-back-text { font-size: 26rpx; color: #fff; font-weight: 700; letter-spacing: 2rpx; }
</style>
