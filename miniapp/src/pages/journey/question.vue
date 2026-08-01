<template>
  <view class="page">
    <view v-if="!savedReflection" class="question-view">
      <view class="intro">
        <text class="eyebrow">INNER QUESTION · 内在一问</text>
        <text class="intro-title">每次只问一个问题。</text>
        <text class="intro-sub">不必答得漂亮。写下一句真实的话，就已经足够。</text>
      </view>

      <view v-if="prompt" class="question-card">
        <view class="question-glow" :style="{ background: themeMeta.color }"></view>
        <view class="question-head">
          <text class="theme-pill" :style="{ color: themeMeta.color, borderColor: themeMeta.color }">
            关于{{ themeMeta.label }}
          </text>
          <view class="change-btn" @tap="changeQuestion">
            <text class="change-text">换一题 ↻</text>
          </view>
        </view>
        <text v-if="prompt.recommendationReason" class="question-basis">{{ prompt.recommendationReason }}</text>
        <text class="question-number">QUESTION {{ String(reflections.length + 1).padStart(2, '0') }}</text>
        <text class="question-text">{{ prompt.question }}</text>

        <view v-if="prompt.type === 'choice'" class="choice-list">
          <view
            v-for="option in prompt.options"
            :key="option"
            :class="['choice-item', selectedOptions.includes(option) ? 'choice-item--active' : '']"
            @tap="toggleOption(option)"
          >
            <text :class="['choice-mark', selectedOptions.includes(option) ? 'choice-mark--active' : '']">
              {{ selectedOptions.includes(option) ? '✓' : '' }}
            </text>
            <text :class="['choice-label', selectedOptions.includes(option) ? 'choice-label--active' : '']">{{ option }}</text>
          </view>
          <text class="choice-tip">最多选择 {{ prompt.maxSelect || 1 }} 项</text>
        </view>

        <view class="answer-wrap">
          <textarea
            v-model="answerText"
            class="answer-input"
            maxlength="500"
            :placeholder="prompt.placeholder"
            placeholder-class="answer-placeholder"
          />
          <text class="answer-count">{{ answerText.length }}/500</text>
        </view>
      </view>

      <view :class="['save-btn', canSave && !saving ? '' : 'save-btn--disabled']" @tap="saveAnswer">
        <text class="save-text">{{ saving ? '正在收好…' : '收进我的内在档案' }}</text>
      </view>
      <text class="save-tip">未开启同步时只保存在本机；没有任何答案是心理诊断。</text>
    </view>

    <view v-else class="saved-view">
      <view class="saved-head">
        <view class="saved-check"><text>✓</text></view>
        <text class="saved-eyebrow">ANSWER KEPT · 已收进内在档案</text>
        <text class="saved-title">谢谢你没有敷衍自己。</text>
        <text class="saved-sub">这一句回答，会成为以后回看自己的一个坐标。</text>
      </view>

      <view class="answer-card">
        <text class="answer-theme" :style="{ color: savedThemeMeta.color }">关于{{ savedThemeMeta.label }}</text>
        <text class="answer-question">{{ savedReflection.question }}</text>
        <view class="answer-divider"></view>
        <text class="answer-copy">{{ savedAnswer }}</text>
      </view>

      <view v-if="recommendation" class="recommend-card" @tap="goStory">
        <image :src="recommendation.story.cover" class="recommend-cover" mode="aspectFill" />
        <view class="recommend-body">
          <text class="recommend-eyebrow">A STORY FOR YOUR ANSWER</text>
          <text class="recommend-title">{{ recommendation.story.title }}</text>
          <text class="recommend-meta">{{ recommendation.story.name }}的故事 · {{ recommendation.story.readTime }}</text>
          <text class="recommend-reason">{{ recommendation.reason }}</text>
          <text class="recommend-link">去读她的故事 →</text>
        </view>
      </view>

      <view class="saved-actions">
        <view class="archive-btn" @tap="goArchive"><text>查看我的内在档案</text></view>
        <view class="home-btn" @tap="goHome"><text>先回到首页</text></view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAssessmentInsightContext } from '@/utils/insights.js'
import { getInitialStories, loadStoryCatalog } from '@/utils/stories.js'
import {
  formatReflectionAnswer,
  getReflectionStoryRecommendation,
  getThemeMeta,
  selectNextPrompt,
} from '@/utils/reflections.js'
import {
  getLatestReflection,
  getReadStoryIds,
  getReflections,
  recordReflection,
} from '@/utils/user.js'

