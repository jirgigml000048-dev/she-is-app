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

    <view class="result-disclaimer">
      <text class="result-disclaimer-text">本测评仅用于自我探索，不构成医学、心理诊断或治疗建议。</text>
    </view>

  <!-- off-screen canvases (old API — createCanvasContext, proven working) -->
  <canvas canvas-id="resultCard" class="result-canvas" :style="{height: resultCardH + 'px'}" />
  <canvas canvas-id="quoteCard"  class="quote-canvas"  />

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
      resultCardH: 700,
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
    // ── Quote card (金句卡) — matches web reference design ──
    _generateQuoteCard() {
      return new Promise((resolve, reject) => {
        const ctx = uni.createCanvasContext('quoteCard', this)
        const W = 390, H = 693
        const dpr = (uni.getSystemInfoSync().pixelRatio) || 2

        // Background — warm off-white
        ctx.setFillStyle('#edeae5')
        ctx.fillRect(0, 0, W, H)

        // Header: "测评名 · CODE"
        const code = (this.test.id || '').toUpperCase()
        ctx.font = '11px sans-serif'
        ctx.setFillStyle('rgba(45,36,112,0.5)')
        ctx.fillText(`${this.test.title} · ${code}`, 28, 52)

        // Thin horizontal rule
        ctx.setFillStyle('rgba(45,36,112,0.15)')
        ctx.fillRect(28, 62, W - 56, 1)

        // Large result label
        const label = this.result?.label || ''
        ctx.font = 'bold 46px sans-serif'
        ctx.setFillStyle('#2d2470')
        ctx.fillText(label, 28, 174)

        // Tagline — medium weight below label
        let y = 212
        const tagline = this.result?.tagline || ''
        if (tagline) {
          ctx.font = '17px sans-serif'
          ctx.setFillStyle('#2d2470')
          y = this._wrapText(ctx, tagline, 28, y, W - 56, 28)
          y += 40
        }

        // Quote — italic, lighter
        const quote = this.result?.quote || ''
        if (quote) {
          ctx.font = 'italic 15px sans-serif'
          ctx.setFillStyle('rgba(45,36,112,0.52)')
          y = this._wrapText(ctx, quote, 28, y, W - 56, 24)
          y += 36
        }

        // Score summary (scale-based tests only: HSP, ECR …)
        if (this.test.scale && this.scoreRows.length) {
          const avgPct = this.scoreRows.reduce((s, r) => s + r.pct, 0) / this.scoreRows.length
          const raw = (avgPct / 100 * this.test.scale).toFixed(2)
          ctx.font = '12px sans-serif'
          ctx.setFillStyle('rgba(45,36,112,0.38)')
          ctx.fillText(`平均得分 ${raw} / ${this.test.scale}`, 28, y)
        }

        // Footer rule
        ctx.setFillStyle('rgba(45,36,112,0.12)')
        ctx.fillRect(0, H - 60, W, 1)

        // Footer left: URL
        ctx.font = '11px sans-serif'
        ctx.setFillStyle('rgba(45,36,112,0.38)')
        ctx.fillText('微信小程序「女也 She Is」', 28, H - 30)

        // Footer right: brand mark
        ctx.font = '14px sans-serif'
        ctx.setFillStyle('#2d2470')
        const brand = 'she is ______.'
        const bW = ctx.measureText(brand).width
        ctx.fillText(brand, W - 28 - bW, H - 30)

        ctx.draw(false, () => {
          uni.canvasToTempFilePath({
            canvasId: 'quoteCard',
            x: 0, y: 0, width: W, height: H,
            destWidth: W * dpr, destHeight: H * dpr,
            success: r => resolve(r.tempFilePath),
            fail: reject,
          }, this)
        })
      })
    },

    // ── Estimate card height so canvas CSS matches content (avoids blank bottom) ──
    _estimateCardH() {
      let y = 86  // header: 30 + 20 + 36
      y += 38     // title (font 30)
      if (this.result?.tagline) y += 30; else y += 10
      if (this.scoreRows.length) y += 12 + this.scoreRows.length * 34 + 12
      y += 22     // divider
      const quote = this.result?.quote || ''
      if (quote) {
        const lines = Math.max(1, Math.ceil(quote.length / Math.floor(321 / 13)))
        y += lines * 20 + 18
      }
      const desc = this.descParagraphs[0] || ''
      if (desc) {
        const lines = Math.max(1, Math.ceil(desc.length / Math.floor(331 / 12)))
        y += lines * 18 + 10
      }
      return y + 16 + 52 + 20  // footerY + footer box + bottom padding
    },

    // ── Full result card (结果长图) — same design as approved ERQ screenshot ──
    _generateCard() {
      return new Promise((resolve, reject) => {
        // Pass 1: resize canvas CSS to exact content height, then redraw
        const W = 375
        const dpr = (uni.getSystemInfoSync().pixelRatio) || 2
        this.resultCardH = Math.min(this._estimateCardH(), 700)

        this.$nextTick(() => {
        const ctx = uni.createCanvasContext('resultCard', this)
        const label   = this.result?.label   || ''
        const tagline = this.result?.tagline || ''
        const quote   = this.result?.quote   || ''
        const desc    = this.descParagraphs[0] || ''

        const H = this.resultCardH
        ctx.setFillStyle('#fcf9f6')
        ctx.fillRect(0, 0, W, H)

        ctx.setFillStyle('#33185c')
        ctx.fillRect(0, 0, W, 4)
        ctx.setFillStyle('rgba(156,60,98,0.12)')
        ctx.fillRect(0, 0, 4, H)

        let y = 30
        ctx.setFontSize(10); ctx.setFillStyle('rgba(74,48,115,0.4)')
        ctx.fillText('自我图鉴 · SELF DISCOVERY', 22, y); y += 20

        ctx.setFontSize(10); ctx.setFillStyle('rgba(74,48,115,0.65)')
        ctx.fillText(this.test.titleEn || this.test.title, 22, y); y += 36

        ctx.setFontSize(30); ctx.setFillStyle('#1c1c1a')
        ctx.fillText(label, 22, y); y += 38

        if (tagline) {
          ctx.setFontSize(13); ctx.setFillStyle('#9c3c62')
          ctx.fillText(tagline, 22, y); y += 30
        } else { y += 10 }

        if (this.scoreRows.length) {
          y += 12
          const BX = 82, BW = 224
          this.scoreRows.forEach(row => {
            ctx.setFontSize(11); ctx.setFillStyle('#999')
            ctx.fillText(row.label, 22, y + 8)
            ctx.setFillStyle('rgba(74,48,115,0.1)')
            ctx.fillRect(BX, y + 2, BW, 5)
            ctx.setFillStyle('#4A3073')
            ctx.fillRect(BX, y + 2, BW * row.pct / 100, 5)
            ctx.setFontSize(11); ctx.setFillStyle('#4A3073')
            ctx.fillText(row.pct + '%', 314, y + 8)
            y += 34
          })
          y += 12
        }

        ctx.setFillStyle('rgba(74,48,115,0.09)')
        ctx.fillRect(22, y, W - 44, 1); y += 22

        if (quote) {
          const lines = Math.ceil(quote.length / 22)
          ctx.setFillStyle('rgba(156,60,98,0.4)')
          ctx.fillRect(22, y - 2, 3, lines * 20 + 6)
          ctx.setFontSize(13); ctx.setFillStyle('#3d3158')
          y = this._wrapText(ctx, quote, 32, y, W - 54, 20); y += 18
        }

        if (desc) {
          ctx.setFontSize(12); ctx.setFillStyle('#666')
          y = this._wrapText(ctx, desc, 22, y, W - 44, 18); y += 10
        }

        const footerY = y + 16
        ctx.setFillStyle('rgba(74,48,115,0.06)')
        ctx.fillRect(0, footerY, W, 52)
        ctx.setFillStyle('rgba(74,48,115,0.1)')
        ctx.fillRect(0, footerY, W, 1)

        ctx.setFontSize(14); ctx.setFillStyle('#33185c')
        ctx.fillText('女也', 22, footerY + 20)
        ctx.setFontSize(10); ctx.setFillStyle('rgba(74,48,115,0.45)')
        ctx.fillText('She Is ______. · 自我图鉴', 22, footerY + 37)
        ctx.setFontSize(10); ctx.setFillStyle('rgba(74,48,115,0.3)')
        const idLabel = this.test.id.toUpperCase()
        ctx.fillText(idLabel, W - 22 - ctx.measureText(idLabel).width, footerY + 29)

        ctx.draw(false, () => {
          uni.canvasToTempFilePath({
            canvasId: 'resultCard',
            destWidth: W * dpr,
            destHeight: this.resultCardH * dpr,
            success: r => resolve(r.tempFilePath),
            fail: reject,
          }, this)
        })
        }) // $nextTick
      })
    },

    _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
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
/* ── CANVAS (off-screen, old API) ── */
/* result-canvas height is set dynamically via :style to eliminate blank bottom space */
.result-canvas { position: fixed; left: -9999px; top: 0; width: 375px; height: 700px; z-index: -1; }
.quote-canvas  { position: fixed; left: -9999px; top: 0; width: 390px; height: 693px; z-index: -1; }

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
.result-disclaimer { padding: 36rpx 12rpx 0; text-align: center; position: relative; z-index: 1; }
.result-disclaimer-text { font-size: 20rpx; color: rgba(74,48,115,0.35); line-height: 1.7; }
</style>
