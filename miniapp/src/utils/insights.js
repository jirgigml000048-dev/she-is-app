// 跨测评组合洞察：只在本机把已经完成的测评并排阅读。
// 这是一套透明、可回溯的规则，不替代量表原本结果，也不作心理诊断。

import { getCompletedAssessments } from '@/utils/user.js'

const THEME_STORY_TAGS = {
  boundary: ['relationship', 'identity'],
  desire: ['identity', 'art'],
  relationship: ['relationship'],
  self: ['identity'],
  emotion: ['inner-soul'],
  body: ['inner-soul'],
  choice: ['identity', 'art'],
  change: ['identity', 'inner-soul'],
}

const COGNITIVE_LABELS = {
  Se: '外感觉 Se', Si: '内感觉 Si', Ne: '外直觉 Ne', Ni: '内直觉 Ni',
  Te: '外思维 Te', Ti: '内思维 Ti', Fe: '外情感 Fe', Fi: '内情感 Fi',
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))]
}

function entryLabel(entry) {
  if (!entry) return ''
  return entry.resultLabel || COGNITIVE_LABELS[entry.resultKey] || entry.resultKey || '已完成'
}

function evidenceLabel(entry) {
  return entry ? `${entry.testTitle} · ${entryLabel(entry)}` : ''
}

function addWeight(weights, theme, value) {
  if (!theme || !Number.isFinite(value)) return
  weights[theme] = (weights[theme] || 0) + value
}

function addIndividualSignals(entry, weights) {
  const key = entry.resultKey
  switch (entry.testId) {
    case 'boundary-sense':
      addWeight(weights, 'boundary', 4)
      addWeight(weights, key === '自我型边界缺失' ? 'self' : 'relationship', 2)
      break
    case 'relationship-role':
      addWeight(weights, 'relationship', 4)
      if (key !== '表达者') addWeight(weights, 'boundary', 1.5)
      break
    case 'ecr-36':
      addWeight(weights, 'relationship', 4)
      addWeight(weights, key === 'secure' ? 'self' : 'emotion', 2)
      break
    case 'hsp-22':
      addWeight(weights, 'emotion', key === 'high' ? 4 : 2.5)
      addWeight(weights, 'body', key === 'high' ? 3 : 1.5)
      break
    case 'erq-10':
      addWeight(weights, 'emotion', 4)
      if (key.includes('suppression')) addWeight(weights, 'relationship', 1.5)
      break
    case 'fmps-15':
      addWeight(weights, 'self', 3)
      addWeight(weights, 'choice', 2)
      if (['high_cm_da', 'high_da_low_cm'].includes(key)) addWeight(weights, 'body', 1.5)
      break
    case 'needs-18':
      if (key === 'autonomy') {
        addWeight(weights, 'choice', 4)
        addWeight(weights, 'self', 3)
      } else if (key === 'competence') {
        addWeight(weights, 'self', 4)
        addWeight(weights, 'change', 2)
      } else if (key === 'relatedness') {
        addWeight(weights, 'relationship', 4)
        addWeight(weights, 'emotion', 2)
      } else {
        addWeight(weights, 'self', 2)
        addWeight(weights, 'desire', 1)
      }
      break
    case 'values-30': {
      const themeByValue = {
        selfDirection: 'choice', stimulation: 'change', hedonism: 'desire',
        achievement: 'self', power: 'choice', security: 'body',
        conformity: 'boundary', tradition: 'relationship',
        benevolence: 'relationship', universalism: 'self',
      }
      addWeight(weights, themeByValue[key] || 'self', 4)
      break
    }
    case 'disc':
      addWeight(weights, key === 'I' || key === 'S' ? 'relationship' : 'change', 2.5)
      addWeight(weights, 'self', 1.5)
      break
    case 'cognitive-48':
    case 'cognitive-80':
      addWeight(weights, ['Fe', 'Fi'].includes(key) ? 'relationship' : 'self', 2)
      addWeight(weights, ['Ne', 'Ni'].includes(key) ? 'change' : 'choice', 1)
      break
    default:
      break
  }
}

function makeInsight(config, entries) {
  return {
    id: config.id,
    title: config.title,
    text: config.text,
    priority: config.priority || 1,
    promptThemes: unique(config.promptThemes),
    storyTags: unique(config.storyTags),
    evidence: unique((config.testIds || []).map(id => evidenceLabel(entries[id]))),
  }
}

