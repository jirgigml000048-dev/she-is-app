<template>
  <view class="page">
    <view class="head">
      <text class="eyebrow">PRIVATE STUDIO · 仅管理员可见</text>
      <text class="title">内容与数据后台</text>
      <text class="sub">文章可以随时发布；用户数据只汇总已开启同步的用户，不展示私人回答。</text>
    </view>

    <view v-if="loading" class="state-card"><text>正在读取后台…</text></view>
    <view v-else-if="accessError" class="state-card state-card--error">
      <text class="state-title">暂时无法进入</text>
      <text class="state-sub">{{ accessError }}</text>
    </view>

    <template v-else>
      <view class="section-head">
        <view>
          <text class="section-label">DATA · 匿名汇总</text>
          <text class="section-title">产品近况</text>
        </view>
        <text class="refresh" @tap="loadStats">刷新</text>
      </view>

      <view class="stats-grid">
        <view v-for="item in statCards" :key="item.label" class="stat-card">
          <text class="stat-num">{{ item.value }}</text>
          <text class="stat-label">{{ item.label }}</text>
        </view>
      </view>
      <text v-if="statsError" class="soft-error">{{ statsError }}</text>
      <view v-if="topStories.length || topTests.length" class="breakdown-grid">
        <view v-if="topStories.length" class="breakdown-card">
          <text class="breakdown-title">故事阅读</text>
          <view v-for="item in topStories" :key="item.id" class="breakdown-row">
            <text class="breakdown-name">{{ item.label }}</text>
            <text class="breakdown-value">{{ item.value }} 人</text>
          </view>
        </view>
        <view v-if="topTests.length" class="breakdown-card">
          <text class="breakdown-title">测评完成</text>
          <view v-for="item in topTests" :key="item.id" class="breakdown-row">
            <text class="breakdown-name">{{ item.label }}</text>
            <text class="breakdown-value">{{ item.value }} 次</text>
          </view>
        </view>
      </view>

      <view class="section-head section-head--stories">
        <view>
          <text class="section-label">STORIES · 内容库</text>
          <text class="section-title">文章管理</text>
        </view>
        <view class="new-btn" @tap="startNew"><text>＋ 新文章</text></view>
      </view>

      <view v-if="!editing" class="story-list">
        <view v-if="!managedStories.length" class="empty-card">
          <text class="empty-title">云端还没有文章</text>
          <text class="empty-sub">现有文章仍会从小程序本地正常显示。点击“新文章”就可以开始发布云端内容。</text>
          <view class="import-btn" @tap="confirmImportLegacy"><text>{{ importing ? '正在导入…' : '首次导入现有 11 篇' }}</text></view>
        </view>
        <view v-for="story in managedStories" :key="story.id" class="story-row" @tap="editStory(story.id)">
          <view class="story-main">
            <view class="story-topline">
              <text class="story-id">VOL. {{ story.id }}</text>
              <text :class="['status', 'status--' + story.status]">{{ statusLabel(story.status) }}</text>
            </view>
            <text class="story-title">{{ story.title || '未命名文章' }}</text>
            <text class="story-meta">{{ story.name || '未填写名字' }} · {{ formatDate(story.updatedAt) }}</text>
          </view>
          <text class="story-arrow">→</text>
        </view>
      </view>

      <view v-else class="editor">
        <view class="editor-head">
          <view>
            <text class="section-label">{{ isNew ? 'NEW STORY' : 'EDIT STORY' }}</text>
            <text class="editor-title">{{ form.title || '还没有标题' }}</text>
          </view>
          <text class="close" @tap="closeEditor">关闭</text>
        </view>

        <view class="field-row">
          <view class="field field--half">
            <text class="field-label">故事编号 *</text>
            <input v-model="form.id" class="input" :disabled="!isNew" placeholder="例如 012" />
          </view>
          <view class="field field--half">
            <text class="field-label">首页排序</text>
            <input v-model="form.sortOrder" class="input" type="number" placeholder="0 最靠前" />
          </view>
        </view>

        <view class="field">
          <text class="field-label">中文标题 *</text>
          <input v-model="form.title" class="input" placeholder="文章标题" />
        </view>
        <view class="field">
          <text class="field-label">英文标题</text>
          <input v-model="form.titleEn" class="input" placeholder="English title" />
        </view>
        <view class="field-row">
          <view class="field field--half">
            <text class="field-label">女孩名字 *</text>
            <input v-model="form.name" class="input" placeholder="例如 小夏" />
          </view>
          <view class="field field--half">
            <text class="field-label">阅读时间</text>
            <input v-model="form.readTime" class="input" placeholder="例如 8 min" />
          </view>
        </view>
        <view class="field">
          <text class="field-label">标签</text>
          <input v-model="form.tagsText" class="input" placeholder="identity, relationship" />
          <text class="field-help">多个英文标签用英文逗号隔开。</text>
        </view>
        <view class="field">
          <text class="field-label">摘要 *</text>
          <textarea v-model="form.summary" class="textarea textarea--summary" maxlength="500" placeholder="故事列表里显示的短摘要" />
        </view>
        <view class="field">
          <text class="field-label">封面地址 *</text>
          <input v-model="form.cover" class="input" placeholder="https://..." />
          <image v-if="form.cover" :src="form.cover" class="cover-preview" mode="aspectFill" />
        </view>
        <view class="field">
          <text class="field-label">背景音乐地址</text>
          <input v-model="form.bgm" class="input" placeholder="https://...mp3" />
        </view>
        <view class="field">
          <text class="field-label">朗读音频地址</text>
          <input v-model="form.tts" class="input" placeholder="https://...mp3" />
        </view>

        <view class="feature-card">
          <view class="feature-row">
            <view>
              <text class="feature-title">首页编辑推荐</text>
              <text class="feature-sub">新用户也会看到这篇推荐</text>
            </view>
            <switch :checked="form.featured" color="#9c3c62" @change="form.featured = $event.detail.value" />
          </view>
          <textarea v-if="form.featured" v-model="form.featuredReason" class="textarea textarea--reason" maxlength="160" placeholder="用自然的话写一句为什么推荐" />
        </view>

        <view class="field">
          <text class="field-label">正文 *</text>
          <textarea v-model="form.bodyHtml" class="textarea textarea--body" maxlength="-1" placeholder="可以直接粘贴普通文字；空行会自动分段。也支持粘贴 HTML。" />
          <text class="field-help">发布前请在下面预览。文章中的空行会保留为段落。</text>
        </view>

        <view v-if="form.bodyHtml" class="preview-card">
          <text class="preview-label">手机正文预览</text>
          <rich-text :nodes="previewHtml" />
        </view>

        <text v-if="saveError" class="save-error">{{ saveError }}</text>
        <view class="editor-actions">
          <view class="action action--draft" @tap="saveAs('draft')"><text>{{ saving ? '保存中…' : '保存草稿' }}</text></view>
          <view class="action action--publish" @tap="confirmPublish"><text>{{ saving ? '发布中…' : '发布文章' }}</text></view>
          <view v-if="!isNew" class="action action--archive" @tap="confirmArchive"><text>下架文章</text></view>
        </view>
      </view>

      <view class="privacy-note">
        <text class="privacy-note-title">数据边界</text>
        <text class="privacy-note-text">这里不会显示 OpenID、昵称、测评原始答案或“内在一问”的具体文字。需要帮助某位用户时，应由用户主动提供信息，不在后台随意翻看私人记录。</text>
      </view>
    </template>
  </view>
