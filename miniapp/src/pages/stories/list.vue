<template>
  <view class="page">

    <!-- Hero -->
    <view class="hero">
      <text class="hero-label">Archive Series · 真实故事</text>
      <text class="hero-title">100 Girls Collection</text>
      <text class="hero-title-cn">一百位真实的女孩</text>
      <text class="hero-desc">A curated digital anthology celebrating the fierce and soft journeys of a hundred individual lives. Each story is a reflection, a muse, and a testament to being.</text>
    </view>

    <!-- Filter bar -->
    <scroll-view scroll-x class="filter-bar" :show-scrollbar="false">
      <view class="filter-inner">
        <view
          v-for="tag in tags" :key="tag.key"
          :class="['filter-tag', activeTag === tag.key ? 'filter-tag--active' : '']"
          @tap="activeTag = tag.key"
        >
          <text class="filter-tag-text">{{ tag.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- AIGC note -->
    <view class="aigc-note">
      <text class="aigc-text">封面图为 AIGC 生成，不代表真实人物。</text>
    </view>

    <!-- Story list -->
    <view class="story-list">
      <view
        v-for="story in filtered" :key="story.id"
        class="story-card"
        @tap="goDetail(story)"
      >
        <!-- Cover image -->
        <view class="cover-wrap">
          <image :src="story.cover" class="cover-img" mode="aspectFill" />
          <view class="cover-overlay" />
        </view>

        <!-- Info -->
        <view class="card-info">
          <view class="vol-row">
            <view class="vol-line" />
            <text class="vol-label">Volume {{ story.id }}</text>
          </view>
          <text class="card-title">{{ story.title }}</text>
          <text class="card-title-en">{{ story.titleEn }}</text>
          <text class="card-summary">{{ story.summary }}</text>
          <view class="card-footer">
            <text class="card-time">{{ story.readTime }}</text>
            <text class="card-read">READ STORY →</text>
          </view>
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
        { key: 'all', label: 'All' },
        { key: 'inner-soul', label: 'Inner Soul' },
        { key: 'identity', label: 'Identity' },
        { key: 'relationship', label: 'Relationship' },
        { key: 'art', label: 'Art' },
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

/* Hero */
.hero { padding: 64rpx 40rpx 48rpx; }
.hero-label {
  display: block;
  font-size: 18rpx;
  letter-spacing: 8rpx;
  color: #9c3c62;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 20rpx;
}
.hero-title {
  display: block;
  font-size: 72rpx;
  font-weight: 700;
  color: #33185c;
  line-height: 1.15;
}
.hero-title-cn {
  display: block;
  font-size: 52rpx;
  color: #9c3c62;
  font-style: italic;
  font-weight: 400;
  margin-bottom: 28rpx;
}
.hero-desc {
  display: block;
  font-size: 24rpx;
  color: rgba(51,24,92,0.5);
  line-height: 1.85;
}

/* Filter */
.filter-bar { padding: 0 40rpx 32rpx; white-space: nowrap; }
.filter-inner { display: flex; gap: 16rpx; }
.filter-tag {
  flex-shrink: 0;
  padding: 12rpx 32rpx;
  border-radius: 999rpx;
  background: rgba(30,22,40,0.06);
  border: none;
}
.filter-tag--active { background: #33185c; }
.filter-tag-text { font-size: 20rpx; letter-spacing: 4rpx; text-transform: uppercase; color: #4a454f; }
.filter-tag--active .filter-tag-text { color: #fff; font-weight: 600; }

/* AIGC note */
.aigc-note { padding: 0 40rpx 16rpx; text-align: right; }
.aigc-text { font-size: 18rpx; color: rgba(74,48,115,0.3); letter-spacing: 1rpx; }

/* Story cards */
.story-list { padding: 0 32rpx; display: flex; flex-direction: column; gap: 48rpx; }

.story-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.03);
}

/* Cover */
.cover-wrap {
  width: 100%;
  aspect-ratio: 4 / 3;
  position: relative;
  background: linear-gradient(135deg, #4a3073, #9c3c62);
  overflow: hidden;
}
.cover-img { width: 100%; height: 100%; }
.cover-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 40%;
  background: linear-gradient(to top, rgba(51,24,92,0.18), transparent);
}

/* Info */
.card-info { padding: 40rpx 40rpx 36rpx; }
.vol-row { display: flex; align-items: center; gap: 20rpx; margin-bottom: 20rpx; }
.vol-line { width: 48rpx; height: 2rpx; background: #9c3c62; flex-shrink: 0; }
.vol-label { font-size: 20rpx; letter-spacing: 6rpx; color: #9c3c62; text-transform: uppercase; font-weight: 700; }

.card-title { display: block; font-size: 44rpx; font-weight: 700; color: #1c1c1a; line-height: 1.4; margin-bottom: 10rpx; }
.card-title-en { display: block; font-size: 28rpx; color: rgba(51,24,92,0.5); font-style: italic; margin-bottom: 24rpx; line-height: 1.4; }
.card-summary {
  display: block;
  font-size: 26rpx;
  color: #4a454f;
  line-height: 1.75;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  margin-bottom: 32rpx;
}

.card-footer { display: flex; align-items: center; justify-content: space-between; }
.card-time { font-size: 24rpx; color: #7b7580; font-style: italic; }
.card-read { font-size: 22rpx; color: #33185c; font-weight: 700; letter-spacing: 4rpx; }
</style>
