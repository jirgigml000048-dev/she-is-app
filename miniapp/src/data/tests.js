export const tests = [
  {
    id: 'ecr-36',
    title: '成人依恋类型',
    titleEn: 'ECR · Attachment Style',
    subtitle: '你在关系里，习惯靠近还是保持距离？',
    itemCount: 36,
    duration: '约 8–12 分钟',
    scale: 7,
    scaleLabels: ['非常不同意', '不同意', '略不同意', '中立', '略同意', '同意', '非常同意'],
    instruction: '下面是一些关于恋爱关系中感受的描述。请根据你在恋爱关系中的一般体验来作答（不只是现在，而是你所有恋爱经历中常常体验到的感觉）。',
    questions: [
      { id: 1, text: '总的来说，我不喜欢让恋人知道自己内心深处的感觉', reverse: false },
      { id: 2, text: '我担心我会被抛弃', reverse: false },
      { id: 3, text: '我觉得跟恋人亲近是一件惬意的事情', reverse: true },
      { id: 4, text: '我很担心我的恋爱关系', reverse: false },
      { id: 5, text: '当恋人开始要跟我亲近时，我发现我自己在退缩', reverse: false },
      { id: 6, text: '我担心恋人不会像我关心他/她那样地关心我', reverse: false },
      { id: 7, text: '当恋人希望跟我非常亲近时，我会觉得不自在', reverse: false },
      { id: 8, text: '我有点担心会失去恋人', reverse: false },
      { id: 9, text: '我觉得对恋人开诚布公，不是一件很舒服的事情', reverse: false },
      { id: 10, text: '我常常希望恋人对我的感情和我对恋人的感情一样强烈', reverse: false },
      { id: 11, text: '我想与恋人亲近，但我又总是会退缩不前', reverse: false },
      { id: 12, text: '我常常想与恋人形影不离，但有时这样会把恋人吓跑', reverse: false },
      { id: 13, text: '当恋人跟我过分亲密的时候，我会感到内心紧张', reverse: false },
      { id: 14, text: '我担心一个人独处', reverse: false },
      { id: 15, text: '我愿意把我内心的想法和感觉告诉恋人，我觉得这是一件自在的事情', reverse: true },
      { id: 16, text: '我想跟恋人非常亲密的愿望，有时会把恋人吓跑', reverse: false },
      { id: 17, text: '我试图避免与恋人变得太亲近', reverse: false },
      { id: 18, text: '我需要我的恋人一再地保证他/她是爱我的', reverse: false },
      { id: 19, text: '我觉得我比较容易与恋人亲近', reverse: true },
      { id: 20, text: '我觉得自己在要求恋人把更多的感觉，以及对恋爱关系的投入程度表现出来', reverse: false },
      { id: 21, text: '我发现让我依赖恋人，是一件困难的事情', reverse: false },
      { id: 22, text: '我并不是常常担心被恋人抛弃', reverse: true },
      { id: 23, text: '我倾向于不跟恋人过分亲密', reverse: false },
      { id: 24, text: '如果我无法得到恋人的注意和关心，我会心烦意乱或者生气', reverse: false },
      { id: 25, text: '我跟恋人什么事情都讲', reverse: true },
      { id: 26, text: '我发现恋人并不愿意像我所想的那样跟我亲近', reverse: false },
      { id: 27, text: '我经常与恋人讨论我所遇到的问题以及我关心的事情', reverse: true },
      { id: 28, text: '如果我还没有恋人的话，我会感到有点焦虑和不安', reverse: false },
      { id: 29, text: '我觉得依赖恋人是很自在的事情', reverse: true },
      { id: 30, text: '如果恋人不能像我所希望的那样在我身边时，我会感到灰心丧气', reverse: false },
      { id: 31, text: '我并不在意从恋人那里寻找安慰、听取劝告、得到帮助', reverse: true },
      { id: 32, text: '如果在我需要的时候，恋人却不在我身边，我会感到沮丧', reverse: false },
      { id: 33, text: '在需要的时候，我向恋人求助，是很有用的', reverse: true },
      { id: 34, text: '当恋人不赞同我时，我觉得确实是我不好', reverse: false },
      { id: 35, text: '我会在很多事情上向恋人求助，包括寻求安慰和得到承诺', reverse: true },
      { id: 36, text: '当恋人不花时间和我在一起时，我会感到怨恨', reverse: false },
    ],
    score(answers) {
      const avoidanceItems = [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35]
      const anxietyItems = [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36]
      const calc = (items) => {
        const vals = items.map(i => {
          const q = this.questions[i - 1]
          const v = answers[i - 1] ?? 4
          return q.reverse ? 8 - v : v
        })
        return vals.reduce((s, v) => s + v, 0) / vals.length
      }
      const avoidance = calc(avoidanceItems)
      const anxiety = calc(anxietyItems)
      const scores = {
        secure:     avoidance * 3.2893296 + anxiety * 5.4725318 - 11.5307833,
        fearful:    avoidance * 7.2371075 + anxiety * 8.1776448 - 32.3553266,
        preoccupied: avoidance * 3.9246754 + anxiety * 9.7102446 - 28.4573220,
        dismissing: avoidance * 7.3654621 + anxiety * 4.9392039 - 22.2281088,
      }
      return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
    },
    results: {
      secure:      { label: '安全型', emoji: '🌿', tagline: '你知道怎么爱，也知道怎么被爱', desc: '在亲密关系中，你大多数时候是安稳的。你可以靠近，也可以给空间；遇到摩擦你不会立刻崩溃，也不会关门不开。这种能力，比你想象的要难得。' },
      fearful:     { label: '恐惧型', emoji: '🌊', tagline: '你想靠近，但靠近本身让你害怕', desc: '你渴望亲密，又担心受伤。关系里的你有时进一步、退两步，不是因为你不爱，而是因为你太在意了。受伤过的地方，愈合总是慢一些。' },
      preoccupied: { label: '专注型', emoji: '🔥', tagline: '你爱得很用力，有时用力到把人吓跑', desc: '你对亲密关系的投入很深，深到有时会放大每一个信号，反复确认对方是否真的在乎你。你不是太敏感，你只是太认真了。' },
      dismissing:  { label: '冷漠型', emoji: '🧊', tagline: '你习惯靠自己，但其实你也想被接住', desc: '你表面上对亲密关系不太上心，但这不一定是真的冷漠。有时候，是因为习惯了自己扛，忘记了也可以让人进来。' },
    },
  },
  {
    id: 'hsp-22',
    title: '高敏感度特质',
    titleEn: 'HSP · High Sensitivity',
    subtitle: '探索你的感受力与环境敏感度',
    itemCount: 22,
    duration: '约 5–8 分钟',
    scale: 7,
    scaleLabels: ['完全不符合', '不符合', '略不符合', '中立', '略符合', '符合', '完全符合'],
    instruction: '请根据你平时的实际状态作答，不是你希望自己是什么样，而是你通常就是这样。',
    questions: [
      { id: 1,  text: '我很容易注意到环境中细微的变化' },
      { id: 2,  text: '别人的情绪会比较强烈地影响到我' },
      { id: 3,  text: '我对疼痛比较敏感' },
      { id: 4,  text: '在繁忙的一天后，我需要找一个安静的地方独处、恢复' },
      { id: 5,  text: '我对咖啡因比较敏感' },
      { id: 6,  text: '强光、强烈气味、粗糙布料或附近的嘈杂声会让我感到困扰' },
      { id: 7,  text: '我有丰富而复杂的内心世界' },
      { id: 8,  text: '我会被某些艺术、音乐或文学深深打动' },
      { id: 9,  text: '当我需要同时处理很多事情时，会感到混乱和焦虑' },
      { id: 10, text: '受到惊吓时，我需要一段时间才能平静' },
      { id: 11, text: '当生活变得混乱或剧变时，我会感到很烦恼' },
      { id: 12, text: '当别人在身体上不舒服时，我很能感同身受' },
      { id: 13, text: '在短时间内需要完成太多事情时，我会感到很烦' },
      { id: 14, text: '我很努力避免犯错或忘事' },
      { id: 15, text: '我似乎能感受到别人感受不到的东西' },
      { id: 16, text: '饥饿、疲惫等身体信号会强烈影响我的注意力和情绪' },
      { id: 17, text: '意外状况或混乱的环境让我很难受' },
      { id: 18, text: '对即将发生的事情的期待，容易让我感到焦虑和紧张' },
      { id: 19, text: '时间压力或截止日期会让我感到相当不舒服' },
      { id: 20, text: '在他人的批评或评价中，我往往比别人更难受' },
      { id: 21, text: '影视或故事中的暴力画面会让我非常不安，需要刻意回避' },
      { id: 22, text: '我对美好的事物有一种近乎崇拜的感受力' },
    ],
    score(answers) {
      const mean = answers.reduce((s, v) => s + (v ?? 4), 0) / answers.length
      return mean >= 4.5 ? 'high' : mean >= 3.0 ? 'mid' : 'low'
    },
    results: {
      high: { label: '高敏感人格', emoji: '🌸', tagline: '你接收到的世界，比大多数人更密、更深', desc: '你比大多数人接收到更多。声音、光线、别人语气里微妙的变化、一个房间里没有人说出口的紧张感。你的神经系统像一台增益开得很大的收音机，信号和噪音一起进来。别人充电一小时能用一天，你可能需要整个下午才能缓过来。你感受世界的方式是昂贵的。' },
      mid:  { label: '中等感受力', emoji: '🌤', tagline: '你能感知细节，也保有不过载的弹性', desc: '有些场景你会被深深触动，有些你可以自然滑过去。一首歌可能突然让你鼻酸，但十分钟后你已经忘了它在放什么。你能共情，但不至于被别人的情绪淹没。大多数时候你掌握着那个旋钮。' },
      low:  { label: '低敏感倾向', emoji: '🪨', tagline: '你和世界之间有一层让你稳定的缓冲', desc: '你的情绪系统波动不大，不容易被外界突然扰动。别人可能已经被一件事搅得心神不宁了，你还保持着自己的步调。乱局里你往往是最清醒的那个。' },
    },
  },
  {
    id: 'erq-10',
    title: '情绪调节策略',
    titleEn: 'ERQ · Emotion Regulation',
    subtitle: '压力来临时，你更常用哪种调节策略？',
    itemCount: 10,
    duration: '约 3–5 分钟',
    scale: 7,
    scaleLabels: ['十分不符合', '不符合', '略不符合', '无法确定', '略符合', '符合', '十分符合'],
    instruction: '下面是一些关于情绪调节方式的描述。请凭第一感觉作答，答案没有对错之分。',
    questions: [
      { id: 1,  text: '当我想感受一些积极的情绪时，我会改变自己思考问题的角度', dimension: 'reappraisal' },
      { id: 2,  text: '我不会表露自己的情绪', dimension: 'suppression' },
      { id: 3,  text: '当我想少感受一些消极的情绪时，我会改变自己思考问题的角度', dimension: 'reappraisal' },
      { id: 4,  text: '当感受到积极情绪时，我会很小心地不让它们表露出来', dimension: 'suppression' },
      { id: 5,  text: '在面对压力情境时，我会使自己以一种有助于保持平静的方式来考虑它', dimension: 'reappraisal' },
      { id: 6,  text: '我控制自己情绪的方式是不表达它们', dimension: 'suppression' },
      { id: 7,  text: '当我想多感受一些积极的情绪时，我会改变自己对情境的考虑方式', dimension: 'reappraisal' },
      { id: 8,  text: '我会通过改变对情境的考虑方式来控制自己的情绪', dimension: 'reappraisal' },
      { id: 9,  text: '当感受到消极的情绪时，我确定不会表露它们', dimension: 'suppression' },
      { id: 10, text: '当我想少感受一些消极的情绪时，我会改变自己对情境的考虑方式', dimension: 'reappraisal' },
    ],
    score(answers) {
      const mean = (items) => items.reduce((s, i) => s + (answers[i - 1] ?? 4), 0) / items.length
      const r = mean([1, 3, 5, 7, 8, 10])
      const s = mean([2, 4, 6, 9])
      if (r >= 4 && s < 4)  return 'high_reappraisal_low_suppression'
      if (r >= 4 && s >= 4) return 'high_reappraisal_high_suppression'
      if (r < 4  && s >= 4) return 'low_reappraisal_high_suppression'
      return 'low_reappraisal_low_suppression'
    },
    results: {
      high_reappraisal_low_suppression:  { label: '思考派', emoji: '💡', tagline: '你习惯换个角度看事情', desc: '遇到情绪风暴，你更倾向于在脑子里重新理解发生了什么——"也许不是我想的那样"，"从长远看没那么严重"。这是一种相对健康的应对方式，也意味着你不容易被情绪淹没。' },
      high_reappraisal_high_suppression: { label: '双管派', emoji: '⚡', tagline: '你用很多方式管理自己的情绪', desc: '你既会调整思维框架，也会管控情绪的外在表达。这双重策略有时有效，有时会让你感觉内外都在用力。不妨问问自己：有没有什么情绪，你不需要管它？' },
      low_reappraisal_high_suppression:  { label: '压下去派', emoji: '🔒', tagline: '你更习惯把情绪藏起来', desc: '你处理情绪的方式，更多是不让它们流出来。这样做能保持表面平静，但情绪本身还在。长期来看，给它们找一个出口——无论是写、说、还是跑步——会让你轻松一些。' },
      low_reappraisal_low_suppression:   { label: '随流派', emoji: '🌀', tagline: '你不太主动调节情绪，让它自然流动', desc: '你不太用力去管理情绪，更多是让它自己来、自己走。这有时是一种自然的韧性，有时也意味着情绪会在你身上停留更久。没有对错，只是了解自己的一个入口。' },
    },
  },
]
