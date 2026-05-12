<template>
  <view class="page">

    <view class="header">
      <text class="header-label">INNER MAP · 你的内在图谱</text>
    </view>

    <!-- 4-blob abstract visualization -->
    <view class="viz-wrap">
      <view class="viz-bg">
        <view class="blob blob-trait" :style="{ opacity: blobOpacity('trait') }"></view>
        <view class="blob blob-emotion" :style="{ opacity: blobOpacity('emotion') }"></view>
        <view class="blob blob-behavior" :style="{ opacity: blobOpacity('behavior') }"></view>
        <view class="blob blob-motivation" :style="{ opacity: blobOpacity('motivation') }"></view>
        <text class="corner-label corner-tl">特质</text>
        <text class="corner-label corner-tr">情绪</text>
        <text class="corner-label corner-bl">行为</text>
        <text class="corner-label corner-br">动机</text>
        <view class="center-badge">
          <text class="center-num">{{ totalCompleted }}</text>
          <text class="center-sep"> / </text>
          <text class="center-total">{{ totalTests }}</text>
        </view>
      </view>
    </view>

    <!-- AI portrait section -->
    <view class="ai-section">
      <view v-if="totalCompleted >= 2 || aiPortrait !== null" class="ai-card">
        <view class="ai-header-row">
          <text class="ai-title">✦ 内在画像</text>
          <view v-if="!aiLoading" @tap="refreshAI" class="ai-refresh-btn">
            <text :class="['ai-refresh-text', aiUpToDate ? 'refresh-done' : 'refresh-ready']">
              {{ aiUpToDate ? '已是最新' : '重新解读 ↺' }}
            </text>
          </view>
        </view>
        <view v-if="aiLoading" class="ai-loading-row">
          <view class="ai-spinner"></view>
          <text class="ai-loading-text">正在生成你的内在画像…</text>
        </view>
        <text v-else-if="aiPortrait" class="ai-text">{{ aiPortrait }}</text>
        <view v-else class="ai-error-row">
          <text class="ai-error-text">解读生成失败</text>
          <text class="ai-retry" @tap="refreshAI">重试</text>
        </view>
      </view>
      <view v-else class="ai-hint">
        <text class="ai-hint-icon">✦</text>
        <text class="ai-hint-text">再完成 {{ 2 - totalCompleted }} 项测评，解锁 AI 内在画像</text>
      </view>
    </view>

    <!-- Detail section -->
    <view class="detail-section">
      <text class="detail-title">测评明细</text>

      <view v-for="axis in axisData" :key="axis.id" class="axis-card">
        <view class="axis-header" @tap="toggleAxis(axis.id)">
          <view class="axis-dot" :style="{ background: axisColor(axis.id) }"></view>
          <view class="axis-meta">
            <text class="axis-name">{{ axis.name }}</text>
            <text class="axis-name-en">· {{ axis.nameEn }}</text>
          </view>
          <text class="axis-count">{{ axis.completed }}/{{ axis.total }}</text>
          <text class="axis-chevron">{{ openAxes[axis.id] ? '−' : '+' }}</text>
        </view>

        <view v-if="openAxes[axis.id]" class="axis-body">
          <view
            v-for="item in axis.items.filter(i => i.done)"
            :key="item.id + '-done'"
            class="test-item test-done"
          >
            <view class="done-head">
              <text class="done-label">{{ item.resultLabel || '已完成' }}</text>
              <text class="done-title">{{ item.title }}</text>
            </view>
            <view v-if="item.scores.length" class="score-rows">
              <view v-for="row in item.scores" :key="row.label" class="score-row">
                <text class="score-lbl">{{ row.label }}</text>
                <view class="bar-bg">
                  <view class="bar-fill" :style="{ width: row.pct + '%', background: axisColor(axis.id) }"></view>
                </view>
                <text class="score-val">{{ row.pct }}%</text>
              </view>
            </view>
          </view>

          <view
            v-for="item in axis.items.filter(i => !i.done)"
            :key="item.id + '-todo'"
            class="test-item test-todo"
            @tap="goTest(item.id)"
          >
            <view class="todo-info">
              <text class="todo-name">{{ item.title }}</text>
              <text class="todo-sub">{{ item.subtitle }}</text>
            </view>
            <text class="todo-arrow">开始 →</text>
          </view>

          <view
            v-for="(p, i) in axis.placeholders"
            :key="'ph-' + i"
            class="test-item test-soon"
          >
            <view class="todo-info">
              <text class="todo-name">{{ p.name }}</text>
              <text class="todo-sub">{{ p.desc }}</text>
            </view>
            <text class="soon-badge">筹备中</text>
          </view>

          <view v-if="!axis.items.length && !axis.placeholders.length" class="axis-empty">
            <text class="axis-empty-text">更多维度即将解锁</text>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
