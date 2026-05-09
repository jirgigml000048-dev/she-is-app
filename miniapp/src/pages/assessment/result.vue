<template>
  <view class="page" v-if="test">

    <!-- ── Score bar result card (any test with computeScores) ── -->
    <view v-if="hasScores && scoreRows.length" class="ecr-page">

      <!-- Glow blobs -->
      <view class="ecr-glow ecr-glow--top" />
      <view class="ecr-glow ecr-glow--bottom" />

      <!-- Header label -->
      <view class="ecr-header">
        <text class="ecr-header-label">{{ test.title }} · {{ test.titleEn }}</text>
      </view>

      <!-- Result capture card -->
      <view class="r-card">

        <!-- Type -->
        <text class="r-type">{{ result.label }}</text>

        <!-- Score bars -->
        <view class="r-viz">
          <view v-for="row in scoreRows" :key="row.label" class="r-score-row">
            <text class="r-score-label">{{ row.label }}</text>
            <view class="r-bar-bg">
              <view class="r-bar-fill" :style="{ width: row.pct + '%' }" />
            </view>
            <text class="r-score-val">{{ row.pct }}%</text>
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

      <!-- Row 1: friend share + quote card -->
      <view class="r-share-row">
        <button class="r-save-btn" open-type="share">
          <text class="r-save-btn-text">分享给好友</text>
        </button>
        <view class="r-save-btn" @tap="saveQuoteCard">
          <text class="r-save-btn-text">保存金句卡</text>
        </view>
      </view>
      <!-- Row 2: full result -->
      <view class="r-share-row" style="margin-top:16rpx;">
        <view class="r-save-btn" @tap="saveCard">
          <text class="r-save-btn-text">保存结果长图</text>
        </view>
        <view class="r-save-btn" @tap="shareImage">
          <text class="r-save-btn-text">分享长图</text>
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

  <!-- 2D canvas API: canvas.width/height set in JS → true pixel resolution, always sharp -->
  <canvas type="2d" id="sheResultCanvas" class="result-canvas" />
  <canvas type="2d" id="sheQuoteCanvas"  class="quote-canvas"  />

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
      scoreRows: [],
    }
  },
  onLoad(query) {
    const t = testsById[query.id]
    if (t) {
      this.test = t
      this.resultKey = decodeURIComponent(query.result || '')
      this.result = t.results[this.resultKey] || null

      const answers = uni.getStorageSync(`test-answers-${t.id}`) || []

      if (t.customResult === 'cognitive') {
        this.cognitiveProfile = this.computeCognitiveProfile(t, answers)
      }

      if (typeof t.computeScores === 'function') {
        this.scoreRows = t.computeScores(answers)
      }

      uni.setNavigationBarTitle({ title: '你的结果' })
    }
  },
  onShareAppMessage() {
    if (!this.result || !this.test) return {}
    const label = this.result.label || ''
    const tagline = this.result.tagline || ''
    return {
      title: `${this.test.title}：${label}${tagline ? ' — ' + tagline : ''}`,
      path: `/pages/assessment/test?id=${this.test.id}`,
    }
  },
  computed: {
    hasScores() {
      return typeof this.test?.computeScores === 'function'
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
    async saveQuoteCard() {
      uni.showLoading({ title: '生成金句卡...' })
      try {
        const filePath = await this._generateQuoteCard()
        uni.hideLoading()
        uni.saveImageToPhotosAlbum({
          filePath,
          success: () => uni.showToast({ title: '金句卡已保存', icon: 'success' }),
          fail: (err) => {
            if (err && err.errMsg && err.errMsg.includes('auth')) {
              uni.showModal({
                title: '需要相册权限',
                content: '请在设置中允许访问相册',
                confirmText: '去设置',
                success: (r) => { if (r.confirm) uni.openSetting() },
              })
            } else {
              uni.showToast({ title: '保存失败，请重试', icon: 'none' })
            }
          },
        })
      } catch {
        uni.hideLoading()
        uni.showToast({ title: '生成失败，请重试', icon: 'none' })
      }
    },
    async saveCard() {
      uni.showLoading({ title: '生成结果卡...' })
      try {
        const filePath = await this._generateCard()
        uni.hideLoading()
        uni.saveImageToPhotosAlbum({
          filePath,
          success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
          fail: (err) => {
            if (err && err.errMsg && err.errMsg.includes('auth')) {
              uni.showModal({
                title: '需要相册权限',
                content: '请在设置中允许访问相册',
                confirmText: '去设置',
                success: (r) => { if (r.confirm) uni.openSetting() },
              })
            } else {
              uni.showToast({ title: '保存失败，请重试', icon: 'none' })
            }
          },
        })
      } catch {
        uni.hideLoading()
        uni.showToast({ title: '生成失败，请重试', icon: 'none' })
      }
    },
    async shareImage() {
      uni.showLoading({ title: '生成长图...' })
      try {
        const filePath = await this._generateCard()
        uni.hideLoading()
        wx.showShareImageMenu({
          path: filePath,
          fail: () => {
            // Fallback: save to album
            uni.saveImageToPhotosAlbum({
              filePath,
              success: () => uni.showToast({ title: '图片已保存，请从相册分享', icon: 'none', duration: 2500 }),
              fail: () => uni.showToast({ title: '请截图后分享', icon: 'none' }),
            })
          },
        })
      } catch {
        uni.hideLoading()
        uni.showToast({ title: '生成失败，请重试', icon: 'none' })
      }
    },
    // ── Get 2D canvas node ──────────────────────────────────────────────
    _getCanvas(id) {
      return new Promise((resolve, reject) => {
        uni.createSelectorQuery().in(this)
          .select('#' + id)
          .fields({ node: true, size: true })
          .exec(res => {
            if (res && res[0] && res[0].node) resolve(res[0].node)
            else reject(new Error('canvas not found: ' + id))
          })
      })
    },

    // ── Quote card (金句卡) — 1:1 mirror of web 390×693 design ─────────
    async _generateQuoteCard() {
      const canvas = await this._getCanvas('sheQuoteCanvas')
      const ctx    = canvas.getContext('2d')
      // Draw at 780×1386 (2× of web 390×693) → true pixel resolution
      const W = 780, H = 1386
      canvas.width = W; canvas.height = H

      const label = this.result?.label || ''
      const quote = this.result?.quote || ''

      // Background
      ctx.fillStyle = '#FAF7F4'
      ctx.fillRect(0, 0, W, H)

      // Radial glow — top-left
      const g1 = ctx.createRadialGradient(-124, -144, 0, -124, -144, 480)
      g1.addColorStop(0, 'rgba(160,133,214,0.18)')
      g1.addColorStop(1, 'rgba(160,133,214,0)')
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H)

      // Radial glow — bottom-right
      const g2 = ctx.createRadialGradient(W + 144, H + 140, 0, W + 144, H + 140, 480)
      g2.addColorStop(0, 'rgba(160,133,214,0.16)')
      g2.addColorStop(1, 'rgba(160,133,214,0)')
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H)

      // Test name (12px → 24px at 2×, centered, uppercase, letter-spacing via spacing)
      const testName = (this.test.title || '').toUpperCase()
      ctx.font = '600 24px sans-serif'
      ctx.fillStyle = '#4A3073'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(testName, W / 2, 88)

      // Thin rule (1px → 2px)
      ctx.fillStyle = 'rgba(74,48,115,0.15)'
      ctx.fillRect(W / 2 - 80, 124, 160, 2)

      // Result label — large, centered, vertically centered in middle third
      ctx.font = 'bold 68px sans-serif'
      ctx.fillStyle = '#4A3073'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, W / 2, H * 0.44)

      // Quote — left-aligned with padding, below label
      if (quote) {
        ctx.font = '36px sans-serif'
        ctx.fillStyle = '#5b5167'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        this._wrapText2D(ctx, quote, 68, H * 0.53, W - 136, 52)
      }

      // Footer rule
      ctx.fillStyle = 'rgba(74,48,115,0.12)'
      ctx.fillRect(0, H - 112, W, 2)

      // Branding
      ctx.font = '22px monospace'
      ctx.fillStyle = '#9d948d'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'bottom'
      ctx.fillText('she-is-app', 56, H - 52)

      ctx.font = '26px monospace'
      ctx.fillStyle = '#4A3073'
      ctx.textAlign = 'right'
      ctx.fillText('she is ______.', W - 56, H - 52)

      return new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          canvas, x: 0, y: 0, width: W, height: H,
          destWidth: W, destHeight: H,
          success: r => resolve(r.tempFilePath),
          fail: reject,
        })
      })
    },

    // ── Full result card (结果长图) ──────────────────────────────────────
    async _generateCard() {
      const canvas = await this._getCanvas('sheResultCanvas')
      const ctx    = canvas.getContext('2d')
      // 750px wide @ native resolution → sharp on all screens
      const W = 750, H_MAX = 1600
      canvas.width = W; canvas.height = H_MAX

      const label   = this.result?.label   || ''
      const tagline = this.result?.tagline || ''
      const quote   = this.result?.quote   || ''
      const desc    = this.descParagraphs[0] || ''

      ctx.textBaseline = 'top'
      ctx.fillStyle = '#fcf9f6'
      ctx.fillRect(0, 0, W, H_MAX)

      // Top bar + left stripe
      ctx.fillStyle = '#33185c'
      ctx.fillRect(0, 0, W, 8)
      ctx.fillStyle = 'rgba(156,60,98,0.12)'
      ctx.fillRect(0, 0, 8, H_MAX)

      // Header
      let y = 60
      ctx.font = '20px sans-serif'; ctx.fillStyle = 'rgba(74,48,115,0.4)'
      ctx.textAlign = 'left'
      ctx.fillText('自我图鉴 · SELF DISCOVERY', 44, y); y += 32

      ctx.font = '20px sans-serif'; ctx.fillStyle = 'rgba(74,48,115,0.65)'
      ctx.fillText(this.test.titleEn || this.test.title, 44, y); y += 64

      // Result label
      ctx.font = 'bold 60px sans-serif'; ctx.fillStyle = '#1c1c1a'
      ctx.fillText(label, 44, y); y += 72

      // Tagline
      if (tagline) {
        ctx.font = '26px sans-serif'; ctx.fillStyle = '#9c3c62'
        ctx.fillText(tagline, 44, y); y += 56
      } else { y += 16 }

      // Score bars
      if (this.scoreRows.length) {
        y += 20
        const BX = 160, BW = 460
        this.scoreRows.forEach(row => {
          ctx.font = '22px sans-serif'; ctx.fillStyle = '#999'
          ctx.fillText(row.label, 44, y + 6)

          ctx.fillStyle = 'rgba(74,48,115,0.1)'
          ctx.fillRect(BX, y + 8, BW, 10)
          ctx.fillStyle = '#4A3073'
          ctx.fillRect(BX, y + 8, BW * row.pct / 100, 10)

          ctx.font = '22px sans-serif'; ctx.fillStyle = '#4A3073'
          ctx.textAlign = 'right'
          ctx.fillText(row.pct + '%', 628, y + 6)
          ctx.textAlign = 'left'
          y += 64
        })
        y += 20
      }

      // Divider
      ctx.fillStyle = 'rgba(74,48,115,0.09)'
      ctx.fillRect(44, y, W - 88, 2); y += 40

      // Quote
      if (quote) {
        const lines = Math.ceil(quote.length / 20)
        ctx.fillStyle = 'rgba(156,60,98,0.4)'
        ctx.fillRect(44, y, 6, lines * 40 + 8)
        ctx.font = '26px sans-serif'; ctx.fillStyle = '#3d3158'
        y = this._wrapText2D(ctx, quote, 62, y, W - 106, 40); y += 32
      }

      // Desc
      if (desc) {
        ctx.font = '24px sans-serif'; ctx.fillStyle = '#666'
        y = this._wrapText2D(ctx, desc, 44, y, W - 88, 36); y += 20
      }

      // Footer
      const footerY = y + 32
      ctx.fillStyle = 'rgba(74,48,115,0.06)'
      ctx.fillRect(0, footerY, W, 100)
      ctx.fillStyle = 'rgba(74,48,115,0.1)'
      ctx.fillRect(0, footerY, W, 2)

      ctx.font = 'bold 28px sans-serif'; ctx.fillStyle = '#33185c'
      ctx.fillText('女也', 44, footerY + 18)
      ctx.font = '20px sans-serif'; ctx.fillStyle = 'rgba(74,48,115,0.45)'
      ctx.fillText('She Is ______. · 自我图鉴', 44, footerY + 58)
      ctx.font = '20px sans-serif'; ctx.fillStyle = 'rgba(74,48,115,0.3)'
      ctx.textAlign = 'right'
      ctx.fillText(this.test.id.toUpperCase(), W - 44, footerY + 38)
      ctx.textAlign = 'left'

      const finalH = footerY + 100 + 24

      return new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          canvas, x: 0, y: 0, width: W, height: finalH,
          destWidth: W, destHeight: finalH,  // 1:1, no upscaling
          success: r => resolve(r.tempFilePath),
          fail: reject,
        })
      })
    },

    _wrapText2D(ctx, text, x, y, maxWidth, lineHeight) {
      let line = '', curY = y
      for (const ch of text) {
        const t = line + ch
        if (ctx.measureText(t).width > maxWidth && line) {
          ctx.fillText(line, x, curY); line = ch; curY += lineHeight
        } else { line = t }
      }
      if (line) { ctx.fillText(line, x, curY); curY += lineHeight }
      return curY
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
/* ── 2D CANVAS (off-screen) ── */
/* canvas.width/height set in JS — CSS size irrelevant for resolution */
.result-canvas, .quote-canvas { position: fixed; left: -9999px; top: 0; width: 1px; height: 1px; z-index: -1; }

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
.r-share-img-row { padding: 12rpx 0 20rpx; text-align: center; position: relative; z-index: 1; }
.r-share-img-text { font-size: 22rpx; color: rgba(74,48,115,0.45); letter-spacing: 3rpx; }

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
