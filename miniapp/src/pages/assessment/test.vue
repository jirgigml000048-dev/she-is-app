<template>
  <view class="page" v-if="test">
    <!-- Progress bar -->
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: progressPct + '%' }" />
    </view>
    <view class="progress-meta">
      <text class="progress-label">{{ test.title }}</text>
      <text class="progress-count">{{ cur + 1 }} / {{ test.questions.length }}</text>
    </view>

    <!-- Question panel -->
    <view class="panel">
      <text class="q-id">Q{{ String(cur + 1).padStart(2, '0') }}</text>
      <text class="q-text">{{ test.questions[cur].text }}</text>

      <!-- Scale slider -->
      <view class="slider-card">
        <view class="scale-labels">
          <text>{{ test.scaleLabels[0] }}</text>
          <text>{{ test.scaleLabels[6] }}</text>
        </view>
        <slider
          class="slider"
          :min="1" :max="7" :step="1"
          :value="answers[cur] || 4"
          activeColor="#4A3073"
          backgroundColor="rgba(74,48,115,0.15)"
          block-color="#4A3073"
          :block-size="28"
          @change="onSlide"
        />
        <view class="ticks">
          <text v-for="n in 7" :key="n" :class="['tick', (answers[cur] || 4) === n ? 'tick--active' : '']">{{ n }}</text>
        </view>
        <view class="value-badge">
          <text class="value-text">{{ scaleWord }}</text>
        </view>
      </view>

      <!-- Navigation -->
      <view class="actions">
        <view class="btn-ghost" @tap="prev" v-if="cur > 0">
          <text class="btn-ghost-text">← 上一题</text>
        </view>
        <view style="flex:1" v-else />
        <view :class="['btn-primary', cur === test.questions.length - 1 ? 'btn-primary--submit' : '']" @tap="next">
          <text class="btn-primary-text">{{ cur === test.questions.length - 1 ? '查看结果' : '下一题 →' }}</text>
        </view>
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
      cur: 0,
      answers: [],
    }
  },
  onLoad(query) {
    const t = tests.find(t => t.id === query.id)
    if (t) {
      this.test = t
      this.answers = new Array(t.questions.length).fill(4)
      uni.setNavigationBarTitle({ title: t.title })
    }
  },
  computed: {
    progressPct() {
      if (!this.test) return 0
      return Math.round(((this.cur + 1) / this.test.questions.length) * 100)
    },
    scaleWord() {
      const v = this.answers[this.cur] || 4
      return this.test?.scaleLabels[v - 1] || ''
    },
  },
  methods: {
    onSlide(e) {
      const arr = [...this.answers]
      arr[this.cur] = e.detail.value
      this.answers = arr
    },
    prev() {
      if (this.cur > 0) this.cur--
    },
    next() {
      if (this.cur < this.test.questions.length - 1) {
        this.cur++
      } else {
        const resultKey = this.test.score(this.answers)
        uni.navigateTo({
          url: `/pages/assessment/result?id=${this.test.id}&result=${resultKey}`,
        })
      }
    },
  },
}
</script>

<style scoped>
.page { background: #faf7f4; min-height: 100vh; padding: 0 0 80rpx; }

.progress-bar { height: 4rpx; background: rgba(74,48,115,0.1); }
.progress-fill { height: 100%; background: #4A3073; transition: width 0.3s ease; border-radius: 0 4rpx 4rpx 0; }

.progress-meta { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 40rpx 32rpx; }
.progress-label { font-size: 20rpx; color: rgba(74,48,115,0.5); letter-spacing: 2rpx; }
.progress-count { font-size: 20rpx; color: rgba(74,48,115,0.5); font-weight: 600; }

.panel { margin: 0 32rpx; background: #fff; border-radius: 32rpx; padding: 48rpx 40rpx 40rpx; box-shadow: 0 10px 40px rgba(51,24,92,0.07); min-height: 72vh; display: flex; flex-direction: column; }

.q-id { display: block; font-size: 20rpx; color: #9c3c62; letter-spacing: 6rpx; font-weight: 700; margin-bottom: 20rpx; }
.q-text { display: block; font-size: 40rpx; color: #2f2a26; line-height: 1.55; font-weight: 500; flex: 1; margin-bottom: 48rpx; }

.slider-card { background: linear-gradient(180deg, #fcfaf7, #f8f4ee); border: 2rpx solid #efe6db; border-radius: 24rpx; padding: 32rpx 28rpx 24rpx; margin-bottom: 40rpx; }
.scale-labels { display: flex; justify-content: space-between; margin-bottom: 20rpx; }
.scale-labels text { font-size: 20rpx; color: #8b8279; }
.slider { width: 100%; }
.ticks { display: flex; justify-content: space-between; margin-top: 12rpx; }
.tick { font-size: 20rpx; color: #b0a8a0; text-align: center; width: 40rpx; }
.tick--active { color: #4A3073; font-weight: 700; }
.value-badge { margin-top: 20rpx; text-align: center; }
.value-text { font-size: 22rpx; color: #4A3073; font-weight: 600; background: rgba(74,48,115,0.08); padding: 8rpx 28rpx; border-radius: 999rpx; }

.actions { display: flex; gap: 16rpx; align-items: center; margin-top: auto; }
.btn-ghost { border: 2rpx solid rgba(74,48,115,0.2); border-radius: 999rpx; padding: 22rpx 32rpx; }
.btn-ghost-text { font-size: 24rpx; color: rgba(74,48,115,0.6); }
.btn-primary { flex: 1; background: #33185c; border-radius: 999rpx; padding: 24rpx 0; text-align: center; }
.btn-primary--submit { background: #9c3c62; }
.btn-primary-text { font-size: 26rpx; font-weight: 700; color: #fff; letter-spacing: 2rpx; }
</style>
