<template>
  <view class="page" v-if="test">

    <!-- ── Values portrait: layered result for relative value priorities ── -->
    <view v-if="test.customResult === 'values' && valueProfile" class="values-page">
      <view class="values-hero">
        <text class="values-kicker">YOUR VALUE PORTRAIT · 价值画像</text>
        <text class="values-overline">当生活真的需要取舍</text>
        <text class="values-title">你更先保护</text>
        <text class="values-primary">{{ valueProfile[0].name }}</text>
        <text class="values-tagline">{{ result.tagline }}</text>
        <view class="values-hero-rule" />
        <text class="values-quote">{{ result.quote }}</text>
      </view>

      <view class="values-note">
        <text class="values-note-mark">i</text>
        <text class="values-note-text">这里不是在给价值观评“高低”，而是在看十类价值在你自己心里的相对前后。</text>
      </view>

      <view class="values-section">
        <text class="values-section-kicker">TOP VALUES</text>
        <text class="values-section-title">现在更靠前的三件事</text>
        <view class="values-top-list">
          <view
            v-for="(item, index) in valueProfile.slice(0, 3)"
            :key="item.id"
            :class="['values-top-card', index === 0 ? 'values-top-card--first' : '']"
          >
            <view class="values-top-head">
              <text class="values-top-rank">0{{ index + 1 }}</text>
              <view class="values-top-name-wrap">
                <text class="values-top-name">{{ item.name }}</text>
                <text class="values-top-position">{{ item.position }}</text>
              </view>
            </view>
            <text class="values-top-desc">{{ item.desc }}</text>
            <text class="values-top-everyday">{{ item.everyday }}</text>
          </view>
        </view>
      </view>

      <view class="values-section">
        <text class="values-section-kicker">FOUR DIRECTIONS</text>
        <text class="values-section-title">你的四个动力方向</text>
        <text class="values-section-sub">这是 Schwartz 理论中的四个高阶方向；享乐价值位于“开放变化”与“自我提升”之间。</text>
        <view class="values-domain-list">
          <view v-for="domain in valueDomains" :key="domain.id" class="values-domain-row">
            <view class="values-domain-head">
              <text class="values-domain-name">{{ domain.name }}</text>
              <text class="values-domain-left">{{ domain.left }}</text>
            </view>
            <view class="values-domain-track">
              <view class="values-domain-fill" :style="{ width: domain.pct + '%' }" />
              <view class="values-domain-mid" />
            </view>
          </view>
        </view>
      </view>

      <view class="values-section">
        <text class="values-section-kicker">VALUE TENSIONS</text>
        <text class="values-section-title">你目前的价值张力</text>
        <view class="values-tension-list">
          <view v-for="tension in valueTensions" :key="tension.title" class="values-tension-card">
            <text class="values-tension-title">{{ tension.title }}</text>
            <text class="values-tension-text">{{ tension.text }}</text>
          </view>
        </view>
      </view>

      <view class="values-section">
        <text class="values-section-kicker">FULL ORDER</text>
        <text class="values-section-title">十类价值的完整位置</text>
        <text class="values-section-sub">中线代表你所有回答的个人平均位置；条越向右，表示这类价值在你自己的排序中越靠前。</text>
        <view class="values-full-card">
          <view v-for="(item, index) in valueProfile" :key="item.id" class="values-full-row">
            <text class="values-full-rank">{{ index + 1 }}</text>
            <text class="values-full-name">{{ item.shortName }}</text>
            <view class="values-full-track">
              <view class="values-full-fill" :style="{ width: item.pct + '%' }" />
              <view class="values-full-mid" />
            </view>
            <text class="values-full-position">{{ item.position }}</text>
          </view>
        </view>
      </view>

      <view class="values-scale-card">
        <text class="values-scale-kicker">量表说明 / SCALE NOTE</text>
        <text class="values-scale-name">{{ test.scaleName }}</text>
        <view class="values-scale-line" />
        <text class="values-scale-label">理论框架</text>
        <text class="values-scale-text">Schwartz Basic Human Values（10 类基本价值观）</text>
        <text class="values-scale-label">本版本</text>
        <text class="values-scale-text">30 题中文情境探索版，题目由「女也」原创编写，不是原版 PVQ。</text>
        <text class="values-scale-label">计分方式</text>
        <text class="values-scale-text">{{ test.scoringNote }}</text>
        <text class="values-scale-label">适用边界</text>
        <text class="values-scale-text">用于个人自我探索；未做学术常模验证，不用于研究、招聘、诊断或治疗。</text>
      </view>

      <view class="values-actions">
        <view class="values-retry" @tap="retry">
          <text class="values-retry-text">重新看看此刻的自己</text>
        </view>
        <view class="values-back" @tap="backToList">
          <text class="values-back-text">探索更多测评 →</text>
        </view>
      </view>
    </view>

    <!-- ── Basic psychological needs: satisfaction and frustration stay separate ── -->
    <view v-else-if="test.customResult === 'needs' && needProfile.length" class="needs-page">
      <view class="needs-hero">
        <text class="values-kicker">CURRENT NEEDS · 心理需要近况</text>
        <text class="needs-overline">回看最近一个月</text>
        <text class="needs-title">更需要被照顾的是</text>
        <text class="needs-primary">{{ result.label }}</text>
        <text class="needs-tagline">{{ result.tagline }}</text>
        <view class="values-hero-rule" />
        <text class="values-quote">{{ result.quote }}</text>
      </view>

      <view class="needs-overview">
        <view class="needs-overview-head">
          <view>
            <text class="needs-overview-kicker">OVERALL STATE</text>
            <text class="needs-overview-title">整体近况</text>
          </view>
          <text class="needs-overview-time">最近 1 个月</text>
        </view>
        <view class="needs-meter-row">
          <view class="needs-meter-labels">
            <text class="needs-meter-name">需要满足</text>
            <text class="needs-meter-hint">滋养感</text>
          </view>
          <view class="needs-meter-track">
            <view class="needs-meter-fill needs-meter-fill--satisfaction" :style="{ width: needOverview.satisfactionPct + '%' }" />
          </view>
        </view>
        <view class="needs-meter-row">
          <view class="needs-meter-labels">
            <text class="needs-meter-name">需要受挫</text>
            <text class="needs-meter-hint">挤压感</text>
          </view>
          <view class="needs-meter-track">
            <view class="needs-meter-fill needs-meter-fill--frustration" :style="{ width: needOverview.frustrationPct + '%' }" />
          </view>
        </view>
        <text class="needs-overview-text">{{ needOverview.text }}</text>
      </view>

      <view class="values-section">
        <text class="values-section-kicker">THREE BASIC NEEDS</text>
        <text class="values-section-title">三种需要，分别发生了什么</text>
        <text class="values-section-sub">满足少，不一定等于受挫多。因此每张卡片保留两条独立的线，不用一个分数把它们抵消。</text>
        <view class="needs-card-list">
          <view v-for="item in needProfile" :key="item.id" class="needs-card">
            <view class="needs-card-head">
              <view class="needs-card-name-wrap">
                <text class="needs-card-name">{{ item.name }}</text>
                <text class="needs-card-desc">{{ item.desc }}</text>
              </view>
              <text :class="['needs-state', 'needs-state--' + item.state]">{{ item.stateLabel }}</text>
            </view>

            <view class="needs-dual-meter">
              <view class="needs-dual-row">
                <text class="needs-dual-label">满足</text>
                <view class="needs-dual-track">
                  <view class="needs-dual-fill needs-dual-fill--satisfaction" :style="{ width: item.satisfactionPct + '%' }" />
                </view>
                <text class="needs-dual-word">{{ item.satisfaction >= 3.6 ? '较多' : item.satisfaction < 3 ? '较少' : '中间' }}</text>
              </view>
              <view class="needs-dual-row">
                <text class="needs-dual-label">受挫</text>
                <view class="needs-dual-track">
                  <view class="needs-dual-fill needs-dual-fill--frustration" :style="{ width: item.frustrationPct + '%' }" />
                </view>
                <text class="needs-dual-word">{{ item.frustration >= 3.6 ? '明显' : item.frustration < 3 ? '较少' : '中间' }}</text>
              </view>
            </view>

            <text class="needs-card-interpretation">{{ item.interpretation }}</text>
          </view>
        </view>
      </view>

      <view class="needs-action-card" v-if="needFocus">
        <text class="values-section-kicker">{{ resultKey === 'supported' ? 'KEEP NOURISHING' : 'START HERE' }}</text>
        <text class="needs-action-title">{{ resultKey === 'supported' ? '继续保护这三个支点' : '先照顾' + needFocus.name }}</text>
        <text class="needs-action-intro">不用一次改变整个生活，先从一个足够小、今天能发生的动作开始。</text>
        <view class="needs-action-list">
          <view v-for="(action, index) in needActions" :key="action" class="needs-action-row">
            <text class="needs-action-index">0{{ index + 1 }}</text>
            <text class="needs-action-text">{{ action }}</text>
          </view>
        </view>
      </view>

      <view class="needs-explain-card">
        <text class="needs-explain-kicker">为什么有两条线？</text>
        <text class="needs-explain-text">“没有得到满足”和“正在被挤压”是不同经验。比如缺少自主，可能只是很少有选择；自主受挫，则更像是明明不愿意却持续被迫。两者可以同时出现，也可能只出现一个。</text>
      </view>

      <view class="values-scale-card">
        <text class="values-scale-kicker">量表说明 / SCALE NOTE</text>
        <text class="values-scale-name">{{ test.scaleName }}</text>
        <view class="values-scale-line" />
        <text class="values-scale-label">理论框架</text>
        <text class="values-scale-text">Self-Determination Theory（自我决定理论）中的 Basic Psychological Needs Theory。</text>
        <text class="values-scale-label">结构参考</text>
        <text class="values-scale-text">参考 BPNSFS 对自主、胜任、连接三类需要分别观察满足与受挫的六维结构。</text>
        <text class="values-scale-label">本版本</text>
        <text class="values-scale-text">18 题中文近况探索版，题目由「女也」原创编写，不是原版或经验证的中文版 BPNSFS。</text>
        <text class="values-scale-label">适用边界</text>
        <text class="values-scale-text">用于回看最近状态，不用于学术研究、心理诊断或治疗。结果可能随生活环境与时间改变。</text>
      </view>

      <view class="values-actions">
        <view class="values-retry" @tap="retry">
          <text class="values-retry-text">重新回看最近一个月</text>
        </view>
        <view class="values-back" @tap="backToList">
          <text class="values-back-text">探索更多测评 →</text>
        </view>
      </view>
    </view>

    <!-- ── ECR attachment: continuous anxiety × avoidance map ── -->
    <view v-else-if="test.customResult === 'attachment' && attachmentProfile" class="attachment-page">
      <view class="attachment-hero">
        <text class="values-kicker">ATTACHMENT MAP · 亲密关系地图</text>
        <text class="attachment-overline">在靠近与距离之间</text>
        <text class="attachment-title">你目前更接近</text>
        <text class="attachment-primary">{{ result.label }}</text>
        <text class="attachment-tagline">{{ result.tagline }}</text>
        <view class="values-hero-rule" />
        <text class="values-quote">{{ result.quote }}</text>
      </view>

      <view class="attachment-caveat">
        <text class="attachment-caveat-mark">↗</text>
        <text class="attachment-caveat-text">这不是一种固定人格。ECR 更适合看作焦虑与回避的连续坐标；不同关系、阶段和经历中，你的位置可能变化。</text>
      </view>

      <view class="values-section">
        <text class="values-section-kicker">TWO-DIMENSION MAP</text>
        <text class="values-section-title">你在双维坐标上的位置</text>
        <text class="values-section-sub">横向越往右，越倾向在亲密中保持距离；纵向越往上，越容易因关系的不确定而警觉。</text>
        <view class="attachment-map-shell">
          <view class="attachment-map">
            <view class="attachment-quadrant attachment-quadrant--tl"><text>焦虑靠近</text></view>
            <view class="attachment-quadrant attachment-quadrant--tr"><text>靠近与退后拉扯</text></view>
            <view class="attachment-quadrant attachment-quadrant--bl"><text>相对安全</text></view>
            <view class="attachment-quadrant attachment-quadrant--br"><text>保持距离</text></view>
            <view class="attachment-axis attachment-axis--x" />
            <view class="attachment-axis attachment-axis--y" />
            <view class="attachment-dot" :style="attachmentDot">
              <view class="attachment-dot-core" />
              <view class="attachment-dot-ring" />
            </view>
            <text class="attachment-axis-label attachment-axis-label--top">焦虑较高</text>
            <text class="attachment-axis-label attachment-axis-label--bottom">焦虑较低</text>
          </view>
          <view class="attachment-x-labels">
            <text>回避较低</text>
            <text>回避较高</text>
          </view>
        </view>
        <text class="attachment-map-note">四个区域只是阅读坐标的辅助，不是天然存在的四类人。</text>
      </view>

      <view class="values-section">
        <text class="values-section-kicker">CONTINUOUS SCORES</text>
        <text class="values-section-title">真正需要看的两条线</text>
        <view class="attachment-dimension-list">
          <view v-for="dimension in attachmentDimensions" :key="dimension.id" class="attachment-dimension-card">
            <view class="attachment-dimension-head">
              <view>
                <text class="attachment-dimension-name">{{ dimension.name }}</text>
                <text class="attachment-dimension-position">{{ dimension.position }}</text>
              </view>
              <text class="attachment-dimension-score">{{ dimension.display }}<text class="attachment-dimension-total"> / 7</text></text>
            </view>
            <view class="attachment-dimension-track">
              <view class="attachment-dimension-fill" :style="{ width: dimension.pct + '%' }" />
              <view class="attachment-dimension-mid" />
            </view>
            <view class="attachment-dimension-ends">
              <text>{{ dimension.low }}</text>
              <text>{{ dimension.high }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="values-section">
        <text class="values-section-kicker">AUTOMATIC PATTERN</text>
        <text class="values-section-title">关系里的自动动作</text>
        <view class="attachment-pattern-card attachment-pattern-card--dark">
          <text class="attachment-pattern-label">你的关系节奏</text>
          <text class="attachment-pattern-text">{{ result.pattern }}</text>
        </view>
        <view class="attachment-pattern-card">
          <text class="attachment-pattern-label">你常用的保护方式</text>
          <text class="attachment-pattern-text">{{ result.protection }}</text>
        </view>
        <view class="attachment-list-card">
          <text class="attachment-list-title">比较容易触发你的时刻</text>
          <view v-for="(trigger, index) in result.triggers" :key="trigger" class="attachment-list-row">
            <text class="attachment-list-index">0{{ index + 1 }}</text>
            <text class="attachment-list-text">{{ trigger }}</text>
          </view>
        </view>
      </view>

      <view class="values-section">
        <text class="values-section-kicker">RELATIONAL RESOURCES</text>
        <text class="values-section-title">这个位置也带给你的能力</text>
        <view class="attachment-strength-grid">
          <view v-for="(strength, index) in result.strengths" :key="strength" class="attachment-strength-card">
            <text class="attachment-strength-mark">{{ index + 1 }}</text>
            <text class="attachment-strength-text">{{ strength }}</text>
          </view>
        </view>
      </view>

      <view class="attachment-action-card">
        <text class="values-section-kicker">TRY THIS NEXT</text>
        <text class="attachment-action-title">下一次关系被触发时</text>
        <text class="attachment-action-intro">不要求自己立刻变成另一种人，只尝试把自动反应放慢一点点。</text>
        <view class="needs-action-list">
          <view v-for="(action, index) in result.actions" :key="action" class="needs-action-row">
            <text class="needs-action-index">0{{ index + 1 }}</text>
            <text class="needs-action-text">{{ action }}</text>
          </view>
        </view>
      </view>

      <view class="values-scale-card">
        <text class="values-scale-kicker">量表说明 / SCALE NOTE</text>
        <text class="values-scale-name">{{ test.scaleName }}</text>
        <view class="values-scale-line" />
        <text class="values-scale-label">量表来源</text>
        <text class="values-scale-text">Experiences in Close Relationships，Brennan、Clark 与 Shaver（1998）。</text>
        <text class="values-scale-label">核心维度</text>
        <text class="values-scale-text">依恋焦虑关注对伴侣可得性与回应的不安；依恋回避关注对亲密、依赖与情感开放的不适。</text>
        <text class="values-scale-label">结果怎么读</text>
        <text class="values-scale-text">{{ test.scoringNote }}</text>
        <text class="values-scale-label">适用边界</text>
        <text class="values-scale-text">用于个人自我探索，不用于心理诊断。当前关系质量与作答时的状态也可能影响结果。</text>
      </view>

      <view class="values-actions">
        <view class="values-retry" @tap="retry">
          <text class="values-retry-text">重新回看关系体验</text>
        </view>
        <view class="values-back" @tap="backToList">
          <text class="values-back-text">探索更多测评 →</text>
        </view>
      </view>
    </view>

    <!-- ── Shared deep interpretation for multidimensional legacy scales ── -->
    <view v-else-if="test.richResult && richContent" class="rich-page">
      <view class="rich-hero">
        <text class="values-kicker">DEEP INTERPRETATION · 深度解读</text>
        <text class="rich-overline">{{ test.titleEn }}</text>
        <text class="rich-primary">{{ result.label }}</text>
        <text class="rich-tagline" v-if="result.tagline">{{ result.tagline }}</text>
        <view class="values-hero-rule" />
        <text class="values-quote">{{ result.quote }}</text>
      </view>

      <view class="rich-overview-card">
        <text class="rich-overview-kicker">YOUR PATTERN</text>
        <text class="rich-overview-title">这组结果正在说什么</text>
        <text class="rich-overview-text">{{ richContent.pattern || result.desc }}</text>
      </view>

      <view class="values-section">
        <text class="values-section-kicker">DIMENSION PROFILE</text>
        <text class="values-section-title">拆开来看，不只看总标签</text>
        <text class="values-section-sub">每一条只表示该倾向在这份问卷中的相对位置，不代表能力高低，也不与别人比较。</text>
        <view class="rich-dimension-list">
          <view v-for="dimension in richDimensions" :key="dimension.label" class="rich-dimension-card">
            <view class="rich-dimension-head">
              <text class="rich-dimension-name">{{ dimension.label }}</text>
              <text class="rich-dimension-position">{{ dimension.position }}</text>
            </view>
            <view class="rich-dimension-track">
              <view class="rich-dimension-fill" :style="{ width: dimension.pct + '%' }" />
            </view>
            <text class="rich-dimension-note">{{ dimension.note }}</text>
          </view>
        </view>
      </view>

      <view class="values-section" v-if="richContent.strengths && richContent.strengths.length">
        <text class="values-section-kicker">WHAT IT GIVES YOU</text>
        <text class="values-section-title">这种方式也带给你的能力</text>
        <view class="attachment-strength-grid">
          <view v-for="(strength, index) in richContent.strengths" :key="strength" class="attachment-strength-card">
            <text class="attachment-strength-mark">{{ index + 1 }}</text>
            <text class="attachment-strength-text">{{ strength }}</text>
          </view>
        </view>
      </view>

      <view class="values-section" v-if="richContent.watchFor && richContent.watchFor.length">
        <text class="values-section-kicker">WATCH FOR</text>
        <text class="values-section-title">比较容易消耗你的地方</text>
        <view class="attachment-list-card rich-watch-card">
          <view v-for="(item, index) in richContent.watchFor" :key="item" class="attachment-list-row">
            <text class="attachment-list-index">0{{ index + 1 }}</text>
            <text class="attachment-list-text">{{ item }}</text>
          </view>
        </view>
      </view>

      <view class="attachment-action-card" v-if="richContent.actions && richContent.actions.length">
        <text class="values-section-kicker">TRY THIS NEXT</text>
        <text class="attachment-action-title">可以先试的三个动作</text>
        <text class="attachment-action-intro">不要求自己一次改变，只把原来的自动反应放松一点点。</text>
        <view class="needs-action-list">
          <view v-for="(action, index) in richContent.actions" :key="action" class="needs-action-row">
            <text class="needs-action-index">0{{ index + 1 }}</text>
            <text class="needs-action-text">{{ action }}</text>
          </view>
        </view>
      </view>

      <view class="values-scale-card">
        <text class="values-scale-kicker">量表说明 / SCALE NOTE</text>
        <text class="values-scale-name">{{ test.scaleName }}</text>
        <view class="values-scale-line" />
        <text class="values-scale-label">量表来源</text>
        <text class="values-scale-text">{{ test.sourceDetail }}</text>
        <text class="values-scale-label">本版本</text>
        <text class="values-scale-text">{{ test.scaleNote }}</text>
        <text class="values-scale-label">结果怎么读</text>
        <text class="values-scale-text">{{ test.scoringNote }}</text>
        <text class="values-scale-label">适用边界</text>
        <text class="values-scale-text">{{ test.scaleBoundary }}</text>
      </view>

      <view class="values-actions">
        <view class="values-retry" @tap="retry">
          <text class="values-retry-text">重新测试</text>
        </view>
        <view class="values-back" @tap="backToList">
          <text class="values-back-text">探索更多测评 →</text>
        </view>
      </view>
    </view>

    <!-- ── Score bar result card (any test with computeScores) ── -->
    <view v-else-if="hasScores && scoreRows.length" class="ecr-page">

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
      <view v-if="test.customResult === 'cognitive' && cognitiveProfile && cognitiveInsight" class="cog-result">
        <view class="cog-pair-card">
          <text class="cog-pair-kicker">YOUR COGNITIVE PAIR</text>
          <text class="cog-pair-title">{{ cognitiveInsight.title }}</text>
          <text class="cog-pair-text">{{ cognitiveInsight.pattern }}</text>
        </view>

        <view class="values-section cog-section">
          <text class="values-section-kicker">FULL PROFILE</text>
          <text class="values-section-title">八种功能的完整位置</text>
          <text class="values-section-sub">这里看的是相对偏好，不是能力测验。相邻分数很接近时，把它们看作一组常用工具，比硬分第一、第二更合适。</text>
          <view class="cog-card">
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
        </view>

        <view class="values-section cog-section">
          <text class="values-section-kicker">WHAT IT GIVES YOU</text>
          <text class="values-section-title">这组组合带给你的能力</text>
          <view class="attachment-strength-grid">
            <view v-for="(item, index) in cognitiveInsight.strengths" :key="item" class="attachment-strength-card">
              <text class="attachment-strength-mark">{{ index + 1 }}</text>
              <text class="attachment-strength-text">{{ item }}</text>
            </view>
          </view>
        </view>

        <view class="values-section cog-section">
          <text class="values-section-kicker">WATCH FOR</text>
          <text class="values-section-title">用得太顺手时，可能忽略什么</text>
          <view class="attachment-list-card rich-watch-card">
            <view v-for="(item, index) in cognitiveInsight.watchFor" :key="item" class="attachment-list-row">
              <text class="attachment-list-index">0{{ index + 1 }}</text>
              <text class="attachment-list-text">{{ item }}</text>
            </view>
          </view>
        </view>

        <view class="attachment-action-card cog-action-card">
          <text class="values-section-kicker">TRY THIS NEXT</text>
          <text class="attachment-action-title">让偏好更有弹性的三个练习</text>
          <text class="attachment-action-intro">不是压低你擅长的方式，而是补上一点平时不容易自动出现的视角。</text>
          <view class="needs-action-list">
            <view v-for="(item, index) in cognitiveInsight.actions" :key="item" class="needs-action-row">
              <text class="needs-action-index">0{{ index + 1 }}</text>
              <text class="needs-action-text">{{ item }}</text>
            </view>
          </view>
        </view>

        <view class="values-scale-card cog-scale-card">
          <text class="values-scale-kicker">量表说明 / SCALE NOTE</text>
          <text class="values-scale-name">{{ test.scaleName }}</text>
          <view class="values-scale-line" />
          <text class="values-scale-label">理论来源</text>
          <text class="values-scale-text">{{ test.sourceDetail }}</text>
          <text class="values-scale-label">本版本</text>
          <text class="values-scale-text">{{ test.scaleNote }}</text>
          <text class="values-scale-label">结果怎么读</text>
          <text class="values-scale-text">{{ test.scoringNote }}</text>
          <text class="values-scale-label">适用边界</text>
          <text class="values-scale-text">{{ test.scaleBoundary }}</text>
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
      cognitiveInsight: null,
      valueProfile: null,
      valueDomains: [],
      valueTensions: [],
      needProfile: [],
      needOverview: null,
      needFocus: null,
      needActions: [],
      attachmentProfile: null,
      attachmentDimensions: [],
      attachmentDot: { left: '50%', bottom: '50%' },
      richContent: null,
      richDimensions: [],
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
        this.cognitiveInsight = this.buildCognitiveInsight(this.cognitiveProfile)
      }

      if (t.customResult === 'values' && typeof t.computeProfile === 'function') {
        this.valueProfile = t.computeProfile(answers)
        const overview = typeof t.computeDomains === 'function'
          ? t.computeDomains(answers)
          : { domains: [], tensions: [] }
        this.valueDomains = overview.domains || []
        this.valueTensions = overview.tensions || []
      }

      if (t.customResult === 'needs' && typeof t.computeProfile === 'function') {
        this.needProfile = t.computeProfile(answers)
        this.needOverview = typeof t.computeOverview === 'function'
          ? t.computeOverview(answers)
          : null
        this.needFocus = [...this.needProfile]
          .sort((a, b) => b.attentionScore - a.attentionScore)[0] || null
        this.needActions = this.resultKey === 'supported'
          ? this.needProfile.map(item => item.actions[0])
          : (this.needFocus?.actions || [])
      }

      if (t.customResult === 'attachment' && typeof t.computeAttachmentProfile === 'function') {
        this.attachmentProfile = t.computeAttachmentProfile(answers)
        this.attachmentDimensions = [
          this.attachmentProfile.anxiety,
          this.attachmentProfile.avoidance,
        ]
        const clampDot = value => Math.max(6, Math.min(94, value))
        this.attachmentDot = {
          left: `${clampDot(this.attachmentProfile.avoidance.pct)}%`,
          bottom: `${clampDot(this.attachmentProfile.anxiety.pct)}%`,
        }
      }

      if (typeof t.computeScores === 'function') {
        this.scoreRows = t.computeScores(answers)
      }

      if (t.richResult) {
        this.richContent = (t.richGuidance && t.richGuidance[this.resultKey]) || {}
        this.richDimensions = this.scoreRows.map(row => {
          let position = '中间位置'
          if (row.pct >= 67) position = '相对突出'
          else if (row.pct <= 33) position = '相对不突出'
          const note = t.dimensionNotes && t.dimensionNotes[row.label]
          return { ...row, position, note: note || '' }
        })
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
    buildCognitiveInsight(profile) {
      const guidance = {
        Se: {
          process: '进入现场，根据真实反馈行动',
          strengths: ['对当下变化敏锐，临场反应通常较快', '能把想法带回真实体验，及时试出结果'],
          watchFor: ['行动速度快于意义梳理，之后才发现方向需要调整', '容易低估安静复盘和长期后果的重要性'],
          actions: ['行动前用一分钟问自己：这件事一周后可能带来什么？'],
        },
        Si: {
          process: '调用经验、细节和熟悉参照',
          strengths: ['能保留可靠经验，让生活和工作更稳定', '对细节差异敏感，较容易发现异常'],
          watchFor: ['新情况出现时，仍用旧经验解释而错过变化', '熟悉感被打破后，需要较长时间才能重新进入状态'],
          actions: ['遇到变化时，先列出一个与过去不同的新事实。'],
        },
        Ne: {
          process: '打开可能，连接看似无关的线索',
          strengths: ['点子和替代方案丰富，容易发现新路径', '能跨领域建立联系，让问题出现新的解释'],
          watchFor: ['可能性越开越多，决定和收尾被不断推迟', '被新鲜方向吸引，忽略原计划仍需要完成'],
          actions: ['每次发散后只保留两个方向，并为其中一个安排下一步。'],
        },
        Ni: {
          process: '收束线索，寻找深层模式与长期方向',
          strengths: ['擅长从复杂信息中提炼主题和趋势', '方向一旦清楚，能够围绕核心长期投入'],
          watchFor: ['太相信整体直觉，却没有让别人看见推理过程', '过早收束为一个解释，忽略仍存在的其他可能'],
          actions: ['形成直觉结论后，补写两条支持证据和一个反例。'],
        },
        Te: {
          process: '明确目标、组织资源并推动落地',
          strengths: ['能把模糊目标转成步骤、标准和结果', '善于分配资源，让复杂任务真正向前推进'],
          watchFor: ['效率成为唯一尺度，人的感受和隐性成本被压后', '面对暂时无法量化的事，容易过快判断它不重要'],
          actions: ['制定方案时加一栏：它会怎样影响参与其中的人？'],
        },
        Ti: {
          process: '拆开概念，检验逻辑能否自洽',
          strengths: ['能发现定义含混与推理中的断点', '善于独立拆解问题，建立清楚的理解框架'],
          watchFor: ['为了再准确一点持续分析，迟迟不进入现实验证', '表达过于强调逻辑，让别人误以为感受不被重视'],
          actions: ['分析到一个可验证假设后，马上做一次小规模现实测试。'],
        },
        Fe: {
          process: '读取关系氛围，协调彼此的需要',
          strengths: ['能察觉互动中的情绪变化和未说出口的需要', '擅长调整表达，让合作更容易继续'],
          watchFor: ['过度照顾整体气氛，自己的真实意见被放到最后', '把别人的失望自动理解成自己应该负责'],
          actions: ['协调别人之前，先用一句话说清自己的真实位置。'],
        },
        Fi: {
          process: '回到内心价值，确认什么真正重要',
          strengths: ['能辨认细腻感受，对真实与原则有稳定判断', '尊重个体差异，不轻易用统一标准定义别人'],
          watchFor: ['价值感很清楚，却不容易把理由翻译给别人', '感到被误解时先退回内心，关系里留下猜测'],
          actions: ['重要选择里不仅说“我不愿意”，也补充“因为我在保护……”。'],
        },
      }
      const top = profile && profile[0]
      const second = profile && profile[1]
      if (!top || !second) return null
      const firstGuide = guidance[top.id]
      const secondGuide = guidance[second.id]
      const unique = items => [...new Set(items)].slice(0, 3)
      return {
        title: `${top.name} × ${second.name}`,
        pattern: `你更常先${firstGuide.process}，同时也会${secondGuide.process}。这不是固定的人格顺序，而是本次回答里你最容易拿到手的两种认知工具。它们越接近，越适合把结果读成“组合”，而不是争论谁才是真正第一。`,
        strengths: unique([...firstGuide.strengths, ...secondGuide.strengths]),
        watchFor: unique([...firstGuide.watchFor, ...secondGuide.watchFor]),
        actions: unique([...firstGuide.actions, ...secondGuide.actions, '下一次做重要判断时，主动请一种与你不同的视角来补充。']),
      }
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

/* ── VALUES PORTRAIT ── */
.values-page {
  position: relative;
  padding-top: 12rpx;
}
.values-hero {
  padding: 64rpx 8rpx 52rpx;
}
.values-kicker,
.values-section-kicker,
.values-scale-kicker {
  display: block;
  font-size: 18rpx;
  color: #9c3c62;
  letter-spacing: 5rpx;
  font-weight: 700;
}
.values-kicker { margin-bottom: 48rpx; }
.values-overline {
  display: block;
  font-size: 24rpx;
  color: rgba(74,48,115,0.45);
  letter-spacing: 3rpx;
  margin-bottom: 14rpx;
}
.values-title {
  display: block;
  font-size: 38rpx;
  color: #33185c;
  line-height: 1.35;
}
.values-primary {
  display: block;
  font-size: 72rpx;
  line-height: 1.18;
  color: #33185c;
  font-weight: 800;
  letter-spacing: 2rpx;
  margin: 4rpx 0 18rpx;
}
.values-tagline {
  display: block;
  font-size: 27rpx;
  line-height: 1.6;
  color: #9c3c62;
}
.values-hero-rule {
  width: 64rpx;
  height: 4rpx;
  background: rgba(74,48,115,0.18);
  border-radius: 999rpx;
  margin: 44rpx 0 28rpx;
}
.values-quote {
  display: block;
  font-size: 28rpx;
  color: #4a454f;
  line-height: 1.85;
  font-style: italic;
}
.values-note {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  background: rgba(156,60,98,0.055);
  border: 2rpx solid rgba(156,60,98,0.12);
  border-radius: 20rpx;
  padding: 24rpx 26rpx;
  margin-bottom: 64rpx;
}
.values-note-mark {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #9c3c62;
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  text-align: center;
  line-height: 32rpx;
  flex-shrink: 0;
  font-style: italic;
}
.values-note-text {
  flex: 1;
  font-size: 22rpx;
  line-height: 1.75;
  color: #6c5e66;
}
.values-section {
  margin-bottom: 72rpx;
}
.values-section-kicker {
  margin: 0 8rpx 14rpx;
}
.values-section-title {
  display: block;
  font-size: 36rpx;
  color: #33185c;
  font-weight: 700;
  line-height: 1.45;
  margin: 0 8rpx 16rpx;
}
.values-section-sub {
  display: block;
  font-size: 21rpx;
  color: #8b8279;
  line-height: 1.75;
  margin: 0 8rpx 28rpx;
}
.values-top-list,
.values-tension-list {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  margin-top: 30rpx;
}
.values-top-card {
  background: #fff;
  border-radius: 26rpx;
  padding: 34rpx 32rpx;
  border: 2rpx solid rgba(74,48,115,0.09);
  box-shadow: 0 4px 24rpx rgba(51,24,92,0.045);
}
.values-top-card--first {
  background: linear-gradient(145deg, #3a205f, #28163f);
  border-color: transparent;
  box-shadow: 0 16rpx 42rpx rgba(51,24,92,0.18);
}
.values-top-head {
  display: flex;
  align-items: flex-start;
  gap: 22rpx;
  margin-bottom: 22rpx;
}
.values-top-rank {
  font-size: 20rpx;
  letter-spacing: 2rpx;
  color: #9c3c62;
  font-weight: 800;
  padding-top: 6rpx;
}
.values-top-card--first .values-top-rank { color: #e7a7bd; }
.values-top-name-wrap { flex: 1; }
.values-top-name {
  display: block;
  font-size: 34rpx;
  color: #33185c;
  font-weight: 700;
  margin-bottom: 8rpx;
}
.values-top-position {
  display: block;
  font-size: 19rpx;
  color: rgba(74,48,115,0.45);
  letter-spacing: 2rpx;
}
.values-top-card--first .values-top-name { color: #fff; }
.values-top-card--first .values-top-position { color: rgba(255,255,255,0.52); }
.values-top-desc,
.values-top-everyday {
  display: block;
  font-size: 24rpx;
  color: #4f4a46;
  line-height: 1.85;
}
.values-top-everyday {
  color: #8b8279;
  margin-top: 18rpx;
  padding-top: 18rpx;
  border-top: 2rpx solid rgba(74,48,115,0.07);
}
.values-top-card--first .values-top-desc { color: rgba(255,255,255,0.88); }
.values-top-card--first .values-top-everyday {
  color: rgba(255,255,255,0.58);
  border-top-color: rgba(255,255,255,0.1);
}
.values-domain-list {
  background: #fff;
  border-radius: 26rpx;
  padding: 34rpx 30rpx 14rpx;
  border: 2rpx solid rgba(74,48,115,0.09);
  box-shadow: 0 4px 24rpx rgba(51,24,92,0.045);
}
.values-domain-row { margin-bottom: 30rpx; }
.values-domain-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 14rpx;
}
.values-domain-name {
  font-size: 25rpx;
  color: #33185c;
  font-weight: 650;
}
.values-domain-left {
  font-size: 19rpx;
  color: #9c3c62;
}
.values-domain-track,
.values-full-track {
  position: relative;
  height: 8rpx;
  border-radius: 999rpx;
  background: rgba(74,48,115,0.08);
  overflow: hidden;
}
.values-domain-fill,
.values-full-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(156,60,98,0.42), #4a3073);
}
.values-domain-mid,
.values-full-mid {
  position: absolute;
  left: 50%;
  top: -4rpx;
  width: 2rpx;
  height: 16rpx;
  background: rgba(255,255,255,0.9);
  box-shadow: 0 0 0 1rpx rgba(74,48,115,0.12);
}
.values-tension-card {
  padding: 30rpx 30rpx 32rpx;
  background: #fffdfa;
  border-radius: 24rpx;
  border-left: 6rpx solid rgba(156,60,98,0.5);
  box-shadow: 0 4px 20rpx rgba(51,24,92,0.04);
}
.values-tension-title {
  display: block;
  font-size: 24rpx;
  color: #9c3c62;
  font-weight: 700;
  letter-spacing: 2rpx;
  margin-bottom: 14rpx;
}
.values-tension-text {
  display: block;
  font-size: 24rpx;
  color: #514c48;
  line-height: 1.85;
}
.values-full-card {
  background: #fff;
  border-radius: 26rpx;
  padding: 18rpx 28rpx;
  border: 2rpx solid rgba(74,48,115,0.09);
  box-shadow: 0 4px 24rpx rgba(51,24,92,0.045);
}
.values-full-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-height: 76rpx;
  border-bottom: 2rpx solid rgba(74,48,115,0.055);
}
.values-full-row:last-child { border-bottom: 0; }
.values-full-rank {
  width: 28rpx;
  flex-shrink: 0;
  font-size: 18rpx;
  color: rgba(74,48,115,0.35);
  font-weight: 700;
}
.values-full-name {
  width: 64rpx;
  flex-shrink: 0;
  font-size: 22rpx;
  color: #33185c;
  font-weight: 600;
}
.values-full-track { flex: 1; }
.values-full-position {
  width: 82rpx;
  flex-shrink: 0;
  text-align: right;
  font-size: 18rpx;
  color: #8b8279;
}
.values-scale-card {
  background: #f2ebe5;
  border-radius: 26rpx;
  padding: 36rpx 32rpx 38rpx;
  margin-bottom: 42rpx;
}
.values-scale-kicker { margin-bottom: 16rpx; }
.values-scale-name {
  display: block;
  font-size: 27rpx;
  color: #33185c;
  font-weight: 700;
  line-height: 1.55;
}
.values-scale-line {
  height: 2rpx;
  background: rgba(74,48,115,0.1);
  margin: 26rpx 0;
}
.values-scale-label {
  display: block;
  font-size: 19rpx;
  color: #9c3c62;
  letter-spacing: 2rpx;
  font-weight: 700;
  margin: 20rpx 0 6rpx;
}
.values-scale-text {
  display: block;
  font-size: 21rpx;
  color: #635c57;
  line-height: 1.7;
}
.values-actions {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}
.values-retry,
.values-back {
  border-radius: 999rpx;
  padding: 28rpx 20rpx;
  text-align: center;
}
.values-retry {
  border: 2rpx solid rgba(74,48,115,0.2);
}
.values-back {
  background: #33185c;
  box-shadow: 0 12rpx 34rpx rgba(51,24,92,0.14);
}
.values-retry-text {
  font-size: 24rpx;
  color: #4a3073;
  font-weight: 600;
}
.values-back-text {
  font-size: 25rpx;
  color: #fff;
  font-weight: 700;
  letter-spacing: 2rpx;
}

/* ── BASIC PSYCHOLOGICAL NEEDS ── */
.needs-page { position: relative; padding-top: 12rpx; }
.needs-hero { padding: 64rpx 8rpx 52rpx; }
.needs-overline {
  display: block;
  font-size: 24rpx;
  color: rgba(74,48,115,0.45);
  letter-spacing: 3rpx;
  margin-bottom: 14rpx;
}
.needs-title {
  display: block;
  font-size: 38rpx;
  color: #33185c;
  line-height: 1.35;
}
.needs-primary {
  display: block;
  font-size: 68rpx;
  line-height: 1.2;
  color: #33185c;
  font-weight: 800;
  letter-spacing: 1rpx;
  margin: 4rpx 0 18rpx;
}
.needs-tagline {
  display: block;
  font-size: 27rpx;
  line-height: 1.65;
  color: #9c3c62;
}
.needs-overview {
  background: linear-gradient(150deg, #3a205f, #28163f);
  border-radius: 28rpx;
  padding: 38rpx 34rpx;
  margin-bottom: 72rpx;
  box-shadow: 0 16rpx 42rpx rgba(51,24,92,0.18);
}
.needs-overview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 34rpx;
}
.needs-overview-kicker {
  display: block;
  font-size: 17rpx;
  letter-spacing: 4rpx;
  color: #e7a7bd;
  font-weight: 700;
  margin-bottom: 10rpx;
}
.needs-overview-title {
  display: block;
  font-size: 34rpx;
  color: #fff;
  font-weight: 700;
}
.needs-overview-time {
  font-size: 18rpx;
  color: rgba(255,255,255,0.45);
  padding-top: 6rpx;
}
.needs-meter-row { margin-bottom: 26rpx; }
.needs-meter-labels {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12rpx;
}
.needs-meter-name { font-size: 22rpx; color: rgba(255,255,255,0.86); font-weight: 600; }
.needs-meter-hint { font-size: 18rpx; color: rgba(255,255,255,0.38); }
.needs-meter-track {
  height: 9rpx;
  background: rgba(255,255,255,0.12);
  border-radius: 999rpx;
  overflow: hidden;
}
.needs-meter-fill { height: 100%; border-radius: 999rpx; }
.needs-meter-fill--satisfaction { background: linear-gradient(90deg, #a991df, #f0c3d1); }
.needs-meter-fill--frustration { background: linear-gradient(90deg, #a55b78, #e3a55c); }
.needs-overview-text {
  display: block;
  font-size: 23rpx;
  color: rgba(255,255,255,0.7);
  line-height: 1.8;
  border-top: 2rpx solid rgba(255,255,255,0.1);
  padding-top: 26rpx;
  margin-top: 34rpx;
}
.needs-card-list {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  margin-top: 30rpx;
}
.needs-card {
  background: #fff;
  border: 2rpx solid rgba(74,48,115,0.09);
  border-radius: 26rpx;
  padding: 34rpx 30rpx;
  box-shadow: 0 4px 24rpx rgba(51,24,92,0.045);
}
.needs-card-head {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}
.needs-card-name-wrap { flex: 1; }
.needs-card-name {
  display: block;
  font-size: 32rpx;
  color: #33185c;
  font-weight: 700;
  margin-bottom: 10rpx;
}
.needs-card-desc {
  display: block;
  font-size: 21rpx;
  color: #8b8279;
  line-height: 1.7;
}
.needs-state {
  flex-shrink: 0;
  max-width: 150rpx;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  font-size: 17rpx;
  text-align: center;
  line-height: 1.35;
}
.needs-state--supported { color: #356f62; background: rgba(63,168,130,0.11); }
.needs-state--mixed { color: #8b6934; background: rgba(201,160,92,0.14); }
.needs-state--absent { color: #6e6680; background: rgba(74,48,115,0.08); }
.needs-state--pressured { color: #9c3c62; background: rgba(156,60,98,0.1); }
.needs-dual-meter {
  margin: 30rpx 0 26rpx;
  padding: 24rpx 0;
  border-top: 2rpx solid rgba(74,48,115,0.07);
  border-bottom: 2rpx solid rgba(74,48,115,0.07);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.needs-dual-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.needs-dual-label {
  width: 50rpx;
  flex-shrink: 0;
  font-size: 20rpx;
  color: #6c6862;
}
.needs-dual-track {
  flex: 1;
  height: 8rpx;
  border-radius: 999rpx;
  background: rgba(74,48,115,0.075);
  overflow: hidden;
}
.needs-dual-fill { height: 100%; border-radius: 999rpx; }
.needs-dual-fill--satisfaction { background: linear-gradient(90deg, #71539b, #9c3c62); }
.needs-dual-fill--frustration { background: linear-gradient(90deg, #c9a05c, #b85f73); }
.needs-dual-word {
  width: 54rpx;
  flex-shrink: 0;
  text-align: right;
  font-size: 18rpx;
  color: #9a928b;
}
.needs-card-interpretation {
  display: block;
  font-size: 24rpx;
  color: #514c48;
  line-height: 1.85;
}
.needs-action-card {
  background: #f2ebe5;
  border-radius: 28rpx;
  padding: 38rpx 32rpx;
  margin-bottom: 28rpx;
}
.needs-action-title {
  display: block;
  font-size: 36rpx;
  color: #33185c;
  font-weight: 700;
  margin: 14rpx 0 12rpx;
}
.needs-action-intro {
  display: block;
  font-size: 22rpx;
  color: #7a716a;
  line-height: 1.75;
  margin-bottom: 30rpx;
}
.needs-action-list {
  display: flex;
  flex-direction: column;
}
.needs-action-row {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 24rpx 0;
  border-top: 2rpx solid rgba(74,48,115,0.08);
}
.needs-action-index {
  width: 38rpx;
  flex-shrink: 0;
  font-size: 18rpx;
  color: #9c3c62;
  font-weight: 800;
  letter-spacing: 1rpx;
  padding-top: 4rpx;
}
.needs-action-text {
  flex: 1;
  font-size: 23rpx;
  color: #4e4945;
  line-height: 1.75;
}
.needs-explain-card {
  border: 2rpx solid rgba(74,48,115,0.1);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 64rpx;
  background: rgba(255,255,255,0.55);
}
.needs-explain-kicker {
  display: block;
  font-size: 22rpx;
  color: #9c3c62;
  font-weight: 700;
  margin-bottom: 14rpx;
}
.needs-explain-text {
  display: block;
  font-size: 22rpx;
  color: #6c6862;
  line-height: 1.8;
}

/* ── ECR ATTACHMENT MAP ── */
.attachment-page { position: relative; padding-top: 12rpx; }
.attachment-hero { padding: 64rpx 8rpx 52rpx; }
.attachment-overline {
  display: block;
  font-size: 24rpx;
  color: rgba(74,48,115,0.45);
  letter-spacing: 3rpx;
  margin-bottom: 14rpx;
}
.attachment-title {
  display: block;
  font-size: 38rpx;
  color: #33185c;
  line-height: 1.35;
}
.attachment-primary {
  display: block;
  font-size: 64rpx;
  line-height: 1.2;
  color: #33185c;
  font-weight: 800;
  margin: 4rpx 0 18rpx;
}
.attachment-tagline {
  display: block;
  font-size: 27rpx;
  line-height: 1.65;
  color: #9c3c62;
}
.attachment-caveat {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  padding: 25rpx 26rpx;
  margin-bottom: 68rpx;
  border-radius: 22rpx;
  background: rgba(156,60,98,0.055);
  border: 2rpx solid rgba(156,60,98,0.12);
}
.attachment-caveat-mark {
  width: 34rpx;
  height: 34rpx;
  flex-shrink: 0;
  border-radius: 50%;
  background: #9c3c62;
  color: #fff;
  font-size: 19rpx;
  line-height: 34rpx;
  text-align: center;
}
.attachment-caveat-text {
  flex: 1;
  font-size: 22rpx;
  line-height: 1.75;
  color: #6c5e66;
}
.attachment-map-shell {
  background: #fff;
  border-radius: 28rpx;
  padding: 28rpx 26rpx 22rpx 38rpx;
  border: 2rpx solid rgba(74,48,115,0.09);
  box-shadow: 0 4px 24rpx rgba(51,24,92,0.045);
}
.attachment-map {
  position: relative;
  width: 100%;
  height: 500rpx;
  overflow: hidden;
  border: 2rpx solid rgba(74,48,115,0.1);
  border-radius: 20rpx;
  background: #faf8f6;
}
.attachment-quadrant {
  position: absolute;
  width: 50%;
  height: 50%;
  padding: 18rpx;
  box-sizing: border-box;
}
.attachment-quadrant text {
  font-size: 18rpx;
  color: rgba(74,48,115,0.35);
  line-height: 1.35;
}
.attachment-quadrant--tl { left: 0; top: 0; background: rgba(156,60,98,0.07); }
.attachment-quadrant--tr { right: 0; top: 0; background: rgba(74,48,115,0.085); text-align: right; }
.attachment-quadrant--bl { left: 0; bottom: 0; background: rgba(63,168,130,0.07); display: flex; align-items: flex-end; }
.attachment-quadrant--br { right: 0; bottom: 0; background: rgba(201,160,92,0.08); display: flex; align-items: flex-end; justify-content: flex-end; text-align: right; }
.attachment-axis { position: absolute; background: rgba(74,48,115,0.16); z-index: 2; }
.attachment-axis--x { left: 0; right: 0; top: 50%; height: 2rpx; }
.attachment-axis--y { top: 0; bottom: 0; left: 50%; width: 2rpx; }
.attachment-dot {
  position: absolute;
  width: 32rpx;
  height: 32rpx;
  transform: translate(-50%, 50%);
  z-index: 5;
}
.attachment-dot-core {
  position: absolute;
  left: 8rpx;
  top: 8rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 7rpx #9c3c62;
}
.attachment-dot-ring {
  position: absolute;
  left: -9rpx;
  top: -9rpx;
  width: 50rpx;
  height: 50rpx;
  border: 2rpx solid rgba(156,60,98,0.32);
  border-radius: 50%;
}
.attachment-axis-label {
  position: absolute;
  left: 8rpx;
  z-index: 3;
  font-size: 16rpx;
  color: rgba(74,48,115,0.32);
  writing-mode: vertical-rl;
  letter-spacing: 2rpx;
}
.attachment-axis-label--top { top: 88rpx; }
.attachment-axis-label--bottom { bottom: 80rpx; }
.attachment-x-labels {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 4rpx 0;
}
.attachment-x-labels text { font-size: 18rpx; color: rgba(74,48,115,0.4); }
.attachment-map-note {
  display: block;
  font-size: 19rpx;
  line-height: 1.7;
  text-align: center;
  color: #9a928b;
  margin-top: 18rpx;
}
.attachment-dimension-list {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  margin-top: 28rpx;
}
.attachment-dimension-card {
  background: #fff;
  border: 2rpx solid rgba(74,48,115,0.09);
  border-radius: 26rpx;
  padding: 32rpx 30rpx;
  box-shadow: 0 4px 24rpx rgba(51,24,92,0.045);
}
.attachment-dimension-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 26rpx;
}
.attachment-dimension-name {
  display: block;
  font-size: 30rpx;
  color: #33185c;
  font-weight: 700;
  margin-bottom: 7rpx;
}
.attachment-dimension-position {
  display: block;
  font-size: 19rpx;
  color: #9c3c62;
  letter-spacing: 1rpx;
}
.attachment-dimension-score {
  flex-shrink: 0;
  font-size: 38rpx;
  color: #4a3073;
  font-weight: 700;
  font-style: italic;
}
.attachment-dimension-total { font-size: 18rpx; color: rgba(74,48,115,0.35); font-weight: 400; }
.attachment-dimension-track {
  position: relative;
  height: 10rpx;
  border-radius: 999rpx;
  background: rgba(74,48,115,0.08);
  overflow: hidden;
}
.attachment-dimension-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(156,60,98,0.45), #4a3073);
}
.attachment-dimension-mid {
  position: absolute;
  left: 50%;
  top: -4rpx;
  width: 2rpx;
  height: 18rpx;
  background: rgba(255,255,255,0.95);
  box-shadow: 0 0 0 1rpx rgba(74,48,115,0.1);
}
.attachment-dimension-ends {
  display: flex;
  justify-content: space-between;
  gap: 30rpx;
  margin-top: 16rpx;
}
.attachment-dimension-ends text {
  width: 48%;
  font-size: 18rpx;
  color: #8b8279;
  line-height: 1.55;
}
.attachment-dimension-ends text:last-child { text-align: right; }
.attachment-pattern-card {
  background: #fff;
  border: 2rpx solid rgba(74,48,115,0.09);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-top: 20rpx;
}
.attachment-pattern-card--dark {
  background: linear-gradient(145deg, #3a205f, #28163f);
  border-color: transparent;
  box-shadow: 0 14rpx 38rpx rgba(51,24,92,0.16);
}
.attachment-pattern-label {
  display: block;
  font-size: 19rpx;
  color: #9c3c62;
  letter-spacing: 2rpx;
  font-weight: 700;
  margin-bottom: 14rpx;
}
.attachment-pattern-text {
  display: block;
  font-size: 24rpx;
  color: #514c48;
  line-height: 1.85;
}
.attachment-pattern-card--dark .attachment-pattern-label { color: #e7a7bd; }
.attachment-pattern-card--dark .attachment-pattern-text { color: rgba(255,255,255,0.84); }
.attachment-list-card {
  background: #f2ebe5;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-top: 20rpx;
}
.attachment-list-title {
  display: block;
  font-size: 24rpx;
  color: #33185c;
  font-weight: 700;
  margin-bottom: 16rpx;
}
.attachment-list-row {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  padding: 20rpx 0;
  border-top: 2rpx solid rgba(74,48,115,0.08);
}
.attachment-list-index {
  width: 34rpx;
  flex-shrink: 0;
  font-size: 17rpx;
  color: #9c3c62;
  font-weight: 800;
  padding-top: 3rpx;
}
.attachment-list-text { flex: 1; font-size: 23rpx; color: #514c48; line-height: 1.7; }
.attachment-strength-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 28rpx;
}
.attachment-strength-card {
  display: flex;
  align-items: center;
  gap: 22rpx;
  background: #fff;
  border-radius: 22rpx;
  padding: 24rpx 26rpx;
  border: 2rpx solid rgba(74,48,115,0.08);
}
.attachment-strength-mark {
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: rgba(63,168,130,0.11);
  color: #356f62;
  font-size: 19rpx;
  font-weight: 800;
  line-height: 42rpx;
  text-align: center;
  flex-shrink: 0;
}
.attachment-strength-text { flex: 1; font-size: 23rpx; color: #514c48; line-height: 1.65; }
.attachment-action-card {
  background: #f2ebe5;
  border-radius: 28rpx;
  padding: 38rpx 32rpx;
  margin: 0 0 64rpx;
}
.attachment-action-title {
  display: block;
  font-size: 36rpx;
  color: #33185c;
  font-weight: 700;
  margin: 14rpx 0 12rpx;
}
.attachment-action-intro {
  display: block;
  font-size: 22rpx;
  color: #7a716a;
  line-height: 1.75;
  margin-bottom: 28rpx;
}

/* ── SHARED RICH SCALE RESULT ── */
.rich-page { position: relative; padding-top: 12rpx; }
.rich-hero { padding: 64rpx 8rpx 52rpx; }
.rich-overline {
  display: block;
  font-size: 21rpx;
  color: rgba(74,48,115,0.42);
  letter-spacing: 2rpx;
  margin-bottom: 18rpx;
}
.rich-primary {
  display: block;
  font-size: 54rpx;
  line-height: 1.3;
  color: #33185c;
  font-weight: 800;
  margin-bottom: 16rpx;
}
.rich-tagline {
  display: block;
  font-size: 27rpx;
  color: #9c3c62;
  line-height: 1.65;
}
.rich-overview-card {
  background: linear-gradient(145deg, #3a205f, #28163f);
  border-radius: 28rpx;
  padding: 38rpx 34rpx;
  margin-bottom: 72rpx;
  box-shadow: 0 16rpx 42rpx rgba(51,24,92,0.18);
}
.rich-overview-kicker {
  display: block;
  font-size: 17rpx;
  color: #e7a7bd;
  letter-spacing: 4rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}
.rich-overview-title {
  display: block;
  font-size: 32rpx;
  color: #fff;
  font-weight: 700;
  margin-bottom: 20rpx;
}
.rich-overview-text {
  display: block;
  font-size: 24rpx;
  color: rgba(255,255,255,0.76);
  line-height: 1.9;
}
.rich-dimension-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 28rpx;
}
.rich-dimension-card {
  background: #fff;
  border: 2rpx solid rgba(74,48,115,0.09);
  border-radius: 24rpx;
  padding: 28rpx 28rpx 30rpx;
  box-shadow: 0 4px 22rpx rgba(51,24,92,0.04);
}
.rich-dimension-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 20rpx;
  margin-bottom: 18rpx;
}
.rich-dimension-name { font-size: 26rpx; color: #33185c; font-weight: 700; }
.rich-dimension-position { font-size: 18rpx; color: #9c3c62; letter-spacing: 1rpx; }
.rich-dimension-track {
  height: 9rpx;
  border-radius: 999rpx;
  background: rgba(74,48,115,0.08);
  overflow: hidden;
}
.rich-dimension-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(156,60,98,0.46), #4a3073);
}
.rich-dimension-note {
  display: block;
  font-size: 21rpx;
  color: #7a746e;
  line-height: 1.7;
  margin-top: 17rpx;
}
.rich-watch-card { margin-top: 28rpx; }
.rich-watch-card .attachment-list-row:first-child { border-top: none; }

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

.cog-result { position: relative; }
.cog-pair-card {
  background: linear-gradient(145deg, #3b205f, #28163f);
  border-radius: 28rpx;
  padding: 40rpx 34rpx;
  margin-bottom: 72rpx;
  box-shadow: 0 16rpx 42rpx rgba(51,24,92,0.18);
}
.cog-pair-kicker { display: block; font-size: 17rpx; color: #e7a7bd; letter-spacing: 4rpx; font-weight: 700; margin-bottom: 14rpx; }
.cog-pair-title { display: block; font-size: 34rpx; color: #fff; font-weight: 750; line-height: 1.45; margin-bottom: 20rpx; }
.cog-pair-text { display: block; font-size: 24rpx; color: rgba(255,255,255,0.76); line-height: 1.9; }
.cog-section { margin-bottom: 72rpx; }
.cog-card { background: #fff; border-radius: 24rpx; padding: 36rpx 32rpx; box-shadow: 0 4px 24rpx rgba(51,24,92,0.05); margin-top: 28rpx; }
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
.cog-action-card { margin-top: 0; margin-bottom: 56rpx; }
.cog-scale-card { margin-bottom: 48rpx; }

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
