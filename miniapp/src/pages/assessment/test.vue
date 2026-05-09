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

      <!-- Slider type -->
      <view v-if="test.type === 'slider'" class="slider-card">
        <view class="scale-labels">
          <text>{{ test.scaleLabels[0] }}</text>
          <text>{{ test.scaleLabels[test.scale - 1] }}</text>
        </view>
        <slider
          class="slider"
          :min="1" :max="test.scale" :step="1"
          :value="answers[cur] || Math.ceil(test.scale / 2)"
          activeColor="#4A3073"
          backgroundColor="rgba(74,48,115,0.15)"
          block-color="#4A3073"
          :block-size="28"
          @change="onSlide"
        />
        <view class="ticks">
          <text v-for="n in test.scale" :key="n"
            :class="['tick', (answers[cur] || Math.ceil(test.scale / 2)) === n ? 'tick--active' : '']"
          >{{ n }}</text>
        </view>
        <view class="value-badge">
          <text class="value-text">{{ scaleWord }}</text>
        </view>
      </view>

      <!-- Choice type -->
      <view v-else class="choices">
        <view
          v-for="opt in test.questions[cur].options" :key="opt.tag + opt.text"
          :class="['choice', answers[cur] === opt.tag ? 'choice--selected' : '']"
          @tap="selectChoice(opt.tag)"
        >
          <text class="choice-text">{{ opt.text }}</text>
        </view>
      </view>

      <!-- Navigation -->
      <view class="actions">
        <view class="btn-ghost" @tap="prev" v-if="cur > 0">
          <text class="btn-ghost-text">← 上一题</text>
        </view>
        <view style="flex:1" v-else />
        <view
          :class="['btn-primary',
            cur === test.questions.length - 1 ? 'btn-primary--submit' : '',
            !canProceed ? 'btn-primary--disabled' : '']"
          @tap="next"
        >
          <text class="btn-primary-text">{{ cur === test.questions.length - 1 ? '查看结果' : '下一题 →' }}</text>
        </view>
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
      cur: 0,
      answers: [],
    }
  },
  onLoad(query) {
    const t = testsById[query.id]
    if (t) {
      this.test = t
      this.answers = new Array(t.questions.length).fill(null)
      uni.setNavigationBarTitle({ title: t.title })
    }
  },
  computed: {
    progressPct() {
      if (!this.test) return 0
      return Math.round(((this.cur + 1) / this.test.questions.length) * 100)
    },
    scaleWord() {
      if (this.test.type !== 'slider') return ''
      const v = this.answers[this.cur] || Math.ceil(this.test.scale / 2)
      return this.test.scaleLabels[v - 1] || ''
    },
    canProceed() {
      if (this.test.type === 'slider') return true
      return this.answers[this.cur] !== null
    },
  },
  methods: {
    onSlide(e) {
      const arr = [...this.answers]
      arr[this.cur] = e.detail.value
      this.answers = arr
    },
    selectChoice(tag) {
      const arr = [...this.answers]
      arr[this.cur] = tag
      this.answers = arr
      // Auto-advance after a short delay
      setTimeout(() => {
        if (this.cur < this.test.questions.length - 1) {
          this.cur++
        }
      }, 300)
    },
    prev() {
      if (this.cur > 0) this.cur--
    },
    next() {
      if (!this.canProceed) {
        uni.showToast({ title: '请先选择一个选项', icon: 'none' })
        return
      }
      if (this.cur < this.test.questions.length - 1) {
        // For slider, set default if not yet set
        if (this.test.type === 'slider' && this.answers[this.cur] === null) {
          const arr = [...this.answers]
          arr[this.cur] = Math.ceil(this.test.scale / 2)
          this.answers = arr
        }
        this.cur++
      } else {
        // Fill any null slider answers with default
        if (this.test.type === 'slider') {
          const arr = this.answers.map(a => a === null ? Math.ceil(this.test.scale / 2) : a)
          this.answers = arr
        }
        uni.setStorageSync(`test-answers-${this.test.id}`, this.answers)
        const resultKey = this.test.score(this.answers)
        uni.redirectTo({
          url: `/pages/assessment/result?id=${this.test.id}&result=${encodeURIComponent(resultKey)}`,
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

.panel { margin: 0 32rpx; background: #fff; border-radius: 32rpx; padding: 48rpx 40rpx 40rpx; box-shadow: 0 10px 40rpx rgba(51,24,92,0.07); min-height: 70vh; display: flex; flex-direction: column; }

.q-id { display: block; font-size: 20rpx; color: #9c3c62; letter-spacing: 6rpx; font-weight: 700; margin-bottom: 20rpx; }
.q-text { display: block; font-size: 36rpx; color: #2f2a26; line-height: 1.55; font-weight: 500; margin-bottom: 48rpx; }

/* Slider */
.slider-card { background: linear-gradient(180deg, #fcfaf7, #f8f4ee); border: 2rpx solid #efe6db; border-radius: 24rpx; padding: 32rpx 28rpx 24rpx; margin-bottom: 40rpx; }
.scale-labels { display: flex; justify-content: space-between; margin-bottom: 20rpx; }
.scale-labels text { font-size: 20rpx; color: #8b8279; }
.slider { width: 100%; }
.ticks { display: flex; justify-content: space-between; margin-top: 12rpx; }
.tick { font-size: 20rpx; color: #b0a8a0; text-align: center; flex: 1; }
.tick--active { color: #4A3073; font-weight: 700; }
.value-badge { margin-top: 20rpx; text-align: center; }
.value-text { font-size: 22rpx; color: #4A3073; font-weight: 600; background: rgba(74,48,115,0.08); padding: 8rpx 28rpx; border-radius: 999rpx; }

/* Choice */
.choices { display: flex; flex-direction: column; gap: 20rpx; margin-bottom: 40rpx; }
.choice { background: #fff; border: 2rpx solid rgba(74,48,115,0.18); border-radius: 20rpx; padding: 28rpx 28rpx; transition: all 0.18s; }
.choice--selected { background: rgba(74,48,115,0.08); border-color: #4A3073; }
.choice-text { font-size: 26rpx; color: #2f2a26; line-height: 1.6; }
.choice--selected .choice-text { color: #33185c; font-weight: 600; }

.actions { display: flex; gap: 16rpx; align-items: center; margin-top: auto; }
.btn-ghost { border: 2rpx solid rgba(74,48,115,0.2); border-radius: 999rpx; padding: 22rpx 32rpx; }
.btn-ghost-text { font-size: 24rpx; color: rgba(74,48,115,0.6); }
.btn-primary { flex: 1; background: #33185c; border-radius: 999rpx; padding: 24rpx 0; text-align: center; }
.btn-primary--submit { background: #9c3c62; }
.btn-primary--disabled { opacity: 0.4; }
.btn-primary-text { font-size: 26rpx; font-weight: 700; color: #fff; letter-spacing: 2rpx; }
</style>
