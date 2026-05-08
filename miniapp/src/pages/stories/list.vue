<template>
  <view class="page">
    <view class="hero">
      <text class="hero-label">ARCHIVE SERIES · 真实故事</text>
      <text class="hero-title">100 Girls</text>
      <text class="hero-subtitle">一百位真实的女孩</text>
    </view>

    <view class="filter-bar">
      <view
        v-for="tag in tags" :key="tag.key"
        :class="['filter-tag', activeTag === tag.key ? 'active' : '']"
        @tap="activeTag = tag.key"
      >{{ tag.label }}</view>
    </view>

    <view class="story-list">
      <view
        v-for="story in filtered" :key="story.id"
        class="story-card"
        @tap="goDetail(story)"
      >
        <image :src="story.cover" class="story-cover" mode="aspectFill" />
        <view class="story-info">
          <text class="story-vol">Volume {{ story.id }}</text>
          <text class="story-title">{{ story.title }}</text>
          <text class="story-title-en">{{ story.titleEn }}</text>
          <text class="story-summary">{{ story.summary }}</text>
          <text class="story-meta">{{ story.readTime }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { stories } from '@/data/stories.js'

export default {
  data() {
    return {
      stories,
      activeTag: 'all',
      tags: [
        { key: 'all', label: '全部' },
        { key: 'inner-soul', label: '内在' },
        { key: 'identity', label: '身份' },
        { key: 'relationship', label: '关系' },
        { key: 'art', label: '艺术' },
      ],
    }
  },
  computed: {
    filtered() {
      if (this.activeTag === 'all') return this.stories
      return this.stories.filter(s => s.tags.includes(this.activeTag))
    },
  },
  methods: {
    goDetail(story) {
      uni.navigateTo({ url: `/pages/stories/detail?id=${story.id}` })
    },
  },
}
</script>

<style scoped>
.page { background: #fcf9f6; min-height: 100vh; padding-bottom: 120rpx; }
.hero { padding: 60rpx 40rpx 40rpx; }
.hero-label { font-size: 20rpx; letter-spacing: 6rpx; color: #9c3c62; text-transform: uppercase; display: block; margin-bottom: 16rpx; }
.hero-title { font-size: 72rpx; font-weight: 700; color: #33185c; display: block; line-height: 1.2; }
.hero-subtitle { font-size: 36rpx; color: #9c3c62; font-style: italic; display: block; margin-top: 8rpx; }

.filter-bar { display: flex; gap: 16rpx; padding: 0 40rpx 32rpx; overflow-x: auto; white-space: nowrap; }
.filter-tag { padding: 12rpx 28rpx; border-radius: 999rpx; font-size: 22rpx; letter-spacing: 4rpx; background: #e5e2df; color: #4a454f; flex-shrink: 0; }
.filter-tag.active { background: #33185c; color: #fff; }

.story-list { padding: 0 40rpx; }
.story-card { display: flex; background: #fff; border-radius: 24rpx; overflow: hidden; margin-bottom: 32rpx; box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.03); }
.story-cover { width: 260rpx; height: 320rpx; flex-shrink: 0; }
.story-info { flex: 1; padding: 28rpx 32rpx; display: flex; flex-direction: column; }
.story-vol { font-size: 20rpx; letter-spacing: 4rpx; color: #9c3c62; text-transform: uppercase; margin-bottom: 12rpx; }
.story-title { font-size: 32rpx; font-weight: 700; color: #1c1c1a; line-height: 1.4; margin-bottom: 8rpx; }
.story-title-en { font-size: 24rpx; color: rgba(51,24,92,0.5); margin-bottom: 16rpx; font-style: italic; }
.story-summary { font-size: 24rpx; color: #4a454f; line-height: 1.7; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; flex: 1; }
.story-meta { font-size: 22rpx; color: #7b7580; font-style: italic; margin-top: 12rpx; }
</style>
