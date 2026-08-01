import {
  REFLECTION_THEMES,
  reflectionPrompts,
} from '@/data/reflectionPrompts.js'

const THEME_PATHS = {
  boundary: ['self', 'relationship', 'desire'],
  desire: ['choice', 'self', 'change'],
  relationship: ['boundary', 'emotion', 'self'],
  self: ['desire', 'change', 'choice'],
  emotion: ['body', 'relationship', 'change'],
  body: ['emotion', 'boundary', 'self'],
  choice: ['desire', 'change', 'self'],
  change: ['choice', 'self', 'desire'],
}

const STORY_REASONS = {
  boundary: '你最近写到了边界。这个故事里，也有人试着把“我愿意”和“我不愿意”分清楚。',
  desire: '你最近写到了自己真正想要的东西。她也曾把愿望放了很久，后来决定不再等。',
  relationship: '你最近写到了一段关系。她的故事里，也有想靠近、又想退后的时候。',
  self: '你最近在想，什么样的生活才像自己。她也没有照着别人给的模板走。',
  emotion: '你最近写到了一些不容易说清的感受。她也花了很久，才听懂自己的情绪。',
  body: '你最近注意到了身体的提醒。她的故事，也从一次不得不停下开始。',
  choice: '你最近写到了一个选择。她也曾在几条路之间犹豫，最后替自己做了决定。',
  change: '你最近正遇到一些变化。她的故事，也发生在旧生活已经装不下自己的时候。',
}

function stableIndex(seed, length) {
  if (!length) return 0
  const hash = String(seed || '').split('').reduce((sum, char) => (
    ((sum * 31) + char.charCodeAt(0)) >>> 0
  ), 7)
  return hash % length
}

export function getThemeMeta(theme) {
  return REFLECTION_THEMES[theme] || { label: '此刻', color: '#9c3c62', storyTags: ['identity'] }
}

export function selectNextPrompt(reflections = [], skippedPromptIds = [], assessmentContext = null) {
  const entries = Array.isArray(reflections)
    ? [...reflections].sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    : []
  const recentUsed = new Set(entries.slice(0, 12).map(item => item.promptId))
  ;(Array.isArray(skippedPromptIds) ? skippedPromptIds : []).forEach(id => recentUsed.add(id))

  const latest = entries[0]
  const hasAssessmentSignal = assessmentContext
    && assessmentContext.completedCount > 0
    && assessmentContext.themeWeights
  let candidates = reflectionPrompts.filter(prompt => !recentUsed.has(prompt.id))
  if (!candidates.length) candidates = reflectionPrompts

  const seed = `${latest ? latest.promptId : 'first'}-${entries.length}-${new Date().toDateString()}-${recentUsed.size}-${assessmentContext?.signature || ''}`
  let selected = null
  if (hasAssessmentSignal) {
    const relatedThemes = latest && THEME_PATHS[latest.theme] ? THEME_PATHS[latest.theme] : []
    const ranked = candidates.map(prompt => {
      const assessmentWeight = Number(assessmentContext.themeWeights[prompt.theme]) || 0
      const reflectionWeight = relatedThemes.includes(prompt.theme) ? 2 : 0
      const freshness = 1 - (stableIndex(`${seed}-${prompt.id}`, 1000) / 1000)
      return { prompt, score: assessmentWeight * 10 + reflectionWeight + freshness }
    }).sort((a, b) => b.score - a.score || a.prompt.id.localeCompare(b.prompt.id))
    selected = ranked[0] && ranked[0].prompt
  } else {
    const relatedThemes = latest && THEME_PATHS[latest.theme]
      ? THEME_PATHS[latest.theme]
      : Object.keys(REFLECTION_THEMES)
    const related = candidates.filter(prompt => relatedThemes.includes(prompt.theme))
    const pool = related.length ? related : candidates
    selected = pool[stableIndex(seed, pool.length)]
  }

  const prompt = selected || reflectionPrompts[0]
  const insight = hasAssessmentSignal && assessmentContext.primaryInsight
  return hasAssessmentSignal
    ? {
        ...prompt,
        recommendationReason: '这道题参考了你最近完成的测评。',
        recommendationSource: insight ? insight.id : 'assessment-profile',
      }
    : prompt
}