export default {
  data() {
    return {
      reflections: [],
      skippedPromptIds: [],
      prompt: null,
      selectedOptions: [],
      answerText: '',
      saving: false,
      savedReflection: null,
      recommendation: null,
      assessmentContext: null,
      stories: getInitialStories(),
    }
  },
  computed: {
    themeMeta() {
      return getThemeMeta(this.prompt && this.prompt.theme)
    },
    savedThemeMeta() {
      return getThemeMeta(this.savedReflection && this.savedReflection.theme)
    },
    savedAnswer() {
      return formatReflectionAnswer(this.savedReflection)
    },
    canSave() {
      if (!this.prompt) return false
      return !!this.answerText.trim() || this.selectedOptions.length > 0
    },
  },
  onLoad() {
    this.reflections = getReflections()
    this.assessmentContext = getAssessmentInsightContext()
    this.prompt = selectNextPrompt(this.reflections, [], this.assessmentContext)
    this.refreshStories()
  },
  methods: {
    async refreshStories() {
      const latest = await loadStoryCatalog()
      if (latest && latest.length) this.stories = latest
    },
    changeQuestion() {
      if (!this.prompt) return
      this.skippedPromptIds.push(this.prompt.id)
      this.prompt = selectNextPrompt(this.reflections, this.skippedPromptIds, this.assessmentContext)
      this.selectedOptions = []
      this.answerText = ''
    },
    toggleOption(option) {
      if (!this.prompt) return
      if (this.selectedOptions.includes(option)) {
        this.selectedOptions = this.selectedOptions.filter(item => item !== option)
        return
      }
      const max = Number(this.prompt.maxSelect) || 1
      if (this.selectedOptions.length >= max) {
        if (max === 1) this.selectedOptions = [option]
        else uni.showToast({ title: `最多选择 ${max} 项`, icon: 'none' })
        return
      }
      this.selectedOptions = [...this.selectedOptions, option]
    },
    async saveAnswer() {
      if (!this.canSave || this.saving) {
        if (!this.canSave) uni.showToast({ title: '先留下一点真实的回答', icon: 'none' })
        return
      }
      this.saving = true
      let synced = true
      try {
        await recordReflection({
          promptId: this.prompt.id,
          theme: this.prompt.theme,
          question: this.prompt.question,
          answerText: this.answerText,
          selectedOptions: this.selectedOptions,
        })
      } catch (error) {
        console.error('[reflection] cloud sync failed', error)
        synced = false
      } finally {
        this.saving = false
      }
      this.reflections = getReflections()
      this.savedReflection = getLatestReflection()
      this.recommendation = getReflectionStoryRecommendation(
        this.stories,
        this.reflections,
        getReadStoryIds(),
        this.assessmentContext,
      )
      uni.showToast({
        title: synced ? '回答已收好' : '已保存在本机',
        icon: 'success',
      })
    },
    goStory() {
      if (!this.recommendation) return
      uni.navigateTo({ url: `/pages/stories/detail?id=${this.recommendation.story.id}` })
    },
    goArchive() {
      uni.navigateTo({ url: '/pages/map/index' })
    },
    goHome() {
      uni.switchTab({ url: '/pages/index/index' })
    },
  },
}
</script>