</template>

<script>
import {
  checkAdminAccess,
  getAnonymousStats,
  getManagedStories,
  getManagedStory,
  saveManagedStory,
} from '@/utils/admin.js'
import { testsById } from '@/data/tests.js'
import { clearStoryCache, getInitialStories, getLegacyStoryDrafts } from '@/utils/stories.js'
import { bodyToHtml, formatArticleHtml } from '@/utils/article.js'

function blankStory() {
  return {
    id: '', title: '', titleEn: '', name: '', tagsText: 'identity',
    cover: '', bgm: '', tts: '', summary: '', readTime: '8 min',
    bodyHtml: '', sortOrder: 0, featured: false, featuredReason: '', status: 'draft',
  }
}

export default {
  data() {
    return {
      loading: true,
      accessError: '',
      statsError: '',
      stats: null,
      managedStories: [],
      editing: false,
      isNew: false,
      saving: false,
      saveError: '',
      importing: false,
      form: blankStory(),
    }
  },
  computed: {
    statCards() {
      const summary = this.stats && this.stats.summary ? this.stats.summary : {}
      return [
        { label: '同步用户', value: Number(summary.users) || 0 },
        { label: '近 7 天活跃', value: Number(summary.active7d) || 0 },
        { label: '完成测评', value: Number(summary.completedAssessments) || 0 },
        { label: '同步读者', value: Number(summary.storyReaders) || 0 },
        { label: '内在回答', value: Number(summary.reflections) || 0 },
        { label: '云端文章', value: this.managedStories.length },
      ]
    },
    previewHtml() {
      return formatArticleHtml(this.form.bodyHtml, { preview: true })
    },
    topStories() {
      const reads = this.stats && this.stats.storyReads ? this.stats.storyReads : {}
      const catalog = [...this.managedStories, ...getInitialStories()]
      return Object.entries(reads)
        .map(([id, value]) => {
          const story = catalog.find(item => item.id === id)
          return { id, label: story && story.title ? story.title : `故事 ${id}`, value: Number(value) || 0 }
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    },
    topTests() {
      const completions = this.stats && this.stats.testCompletions ? this.stats.testCompletions : {}
      return Object.entries(completions)
        .map(([id, value]) => ({
          id,
          label: testsById[id] && testsById[id].title ? testsById[id].title : id,
          value: Number(value) || 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    },
  },
  onLoad() {
    this.initialize()
  },
  methods: {
    async initialize() {
      this.loading = true
      this.accessError = ''
      try {
        await checkAdminAccess()
        await Promise.all([this.loadStories(), this.loadStats()])
      } catch (error) {
        this.accessError = error.message || '请确认管理员权限和云函数配置。'
      } finally {
        this.loading = false
      }
    },
    async loadStories() {
      const result = await getManagedStories()
      this.managedStories = Array.isArray(result && result.stories) ? result.stories : []
    },
    async loadStats() {
      this.statsError = ''
      try {
        this.stats = await getAnonymousStats()
      } catch (error) {
        this.statsError = '统计暂时没有取到，不影响文章发布。'
      }
    },
    startNew() {
      this.form = blankStory()
      this.isNew = true
      this.editing = true
      this.saveError = ''
    },
    confirmImportLegacy() {
      if (this.importing) return
      uni.showModal({
        title: '导入现有文章？',
        content: '会把安装包里的现有文章复制到云端并保持发布状态，以后就能在这里修改。',
        confirmText: '开始导入',
        success: result => { if (result.confirm) this.importLegacyStories() },
      })
    },
    async importLegacyStories() {
      this.importing = true
      try {
        const stories = getLegacyStoryDrafts()
        for (const story of stories) await saveManagedStory(story)
        clearStoryCache()
        await this.loadStories()
        uni.showToast({ title: '现有文章已导入', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: error.message || '导入中断，请重试', icon: 'none' })
      } finally {
        this.importing = false
      }
    },
    async editStory(id) {
      uni.showLoading({ title: '读取文章' })
      try {
        const result = await getManagedStory(id)
        const story = result && result.story
        if (!story) throw new Error('没有找到这篇文章')
        const form = {
          ...blankStory(),
          ...story,
          tagsText: Array.isArray(story.tags) ? story.tags.join(', ') : '',
          sortOrder: Number(story.sortOrder) || 0,
          featured: story.featured === true,
        }
        delete form.publishedVersion
        delete form.publicVisible
        this.form = form
        this.isNew = false
        this.editing = true
        this.saveError = ''
      } catch (error) {
        uni.showToast({ title: error.message || '读取失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    closeEditor() {
      if (this.saving) return
      this.editing = false
      this.form = blankStory()
      this.saveError = ''
    },
    statusLabel(status) {
      return ({ draft: '草稿', published: '已发布', archived: '已下架' })[status] || '草稿'
    },
    formatDate(timestamp) {
      if (!Number(timestamp)) return '尚未保存'
      const date = new Date(Number(timestamp))
      return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
    },
    async saveAs(status) {
      if (this.saving) return
      this.saving = true
      this.saveError = ''
      try {
        const story = {
          ...this.form,
          id: String(this.form.id || '').trim().toLowerCase(),
          tags: String(this.form.tagsText || '').split(',').map(tag => tag.trim()).filter(Boolean),
          sortOrder: Number(this.form.sortOrder) || 0,
          bodyHtml: bodyToHtml(this.form.bodyHtml),
          status,
        }
        await saveManagedStory(story)
        clearStoryCache(story.id)
        await this.loadStories()
        this.editing = false
        this.form = blankStory()
        uni.showToast({ title: status === 'published' ? '文章已发布' : status === 'archived' ? '文章已下架' : '草稿已保存', icon: 'success' })
      } catch (error) {
        this.saveError = error.message || '保存失败，请重试。'
      } finally {
        this.saving = false
      }
    },
    confirmPublish() {
      if (this.saving) return
      uni.showModal({
        title: '现在发布？',
        content: '发布后，用户刷新故事页就能看到这篇文章。',
        confirmText: '发布',
        success: result => { if (result.confirm) this.saveAs('published') },
      })
    },
    confirmArchive() {
      if (this.saving) return
      uni.showModal({
        title: '下架这篇文章？',
        content: '下架后普通用户将无法再打开；文章内容仍保留在后台。',
        confirmText: '下架',
        confirmColor: '#b13b5c',
        success: result => { if (result.confirm) this.saveAs('archived') },
      })
    },
  },
}
</script>

<style scoped>
.page { min-height: 100vh; box-sizing: border-box; padding: 56rpx 32rpx 140rpx; background: #faf7f4; color: #33185c; }
.head { padding: 14rpx 8rpx 44rpx; }
.eyebrow, .section-label { display: block; font-size: 18rpx; font-weight: 700; letter-spacing: 4rpx; color: #9c3c62; }
.title { display: block; margin-top: 16rpx; font-size: 46rpx; font-weight: 700; }
.sub { display: block; margin-top: 14rpx; font-size: 23rpx; line-height: 1.7; color: rgba(51,24,92,0.5); }
.state-card, .empty-card { padding: 52rpx 36rpx; border-radius: 26rpx; background: #fff; text-align: center; box-shadow: 0 8rpx 32rpx rgba(51,24,92,0.05); }
.state-card--error { color: #9c3c62; }
.state-title, .empty-title { display: block; font-size: 29rpx; font-weight: 700; }
.state-sub, .empty-sub { display: block; margin-top: 14rpx; font-size: 22rpx; line-height: 1.7; color: rgba(51,24,92,0.5); }
.import-btn { margin: 28rpx auto 0; padding: 20rpx 30rpx; border-radius: 999rpx; background: rgba(51,24,92,0.08); color: #33185c; font-size: 22rpx; }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20rpx; margin: 18rpx 6rpx 24rpx; }
.section-head--stories { margin-top: 60rpx; }
.section-title { display: block; margin-top: 9rpx; font-size: 34rpx; font-weight: 700; }
.refresh { padding: 10rpx 0; font-size: 22rpx; color: #9c3c62; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14rpx; }
.stat-card { padding: 28rpx 10rpx 24rpx; border-radius: 22rpx; background: #fff; text-align: center; box-shadow: 0 5rpx 22rpx rgba(51,24,92,0.045); }
.stat-num { display: block; font-size: 38rpx; font-weight: 700; }
.stat-label { display: block; margin-top: 8rpx; font-size: 18rpx; color: rgba(51,24,92,0.46); }
.soft-error { display: block; margin: 18rpx 6rpx 0; font-size: 20rpx; color: #9c3c62; }
.breakdown-grid { display: flex; flex-direction: column; gap: 14rpx; margin-top: 18rpx; }
.breakdown-card { padding: 26rpx; border-radius: 22rpx; background: rgba(255,255,255,0.78); }
.breakdown-title { display: block; margin-bottom: 13rpx; font-size: 21rpx; font-weight: 700; color: #33185c; }
.breakdown-row { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; padding: 10rpx 0; border-top: 1rpx solid rgba(51,24,92,0.055); }
.breakdown-name { flex: 1; overflow: hidden; font-size: 20rpx; color: rgba(51,24,92,0.62); white-space: nowrap; text-overflow: ellipsis; }
.breakdown-value { flex-shrink: 0; font-size: 20rpx; font-weight: 600; color: #9c3c62; }
.new-btn { padding: 17rpx 24rpx; border-radius: 999rpx; background: #33185c; color: #fff; font-size: 22rpx; }
.story-list { display: flex; flex-direction: column; gap: 16rpx; }
.story-row { display: flex; align-items: center; gap: 18rpx; padding: 28rpx 26rpx; border-radius: 24rpx; background: #fff; box-shadow: 0 5rpx 24rpx rgba(51,24,92,0.045); }
.story-main { flex: 1; min-width: 0; }
.story-topline { display: flex; align-items: center; gap: 14rpx; }
.story-id { font-size: 17rpx; letter-spacing: 3rpx; color: rgba(51,24,92,0.38); }
.status { padding: 5rpx 12rpx; border-radius: 999rpx; font-size: 17rpx; }
.status--draft { color: #8b6a28; background: rgba(201,160,92,0.12); }
.status--published { color: #277f62; background: rgba(63,168,130,0.12); }
.status--archived { color: #8a4058; background: rgba(156,60,98,0.1); }
.story-title { display: block; overflow: hidden; margin-top: 10rpx; font-size: 29rpx; font-weight: 700; white-space: nowrap; text-overflow: ellipsis; }
.story-meta { display: block; margin-top: 8rpx; font-size: 20rpx; color: rgba(51,24,92,0.42); }
.story-arrow { font-size: 28rpx; color: rgba(51,24,92,0.3); }
.editor { padding: 34rpx 26rpx; border-radius: 28rpx; background: #fff; box-shadow: 0 8rpx 34rpx rgba(51,24,92,0.055); }
.editor-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20rpx; margin-bottom: 34rpx; }
.editor-title { display: block; margin-top: 10rpx; max-width: 500rpx; font-size: 31rpx; font-weight: 700; }
.close { font-size: 22rpx; color: #9c3c62; }
.field-row { display: flex; gap: 16rpx; }
.field { margin-bottom: 26rpx; }
.field--half { flex: 1; min-width: 0; }
.field-label { display: block; margin: 0 4rpx 10rpx; font-size: 21rpx; font-weight: 600; color: rgba(51,24,92,0.75); }
.input, .textarea { box-sizing: border-box; width: 100%; border: 1rpx solid rgba(51,24,92,0.1); border-radius: 16rpx; background: #faf8f8; color: #33185c; font-size: 24rpx; }
.input { height: 76rpx; padding: 0 20rpx; }
.textarea { padding: 18rpx 20rpx; line-height: 1.7; }
.textarea--summary { height: 180rpx; }
.textarea--reason { height: 150rpx; margin-top: 20rpx; background: #fff; }
.textarea--body { height: 620rpx; }
.field-help { display: block; margin: 9rpx 4rpx 0; font-size: 18rpx; color: rgba(51,24,92,0.36); }
.cover-preview { width: 100%; height: 300rpx; margin-top: 14rpx; border-radius: 16rpx; background: #eee8ef; }
.feature-card { margin-bottom: 28rpx; padding: 24rpx; border-radius: 20rpx; background: rgba(156,60,98,0.05); }
.feature-row { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
.feature-title { display: block; font-size: 23rpx; font-weight: 700; }
.feature-sub { display: block; margin-top: 7rpx; font-size: 18rpx; color: rgba(51,24,92,0.4); }
.preview-card { margin: 12rpx 0 30rpx; padding: 32rpx 26rpx; border-radius: 22rpx; border: 1rpx solid rgba(51,24,92,0.08); background: #fcf9f6; }
.preview-label { display: block; margin-bottom: 26rpx; font-size: 19rpx; font-weight: 700; letter-spacing: 3rpx; color: #9c3c62; }
.save-error { display: block; margin-bottom: 18rpx; font-size: 22rpx; color: #b13b5c; }
.editor-actions { display: flex; flex-direction: column; gap: 14rpx; }
.action { padding: 24rpx; border-radius: 999rpx; text-align: center; font-size: 24rpx; font-weight: 600; }
.action--draft { color: #33185c; background: rgba(51,24,92,0.07); }
.action--publish { color: #fff; background: #33185c; }
.action--archive { color: #b13b5c; border: 1rpx solid rgba(177,59,92,0.25); }
.privacy-note { margin-top: 48rpx; padding: 28rpx; border-radius: 22rpx; background: rgba(51,24,92,0.04); }
.privacy-note-title { display: block; font-size: 22rpx; font-weight: 700; color: #33185c; }
.privacy-note-text { display: block; margin-top: 10rpx; font-size: 20rpx; line-height: 1.75; color: rgba(51,24,92,0.46); }
</style>