export function getReflectionPatterns(reflections = []) {
  const entries = Array.isArray(reflections) ? reflections : []
  const counts = {}
  entries.forEach(item => {
    if (REFLECTION_THEMES[item.theme]) counts[item.theme] = (counts[item.theme] || 0) + 1
  })
  return Object.entries(counts)
    .map(([theme, count]) => ({ theme, count, ...getThemeMeta(theme) }))
    .sort((a, b) => b.count - a.count)
}

export function getPatternSummary(reflections = []) {
  const patterns = getReflectionPatterns(reflections)
  if (!patterns.length) return ''
  if (reflections.length < 3) {
    return `你目前写得最多的是“${patterns[0].label}”。再多答几次，我们看看它会不会经常出现。`
  }
  if (patterns.length === 1) {
    return `最近几次，你写的都是“${patterns[0].label}”。这件事可能占了你不少心思。`
  }
  return `最近你常写到“${patterns[0].label}”和“${patterns[1].label}”。回想一下：它们会不会总在同一件事里出现？`
}

export function formatReflectionAnswer(reflection) {
  if (!reflection) return ''
  const choices = Array.isArray(reflection.selectedOptions) ? reflection.selectedOptions.join('、') : ''
  const text = typeof reflection.answerText === 'string' ? reflection.answerText.trim() : ''
  if (choices && text) return `${choices}。${text}`
  return choices || text
}

export function getReflectionStoryRecommendation(stories = [], reflections = [], readStoryIds = [], assessmentContext = null) {
  if (!Array.isArray(stories) || !stories.length) return null
  const entries = Array.isArray(reflections)
    ? [...reflections].sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    : []
  const latest = entries[0]
  const theme = latest ? latest.theme : null
  const hasAssessmentSignal = assessmentContext
    && assessmentContext.completedCount > 0
    && Array.isArray(assessmentContext.storyTags)
    && assessmentContext.storyTags.length > 0
  if (!latest && !hasAssessmentSignal) {
    const editorial = stories.find(story => story && story.featured)
    if (!editorial) return null
    return {
      story: editorial,
      reason: editorial.featuredReason || '编辑为你挑了这篇。也许她的某一段经历，会刚好碰到你此刻在想的事。',
      source: 'editorial',
    }
  }
  const safeTheme = theme || 'self'
  const themeMeta = getThemeMeta(safeTheme)
  const readSet = new Set(Array.isArray(readStoryIds) ? readStoryIds : [])
  const assessmentTags = hasAssessmentSignal ? assessmentContext.storyTags : []
  const seed = `${latest ? latest.id : 'first'}-${safeTheme}-${assessmentContext?.signature || ''}`
  const ranked = stories.map(story => {
    const tags = Array.isArray(story.tags) ? story.tags : []
    const reflectionMatches = latest
      ? themeMeta.storyTags.filter(tag => tags.includes(tag)).length
      : 0
    const assessmentMatches = assessmentTags.filter(tag => tags.includes(tag)).length
    const unreadBonus = readSet.has(story.id) ? 0 : 8
    const editorialBonus = story.featured ? 2 : 0
    const tieBreaker = 1 - (stableIndex(`${seed}-${story.id}`, 1000) / 1000)
    return {
      story,
      score: unreadBonus + editorialBonus + reflectionMatches * 6 + assessmentMatches * 4 + tieBreaker,
    }
  }).sort((a, b) => b.score - a.score || a.story.id.localeCompare(b.story.id))
  const story = ranked[0].story
  const primaryInsight = hasAssessmentSignal && assessmentContext.primaryInsight
  let reason = STORY_REASONS[safeTheme] || STORY_REASONS.self
  let source = 'reflection'
  if (latest && primaryInsight) {
    source = 'combined'
    reason = `你最近写到了“${themeMeta.label}”，几份测评里也出现了相近的困惑。这个故事里，刚好有人经历过类似的拉扯。`
  } else if (primaryInsight) {
    source = 'assessment'
    reason = '你几份测评里反复出现的那种拉扯，这个故事里的女孩也遇到过。'
  } else if (latest && hasAssessmentSignal) {
    source = 'combined'
    reason = `你最近写到了“${themeMeta.label}”，刚完成的测评也和这个故事谈到了相近的事。`
  } else if (hasAssessmentSignal) {
    source = 'assessment'
    reason = '你刚完成的测评，和这个故事谈到的是同一类困惑。'
  }
  return {
    story,
    reason,
    source,
  }
}