<style scoped>
.page { min-height: 100vh; box-sizing: border-box; padding: 56rpx 32rpx 120rpx; background: #faf7f4; }
.intro { padding: 10rpx 8rpx 38rpx; }
.eyebrow { display: block; font-size: 18rpx; font-weight: 700; color: #9c3c62; letter-spacing: 5rpx; }
.intro-title { display: block; margin-top: 20rpx; font-size: 43rpx; font-weight: 700; color: #33185c; }
.intro-sub { display: block; margin-top: 14rpx; font-size: 24rpx; color: rgba(51,24,92,0.5); line-height: 1.75; }
.question-card { position: relative; overflow: hidden; box-sizing: border-box; padding: 36rpx 32rpx 30rpx; border: 2rpx solid rgba(74,48,115,0.08); border-radius: 30rpx; background: #fff; box-shadow: 0 8rpx 36rpx rgba(51,24,92,0.055); }
.question-glow { position: absolute; top: -160rpx; right: -130rpx; width: 340rpx; height: 340rpx; border-radius: 50%; opacity: 0.08; }
.question-head { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
.question-basis { position: relative; display: block; margin-top: 24rpx; padding: 17rpx 20rpx; border-radius: 16rpx; background: rgba(156,60,98,0.055); font-size: 19rpx; color: rgba(110,41,75,0.62); line-height: 1.6; }
.theme-pill { padding: 8rpx 18rpx; border: 2rpx solid; border-radius: 999rpx; font-size: 19rpx; font-weight: 700; letter-spacing: 2rpx; }
.change-btn { padding: 10rpx 0 10rpx 20rpx; }
.change-text { font-size: 21rpx; color: rgba(74,48,115,0.48); }
.question-number { position: relative; display: block; margin-top: 44rpx; font-size: 17rpx; color: rgba(74,48,115,0.25); letter-spacing: 4rpx; }
.question-text { position: relative; display: block; margin-top: 18rpx; font-size: 38rpx; font-weight: 700; color: #291346; line-height: 1.6; }
.choice-list { display: flex; flex-direction: column; gap: 14rpx; margin-top: 34rpx; }
.choice-item { display: flex; align-items: center; gap: 18rpx; padding: 21rpx 22rpx; border: 2rpx solid rgba(74,48,115,0.08); border-radius: 18rpx; background: #faf8fa; }
.choice-item--active { border-color: rgba(156,60,98,0.45); background: rgba(156,60,98,0.06); }
.choice-mark { width: 34rpx; height: 34rpx; border: 2rpx solid rgba(74,48,115,0.18); border-radius: 50%; color: transparent; font-size: 19rpx; line-height: 34rpx; text-align: center; flex-shrink: 0; }
.choice-mark--active { border-color: #9c3c62; background: #9c3c62; color: #fff; }
.choice-label { font-size: 25rpx; color: rgba(51,24,92,0.62); }
.choice-label--active { color: #6e294b; font-weight: 600; }
.choice-tip { margin-top: 2rpx; font-size: 18rpx; color: rgba(74,48,115,0.28); text-align: right; }
.answer-wrap { margin-top: 32rpx; }
.answer-input { box-sizing: border-box; width: 100%; height: 250rpx; padding: 26rpx; border-radius: 20rpx; background: #f8f5f7; font-size: 26rpx; color: #33185c; line-height: 1.75; }
.answer-placeholder { color: rgba(51,24,92,0.28); }
.answer-count { display: block; margin-top: 12rpx; font-size: 18rpx; color: rgba(51,24,92,0.25); text-align: right; }
.save-btn { margin-top: 30rpx; padding: 30rpx; border-radius: 999rpx; background: #33185c; text-align: center; box-shadow: 0 12rpx 30rpx rgba(51,24,92,0.16); }
.save-btn--disabled { opacity: 0.35; box-shadow: none; }
.save-text { font-size: 28rpx; font-weight: 700; color: #fff; letter-spacing: 2rpx; }
.save-tip { display: block; margin: 18rpx 24rpx 0; font-size: 19rpx; color: rgba(51,24,92,0.3); line-height: 1.6; text-align: center; }
.saved-head { display: flex; flex-direction: column; align-items: center; padding: 24rpx 18rpx 42rpx; text-align: center; }
.saved-check { width: 70rpx; height: 70rpx; border-radius: 50%; background: #3fa882; color: #fff; font-size: 34rpx; line-height: 70rpx; }
.saved-eyebrow { display: block; margin-top: 24rpx; font-size: 17rpx; font-weight: 700; color: #3fa882; letter-spacing: 4rpx; }
.saved-title { display: block; margin-top: 18rpx; font-size: 40rpx; font-weight: 700; color: #33185c; }
.saved-sub { display: block; margin-top: 12rpx; font-size: 23rpx; color: rgba(51,24,92,0.46); line-height: 1.7; }
.answer-card { padding: 36rpx 34rpx; border-radius: 28rpx; background: #fff; border: 2rpx solid rgba(74,48,115,0.08); }
.answer-theme { display: block; font-size: 19rpx; font-weight: 700; letter-spacing: 3rpx; }
.answer-question { display: block; margin-top: 18rpx; font-size: 29rpx; font-weight: 700; color: #33185c; line-height: 1.65; }
.answer-divider { height: 2rpx; margin: 26rpx 0; background: rgba(74,48,115,0.07); }
.answer-copy { display: block; font-size: 26rpx; color: #513c68; line-height: 1.85; white-space: pre-wrap; }
.recommend-card { overflow: hidden; margin-top: 24rpx; border-radius: 28rpx; background: #1a0f2e; }
.recommend-cover { width: 100%; height: 300rpx; opacity: 0.84; }
.recommend-body { padding: 30rpx 32rpx 34rpx; }
.recommend-eyebrow { display: block; font-size: 17rpx; color: rgba(255,255,255,0.42); letter-spacing: 4rpx; }
.recommend-title { display: block; margin-top: 13rpx; font-size: 34rpx; font-weight: 700; color: #fff; }
.recommend-meta { display: block; margin-top: 7rpx; font-size: 20rpx; color: rgba(255,255,255,0.42); }
.recommend-reason { display: block; margin-top: 14rpx; font-size: 22rpx; color: rgba(255,255,255,0.62); line-height: 1.7; }
.recommend-link { display: block; margin-top: 20rpx; font-size: 22rpx; color: #e0b5c5; }
.saved-actions { margin-top: 28rpx; }
.archive-btn { padding: 28rpx; border-radius: 999rpx; background: #33185c; color: #fff; font-size: 27rpx; font-weight: 700; text-align: center; }
.home-btn { margin-top: 12rpx; padding: 22rpx; color: rgba(51,24,92,0.48); font-size: 23rpx; text-align: center; }
</style>
