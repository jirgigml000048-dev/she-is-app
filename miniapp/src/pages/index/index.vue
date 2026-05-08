<template>
  <view class="page">
    <view class="brand">
      <text class="brand-zh">女也</text>
      <text class="brand-en">She Is ______.</text>
    </view>
    <view class="quote-card">
      <text class="quote-zh">内心的注视是种无畏的爱。</text>
      <text class="quote-en">The inner gaze is a fierce act of love.</text>
    </view>
    <view class="section">
      <text class="section-label">100位女孩 · STORIES</text>
      <scroll-view scroll-x class="story-scroll">
        <view v-for="story in stories.slice(0, 5)" :key="story.id" class="mini-card" @tap="goStory(story)">
          <image :src="story.cover" class="mini-cover" mode="aspectFill" />
          <view class="mini-info">
            <text class="mini-name">{{ story.name }}</text>
            <text class="mini-title">{{ story.title }}</text>
          </view>
        </view>
      </scroll-view>
      <view class="see-all" @tap="goStories"><text class="see-all-text">查看全部故事 →</text></view>
    </view>
    <view class="footer"><text class="footer-text">女也 She Is · 2026</text></view>
  </view>
</template>
<script>
import { stories } from '@/data/stories.js'
export default {
  data() { return { stories } },
  methods: {
    goStory(story) { uni.navigateTo({ url: '/pages/stories/detail?id=' + story.id }) },
    goStories() { uni.switchTab({ url: '/pages/stories/list' }) },
  },
}
</script>
<style scoped>
.page { background: #fcf9f6; min-height: 100vh; padding: 80rpx 40rpx 120rpx; }
.brand { margin-bottom: 60rpx; }
.brand-zh { font-size: 56rpx; font-weight: 700; color: #33185c; display: block; letter-spacing: 8rpx; }
.brand-en { font-size: 24rpx; color: rgba(51,24,92,0.5); letter-spacing: 4rpx; display: block; margin-top: 8rpx; }
.quote-card { padding: 48rpx 40rpx; background: rgba(74,48,115,0.03); border-radius: 24rpx; border-left: 6rpx solid #33185c; margin-bottom: 64rpx; }
.quote-zh { font-size: 36rpx; font-weight: 500; color: #33185c; line-height: 1.6; display: block; }
.quote-en { font-size: 24rpx; color: rgba(51,24,92,0.4); font-style: italic; display: block; margin-top: 16rpx; }
.section { margin-bottom: 48rpx; }
.section-label { font-size: 20rpx; letter-spacing: 6rpx; color: #9c3c62; text-transform: uppercase; display: block; margin-bottom: 24rpx; }
.story-scroll { white-space: nowrap; }
.mini-card { display: inline-block; width: 280rpx; margin-right: 24rpx; border-radius: 20rpx; overflow: hidden; background: #fff; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04); }
.mini-cover { width: 280rpx; height: 200rpx; }
.mini-info { padding: 20rpx; }
.mini-name { font-size: 20rpx; color: #9c3c62; letter-spacing: 4rpx; text-transform: uppercase; display: block; margin-bottom: 8rpx; }
.mini-title { font-size: 26rpx; color: #1c1c1a; font-weight: 600; white-space: normal; line-height: 1.4; display: block; }
.see-all { padding: 24rpx 0; }
.see-all-text { font-size: 24rpx; color: #4A3073; font-weight: 600; letter-spacing: 2rpx; }
.footer { text-align: center; padding-top: 48rpx; }
.footer-text { font-size: 20rpx; color: rgba(51,24,92,0.25); letter-spacing: 4rpx; }
</style>