import { axes, testsById } from '@/data/tests.js'
import { ANTHROPIC_API_KEY } from '@/config.js'

const AXIS_COLORS = {
  trait: '#7c5cbf',
  emotion: '#d4607e',
  behavior: '#3fa882',
  motivation: '#c9a05c',
}

export default {
  data() {
    return {
      axisData: [],
      openAxes: { trait: false, emotion: false, behavior: false, motivation: false },
      aiPortrait: null,
      aiLoading: false,
      aiUpToDate: false,
    }
  },
  computed: {
    totalCompleted() {
      return this.axisData.reduce((sum, a) => sum + a.completed, 0)
    },
    totalTests() {
      return this.axisData.reduce((sum, a) => sum + a.total, 0)
    },
    completedTestIds() {
      return this.axisData.flatMap(a => a.items.filter(i => i.done).map(i => i.id))
    },
  },
  onShow() {
    this.loadData()
  },
  methods: {
    loadData() {
      try {
        this.axisData = axes.map(axis => {
          const items = (axis.tests || []).map(testId => {
            const t = testsById[testId]
            if (!t) return { id: testId, title: testId, subtitle: '', done: false, resultLabel: '', scores: [] }
            let answers = []
            try { answers = uni.getStorageSync(`test-answers-${testId}`) || [] } catch (e) { answers = [] }
            const done = Array.isArray(answers) && answers.length > 0
            let resultLabel = '', scores = []
            try {
              if (done && typeof t.computeScores === 'function') scores = t.computeScores(answers) || []
            } catch (e) { scores = [] }
            try {
              if (done && typeof t.score === 'function' && t.results && Object.keys(t.results).length > 0) {
                const key = t.score(answers)
                resultLabel = (t.results[key] && t.results[key].label) || ''
              }
            } catch (e) { resultLabel = '' }
            return { id: t.id, title: t.title, subtitle: t.subtitle, done, resultLabel, scores }
          })
          return {
            ...axis,
            items,
            completed: items.filter(i => i.done).length,
            total: items.length,
          }
        })
      } catch (e) {
        console.error('[map] loadData error', e)
        this.axisData = []
      }
      this.checkAIPortrait()
    },
    checkAIPortrait() {
      const completedIds = this.completedTestIds
      if (completedIds.length < 2) {
        this.aiPortrait = null
        return
      }
      let cached = null
      try { cached = uni.getStorageSync('ai-portrait-v1') } catch (e) { cached = null }
      const cachedIds = cached && Array.isArray(cached.completedIds) ? cached.completedIds.join(',') : ''
      const sameIds = cachedIds === completedIds.join(',')
      if (cached && cached.text && sameIds) {
        this.aiPortrait = cached.text
        this.aiUpToDate = true
      } else {
        this.aiUpToDate = false
        this.fetchAIPortrait()
      }
    },
    refreshAI() {
      if (this.aiLoading) return
      this.aiUpToDate = false
      this.fetchAIPortrait()
    },
    fetchAIPortrait() {
      const completedIds = this.completedTestIds
      const completedResults = this.axisData.flatMap(axis =>
        axis.items
          .filter(i => i.done)
          .map(i => ({
            axisName: axis.name,
            testTitle: i.title,
            resultLabel: i.resultLabel || '已完成',
            scores: i.scores.map(s => `${s.label}:${s.pct}%`),
          }))
      )

      const prompt = `你是「她也」App的内在洞察师。用户完成了以下心理测评：\n\n${
        completedResults.map(r =>
          `- ${r.axisName} · ${r.testTitle}：${r.resultLabel}（${r.scores.join('，')}）`
        ).join('\n')
      }\n\n请写一段200-300字的个性化内在画像。要求：\n1. 找到这些测评结果之间的交叉联系（比如依恋风格如何影响情绪调节策略）\n2. 不要逐条列举，要综合叙述\n3. 语气直觉性、非临床，犀利、冷峻、共情，参考风格韩江、伍尔夫\n4. 中文，第二人称"你"，不要加任何标题或前缀`

      if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_ANTHROPIC_API_KEY_HERE') {
        this.aiPortrait = ''
        return
      }

      this.aiLoading = true
      this.aiPortrait = null

      uni.request({
        url: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        data: {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          messages: [{ role: 'user', content: prompt }],
        },
        success: (res) => {
          const text = (res && res.data && res.data.content && res.data.content[0] && res.data.content[0].text) || ''
          this.aiPortrait = text || ''
          this.aiUpToDate = true
          if (text) uni.setStorageSync('ai-portrait-v1', { text, completedIds })
        },
        fail: () => {
          this.aiPortrait = ''
        },
        complete: () => {
          this.aiLoading = false
        },
      })
    },
    blobOpacity(axisId) {
      const axis = this.axisData.find(a => a.id === axisId)
      if (!axis || axis.total === 0) return 0.06
      return 0.08 + (axis.completed / axis.total) * 0.62
    },
    axisColor(axisId) {
      return AXIS_COLORS[axisId] || '#4A3073'
    },
    toggleAxis(id) {
      this.openAxes = { ...this.openAxes, [id]: !this.openAxes[id] }
    },
    goTest(id) {
      uni.navigateTo({ url: `/pages/assessment/test?id=${id}` })
    },
  },
}
</script>

