<template>
  <view class="page">
    <view class="top-bar">
      <view class="brand">
        <text class="brand-zh">女也</text>
        <text class="brand-en">She Is ______.</text>
      </view>
      <view class="profile-btn" @tap="goProfile">
        <text class="profile-icon">{{ loggedIn ? '●' : '○' }}</text>
        <text class="profile-label">{{ loggedIn ? '我的' : '登录' }}</text>
      </view>
    </view>
    <view class="quote-card">
      <text class="quote-zh">内心的注视是种无畏的爱。</text>
      <text class="quote-en">The inner gaze is a fierce act of love.</text>
    </view>

    <view v-if="recommendation" class="recommend-block">
      <view class="recommend-card" @tap="goRecommendedStory">
        <image :src="recommendation.story.cover" class="recommend-cover" mode="aspectFill" />
        <view class="recommend-overlay"></view>
        <view class="recommend-content">
          <text class="recommend-eyebrow">A STORY FOR YOU · 为你推荐</text>
          <text class="recommend-title">{{ recommendation.story.title }}</text>
          <view class="recommend-meta-row">
            <text class="recommend-name">{{ recommendation.story.name }}的故事 · {{ recommendation.story.readTime }}</text>
            <text class="recommend-read">阅读 →</text>
          </view>
        </view>
      </view>
      <view class="recommend-note" @tap="goRecommendedStory">
        <text class="recommend-note-label">为什么推荐</text>
        <text class="recommend-reason">{{ recommendation.reason }}</text>
      </view>
    </view>

    <view class="section">
      <text class="section-label">100位女孩 · STORIES</text>
      <scroll-view scroll-x class="story-scroll">
        <view class="story-track">
          <view
            v-for="story in homeStories"
            :key="story.id"
            class="mini-card"
            :style="story.homeLayout.cardStyle"
            @tap="goStory(story)"
          >
            <image :src="story.cover" class="mini-cover" :style="story.homeLayout.coverStyle" mode="aspectFill" />
            <view class="mini-info" :style="story.homeLayout.infoStyle">
              <text class="mini-name">{{ story.name }}</text>
              <text class="mini-title" :style="story.homeLayout.titleStyle">{{ story.title }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="see-all" @tap="goStories"><text class="see-all-text">查看全部故事 →</text></view>
    </view>

    <view class="map-card" @tap="goMap">
      <view class="map-blob map-blob-1"></view>
      <view class="map-blob map-blob-2"></view>
      <view class="map-blob map-blob-3"></view>
      <view class="map-blob map-blob-4"></view>
      <view class="map-card-content">
        <text class="map-card-eyebrow">INNER MAP · 内在图谱</text>
        <text class="map-card-title">你的内在画像</text>
        <text class="map-card-sub">4 轴测评 · 内在档案 · AI 解读</text>
      </view>
      <text class="map-card-arrow">→</text>
    </view>

    <view v-if="activePrompt" class="question-card" @tap="goQuestion">
      <view class="question-glow" :style="{ background: activeTheme.color }"></view>
      <view class="question-top">
        <text class="question-eyebrow">INNER QUESTION · 内在一问</text>
        <text class="question-status">第 {{ reflectionCount + 1 }} 问</text>
      </view>
      <text class="question-theme" :style="{ color: activeTheme.color }">关于{{ activeTheme.label }}</text>
      <text class="question-title">{{ activePrompt.question }}</text>
      <view class="question-foot">
        <text class="question-note">{{ activePrompt.recommendationReason || '每次一个不同的问题，也可以换一题' }}</text>
        <text class="question-link">回答 →</text>
      </view>
    </view>

    <view class="footer"><text class="footer-text">女也 She Is · 2026</text></view>
  </view>
</template>

<script>
import { getAssessmentInsightContext } from '@/utils/insights.js'
import { getInitialStories, loadStoryCatalog } from '@/utils/stories.js'
import {
  getReflectionStoryRecommendation,
  getThemeMeta,
  selectNextPrompt,
} from '@/utils/reflections.js'
import {
  getReadStoryIds,
  getReflections,
  isLoggedIn,
} from '@/utils/user.js'
export default {
  data() {
    return {
      stories: getInitialStories(),
      loggedIn: false,
      activePrompt: null,
      activeTheme: getThemeMeta('self'),
      reflectionCount: 0,
      recommendation: null,
      assessmentContext: null,
    }
  },
  onShow() {
    this.refreshHome()
  },
  computed: {
    homeStories() {
      const layouts = [
        { width: 248, top: 56, cover: 220, info: 132, title: 26 },
        { width: 304, top: 0, cover: 246, info: 162, title: 29 },
        { width: 240, top: 40, cover: 224, info: 144, title: 26 },
        { width: 276, top: 14, cover: 236, info: 158, title: 28 },
        { width: 252, top: 54, cover: 218, info: 136, title: 26 },
      ]
      return this.stories.slice(0, 5).map((story, index) => {
        const layout = layouts[index % layouts.length]
        return {
          ...story,
          homeLayout: {
            cardStyle: `width:${layout.width}rpx;margin-top:${layout.top}rpx;`,
            coverStyle: `height:${layout.cover}rpx;`,
            infoStyle: `min-height:${layout.info}rpx;`,
            titleStyle: `font-size:${layout.title}rpx;`,
          },
        }
      })
    },
  },
  methods: {
    async refreshHome() {
      this.loggedIn = isLoggedIn()
      const reflections = getReflections()
      this.assessmentContext = getAssessmentInsightContext()
      this.reflectionCount = reflections.length
      this.activePrompt = selectNextPrompt(reflections, [], this.assessmentContext)
      this.activeTheme = getThemeMeta(this.activePrompt && this.activePrompt.theme)
      this.recommendation = getReflectionStoryRecommendation(
        this.stories,
        reflections,
        getReadStoryIds(),
        this.assessmentContext,
      )
      const latestStories = await loadStoryCatalog()
      if (latestStories && latestStories.length) {
        this.stories = latestStories
        this.recommendation = getReflectionStoryRecommendation(
          this.stories,
          reflections,
          getReadStoryIds(),
          this.assessmentContext,
        )
      }
    },
    goStory(story) { uni.navigateTo({ url: '/pages/stories/detail?id=' + story.id }) },
    goRecommendedStory() {
      if (this.recommendation) this.goStory(this.recommendation.story)
    },
    goStories() { uni.switchTab({ url: '/pages/stories/list' }) },
    goQuestion() { uni.navigateTo({ url: '/pages/journey/question' }) },
    goMap() { uni.navigateTo({ url: '/pages/map/index' }) },
    goProfile() { uni.switchTab({ url: '/pages/profile/index' }) },
  },
}
</script>

<style scoped>
.page { background: #fcf9f6; min-height: 100vh; padding: 80rpx 40rpx 120rpx; }
.top-bar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 60rpx; }
.brand { flex: 1; }
.brand-zh { font-size: 56rpx; font-weight: 700; color: #33185c; display: block; letter-spacing: 8rpx; }
.brand-en { font-size: 24rpx; color: rgba(51,24,92,0.5); letter-spacing: 4rpx; display: block; margin-top: 8rpx; }
.profile-btn { display: flex; flex-direction: column; align-items: center; gap: 4rpx; padding: 8rpx 16rpx; }
.profile-icon { font-size: 36rpx; color: #33185c; }
.profile-label { font-size: 18rpx; color: rgba(51,24,92,0.5); letter-spacing: 2rpx; }

.quote-card { padding: 48rpx 40rpx; background: rgba(74,48,115,0.03); border-radius: 24rpx; border-left: 6rpx solid #33185c; margin-bottom: 64rpx; }
.quote-zh { font-size: 36rpx; font-weight: 500; color: #33185c; line-height: 1.6; display: block; }
.quote-en { font-size: 24rpx; color: rgba(51,24,92,0.4); font-style: italic; display: block; margin-top: 16rpx; }

.question-card { position: relative; overflow: hidden; box-sizing: border-box; margin-bottom: 28rpx; padding: 36rpx; border-radius: 28rpx; background: #fff; border: 2rpx solid rgba(74,48,115,0.09); box-shadow: 0 8rpx 30rpx rgba(51,24,92,0.055); }
.question-glow { position: absolute; top: -160rpx; right: -120rpx; width: 340rpx; height: 340rpx; border-radius: 50%; opacity: 0.1; }
.question-top { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 18rpx; }
.question-eyebrow { font-size: 18rpx; font-weight: 700; color: #9c3c62; letter-spacing: 4rpx; }
.question-status { flex-shrink: 0; font-size: 18rpx; color: rgba(74,48,115,0.32); }
.question-theme { position: relative; display: block; margin-top: 30rpx; font-size: 20rpx; font-weight: 700; letter-spacing: 3rpx; }
.question-title { position: relative; display: block; margin-top: 15rpx; font-size: 34rpx; font-weight: 700; color: #33185c; line-height: 1.6; }
.question-foot { position: relative; display: flex; align-items: flex-end; justify-content: space-between; gap: 20rpx; margin-top: 28rpx; padding-top: 22rpx; border-top: 2rpx solid rgba(74,48,115,0.06); }
.question-note { flex: 1; font-size: 19rpx; color: rgba(51,24,92,0.34); line-height: 1.5; }
.question-link { flex-shrink: 0; font-size: 23rpx; font-weight: 700; color: #9c3c62; }

.recommend-block { margin-bottom: 56rpx; }
.recommend-card { position: relative; overflow: hidden; height: 410rpx; border-radius: 28rpx; background: #1a0f2e; }
.recommend-cover { width: 100%; height: 100%; }
.recommend-overlay { position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: linear-gradient(180deg, rgba(18,11,34,0) 34%, rgba(18,11,34,0.2) 56%, rgba(18,11,34,0.9) 100%); }
.recommend-content { position: absolute; left: 32rpx; right: 32rpx; bottom: 28rpx; }
.recommend-eyebrow { display: block; font-size: 17rpx; font-weight: 700; color: rgba(255,255,255,0.55); letter-spacing: 4rpx; }
.recommend-title { display: block; margin-top: 12rpx; font-size: 38rpx; font-weight: 700; color: #fff; }
.recommend-meta-row { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; margin-top: 10rpx; }
.recommend-name { font-size: 20rpx; color: rgba(255,255,255,0.6); }
.recommend-read { flex-shrink: 0; font-size: 20rpx; font-weight: 600; color: rgba(255,255,255,0.82); }
.recommend-note { margin-top: 14rpx; padding: 20rpx 24rpx 22rpx; border-left: 5rpx solid rgba(156,60,98,0.5); border-radius: 18rpx; background: rgba(156,60,98,0.045); }
.recommend-note-label { display: block; margin-bottom: 7rpx; font-size: 17rpx; font-weight: 700; color: rgba(156,60,98,0.72); letter-spacing: 3rpx; }
.recommend-reason { display: -webkit-box; overflow: hidden; font-size: 20rpx; color: rgba(51,24,92,0.56); line-height: 1.65; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }

.section { margin-bottom: 56rpx; }
.section-label { font-size: 20rpx; letter-spacing: 6rpx; color: #9c3c62; text-transform: uppercase; display: block; margin-bottom: 24rpx; }
.story-scroll { height: 436rpx; }
.story-track { display: inline-flex; align-items: flex-start; box-sizing: border-box; min-width: 100%; height: 432rpx; padding: 4rpx 0 20rpx; }
.mini-card { flex: none; box-sizing: border-box; margin-right: 24rpx; border-radius: 20rpx; overflow: hidden; background: #fff; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04); }
.mini-cover { display: block; width: 100%; }
.mini-info { box-sizing: border-box; min-height: 130rpx; padding: 20rpx; }
.mini-name { font-size: 20rpx; color: #9c3c62; letter-spacing: 4rpx; text-transform: uppercase; display: block; margin-bottom: 8rpx; }
.mini-title { display: -webkit-box; overflow: hidden; font-size: 26rpx; color: #1c1c1a; font-weight: 600; white-space: normal; line-height: 1.4; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.see-all { padding: 24rpx 0; }
.see-all-text { font-size: 24rpx; color: #4A3073; font-weight: 600; letter-spacing: 2rpx; }

/* Inner Map entry card */
.map-card {
  position: relative;
  overflow: hidden;
  background: #120b22;
  border-radius: 28rpx;
  padding: 48rpx 40rpx;
  margin-bottom: 64rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.map-blob { position: absolute; border-radius: 50%; }
.map-blob-1 { width: 300rpx; height: 300rpx; background: radial-gradient(circle, rgba(124,92,191,0.7) 0%, transparent 65%); top: -100rpx; left: -60rpx; }
.map-blob-2 { width: 260rpx; height: 260rpx; background: radial-gradient(circle, rgba(212,96,126,0.6) 0%, transparent 65%); top: -80rpx; right: -40rpx; }
.map-blob-3 { width: 240rpx; height: 240rpx; background: radial-gradient(circle, rgba(63,168,130,0.45) 0%, transparent 65%); bottom: -80rpx; left: 20%; }
.map-blob-4 { width: 220rpx; height: 220rpx; background: radial-gradient(circle, rgba(201,160,92,0.4) 0%, transparent 65%); bottom: -70rpx; right: -30rpx; }
.map-card-content { position: relative; flex: 1; z-index: 1; }
.map-card-eyebrow { display: block; font-size: 18rpx; letter-spacing: 5rpx; color: rgba(255,255,255,0.45); margin-bottom: 14rpx; }
.map-card-title { display: block; font-size: 40rpx; font-weight: 700; color: #fff; letter-spacing: 2rpx; margin-bottom: 10rpx; }
.map-card-sub { display: block; font-size: 22rpx; color: rgba(255,255,255,0.5); letter-spacing: 1rpx; }
.map-card-arrow { position: relative; z-index: 1; font-size: 40rpx; color: rgba(255,255,255,0.6); flex-shrink: 0; }

.footer { text-align: center; padding-top: 48rpx; }
.footer-text { font-size: 20rpx; color: rgba(51,24,92,0.25); letter-spacing: 4rpx; }
</style>
