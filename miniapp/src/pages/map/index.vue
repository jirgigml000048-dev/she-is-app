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
          <view class="center-count-row">
            <text class="center-num">{{ totalCompleted }}</text>
            <text class="center-sep"> / </text>
            <text class="center-total">{{ totalTests }}</text>
          </view>
          <text class="center-label">已完成测评</text>
          <view class="center-progress">
            <view class="center-progress-fill" :style="{ width: completionPct + '%' }"></view>
          </view>
          <text class="center-hint">{{ completionHint }}</text>
        </view>
      </view>
    </view>

    <!-- Cross-assessment insights -->
    <view v-if="combinationInsights.length" class="combo-section">
      <view class="combo-head">
        <text class="combo-eyebrow">CROSS-ASSESSMENT · 组合洞察</text>
        <text class="combo-title">把几份结果连起来看</text>
        <text class="combo-caption">一份测评只看到一个角度。放在一起，才更容易看懂你为什么会在某些时候一边这样想，一边那样做。</text>
      </view>
      <view class="combo-list">
        <view v-for="(insight, index) in combinationInsights" :key="insight.id" class="combo-card">
          <view class="combo-card-top">
            <text class="combo-index">0{{ index + 1 }}</text>
            <text class="combo-card-title">{{ insight.title }}</text>
          </view>
          <text class="combo-text">{{ insight.text }}</text>
          <view class="combo-evidence">
            <text class="combo-evidence-label">来自</text>
            <text v-for="item in insight.evidence" :key="item" class="combo-evidence-pill">{{ item }}</text>
          </view>
        </view>
      </view>
      <text class="combo-boundary">这里只是帮你多看一眼，不替你下结论，也不作心理诊断。组合计算只在本机完成。</text>
    </view>

    <!-- AI portrait section -->
    <view class="ai-section">
      <view class="section-heading">
        <view>
          <text class="section-eyebrow section-eyebrow--ai">PORTRAIT · 内在画像</text>
          <text class="section-caption">把你做过的测评，连成一段话</text>
        </view>
      </view>
      <view v-if="totalCompleted >= 2 || aiPortrait !== null" class="ai-card">
        <view class="ai-header-row">
          <text class="ai-title">✦ 你的解读</text>
          <view v-if="!aiLoading && aiPortrait" @tap="refreshAI" class="ai-refresh-btn">
            <text :class="['ai-refresh-text', aiUpToDate ? 'refresh-done' : 'refresh-ready']">
              {{ aiUpToDate ? '已是最新' : '重新解读 ↺' }}
            </text>
          </view>
        </view>
        <view v-if="aiLoading" class="ai-loading-row">
          <view class="ai-spinner"></view>
          <text class="ai-loading-text">正在生成你的内在画像…</text>
        </view>
        <view v-else-if="aiConsentNeeded" class="ai-consent">
          <text class="ai-consent-text">生成时会将测评名称、结果标签和分数发送给 DeepSeek；不会发送昵称、微信身份或原始答案。</text>
          <view class="ai-consent-btn" @tap="requestAIPortrait">
            <text class="ai-consent-btn-text">同意并生成画像</text>
          </view>
        </view>
        <view v-else-if="aiPortrait" class="ai-content">
          <view class="ai-paragraph-list">
            <view
              v-for="(paragraph, index) in visibleAIPortraitParagraphs"
              :key="index"
              :class="['ai-paragraph', paragraph.isQuestion ? 'ai-question' : '']"
            >
              <text v-if="paragraph.isQuestion" class="ai-question-label">留给此刻的你</text>
              <text :class="paragraph.isQuestion ? 'ai-question-text' : 'ai-paragraph-text'">
                {{ paragraph.text }}
              </text>
            </view>
          </view>
          <view v-if="aiPortraitHasMore" class="ai-expand-btn" @tap="toggleAIPortrait">
            <text class="ai-expand-text">{{ aiExpanded ? '收起内容' : '展开完整解读' }}</text>
            <text :class="['ai-expand-arrow', aiExpanded ? 'arrow-up' : '']">⌄</text>
          </view>
        </view>
        <view v-else class="ai-error-row">
          <text class="ai-error-text">{{ aiError || '解读生成失败' }}</text>
          <text v-if="aiCanRetry" class="ai-retry" @tap="refreshAI">重试</text>
        </view>
      </view>
      <view v-else class="ai-hint">
        <text class="ai-hint-icon">✦</text>
        <text class="ai-hint-text">再完成 {{ 2 - totalCompleted }} 项测评，解锁 AI 内在画像</text>
      </view>
    </view>

    <!-- Inner answer archive -->
    <view class="archive-section">
      <view class="archive-section-head">
        <view>
          <text class="archive-eyebrow">INNER ARCHIVE · 内在档案</text>
          <text class="archive-caption">你写过的答案，都留在这里</text>
        </view>
        <text class="archive-action" @tap="goQuestion">再答一问 →</text>
      </view>

      <view v-if="latestReflection" class="archive-card">
        <view class="latest-head">
          <view>
            <text class="latest-label">最近一次回答</text>
            <text class="latest-theme" :style="{ color: themeMeta(latestReflection.theme).color }">
              关于{{ themeMeta(latestReflection.theme).label }}
            </text>
          </view>
          <text class="latest-date">{{ formatReflectionDate(latestReflection.createdAt) }}</text>
        </view>
        <text class="latest-question">{{ latestReflection.question }}</text>
        <view class="latest-answer-wrap">
          <text class="latest-answer">{{ reflectionAnswer(latestReflection) }}</text>
        </view>

        <view class="pattern-block">
          <text class="pattern-title">你最近常写到</text>
          <text class="pattern-summary">{{ patternSummary }}</text>
          <view class="pattern-pills">
            <view
              v-for="pattern in patterns.slice(0, 4)"
              :key="pattern.theme"
              class="pattern-pill"
              :style="{ borderColor: pattern.color }"
            >
              <text class="pattern-name" :style="{ color: pattern.color }">{{ pattern.label }}</text>
              <text class="pattern-count">{{ pattern.count }}</text>
            </view>
          </view>
        </view>

        <view v-if="reflections.length > 1" class="older-list">
          <text class="older-title">更早的回答</text>
          <view v-for="item in reflections.slice(1, 4)" :key="item.id" class="older-item">
            <view class="older-dot" :style="{ background: themeMeta(item.theme).color }"></view>
            <view class="older-copy">
              <text class="older-question">{{ item.question }}</text>
              <text class="older-answer">{{ reflectionAnswer(item) }}</text>
            </view>
            <text class="older-date">{{ formatReflectionDate(item.createdAt) }}</text>
          </view>
        </view>
      </view>

      <view v-else class="archive-empty" @tap="goQuestion">
        <text class="archive-empty-title">你的内在档案还没有第一句话</text>
        <text class="archive-empty-sub">每次答一个问题。多写几次，就能回头看看自己最近都在想什么。</text>
        <text class="archive-empty-link">回答第一问 →</text>
      </view>

      <view v-if="recommendation" class="archive-story" @tap="goRecommendedStory">
        <image :src="recommendation.story.cover" class="archive-story-cover" mode="aspectFill" />
        <view class="archive-story-body">
          <text class="archive-story-eyebrow">这篇故事可能适合现在的你</text>
          <text class="archive-story-title">{{ recommendation.story.title }}</text>
          <text class="archive-story-reason">{{ recommendation.reason }}</text>
          <text class="archive-story-link">去读她的故事 →</text>
        </view>
      </view>
    </view>

    <!-- Detail section -->
    <view class="detail-section">
      <view class="detail-section-head">
        <view>
          <text class="detail-title">ASSESSMENT RECORD · 测评记录</text>
          <text class="detail-caption">展开看结果，也可以继续没做完的测评</text>
        </view>
      </view>

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
            v-for="item in axis.doneItems"
            :key="item.id"
            class="test-item test-done"
            @tap="openResult(item)"
          >
            <view class="done-head">
              <view class="done-copy">
                <text class="done-label">{{ item.resultLabel || '已完成' }}</text>
                <text class="done-title">{{ item.title }}</text>
              </view>
              <text class="done-link">查看结果 →</text>
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
            v-for="item in axis.todoItems"
            :key="item.id"
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
import { getAssessmentInsightContext } from '@/utils/insights.js'
import { getInitialStories, loadStoryCatalog } from '@/utils/stories.js'
import {
  formatReflectionAnswer,
  getPatternSummary,
  getReflectionPatterns,
  getReflectionStoryRecommendation,
  getThemeMeta,
} from '@/utils/reflections.js'
import { getReadStoryIds, getReflections } from '@/utils/user.js'

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
      aiError: '',
      aiCanRetry: false,
      aiConsentNeeded: false,
      aiExpanded: true,
      reflections: [],
      latestReflection: null,
      patterns: [],
      patternSummary: '',
      recommendation: null,
      assessmentContext: null,
      combinationInsights: [],
      stories: getInitialStories(),
    }
  },
  computed: {
    totalCompleted() {
      return this.axisData.reduce((sum, a) => sum + a.completed, 0)
    },
    totalTests() {
      return this.axisData.reduce((sum, a) => sum + a.total, 0)
    },
    completionPct() {
      if (!this.totalTests) return 0
      return Math.round((this.totalCompleted / this.totalTests) * 100)
    },
    completionHint() {
      if (!this.totalCompleted) return '完成第一份，四条轴线就会开始显现'
      if (this.totalCompleted >= this.totalTests) return '你的四条轴线已经完整显现'
      if (this.totalCompleted < 2) return '再完成一份，就能开始组合解读'
      return '每完成一份，图谱都会更清楚'
    },
    completedTestIds() {
      const ids = []
      this.axisData.forEach(a => (a.items || []).forEach(i => { if (i.done) ids.push(i.id) }))
      return ids
    },
    aiPortraitParagraphs() {
      return this.formatPortraitParagraphs(this.aiPortrait)
    },
    visibleAIPortraitParagraphs() {
      if (this.aiExpanded || this.aiPortraitParagraphs.length <= 2) return this.aiPortraitParagraphs
      return this.aiPortraitParagraphs.slice(0, 2)
    },
    aiPortraitHasMore() {
      return this.aiPortraitParagraphs.length > 2
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
            if (!t) return { id: testId, title: testId, subtitle: '', done: false, resultKey: '', resultLabel: '', scores: [] }
            let answers = []
            try { answers = uni.getStorageSync(`test-answers-${testId}`) || [] } catch (e) { answers = [] }
            const done = Array.isArray(answers) && answers.length > 0
            let resultKey = '', resultLabel = '', scores = []
            try {
              if (done && typeof t.computeScores === 'function') scores = t.computeScores(answers) || []
            } catch (e) { scores = [] }
            try {
              if (done && typeof t.score === 'function') {
                resultKey = String(t.score(answers) || '')
                resultLabel = (t.results && t.results[resultKey] && t.results[resultKey].label) || ''
              }
            } catch (e) { resultKey = ''; resultLabel = '' }
            return { id: t.id, title: t.title, subtitle: t.subtitle, done, resultKey, resultLabel, scores }
          })
          const doneItems = items.filter(i => i.done)
          const todoItems = items.filter(i => !i.done)
          return {
            ...axis,
            items,
            doneItems,
            todoItems,
            completed: doneItems.length,
            total: items.length,
          }
        })
      } catch (e) {
        console.error('[map] loadData error', e)
        this.axisData = []
      }
      this.assessmentContext = getAssessmentInsightContext()
      this.combinationInsights = this.assessmentContext.insights || []
      this.loadArchive()
      this.refreshStories()
      this.checkAIPortrait()
    },
    async refreshStories() {
      const latest = await loadStoryCatalog()
      if (!latest || !latest.length) return
      this.stories = latest
      this.loadArchive()
    },
    loadArchive() {
      this.reflections = getReflections()
      this.latestReflection = this.reflections[0] || null
      this.patterns = getReflectionPatterns(this.reflections)
      this.patternSummary = getPatternSummary(this.reflections)
      this.recommendation = this.reflections.length
        ? getReflectionStoryRecommendation(this.stories, this.reflections, getReadStoryIds(), this.assessmentContext)
        : getReflectionStoryRecommendation(this.stories, [], getReadStoryIds(), this.assessmentContext)
    },
    themeMeta(theme) {
      return getThemeMeta(theme)
    },
    reflectionAnswer(reflection) {
      return formatReflectionAnswer(reflection)
    },
    formatReflectionDate(timestamp) {
      const date = new Date(Number(timestamp) || Date.now())
      return `${date.getMonth() + 1}.${date.getDate()}`
    },
    goQuestion() {
      uni.navigateTo({ url: '/pages/journey/question' })
    },
    goRecommendedStory() {
      if (!this.recommendation) return
      uni.navigateTo({ url: `/pages/stories/detail?id=${this.recommendation.story.id}` })
    },
    checkAIPortrait() {
      const completedResults = this.buildPortraitResults()
      if (completedResults.length < 2) {
        this.aiPortrait = null
        this.aiError = ''
        this.aiConsentNeeded = false
        return
      }
      let cached = null
      try { cached = uni.getStorageSync('ai-portrait-v1') } catch (e) { cached = null }
      const inputKey = JSON.stringify(completedResults)
      if (cached && cached.text && cached.inputKey === inputKey) {
        this.aiPortrait = cached.text
        this.aiExpanded = true
        this.aiUpToDate = true
        this.aiError = ''
        this.aiConsentNeeded = false
      } else {
        this.aiUpToDate = false
        this.aiPortrait = ''
        this.aiError = ''
        this.aiConsentNeeded = true
      }
    },
    requestAIPortrait() {
      this.aiConsentNeeded = false
      this.fetchAIPortrait(false)
    },
    refreshAI() {
      if (this.aiLoading) return
      this.aiUpToDate = false
      this.fetchAIPortrait(true)
    },
    buildPortraitResults() {
      const results = []
      this.axisData.forEach(axis => (axis.items || []).forEach(item => {
        if (!item.done) return
        results.push({
          id: item.id,
          axisName: axis.name,
          testTitle: item.title,
          resultLabel: item.resultLabel || '已完成',
          scores: (item.scores || []).map(score => `${score.label}:${score.pct}%`),
        })
      }))
      return results
    },
    fetchAIPortrait(force = false, preparedResults = null) {
      const completedResults = preparedResults || this.buildPortraitResults()
      if (completedResults.length < 2 || this.aiLoading) return

      const inputKey = JSON.stringify(completedResults)
      this.aiLoading = true
      this.aiPortrait = null
      this.aiError = ''
      this.aiCanRetry = false
      this.aiConsentNeeded = false

      // #ifdef MP-WEIXIN
      wx.cloud.callFunction({
        name: 'generatePortrait',
        // 仅发送去标识化的结果摘要；不发送昵称、OpenID 或原始答案。
        data: { completedResults, force },
        success: response => {
          const result = response && response.result
          if (result && result.success && result.text) {
            this.aiPortrait = result.text
            this.aiExpanded = true
            this.aiUpToDate = true
            uni.setStorageSync('ai-portrait-v1', {
              text: result.text,
              inputKey,
              fingerprint: result.fingerprint || '',
            })
            return
          }
          this.aiPortrait = ''
          this.aiError = (result && result.message) || '解读生成失败'
          this.aiCanRetry = !result || result.code !== 'AI_NOT_CONFIGURED'
        },
        fail: () => {
          this.aiPortrait = ''
          this.aiError = '网络开小差了，请稍后再试'
          this.aiCanRetry = true
        },
        complete: () => { this.aiLoading = false },
      })
      // #endif
      // #ifndef MP-WEIXIN
      this.aiPortrait = ''
      this.aiError = 'AI 解读仅在微信小程序中提供'
      this.aiLoading = false
      // #endif
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
    openResult(item) {
      if (!item || !item.id || !item.resultKey) return
      uni.navigateTo({
        url: `/pages/assessment/result?id=${item.id}&result=${encodeURIComponent(item.resultKey)}`,
      })
    },
    toggleAIPortrait() {
      this.aiExpanded = !this.aiExpanded
    },
    formatPortraitParagraphs(value) {
      if (typeof value !== 'string' || !value.trim()) return []

      const cleaned = value
        .replace(/\*\*/g, '')
        .replace(/[*_`#]/g, '')
        .replace(/^\s*[-•]\s*/gm, '')
        .replace(/\r/g, '')
        .trim()

      const lines = cleaned
        .split(/\n+/)
        .map(line => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
      const paragraphs = []

      lines.forEach(line => {
        const sentences = line.match(/[^。！？!?]+[。！？!?]?/g) || [line]
        let current = ''
        sentences.forEach(sentence => {
          const text = sentence.trim()
          if (!text) return
          const isQuestion = /[？?]$/.test(text)
          if (isQuestion) {
            if (current) paragraphs.push(current)
            paragraphs.push(text)
            current = ''
            return
          }
          if (current && current.length + text.length > 92) {
            paragraphs.push(current)
            current = text
          } else {
            current += text
          }
        })
        if (current) paragraphs.push(current)
      })

      return paragraphs.map((text, index) => ({
        text,
        isQuestion: index === paragraphs.length - 1 && /[？?]$/.test(text),
      }))
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
.viz-wrap { padding: 0 32rpx; margin-bottom: 32rpx; }
.viz-bg {
  width: 100%;
  height: 286rpx;
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
  width: 330rpx;
  height: 330rpx;
  border-radius: 50%;
}
.blob-trait {
  background: radial-gradient(circle at center, #7c5cbf 0%, rgba(124,92,191,0.5) 35%, transparent 70%);
  top: -92rpx;
  left: -82rpx;
}
.blob-emotion {
  background: radial-gradient(circle at center, #d4607e 0%, rgba(212,96,126,0.5) 35%, transparent 70%);
  top: -92rpx;
  right: -82rpx;
}
.blob-behavior {
  background: radial-gradient(circle at center, #3fa882 0%, rgba(63,168,130,0.5) 35%, transparent 70%);
  bottom: -92rpx;
  left: -82rpx;
}
.blob-motivation {
  background: radial-gradient(circle at center, #c9a05c 0%, rgba(201,160,92,0.5) 35%, transparent 70%);
  bottom: -92rpx;
  right: -82rpx;
}

.corner-label {
  position: absolute;
  font-size: 20rpx;
  color: rgba(255,255,255,0.55);
  letter-spacing: 2rpx;
}
.corner-tl { top: 20rpx; left: 24rpx; }
.corner-tr { top: 20rpx; right: 24rpx; }
.corner-bl { bottom: 20rpx; left: 24rpx; }
.corner-br { bottom: 20rpx; right: 24rpx; }

.center-badge { display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; }
.center-count-row { display: flex; align-items: baseline; gap: 4rpx; }
.center-num { font-size: 68rpx; font-weight: 800; color: rgba(255,255,255,0.94); line-height: 1; }
.center-sep { font-size: 28rpx; color: rgba(255,255,255,0.3); }
.center-total { font-size: 28rpx; color: rgba(255,255,255,0.45); }
.center-label { margin-top: 8rpx; font-size: 18rpx; color: rgba(255,255,255,0.62); letter-spacing: 3rpx; }
.center-progress { overflow: hidden; width: 218rpx; height: 6rpx; margin-top: 15rpx; border-radius: 999rpx; background: rgba(255,255,255,0.12); }
.center-progress-fill { height: 100%; border-radius: 999rpx; background: linear-gradient(90deg, #b69ce7, #e49ab0); transition: width 0.35s ease; }
.center-hint { margin-top: 12rpx; font-size: 17rpx; color: rgba(255,255,255,0.42); }

/* Cross-assessment insights */
.combo-section { padding: 10rpx 32rpx 0; margin-bottom: 56rpx; }
.combo-head { padding: 0 4rpx; margin-bottom: 24rpx; }
.combo-eyebrow { display: block; font-size: 18rpx; font-weight: 700; color: #9c3c62; letter-spacing: 4rpx; }
.combo-title { display: block; margin-top: 13rpx; font-size: 36rpx; font-weight: 750; color: #33185c; line-height: 1.45; }
.combo-caption { display: block; margin-top: 10rpx; font-size: 21rpx; color: rgba(51,24,92,0.44); line-height: 1.7; }
.combo-list { display: flex; flex-direction: column; gap: 18rpx; }
.combo-card { padding: 32rpx 30rpx; border-radius: 26rpx; background: #fff; border: 2rpx solid rgba(74,48,115,0.085); box-shadow: 0 7rpx 28rpx rgba(51,24,92,0.045); }
.combo-card:first-child { background: linear-gradient(145deg, rgba(156,60,98,0.075), #fff 74%); border-color: rgba(156,60,98,0.14); border-left: 6rpx solid rgba(156,60,98,0.72); box-shadow: 0 8rpx 30rpx rgba(51,24,92,0.055); }
.combo-card-top { display: flex; align-items: flex-start; gap: 18rpx; }
.combo-index { flex-shrink: 0; margin-top: 4rpx; font-size: 18rpx; font-weight: 700; color: #9c3c62; letter-spacing: 2rpx; }
.combo-card-title { flex: 1; font-size: 28rpx; font-weight: 700; color: #33185c; line-height: 1.55; }
.combo-text { display: block; margin-top: 18rpx; font-size: 23rpx; color: rgba(51,24,92,0.62); line-height: 1.82; }
.combo-card:first-child .combo-index { color: #9c3c62; }
.combo-card:first-child .combo-card-title { color: #33185c; }
.combo-card:first-child .combo-text { color: rgba(51,24,92,0.62); }
.combo-evidence { display: flex; flex-wrap: wrap; align-items: center; gap: 9rpx; margin-top: 22rpx; padding-top: 19rpx; border-top: 2rpx solid rgba(74,48,115,0.06); }
.combo-card:first-child .combo-evidence { border-top-color: rgba(156,60,98,0.1); }
.combo-evidence-label { font-size: 17rpx; color: rgba(74,48,115,0.3); }
.combo-evidence-pill { padding: 7rpx 12rpx; border-radius: 999rpx; background: rgba(74,48,115,0.055); font-size: 17rpx; color: rgba(74,48,115,0.52); }
.combo-card:first-child .combo-evidence-label { color: rgba(74,48,115,0.3); }
.combo-card:first-child .combo-evidence-pill { background: rgba(156,60,98,0.065); color: rgba(74,48,115,0.56); }
.combo-boundary { display: block; padding: 18rpx 8rpx 0; font-size: 17rpx; color: rgba(51,24,92,0.28); line-height: 1.65; }

/* Inner answer archive */
.archive-section { padding: 0 32rpx; margin-bottom: 40rpx; }
.archive-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20rpx; margin-bottom: 20rpx; }
.archive-eyebrow { display: block; font-size: 20rpx; font-weight: 700; color: #4a3073; letter-spacing: 4rpx; }
.archive-caption { display: block; margin-top: 8rpx; font-size: 19rpx; color: rgba(74,48,115,0.34); }
.archive-action { flex-shrink: 0; padding: 8rpx 0; font-size: 22rpx; font-weight: 600; color: #9c3c62; }
.archive-card { box-sizing: border-box; padding: 34rpx; border: 2rpx solid rgba(74,48,115,0.08); border-radius: 28rpx; background: #fff; }
.latest-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20rpx; }
.latest-label { display: block; font-size: 18rpx; color: rgba(74,48,115,0.32); letter-spacing: 2rpx; }
.latest-theme { display: block; margin-top: 7rpx; font-size: 21rpx; font-weight: 700; letter-spacing: 2rpx; }
.latest-date { flex-shrink: 0; font-size: 18rpx; color: rgba(74,48,115,0.28); }
.latest-question { display: block; margin-top: 25rpx; font-size: 29rpx; font-weight: 700; color: #33185c; line-height: 1.65; }
.latest-answer-wrap { margin-top: 20rpx; padding: 24rpx; border-radius: 18rpx; background: #faf8fa; }
.latest-answer { display: block; font-size: 24rpx; color: #513c68; line-height: 1.78; white-space: pre-wrap; }
.pattern-block { margin-top: 30rpx; padding-top: 26rpx; border-top: 2rpx solid rgba(74,48,115,0.07); }
.pattern-title { display: block; font-size: 20rpx; font-weight: 700; color: #9c3c62; letter-spacing: 3rpx; }
.pattern-summary { display: block; margin-top: 12rpx; font-size: 22rpx; color: rgba(51,24,92,0.56); line-height: 1.75; }
.pattern-pills { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 20rpx; }
.pattern-pill { display: flex; align-items: center; gap: 8rpx; padding: 9rpx 15rpx; border: 2rpx solid; border-radius: 999rpx; }
.pattern-name { font-size: 19rpx; font-weight: 600; }
.pattern-count { min-width: 28rpx; height: 28rpx; border-radius: 50%; background: rgba(74,48,115,0.07); font-size: 16rpx; color: rgba(74,48,115,0.5); line-height: 28rpx; text-align: center; }
.older-list { margin-top: 30rpx; padding-top: 26rpx; border-top: 2rpx solid rgba(74,48,115,0.07); }
.older-title { display: block; margin-bottom: 6rpx; font-size: 19rpx; color: rgba(74,48,115,0.38); letter-spacing: 2rpx; }
.older-item { display: flex; align-items: flex-start; gap: 15rpx; padding: 22rpx 0; border-bottom: 2rpx solid rgba(74,48,115,0.05); }
.older-item:last-child { border-bottom: none; }
.older-dot { width: 10rpx; height: 10rpx; margin-top: 11rpx; border-radius: 50%; flex-shrink: 0; }
.older-copy { flex: 1; min-width: 0; }
.older-question { display: block; font-size: 21rpx; font-weight: 600; color: #443058; line-height: 1.55; }
.older-answer { display: block; overflow: hidden; margin-top: 7rpx; font-size: 20rpx; color: rgba(74,48,115,0.42); line-height: 1.5; white-space: nowrap; text-overflow: ellipsis; }
.older-date { flex-shrink: 0; font-size: 17rpx; color: rgba(74,48,115,0.25); }
.archive-empty { padding: 38rpx 34rpx; border: 2rpx dashed rgba(156,60,98,0.18); border-radius: 28rpx; background: rgba(156,60,98,0.035); }
.archive-empty-title { display: block; font-size: 28rpx; font-weight: 700; color: #33185c; }
.archive-empty-sub { display: block; margin-top: 12rpx; font-size: 22rpx; color: rgba(51,24,92,0.48); line-height: 1.75; }
.archive-empty-link { display: block; margin-top: 22rpx; font-size: 22rpx; font-weight: 700; color: #9c3c62; }
.archive-story { display: flex; overflow: hidden; min-height: 230rpx; margin-top: 20rpx; border-radius: 24rpx; background: #1a0f2e; }
.archive-story-cover { width: 210rpx; height: 260rpx; flex-shrink: 0; }
.archive-story-body { flex: 1; padding: 26rpx 28rpx; }
.archive-story-eyebrow { display: block; font-size: 17rpx; color: rgba(255,255,255,0.42); letter-spacing: 3rpx; }
.archive-story-title { display: block; margin-top: 11rpx; font-size: 28rpx; font-weight: 700; color: #fff; }
.archive-story-reason { display: block; margin-top: 10rpx; font-size: 20rpx; color: rgba(255,255,255,0.58); line-height: 1.55; }
.archive-story-link { display: block; margin-top: 14rpx; font-size: 20rpx; color: #e0b5c5; }

/* AI section */
.ai-section { padding: 0 32rpx; margin-bottom: 40rpx; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 20rpx; }
.section-eyebrow { display: block; font-size: 20rpx; font-weight: 700; letter-spacing: 4rpx; }
.section-eyebrow--ai { color: #7c5cbf; }
.section-caption { display: block; margin-top: 8rpx; font-size: 19rpx; color: rgba(74,48,115,0.34); }

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

.ai-content { display: flex; flex-direction: column; }
.ai-paragraph-list { display: flex; flex-direction: column; gap: 28rpx; }
.ai-paragraph { display: block; }
.ai-paragraph-text {
  display: block;
  font-size: 27rpx;
  color: #3f2a60;
  line-height: 1.9;
  letter-spacing: 0.5rpx;
  text-align: justify;
}
.ai-question {
  margin-top: 4rpx;
  padding: 26rpx 28rpx;
  border-radius: 20rpx;
  background: rgba(156,60,98,0.055);
  border-left: 5rpx solid rgba(156,60,98,0.45);
}
.ai-question-label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 19rpx;
  color: rgba(156,60,98,0.72);
  letter-spacing: 3rpx;
  font-weight: 600;
}
.ai-question-text {
  display: block;
  font-size: 26rpx;
  color: #56346c;
  line-height: 1.8;
}
.ai-expand-btn {
  margin-top: 30rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid rgba(74,48,115,0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}
.ai-expand-text { font-size: 22rpx; color: #9c3c62; letter-spacing: 1rpx; }
.ai-expand-arrow { font-size: 24rpx; color: #9c3c62; transition: transform 0.2s ease; }
.arrow-up { transform: rotate(180deg); }

.ai-consent { display: flex; flex-direction: column; gap: 24rpx; }
.ai-consent-text { font-size: 23rpx; color: rgba(74,48,115,0.55); line-height: 1.75; }
.ai-consent-btn { padding: 22rpx 28rpx; border-radius: 999rpx; background: #9c3c62; text-align: center; }
.ai-consent-btn-text { font-size: 24rpx; color: #fff; font-weight: 600; letter-spacing: 1rpx; }

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
.detail-section-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 20rpx; }
.detail-title { display: block; font-size: 20rpx; font-weight: 700; letter-spacing: 4rpx; color: #8f6f36; text-transform: uppercase; }
.detail-caption { display: block; margin-top: 8rpx; font-size: 19rpx; color: rgba(74,48,115,0.34); }

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
.done-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20rpx; margin-bottom: 16rpx; }
.done-copy { flex: 1; min-width: 0; }
.done-label { display: block; font-size: 28rpx; font-weight: 700; color: #33185c; margin-bottom: 4rpx; }
.done-title { display: block; font-size: 20rpx; color: rgba(74,48,115,0.4); letter-spacing: 1rpx; }
.done-link { flex-shrink: 0; padding-top: 5rpx; font-size: 20rpx; color: #9c3c62; }

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

/* Clear section boundaries without changing the existing type scale. */
.combo-section,
.ai-section,
.archive-section,
.detail-section {
  box-sizing: border-box;
  margin: 0 24rpx 28rpx;
  padding: 32rpx 24rpx 26rpx;
  border: 2rpx solid rgba(74,48,115,0.07);
  border-top-width: 6rpx;
  border-radius: 32rpx;
  background: rgba(255,255,255,0.7);
  box-shadow: 0 8rpx 30rpx rgba(51,24,92,0.035);
}
.combo-section { border-top-color: rgba(156,60,98,0.48); }
.ai-section { border-top-color: rgba(124,92,191,0.46); }
.archive-section { border-top-color: rgba(63,168,130,0.42); }
.detail-section { border-top-color: rgba(201,160,92,0.48); margin-bottom: 0; }
.combo-head { padding: 0; }
.detail-section .axis-card:last-child { margin-bottom: 0; }
</style>