<style scoped>
.page { background: #faf7f4; min-height: 100vh; padding-bottom: 120rpx; }

/* Header */
.header { padding: 48rpx 40rpx 32rpx; }
.header-label { display: block; font-size: 18rpx; letter-spacing: 8rpx; color: #9c3c62; text-transform: uppercase; font-weight: 700; }

/* Visualization */
.viz-wrap { padding: 0 32rpx; margin-bottom: 40rpx; }
.viz-bg {
  width: 100%;
  height: 380rpx;
  background: #1a0f2e;
  border-radius: 32rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blob {
  position: absolute;
  width: 400rpx;
  height: 400rpx;
  border-radius: 50%;
}
.blob-trait {
  background: radial-gradient(circle at center, #7c5cbf 0%, rgba(124,92,191,0.5) 35%, transparent 70%);
  top: -100rpx;
  left: -100rpx;
}
.blob-emotion {
  background: radial-gradient(circle at center, #d4607e 0%, rgba(212,96,126,0.5) 35%, transparent 70%);
  top: -100rpx;
  right: -100rpx;
}
.blob-behavior {
  background: radial-gradient(circle at center, #3fa882 0%, rgba(63,168,130,0.5) 35%, transparent 70%);
  bottom: -100rpx;
  left: -100rpx;
}
.blob-motivation {
  background: radial-gradient(circle at center, #c9a05c 0%, rgba(201,160,92,0.5) 35%, transparent 70%);
  bottom: -100rpx;
  right: -100rpx;
}

.corner-label {
  position: absolute;
  font-size: 20rpx;
  color: rgba(255,255,255,0.55);
  letter-spacing: 2rpx;
}
.corner-tl { top: 24rpx; left: 28rpx; }
.corner-tr { top: 24rpx; right: 28rpx; }
.corner-bl { bottom: 24rpx; left: 28rpx; }
.corner-br { bottom: 24rpx; right: 28rpx; }

.center-badge { display: flex; align-items: baseline; gap: 4rpx; position: relative; z-index: 1; }
.center-num { font-size: 96rpx; font-weight: 800; color: rgba(255,255,255,0.92); line-height: 1; }
.center-sep { font-size: 36rpx; color: rgba(255,255,255,0.3); }
.center-total { font-size: 36rpx; color: rgba(255,255,255,0.4); }

/* AI section */
.ai-section { padding: 0 32rpx; margin-bottom: 40rpx; }

.ai-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 36rpx 36rpx 28rpx;
  border: 2rpx solid rgba(156,60,98,0.12);
  box-shadow: 0 4px 20rpx rgba(156,60,98,0.06);
}
.ai-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; }
.ai-title { font-size: 24rpx; font-weight: 700; color: #9c3c62; letter-spacing: 4rpx; }
.ai-refresh-btn { padding: 6rpx 0; }
.ai-refresh-text { font-size: 22rpx; letter-spacing: 1rpx; }
.refresh-done { color: rgba(74,48,115,0.25); }
.refresh-ready { color: #9c3c62; }

.ai-loading-row { display: flex; align-items: center; gap: 20rpx; padding: 16rpx 0; }
.ai-spinner {
  width: 36rpx;
  height: 36rpx;
  border: 3rpx solid rgba(156,60,98,0.15);
  border-top-color: #9c3c62;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
.ai-loading-text { font-size: 24rpx; color: rgba(74,48,115,0.4); }

.ai-text { display: block; font-size: 28rpx; color: #33185c; line-height: 2; letter-spacing: 1rpx; }

.ai-error-row { display: flex; align-items: center; gap: 20rpx; }
.ai-error-text { font-size: 24rpx; color: rgba(74,48,115,0.4); }
.ai-retry { font-size: 24rpx; color: #9c3c62; }

.ai-hint {
  background: rgba(156,60,98,0.04);
  border-radius: 28rpx;
  padding: 32rpx 36rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border: 2rpx dashed rgba(156,60,98,0.15);
}
.ai-hint-icon { font-size: 24rpx; color: rgba(156,60,98,0.3); flex-shrink: 0; }
.ai-hint-text { font-size: 24rpx; color: rgba(156,60,98,0.55); letter-spacing: 1rpx; }

/* Detail section */
.detail-section { padding: 0 32rpx; }
.detail-title { display: block; font-size: 20rpx; letter-spacing: 6rpx; color: rgba(74,48,115,0.4); text-transform: uppercase; margin-bottom: 20rpx; }

.axis-card {
  background: #fff;
  border-radius: 24rpx;
  border: 2rpx solid rgba(74,48,115,0.08);
  overflow: hidden;
  margin-bottom: 16rpx;
}
.axis-header { display: flex; align-items: center; gap: 20rpx; padding: 28rpx 28rpx; }
.axis-dot { width: 12rpx; height: 12rpx; border-radius: 50%; flex-shrink: 0; }
.axis-meta { flex: 1; display: flex; align-items: baseline; gap: 10rpx; }
.axis-name { font-size: 28rpx; font-weight: 700; color: #33185c; }
.axis-name-en { font-size: 20rpx; color: rgba(74,48,115,0.35); font-style: italic; }
.axis-count { font-size: 22rpx; color: rgba(74,48,115,0.4); margin-right: 8rpx; }
.axis-chevron { font-size: 32rpx; color: rgba(74,48,115,0.4); font-weight: 300; flex-shrink: 0; }

.axis-body { padding: 0 28rpx 16rpx; border-top: 2rpx solid rgba(74,48,115,0.06); }

.test-item { padding: 24rpx 0; border-bottom: 2rpx solid rgba(74,48,115,0.05); }
.test-item:last-child { border-bottom: none; }

/* Completed test */
.done-head { margin-bottom: 16rpx; }
.done-label { display: block; font-size: 28rpx; font-weight: 700; color: #33185c; margin-bottom: 4rpx; }
.done-title { display: block; font-size: 20rpx; color: rgba(74,48,115,0.4); letter-spacing: 1rpx; }

.score-rows { display: flex; flex-direction: column; gap: 12rpx; }
.score-row { display: flex; align-items: center; gap: 16rpx; }
.score-lbl { font-size: 20rpx; color: #aaa; width: 72rpx; flex-shrink: 0; }
.bar-bg { flex: 1; height: 6rpx; background: rgba(74,48,115,0.08); border-radius: 4rpx; overflow: hidden; }
.bar-fill { height: 6rpx; border-radius: 4rpx; transition: width 0.4s ease; }
.score-val { font-size: 20rpx; color: rgba(74,48,115,0.5); width: 64rpx; text-align: right; flex-shrink: 0; }

/* Todo test */
.test-todo { display: flex; align-items: center; gap: 16rpx; }
.test-soon { display: flex; align-items: center; gap: 16rpx; opacity: 0.5; }
.todo-info { flex: 1; }
.todo-name { display: block; font-size: 26rpx; color: #33185c; margin-bottom: 6rpx; }
.todo-sub { display: block; font-size: 21rpx; color: #8b8279; line-height: 1.5; }
.todo-arrow { font-size: 26rpx; color: #4A3073; opacity: 0.55; flex-shrink: 0; }
.soon-badge { font-size: 18rpx; padding: 6rpx 16rpx; background: rgba(30,22,40,0.05); color: rgba(30,22,40,0.35); border-radius: 999rpx; flex-shrink: 0; }

.axis-empty { padding: 24rpx 0; }
.axis-empty-text { font-size: 24rpx; color: rgba(74,48,115,0.3); }
</style>
