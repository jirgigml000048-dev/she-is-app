<template>
  <view class="page" v-if="test">

    <!-- ── Intro screen (any test with hasIntro) ── -->
    <view v-if="showIntro" class="intro-wrap">
      <view class="intro-glow intro-glow--top" />
      <view class="intro-glow intro-glow--bottom" />
      <view class="intro-body">
        <!-- Header -->
        <view class="intro-header">
          <text class="intro-label">Self Discovery</text>
          <text class="intro-title-en">{{ test.intro.titleEn }}</text>
          <text class="intro-title-cn">{{ test.intro.titleCn }}</text>
          <view class="intro-hr" />
          <text class="intro-sub">{{ test.intro.code }}</text>
        </view>
        <!-- Reflective text -->
        <view class="intro-quote-wrap">
          <text class="intro-quote">{{ test.intro.quote }}</text>
          <text class="intro-quote-cn">{{ test.intro.quoteCn }}</text>
        </view>
        <!-- CTA -->
        <view class="intro-cta-wrap">
          <view class="intro-btn" @tap="startTest">
            <text class="intro-btn-text">Ready / 准备好了 →</text>
          </view>
          <text class="intro-time">{{ test.intro.time }}</text>
        </view>
      </view>
    </view>

    <!-- ── Likert circle layout (ECR, HSP, FMPS…) ── -->
    <view v-else-if="test.type === 'likert'" class="ecr-page">
      <!-- Counter + status -->
      <view class="ecr-top">
        <view class="ecr-counter-row">
          <text class="ecr-counter">{{ cur + 1 }}<text class="ecr-counter-of"> / {{ test.questions.length }}</text></text>
          <view class="ecr-status">
            <text class="ecr-status-label">进度 / STATUS</text>
            <text class="ecr-status-val">已完成 {{ answeredCount }} / {{ test.questions.length }}<text class="ecr-status-en"> · Completed {{ answeredCount }} / {{ test.questions.length }}</text></text>
          </view>
        </view>
        <view class="ecr-prog-bg">
          <view class="ecr-prog-fill" :style="{ width: (answeredCount / test.questions.length * 100) + '%' }" />
        </view>
      </view>

      <!-- Question card -->
      <view class="ecr-card">
        <view class="ecr-card-rule" />
        <text class="ecr-q-text">{{ test.questions[cur].text }}</text>
        <text class="ecr-q-en" v-if="test.questions[cur].text_en">{{ test.questions[cur].text_en }}</text>

        <!-- Dynamic circles based on test.scale -->
        <view class="ecr-likert">
          <view
            v-for="n in test.scale" :key="n"
            :class="['ecr-circle', answers[cur] === n ? 'ecr-circle--active' : '']"
            @tap="selectLikert(n)"
          >
            <text :class="['ecr-circle-num', answers[cur] === n ? 'ecr-circle-num--active' : '']">{{ n }}</text>
          </view>
        </view>

        <!-- Scale labels -->
        <view class="ecr-scale-labels">
          <view class="ecr-scale-left">
            <text class="ecr-scale-main">1 {{ test.scaleLabels[0] }}</text>
          </view>
          <view class="ecr-scale-right">
            <text class="ecr-scale-main">{{ test.scale }} {{ test.scaleLabels[test.scale - 1] }}</text>
          </view>
        </view>
      </view>

      <!-- Actions -->
      <view class="ecr-actions">
        <view class="ecr-prev-next">
          <view class="ecr-prev" @tap="prev" :style="{ opacity: cur === 0 ? 0.4 : 1 }">
            <text class="ecr-prev-text">← 上一题</text>
          </view>
          <view
            :class="['ecr-next', answers[cur] === null ? 'ecr-next--disabled' : '']"
            @tap="next"
          >
            <text class="ecr-next-text">
              {{ cur === test.questions.length - 1 ? '查看结果 →' : '下一题 →' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- ── Standard layout (slider / choice) ── -->
    <view v-else>
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

  </view>
</template>

<script>
import { testsById } from '@/data/tests.js'
import { recordAssessment } from '@/utils/user.js'

export default {
  data() {
    return {
      test: null,
      cur: 0,
      answers: [],
      showIntro: false,
    }
  },
  onLoad(query) {
    const t = testsById[query.id]
    if (t) {
      this.test = t
      this.answers = new Array(t.questions.length).fill(null)
      this.showIntro = !!t.hasIntro
      uni.setNavigationBarTitle({ title: t.title })
    }
  },
  computed: {
    answeredCount() {
      return this.answers.filter(v => v !== null).length
    },
    progressPct() {
      if (!this.test) return 0
      return Math.round(((this.cur + 1) / this.test.questions.length) * 100)
    },
    scaleWord() {
      if (!this.test || this.test.type !== 'slider') return ''
      const v = this.answers[this.cur] || Math.ceil(this.test.scale / 2)
      return this.test.scaleLabels[v - 1] || ''
    },
    canProceed() {
      if (!this.test) return false
      if (this.test.type === 'slider') return true
      return this.answers[this.cur] !== null
    },
  },
  methods: {
    startTest() {
      this.showIntro = false
    },
    selectLikert(val) {
      const arr = [...this.answers]
      arr[this.cur] = val
      this.answers = arr
    },
    onSlide(e) {
      const arr = [...this.answers]
      arr[this.cur] = e.detail.value
      this.answers = arr
    },
    selectChoice(tag) {
      const arr = [...this.answers]
      arr[this.cur] = tag
      this.answers = arr
    },
    prev() {
      if (this.cur > 0) this.cur--
    },
    next() {
      // Likert submit: only allow when all answered
      if (this.test.type === 'likert') {
        if (this.answers[this.cur] === null) {
          uni.showToast({ title: '请先选择一个选项', icon: 'none' })
          return
        }
        if (this.cur < this.test.questions.length - 1) {
          this.cur++
          return
        }
        if (this.answeredCount < this.test.questions.length) {
          const firstUnanswered = this.answers.findIndex(value => value === null)
          if (firstUnanswered >= 0) this.cur = firstUnanswered
          uni.showToast({ title: '请完成所有题目再提交', icon: 'none' })
          return
        }
        this._submit()
        return
      }
      if (!this.canProceed) {
        uni.showToast({ title: '请先选择一个选项', icon: 'none' })
        return
      }
      if (this.cur < this.test.questions.length - 1) {
        if (this.test.type === 'slider' && this.answers[this.cur] === null) {
          const arr = [...this.answers]
          arr[this.cur] = Math.ceil(this.test.scale / 2)
          this.answers = arr
        }
        this.cur++
      } else {
        if (this.test.type === 'slider') {
          this.answers = this.answers.map(a => a === null ? Math.ceil(this.test.scale / 2) : a)
        }
        this._submit()
      }
    },
    _submit() {
      const resultKey = this.test.score(this.answers)
      recordAssessment(this.test.id, this.answers, resultKey).catch(error => {
        console.warn('[assessment] cloud sync deferred', error)
      })
      uni.redirectTo({
        url: `/pages/assessment/result?id=${this.test.id}&result=${encodeURIComponent(resultKey)}`,
      })
    },
  },
}
</script>

<style scoped>
/* ── INTRO ── */
.intro-wrap {
  min-height: 100vh;
  background: #fcf9f6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 64rpx 80rpx;
  position: relative;
  overflow: hidden;
}
.intro-glow {
  position: absolute;
  border-radius: 9999rpx;
  pointer-events: none;
}
.intro-glow--top {
  width: 600rpx; height: 440rpx;
  top: -80rpx; right: -80rpx;
  background: rgba(236,220,255,0.25);
}
.intro-glow--bottom {
  width: 500rpx; height: 380rpx;
  bottom: -80rpx; left: -80rpx;
  background: rgba(229,226,223,0.4);
}
.intro-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 64rpx;
  position: relative;
  z-index: 10;
}
.intro-header { display: flex; flex-direction: column; align-items: center; gap: 20rpx; }
.intro-label {
  font-size: 20rpx;
  text-transform: uppercase;
  letter-spacing: 8rpx;
  color: #9c3c62;
  font-weight: 700;
}
.intro-title-en {
  display: block;
  font-size: 64rpx;
  line-height: 1.2;
  color: #33185c;
  font-weight: 700;
}
.intro-title-cn {
  display: block;
  font-size: 44rpx;
  color: rgba(51,24,92,0.75);
  font-weight: 400;
}
.intro-hr { height: 2rpx; width: 96rpx; background: #ccc4d1; }
.intro-sub {
  font-size: 20rpx;
  letter-spacing: 4rpx;
  color: #4a454f;
  text-transform: uppercase;
}
.intro-quote-wrap { max-width: 560rpx; display: flex; flex-direction: column; gap: 32rpx; }
.intro-quote {
  display: block;
  font-size: 36rpx;
  font-style: italic;
  line-height: 1.7;
  color: rgba(28,28,26,0.85);
}
.intro-quote-cn {
  display: block;
  font-size: 26rpx;
  color: rgba(74,69,79,0.8);
  line-height: 1.6;
  font-weight: 300;
}
.intro-cta-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 40rpx; }
.intro-btn {
  width: 100%;
  height: 104rpx;
  background: linear-gradient(to right, #33185c, #4a3073);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 40px rgba(51,24,92,0.2);
}
.intro-btn-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
  letter-spacing: 6rpx;
  text-transform: uppercase;
}
.intro-time {
  font-size: 20rpx;
  color: #7b7580;
  letter-spacing: 4rpx;
  text-transform: uppercase;
}

/* ── ECR LAYOUT ── */
.ecr-page {
  background: #fcf9f6;
  min-height: 100vh;
  padding: 0 32rpx 120rpx;
  display: flex;
  flex-direction: column;
}
.ecr-top { padding: 60rpx 8rpx 48rpx; }
.ecr-counter-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28rpx;
}
.ecr-counter {
  font-size: 80rpx;
  color: rgba(51,24,92,0.8);
  font-weight: 700;
  line-height: 1;
}
.ecr-counter-of { font-size: 32rpx; color: #ccc4d1; font-weight: 400; }
.ecr-status { text-align: right; }
.ecr-status-label {
  display: block;
  font-size: 18rpx;
  text-transform: uppercase;
  letter-spacing: 4rpx;
  color: #7b7580;
  font-weight: 700;
  margin-bottom: 8rpx;
}
.ecr-status-val {
  display: block;
  font-size: 22rpx;
  color: rgba(51,24,92,0.6);
  font-weight: 500;
}
.ecr-status-en { font-size: 18rpx; color: rgba(123,117,128,0.55); }
.ecr-prog-bg { width: 100%; height: 8rpx; background: #f0edea; border-radius: 9999rpx; overflow: hidden; }
.ecr-prog-fill { height: 100%; background: #9c3c62; border-radius: 9999rpx; transition: width 0.25s; }

/* Question card */
.ecr-card {
  flex: 1;
  background: #fff;
  border: 2rpx solid rgba(229,226,223,0.8);
  border-radius: 32rpx;
  padding: 48rpx 40rpx 40rpx;
  box-shadow: 0 10px 40px rgba(51,24,92,0.07);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 40rpx;
}
.ecr-card-rule {
  width: 96rpx;
  height: 4rpx;
  background: rgba(51,24,92,0.12);
  border-radius: 9999rpx;
  margin-bottom: 48rpx;
}
.ecr-q-text {
  display: block;
  font-size: 48rpx;
  line-height: 1.6;
  color: #1c1c1a;
  font-weight: 500;
  margin-bottom: 20rpx;
  padding: 0 8rpx;
}
.ecr-q-en {
  display: block;
  font-size: 28rpx;
  color: rgba(51,24,92,0.45);
  line-height: 1.5;
  font-style: italic;
  margin-bottom: 64rpx;
}
.ecr-likert {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 4rpx;
}
.ecr-circle {
  width: 64rpx;
  height: 64rpx;
  border-radius: 9999rpx;
  background: transparent;
  border: 2rpx solid #ccc4d1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.ecr-circle--active {
  width: 80rpx;
  height: 80rpx;
  background: #33185c;
  border-color: #33185c;
  box-shadow: 0 8rpx 24rpx rgba(51,24,92,0.25);
}
.ecr-circle-num {
  font-size: 22rpx;
  color: #7b7580;
  font-weight: 600;
}
.ecr-circle-num--active {
  font-size: 26rpx;
  color: #fff;
  font-weight: 700;
}
.ecr-scale-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 4rpx;
  margin-top: 24rpx;
}
.ecr-scale-left { text-align: left; }
.ecr-scale-right { text-align: right; }
.ecr-scale-main { display: block; font-size: 20rpx; color: #7b7580; font-weight: 700; text-transform: uppercase; }
.ecr-scale-en { display: block; font-size: 18rpx; color: rgba(123,117,128,0.6); text-transform: uppercase; letter-spacing: -1rpx; font-weight: 500; margin-top: 4rpx; }

/* ECR Action buttons */
.ecr-actions { display: flex; flex-direction: column; gap: 20rpx; }
.ecr-prev-next { display: flex; gap: 20rpx; }
.ecr-prev {
  flex: 1; padding: 32rpx;
  border-radius: 24rpx;
  background: #f0edea;
  display: flex; align-items: center; justify-content: center;
}
.ecr-prev-text { font-size: 28rpx; color: #7b7580; font-weight: 600; }
.ecr-next {
  flex: 1; padding: 32rpx;
  border-radius: 24rpx;
  background: #33185c;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(51,24,92,0.15);
}
.ecr-next-text { font-size: 28rpx; color: #fff; font-weight: 600; }
.ecr-next--disabled { opacity: 0.38; box-shadow: none; }
.ecr-submit {
  width: 100%; padding: 40rpx;
  border-radius: 24rpx;
  border: 2rpx solid rgba(204,196,209,0.5);
  display: flex; align-items: center; justify-content: center;
  background: rgba(246,243,240,0.6);
}
.ecr-submit--dim { opacity: 0.45; }
.ecr-submit--ready { opacity: 1; border-color: rgba(51,24,92,0.3); }
.ecr-submit-text { font-size: 24rpx; color: #33185c; font-weight: 500; letter-spacing: 2rpx; }

/* ── STANDARD layout ── */
.page { background: #faf7f4; min-height: 100vh; padding: 0 0 80rpx; }

.progress-bar { height: 4rpx; background: rgba(74,48,115,0.1); }
.progress-fill { height: 100%; background: #4A3073; transition: width 0.3s ease; border-radius: 0 4rpx 4rpx 0; }

.progress-meta { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 40rpx 32rpx; }
.progress-label { font-size: 20rpx; color: rgba(74,48,115,0.5); letter-spacing: 2rpx; }
.progress-count { font-size: 20rpx; color: rgba(74,48,115,0.5); font-weight: 600; }

.panel { margin: 0 32rpx; background: #fff; border-radius: 32rpx; padding: 48rpx 40rpx 40rpx; box-shadow: 0 10px 40rpx rgba(51,24,92,0.07); min-height: 70vh; display: flex; flex-direction: column; }

.q-id { display: block; font-size: 20rpx; color: #9c3c62; letter-spacing: 6rpx; font-weight: 700; margin-bottom: 20rpx; }
.q-text { display: block; font-size: 36rpx; color: #2f2a26; line-height: 1.55; font-weight: 500; margin-bottom: 48rpx; }

.slider-card { background: linear-gradient(180deg, #fcfaf7, #f8f4ee); border: 2rpx solid #efe6db; border-radius: 24rpx; padding: 32rpx 28rpx 24rpx; margin-bottom: 40rpx; }
.scale-labels { display: flex; justify-content: space-between; margin-bottom: 20rpx; }
.scale-labels text { font-size: 20rpx; color: #8b8279; }
.slider { width: 100%; }
.ticks { display: flex; justify-content: space-between; margin-top: 12rpx; }
.tick { font-size: 20rpx; color: #b0a8a0; text-align: center; flex: 1; }
.tick--active { color: #4A3073; font-weight: 700; }
.value-badge { margin-top: 20rpx; text-align: center; }
.value-text { font-size: 22rpx; color: #4A3073; font-weight: 600; background: rgba(74,48,115,0.08); padding: 8rpx 28rpx; border-radius: 999rpx; }

.choices { display: flex; flex-direction: column; gap: 20rpx; margin-bottom: 40rpx; }
.choice { background: #fff; border: 2rpx solid rgba(74,48,115,0.18); border-radius: 20rpx; padding: 28rpx 28rpx; }
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
