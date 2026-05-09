<template>
  <view class="page" v-if="test">

    <!-- ── ECR result card ── -->
    <view v-if="isEcr && ecrScores" class="ecr-page">

      <!-- Glow blobs -->
      <view class="ecr-glow ecr-glow--top" />
      <view class="ecr-glow ecr-glow--bottom" />

      <!-- Header label -->
      <view class="ecr-header">
        <text class="ecr-header-label">成人依恋类型 · ECR-36</text>
      </view>

      <!-- Result capture card -->
      <view class="r-card">

        <!-- Type -->
        <text class="r-type">{{ result.label }}</text>
        <text class="r-score-line">回避 {{ ecrScores.avoidanceStr }} · 焦虑 {{ ecrScores.anxietyStr }}</text>

        <!-- Score bars -->
        <view class="r-viz">
          <view class="r-score-row">
            <text class="r-score-label">回避</text>
            <view class="r-bar-bg">
              <view class="r-bar-fill" :style="{ width: ecrScores.avoidancePct + '%' }" />
            </view>
            <text class="r-score-val">{{ ecrScores.avoidancePct }}%</text>
          </view>
          <view class="r-score-row">
            <text class="r-score-label">焦虑</text>
            <view class="r-bar-bg">
              <view class="r-bar-fill" :style="{ width: ecrScores.anxietyPct + '%' }" />
            </view>
            <text class="r-score-val">{{ ecrScores.anxietyPct }}%</text>
          </view>
        </view>

        <view class="r-divider" />

        <!-- Quote -->
        <text class="r-quote" v-if="result.quote">{{ result.quote }}</text>

        <!-- Description paragraphs -->
        <view class="r-desc-wrap" v-if="descParagraphs.length">
          <text v-for="(p, i) in descParagraphs" :key="i" class="r-desc-p">{{ p }}</text>
        </view>

        <!-- Badge -->
        <view class="r-badge-row">
          <view class="r-badge">
            <text class="r-badge-text">{{ test.title }} · {{ test.titleEn }}</text>
          </view>
        </view>
      </view>

      <!-- Share caption -->
      <text class="r-share-caption">分享你的结果</text>

      <!-- Share buttons row -->
      <view class="r-share-row">
        <button class="r-save-btn" open-type="share">
          <text class="r-save-btn-text">分享给好友</text>
        </button>
        <view class="r-save-btn" @tap="saveCard">
          <text class="r-save-btn-text">保存结果卡</text>
        </view>
      </view>

      <!-- Back + retry -->
      <view class="r-actions">
        <view class="r-back-btn" @tap="backToList">
          <text class="r-back-btn-text">← 探索更多测评</text>
        </view>
        <view class="r-retry-btn" @tap="retry">
          <text class="r-retry-btn-text">再做一次</text>
        </view>
      </view>

    </view>

    <!-- ── Standard result (cognitive / non-ECR) ── -->
    <view v-else>
      <!-- Hero -->
      <view class="hero">
        <text class="hero-emoji">{{ heroEmoji }}</text>
        <text class="hero-type">{{ heroLabel }}</text>
        <text class="hero-tagline" v-if="heroTagline">{{ heroTagline }}</text>
      </view>

      <view class="divider" />

      <!-- Cognitive profile -->
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
      ecrScores: null,
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

      if (t.type === 'ecr' && t.computeScores) {
        const answers = uni.getStorageSync(`test-answers-${t.id}`) || []
        const { avoidance, anxiety } = t.computeScores(answers)
        const avPct = Math.round(((avoidance - 1) / 6) * 100)
        const axPct = Math.round(((anxiety - 1) / 6) * 100)
        this.ecrScores = {
          avoidance,
          anxiety,
          avoidancePct: avPct,
          anxietyPct: axPct,
          avoidanceStr: avoidance.toFixed(2),
          anxietyStr: anxiety.toFixed(2),
        }
      }

      uni.setNavigationBarTitle({ title: '你的结果' })
    }
  },
  onShareAppMessage() {
    if (!this.result || !this.test) return {}
    return {
      title: `我的依恋风格：${this.result.label} — ${this.result.tagline}`,
      path: `/pages/assessment/test?id=${this.test.id}`,
    }
  },
  computed: {
    isEcr() {
      return this.test?.type === 'ecr'
    },
    descParagraphs() {
      if (!this.result?.desc) return []
      return this.result.desc
        .replace(/<\/p>/g, '\n')
        .replace(/<p>/g, '')
        .replace(/<[^>]+>/g, '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
    },
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
    saveCard() {
      uni.showToast({ title: '长按图片即可保存', icon: 'none', duration: 2000 })
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
/* ── ECR RESULT ── */
.ecr-page {
  background: #fcf9f6;
  min-height: 100vh;
  padding: 0 40rpx 120rpx;
  position: relative;
  overflow: hidden;
}
.ecr-glow {
  position: absolute;
  border-radius: 9999rpx;
  pointer-events: none;
}
.ecr-glow--top { width: 600rpx; height: 440rpx; top: -80rpx; right: -80rpx; background: rgba(236,220,255,0.25); }
.ecr-glow--bottom { width: 500rpx; height: 380rpx; bottom: 120rpx; left: -80rpx; background: rgba(229,226,223,0.35); }

.ecr-header { padding: 80rpx 0 40rpx; }
.ecr-header-label {
  font-size: 18rpx;
  letter-spacing: 4rpx;
  color: rgba(74,48,115,0.45);
  text-transform: uppercase;
}

/* Result card */
.r-card {
  background: #fffdfa;
  border: 2rpx solid #e7dfd6;
  border-radius: 28rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 6px 20px rgba(48,35,23,0.06);
  margin-bottom: 40rpx;
  position: relative;
  z-index: 1;
}
.r-type {
  display: block;
  font-size: 56rpx;
  color: #2e2e2e;
  font-weight: 600;
  margin-bottom: 12rpx;
  line-height: 1.2;
}
.r-score-line {
  display: block;
  font-size: 22rpx;
  color: #4A3073;
  letter-spacing: 2rpx;
  margin-bottom: 36rpx;
}
.r-viz { margin-bottom: 44rpx; }
.r-score-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}
.r-score-label {
  font-size: 22rpx;
  color: #888;
  width: 80rpx;
  flex-shrink: 0;
}
.r-bar-bg {
  flex: 1;
  height: 6rpx;
  background: rgba(74,48,115,0.1);
  border-radius: 4rpx;
  overflow: hidden;
}
.r-bar-fill {
  height: 6rpx;
  background: #4A3073;
  border-radius: 4rpx;
}
.r-score-val {
  font-size: 22rpx;
  color: #4A3073;
  width: 72rpx;
  text-align: right;
  flex-shrink: 0;
}
.r-divider { height: 2rpx; background: rgba(74,48,115,0.08); margin-bottom: 36rpx; }
.r-quote {
  display: block;
  font-size: 28rpx;
  color: #3d3158;
  line-height: 1.9;
  border-left: 4rpx solid rgba(74,48,115,0.4);
  padding-left: 24rpx;
  margin-bottom: 12rpx;
}
.r-desc-wrap { margin-top: 24rpx; }
.r-desc-p {
  display: block;
  font-size: 26rpx;
  color: #555;
  line-height: 2;
  margin-bottom: 28rpx;
}
.r-badge-row { margin-top: 32rpx; }
.r-badge {
  display: inline-flex;
  background: rgba(74,48,115,0.07);
  border-radius: 999rpx;
  padding: 10rpx 24rpx;
}
.r-badge-text { font-size: 18rpx; color: rgba(74,48,115,0.5); letter-spacing: 2rpx; }

/* Share */
.r-share-caption {
  display: block;
  font-size: 22rpx;
  color: rgba(74,48,115,0.5);
  letter-spacing: 2rpx;
  margin-bottom: 20rpx;
  position: relative; z-index: 1;
}
.r-share-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
  position: relative; z-index: 1;
}
.r-save-btn {
  flex: 1;
  background: transparent;
  border: 2rpx solid rgba(74,48,115,0.22);
  border-radius: 16rpx;
  padding: 28rpx 0;
  text-align: center;
  line-height: 1;
}
/* reset wx button styles */
.r-save-btn::after { border: none; }
.r-save-btn-text { font-size: 24rpx; color: #4A3073; letter-spacing: 2rpx; }
.r-actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 4rpx;
  position: relative; z-index: 1;
}
.r-back-btn {
  background: #33185c;
  border-radius: 16rpx;
  padding: 32rpx 0;
  text-align: center;
}
.r-back-btn-text { font-size: 26rpx; color: #fff; font-weight: 600; letter-spacing: 2rpx; }
.r-retry-btn { padding: 16rpx 0; text-align: center; }
.r-retry-btn-text { font-size: 22rpx; color: #bbb; letter-spacing: 2rpx; }

/* ── STANDARD (non-ECR) ── */
.page { background: #faf7f4; min-height: 100vh; padding: 0 40rpx 120rpx; }

.hero { padding: 80rpx 0 48rpx; text-align: center; }
.hero-emoji { display: block; font-size: 96rpx; margin-bottom: 24rpx; }
.hero-type { display: block; font-size: 56rpx; font-weight: 700; color: #33185c; line-height: 1.2; margin-bottom: 16rpx; }
.hero-tagline { display: block; font-size: 28rpx; color: #9c3c62; font-style: italic; line-height: 1.5; }

.divider { height: 2rpx; background: rgba(74,48,115,0.08); margin: 0 0 40rpx; border-radius: 2rpx; }

.desc-card { background: #fff; border-radius: 24rpx; padding: 40rpx; box-shadow: 0 4px 24rpx rgba(51,24,92,0.05); margin-bottom: 32rpx; }
.desc-text { font-size: 28rpx; color: #46433f; line-height: 1.9; display: block; }

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