export function buildAssessmentInsightContext(assessments = []) {
  let clean = Array.isArray(assessments)
    ? assessments.filter(item => item && item.testId && Array.isArray(item.answers))
    : []
  // 48 题与 80 题是同一认知功能框架的两个长度版本；两者都完成时只保留深度版，
  // 避免把同一量表误当成两份独立证据。
  if (clean.some(item => item.testId === 'cognitive-80')) {
    clean = clean.filter(item => item.testId !== 'cognitive-48')
  }
  const entries = Object.fromEntries(clean.map(item => [item.testId, item]))
  const key = id => entries[id] && entries[id].resultKey
  const has = id => !!entries[id]
  const candidates = []
  const add = config => candidates.push(makeInsight(config, entries))

  if (has('boundary-sense') && has('relationship-role')
    && ['情感型边界缺失', '社交型边界缺失'].includes(key('boundary-sense'))
    && ['倾听者', '照顾者'].includes(key('relationship-role'))) {
    add({
      id: 'care-before-boundary',
      title: '你总是先顾到别人，回头才发现自己其实不愿意',
      text: '别人一开口，你很快就会想到她会不会失望、现场会不会尴尬。等事情答应下来，你才有空问自己累不累。下次先别急着回答，给自己十分钟也可以。',
      priority: 10,
      testIds: ['boundary-sense', 'relationship-role'],
      promptThemes: ['boundary', 'relationship', 'self'],
      storyTags: ['relationship', 'identity'],
    })
  }

  if (has('hsp-22') && has('erq-10') && key('hsp-22') === 'high'
    && ['low_reappraisal_high_suppression', 'high_reappraisal_high_suppression'].includes(key('erq-10'))) {
    add({
      id: 'feel-more-show-less',
      title: '你心里接住了很多，别人看到的却不多',
      text: '语气变了、气氛不对、别人有点不高兴，你往往很快就能感觉到。但你又习惯把自己的反应收好，所以别人可能只看到你很平静，不知道你已经累了。',
      priority: 10,
      testIds: ['hsp-22', 'erq-10'],
      promptThemes: ['emotion', 'body', 'relationship'],
      storyTags: ['inner-soul', 'relationship'],
    })
  }

  if (has('ecr-36') && has('erq-10')
    && ['fearful', 'dismissing'].includes(key('ecr-36'))
    && ['low_reappraisal_high_suppression', 'high_reappraisal_high_suppression'].includes(key('erq-10'))) {
    add({
      id: 'distance-and-control',
      title: '你一收起情绪，也会顺手和人拉开一点距离',
      text: '关系一让你不安，你通常不会马上说出来，也不太愿意依赖对方。这样做很安全，可对方也很难知道该怎么靠近你。',
      priority: 9,
      testIds: ['ecr-36', 'erq-10'],
      promptThemes: ['relationship', 'emotion', 'boundary'],
      storyTags: ['relationship', 'inner-soul'],
    })
  }

  if (has('ecr-36') && has('needs-18') && key('needs-18') === 'relatedness'
    && key('ecr-36') !== 'secure') {
    add({
      id: 'need-and-protect-connection',
      title: '你想和人亲近，可真正靠近时又会紧张',
      text: '你最近可能很需要有人懂你，但真的要开口、依赖或相信对方时，身体又会先防备。先别逼自己“学会信任”，看看什么样的回应会让你松一点。',
      priority: 9,
      testIds: ['ecr-36', 'needs-18'],
      promptThemes: ['relationship', 'boundary', 'emotion'],
      storyTags: ['relationship', 'inner-soul'],
    })
  }

  if (has('fmps-15') && has('needs-18')
    && ['high_cm_da', 'high_da_low_cm', 'high_pe'].includes(key('fmps-15'))
    && ['autonomy', 'competence'].includes(key('needs-18'))) {
    add({
      id: 'standards-under-pressure',
      title: '你已经很用力了，却还是常觉得自己做得不够',
      text: '你一边想把事情做好，一边又很难得到“我可以”或“这是我自己选的”这种感觉。这个时候再加要求，只会更累。先把目标切小，给自己一条可以结束的线。',
      priority: 10,
      testIds: ['fmps-15', 'needs-18'],
      promptThemes: ['self', 'choice', 'body'],
      storyTags: ['identity', 'inner-soul'],
    })
  }

  if (has('values-30') && has('needs-18')) {
    const valueKey = key('values-30')
    const needKey = key('needs-18')
    const matched = (['selfDirection', 'stimulation', 'power'].includes(valueKey) && needKey === 'autonomy')
      || (valueKey === 'achievement' && needKey === 'competence')
      || (['benevolence', 'universalism'].includes(valueKey) && needKey === 'relatedness')
    if (matched) {
      const copy = needKey === 'autonomy'
        ? ['你很在乎自己做主，最近却常常没有得选', '很多事情像是早就安排好了，你只能照着完成。一直没有选择，谁都会慢慢泄气。先从一件小事开始，把时间或做法拿回来。', ['choice', 'desire', 'self'], ['identity', 'art']]
        : needKey === 'competence'
          ? ['你很想把事情做成，最近却很难觉得自己做得不错', '你会盯着进展和结果，可最近的反馈总让你怀疑能力。别急着再加一个更高目标，先完成一件今天就能看见结果的小事。', ['self', 'change', 'body'], ['identity', 'inner-soul']]
          : ['你总把关心留给别人，最近自己却没怎么被接住', '你在意别人过得好不好，也愿意花时间照顾关系。可一段关系不能一直由你一个人撑。那些也愿意听你说、照顾你感受的人，应该放得更靠前。', ['relationship', 'boundary', 'self'], ['relationship', 'identity']]
      add({
        id: `value-need-${needKey}`,
        title: copy[0], text: copy[1], priority: 11,
        testIds: ['values-30', 'needs-18'], promptThemes: copy[2], storyTags: copy[3],
      })
    }
  }

  if (has('hsp-22') && has('boundary-sense') && key('hsp-22') === 'high'
    && key('boundary-sense') !== '自我型边界缺失') {
    add({
      id: 'read-room-before-self',
      title: '你很会看气氛，却常常最后才发现自己已经累了',
      text: '一句话的语气变了、谁突然沉默了，你很快就能察觉。可注意力一直在外面时，自己的紧绷和不情愿就容易被漏掉。下次也把身体的反应算进去。',
      priority: 8,
      testIds: ['hsp-22', 'boundary-sense'],
      promptThemes: ['body', 'boundary', 'emotion'],
      storyTags: ['inner-soul', 'relationship'],
    })
  }

  if (has('disc') && has('fmps-15') && ['D', 'C'].includes(key('disc'))
    && ['high_cm_da', 'high_da_low_cm', 'high_ps_low_cm', 'high_or'].includes(key('fmps-15'))) {
    add({
      id: 'drive-and-standards',
      title: '你想把事情往前推，也很难接受“先这样吧”',
      text: '你能发现问题，也愿意负责到底。代价是，开始前想很多，做完后还在检查，连休息都像在偷懒。下一次可以先决定：这件事做到七分够不够。',
      priority: 7,
      testIds: ['disc', 'fmps-15'],
      promptThemes: ['choice', 'self', 'body'],
      storyTags: ['identity', 'inner-soul'],
    })
  }

  const cognitive = entries['cognitive-80'] || entries['cognitive-48']
  if (cognitive && has('values-30')) {
    const cognitiveKey = cognitive.resultKey
    const valueKey = key('values-30')
    if ((['Ne', 'Ni'].includes(cognitiveKey) && ['selfDirection', 'stimulation'].includes(valueKey))
      || (['Fe', 'Fi'].includes(cognitiveKey) && ['benevolence', 'universalism'].includes(valueKey))) {
      const possibility = ['Ne', 'Ni'].includes(cognitiveKey)
      add({
        id: possibility ? 'possibility-and-freedom' : 'people-and-values',
        title: possibility ? '你脑子里总有下一种可能，也很在意路是不是自己选的' : '你做决定时，很难完全不考虑别人',
        text: possibility
          ? '别人要你尽快定下来时，你可能会有点憋闷。你有主意，只是还看得见别的路。可以先选一个短期方向，不必马上把其余可能全都关掉。'
          : '你会想到别人怎么感受，也会问这件事符不符合自己的价值。好处是细腻，麻烦是每个人都被照顾到了，只有你自己还没表态。',
        priority: 6,
        testIds: [cognitive.testId, 'values-30'],
        promptThemes: possibility ? ['change', 'choice', 'desire'] : ['relationship', 'self', 'boundary'],
        storyTags: possibility ? ['identity', 'art'] : ['relationship', 'identity'],
      })
    }
  }

  const ordered = candidates.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))
  if (!ordered.length && clean.length >= 2) {
    const recent = [...clean].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt)).slice(0, 2)
    add({
      id: 'parallel-clues',
      title: '这两份结果暂时还拼不出一个答案',
      text: `一份里你更像“${entryLabel(recent[0])}”，另一份里你更像“${entryLabel(recent[1])}”。它们不一定冲突。下次遇到让你纠结的事，可以看看这两种反应会不会同时出现。`,
      priority: 1,
      testIds: recent.map(item => item.testId),
      promptThemes: ['self', 'choice', 'change'],
      storyTags: ['identity', 'inner-soul'],
    })
  }

  const insights = candidates.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id)).slice(0, 3)
  const themeWeights = {}
  clean.forEach(entry => addIndividualSignals(entry, themeWeights))
  insights.forEach((insight, insightIndex) => {
    const bonus = Math.max(2, 5 - insightIndex)
    insight.promptThemes.forEach((theme, themeIndex) => addWeight(themeWeights, theme, bonus - themeIndex * 0.6))
  })
  const promptThemes = Object.entries(themeWeights)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([theme]) => theme)
  const storyTags = unique([
    ...insights.flatMap(insight => insight.storyTags),
    ...promptThemes.slice(0, 2).flatMap(theme => THEME_STORY_TAGS[theme] || []),
  ])
  const signature = clean
    .map(entry => `${entry.testId}:${entry.resultKey}`)
    .sort()
    .join('|')

  return {
    completedCount: clean.length,
    insights,
    primaryInsight: insights[0] || null,
    themeWeights,
    promptThemes,
    storyTags,
    signature,
  }
}

export function getAssessmentInsightContext() {
  return buildAssessmentInsightContext(getCompletedAssessments())
}
