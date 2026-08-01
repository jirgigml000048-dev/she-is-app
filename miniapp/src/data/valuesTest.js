// 价值观画像（30 题）
// 理论参照 Schwartz 基本价值观理论；题目由「女也」按中文日常情境原创编写，
// 不是原版 Portrait Values Questionnaire（PVQ），也不用于学术研究或诊断。

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export const valuesTest = {
  id: 'values-30',
  axis: 'motivation',
  type: 'likert',
  hasIntro: true,
  customResult: 'values',
  intro: {
    titleEn: 'What Matters to You',
    titleCn: '你的价值排序',
    code: 'SCHWARTZ · VALUES EXPLORATION',
    quote: '"Not what you should want — what quietly guides your choices?"',
    quoteCn: '不是判断哪一种价值更好，而是看见：当生活真的需要取舍时，什么会被你放在前面。',
    time: 'Approx. 6-8 Minutes',
  },
  title: '你的价值排序',
  titleEn: 'Schwartz Values · She Is Edition',
  subtitle: '当自由、安稳、成就与关怀同时出现，你会先保护什么？',
  itemCount: 30,
  duration: '约 6 分钟',
  scale: 6,
  scaleLabels: ['完全不像我', '不太像我', '有点不像我', '有点像我', '很像我', '非常像我'],
  questionPrompt: '这句话有多像现在的你？',
  instruction: '下面有 30 个关于生活选择的描述。请按现在真实的自己作答，而不是理想中、别人期待的你。',
  scaleName: 'Schwartz 基本价值观理论 · 女也中文情境探索版',
  scaleNote: '参照 Schwartz 的 10 类基本价值观框架，由「女也」原创编写中文人物情境题；不是原版 PVQ，也没有用于学术常模验证。',
  scoringNote: '结果采用个人内相对排序：比较十类价值在你自己心中的前后位置，不代表能力高低，也不与他人比较。',
  dimensions: [
    {
      id: 'selfDirection',
      name: '自主选择',
      shortName: '自主',
      desc: '重视独立思考、自由选择与按自己的方式行动。',
      everyday: '你更愿意先弄清“这是不是我真正想要的”，再决定是否跟随主流。',
    },
    {
      id: 'stimulation',
      name: '新鲜探索',
      shortName: '探索',
      desc: '重视变化、新体验、挑战感与生活的鲜活度。',
      everyday: '比起始终可预测的路线，你可能更容易被未知、变化和新可能点亮。',
    },
    {
      id: 'hedonism',
      name: '愉悦体验',
      shortName: '愉悦',
      desc: '重视身体感受、当下享受与生活本身带来的快乐。',
      everyday: '你愿意为好吃、好看、舒服和真正喜欢的体验留出位置，而不只把它们当奖励。',
    },
    {
      id: 'achievement',
      name: '成就实现',
      shortName: '成就',
      desc: '重视发挥能力、完成目标与被看见的胜任感。',
      everyday: '明确的目标、可见的进展和对能力的认可，会让你更有动力。',
    },
    {
      id: 'power',
      name: '影响力',
      shortName: '影响',
      desc: '重视话语权、社会位置，以及对决定和资源产生影响的能力。',
      everyday: '你不只想参与，也可能在意自己能否真正影响方向、拥有与责任相称的决定权。',
    },
    {
      id: 'security',
      name: '安全稳定',
      shortName: '安稳',
      desc: '重视生活、关系与环境的安全、秩序和可预期性。',
      everyday: '清楚的安排、可靠的关系和留有余地的计划，会让你更安心地向前。',
    },
    {
      id: 'conformity',
      name: '规则与分寸',
      shortName: '分寸',
      desc: '重视克制可能伤害他人或破坏共同规则的行为。',
      everyday: '你会考虑自己的表达和行动会不会给别人添麻烦，也愿意遵守彼此约定好的边界。',
    },
    {
      id: 'tradition',
      name: '传统联结',
      shortName: '传统',
      desc: '重视文化、家庭传统、仪式与代际经验带来的归属。',
      everyday: '熟悉的节日、仪式和上一代留下的经验，可能会让你感到自己有所来处。',
    },
    {
      id: 'benevolence',
      name: '身边关怀',
      shortName: '关怀',
      desc: '重视照顾亲近的人，维系信任、可靠与彼此扶持。',
      everyday: '重要的人是否被照顾、关系是否值得信赖，常常会进入你的决定。',
    },
    {
      id: 'universalism',
      name: '广泛关怀',
      shortName: '共生',
      desc: '重视公平、包容、自然，以及更广泛人群的福祉。',
      everyday: '即使一件事与你没有直接关系，你也可能会在意它是否公平、是否尊重差异和环境。',
    },
  ],
  questions: [
    { id: 1, dimension: 'selfDirection', text: '做重要选择时，你更愿意听从自己的判断，即使那条路不太主流。' },
    { id: 2, dimension: 'benevolence', text: '对你来说，成为亲近的人可以信赖、可以求助的对象很重要。' },
    { id: 3, dimension: 'security', text: '你喜欢生活有一个可靠的底：稳定的安排、清楚的计划和可预期的关系。' },
    { id: 4, dimension: 'achievement', text: '你希望把能力真正做出结果，也在意自己的专业和努力被认可。' },
    { id: 5, dimension: 'universalism', text: '看到不公平或某个群体被忽视时，即使与你无关，你也很难完全不在意。' },
    { id: 6, dimension: 'stimulation', text: '新的城市、新的做法或陌生的体验，会让你感到生活重新亮起来。' },
    { id: 7, dimension: 'conformity', text: '即使没有人监督，你也愿意遵守大家事先约定好的规则和边界。' },
    { id: 8, dimension: 'hedonism', text: '好吃、好看、舒服和真正喜欢的体验，本身就是你认真生活的一部分。' },
    { id: 9, dimension: 'tradition', text: '家庭或文化里的节日、仪式和习惯，会给你一种“我有所来处”的踏实感。' },
    { id: 10, dimension: 'power', text: '你在意自己的意见是否有分量，能不能真正影响一件事的方向。' },

    { id: 11, dimension: 'selfDirection', text: '比起别人把步骤都安排好，你更喜欢自己决定时间、方法和节奏。' },
    { id: 12, dimension: 'benevolence', text: '亲近的人遇到难处时，你愿意认真腾出时间，而不只是口头安慰。' },
    { id: 13, dimension: 'security', text: '面对风险，你通常会先准备退路、储备和备用方案，再安心尝试。' },
    { id: 14, dimension: 'achievement', text: '有一个够难、又能看见进展的目标，会比“随便做做”更让你投入。' },
    { id: 15, dimension: 'universalism', text: '即使不赞同，你也愿意先理解与自己背景、身份和生活方式很不同的人。' },
    { id: 16, dimension: 'stimulation', text: '日子长时间一成不变时，你会主动给自己找一点新的挑战或变化。' },
    { id: 17, dimension: 'conformity', text: '如果一个冲动可能给别人造成明显困扰，你愿意先克制一下自己。' },
    { id: 18, dimension: 'hedonism', text: '在能力范围内，你愿意为一段真正让自己愉快的体验花时间或金钱。' },
    { id: 19, dimension: 'tradition', text: '有些传下来的做法即使不那么便利，你仍觉得值得理解和保留。' },
    { id: 20, dimension: 'power', text: '承担重要责任时，你也希望拥有与责任相匹配的决定权和资源。' },

    { id: 21, dimension: 'selfDirection', text: '听完很多意见后，你仍需要形成自己的看法，而不是直接借用别人的结论。' },
    { id: 22, dimension: 'benevolence', text: '如果自己的成功也能让身边重要的人过得更好，你会觉得这份成功更有意义。' },
    { id: 23, dimension: 'security', text: '比起高回报但大起大落的可能，你常常更珍惜长期可靠和心里有底。' },
    { id: 24, dimension: 'achievement', text: '清楚的标准、完成一件难事的证明，会给你很强的满足感。' },
    { id: 25, dimension: 'universalism', text: '你会在意消费和生活选择是否对环境、动物或更远处的人造成影响。' },
    { id: 26, dimension: 'stimulation', text: '在熟悉但平稳与有趣但不确定之间，你经常会被后者吸引。' },
    { id: 27, dimension: 'conformity', text: '公开表达不满前，你会先想一想怎样说既诚实，又不让无关的人难堪。' },
    { id: 28, dimension: 'hedonism', text: '你允许自己享受快乐，不觉得每一次放松都必须先用辛苦换来。' },
    { id: 29, dimension: 'tradition', text: '面对人生的重要节点，熟悉的仪式和代际经验会给你方向感。' },
    { id: 30, dimension: 'power', text: '在群体中拥有一定的位置、资源和被认真听取的话语权，对你来说是重要的。' },
  ],
  computeProfile(answers) {
    const fallback = 3.5
    const cleanAnswers = this.questions.map((_, index) => {
      const value = Number(answers[index])
      return Number.isFinite(value) ? clamp(value, 1, 6) : fallback
    })
    const overall = cleanAnswers.reduce((sum, value) => sum + value, 0) / cleanAnswers.length

    return this.dimensions.map(dimension => {
      const values = this.questions
        .map((question, index) => ({ question, value: cleanAnswers[index] }))
        .filter(item => item.question.dimension === dimension.id)
        .map(item => item.value)
      const raw = values.reduce((sum, value) => sum + value, 0) / values.length
      const centered = raw - overall
      const pct = Math.round(clamp(50 + centered * 18, 8, 92))
      let position = '居中'
      if (centered >= 0.65) position = '非常靠前'
      else if (centered >= 0.25) position = '相对靠前'
      else if (centered <= -0.65) position = '暂不优先'
      else if (centered <= -0.25) position = '相对靠后'
      return { ...dimension, raw, centered, pct, position }
    }).sort((a, b) => b.centered - a.centered)
  },
  computeDomains(answers) {
    const profile = this.computeProfile(answers)
    const byId = Object.fromEntries(profile.map(item => [item.id, item]))
    const mean = (ids) => ids.reduce((sum, id) => sum + byId[id].centered, 0) / ids.length
    const hedonism = byId.hedonism.centered
    const domains = [
      {
        id: 'openness',
        name: '开放变化',
        left: '自由与变化',
        centered: (byId.selfDirection.centered + byId.stimulation.centered + hedonism * 0.5) / 2.5,
      },
      {
        id: 'conservation',
        name: '稳定延续',
        left: '秩序与安稳',
        centered: mean(['security', 'conformity', 'tradition']),
      },
      {
        id: 'transcendence',
        name: '超越自我',
        left: '关怀与共生',
        centered: mean(['benevolence', 'universalism']),
      },
      {
        id: 'enhancement',
        name: '自我提升',
        left: '成就与影响',
        centered: (byId.achievement.centered + byId.power.centered + hedonism * 0.5) / 2.5,
      },
    ].map(domain => ({
      ...domain,
      pct: Math.round(clamp(50 + domain.centered * 18, 8, 92)),
    }))

    const byDomain = Object.fromEntries(domains.map(domain => [domain.id, domain]))
    const changeGap = byDomain.openness.centered - byDomain.conservation.centered
    const focusGap = byDomain.transcendence.centered - byDomain.enhancement.centered
    const changeText = Math.abs(changeGap) < 0.2
      ? '你既想保留自由和变化，也需要生活有一个稳定的底。两边都不是妥协，而是你做选择时会同时照顾的条件。'
      : changeGap > 0
        ? '自由和变化目前更能驱动你；当环境只剩秩序与可预测，你可能会觉得自己被困住。'
        : '稳定和可预期目前更能托住你；面对变化，你通常需要先确认安全边界，再愿意迈出去。'
    const focusText = Math.abs(focusGap) < 0.2
      ? '你会同时考虑“我能做到什么”和“这会对别人带来什么”。成就与关怀在你这里经常需要一起成立。'
      : focusGap > 0
        ? '关怀、公平与更广泛的影响目前更靠前；你不太容易只用个人得失衡量一件事。'
        : '能力、成果与影响力目前更靠前；看得见的推进和决定权会让你更有行动感。'

    return {
      domains,
      tensions: [
        { title: '变化 × 安稳', text: changeText },
        { title: '成就 × 关怀', text: focusText },
      ],
    }
  },
  computeScores(answers) {
    // The map and AI portrait only need the leading values; the dedicated
    // result page renders the complete 10-dimension profile.
    return this.computeProfile(answers).slice(0, 4).map(item => ({
      label: item.shortName,
      pct: item.pct,
    }))
  },
  score(answers) {
    return this.computeProfile(answers)[0]?.id || 'selfDirection'
  },
  results: {
    selfDirection: {
      label: '自主选择',
      emoji: '🧭',
      tagline: '你更想活成自己认可的样子',
      quote: '方向可以听很多人的，但最后那一步，你希望是自己选的。',
      desc: '当外界期待和内在判断不一致时，你通常会认真辨认自己的声音。自由对你来说不只是没有限制，更是有权决定怎样理解、怎样行动、怎样成为自己。',
    },
    stimulation: {
      label: '新鲜探索',
      emoji: '✦',
      tagline: '变化会让你的生命感重新亮起来',
      quote: '你不是为了逃离日常才出发，而是在未知里更容易遇见自己。',
      desc: '新的经验、挑战和转弯会唤起你的动力。你未必时时冒险，但当生活过度重复时，你会需要一点未知，来确认自己仍在生长。',
    },
    hedonism: {
      label: '愉悦体验',
      emoji: '🍑',
      tagline: '你愿意让快乐本身成为理由',
      quote: '生活不只需要完成，也值得被真实地尝到。',
      desc: '你重视身体和感官给出的答案，也愿意为喜欢、舒服与愉快留出空间。这不是肤浅，而是你对“活着的质地”有清楚感受。',
    },
    achievement: {
      label: '成就实现',
      emoji: '↗',
      tagline: '把能力变成结果，会让你确认自己',
      quote: '你想要的不只是被夸奖，而是知道自己真的做成了。',
      desc: '目标、进展和胜任感能有效调动你。你希望自己的努力落到具体成果里，也希望能力被准确地看见与承认。',
    },
    power: {
      label: '影响力',
      emoji: '◉',
      tagline: '你在意自己能否真正推动方向',
      quote: '参与还不够，你希望自己的声音能够改变一点什么。',
      desc: '你重视话语权、决定权与资源，因为它们意味着能把想法真正推向现实。对你来说，拥有影响力也常常与承担责任相连。',
    },
    security: {
      label: '安全稳定',
      emoji: '⌂',
      tagline: '确定的底，会让你更有力量向前',
      quote: '安稳不是停在原地，而是知道自己从哪里出发、可以回到哪里。',
      desc: '可靠的关系、清楚的安排和风险边界会给你安全感。有了稳定的支点，你反而更容易专注，也更有余力面对外面的变化。',
    },
    conformity: {
      label: '规则与分寸',
      emoji: '◌',
      tagline: '你在意自由，也在意不让自由伤到别人',
      quote: '分寸不是把自己藏起来，而是知道每个动作都会落在关系里。',
      desc: '你会考虑自己的行为是否给别人造成负担，也愿意尊重共同约定。规则对你来说更像彼此相处的保护线，而不只是外部要求。',
    },
    tradition: {
      label: '传统联结',
      emoji: '〽',
      tagline: '来处会给你归属，也给你方向',
      quote: '有些被一代代保留下来的事，会提醒你：你并不是从空白处开始。',
      desc: '仪式、文化和代际经验能带给你根系感。你不一定照单全收，但愿意理解那些被时间留下来的东西，并从中寻找自己的位置。',
    },
    benevolence: {
      label: '身边关怀',
      emoji: '♡',
      tagline: '重要的人过得好，会进入你的幸福里',
      quote: '你珍惜的不是“被需要”，而是关系里真实的彼此可靠。',
      desc: '信任、照顾和长期的彼此支持对你很重要。你做选择时常常会把亲近的人放进画面里，因为关系的质量本身就是你看重的生活成果。',
    },
    universalism: {
      label: '广泛关怀',
      emoji: '◎',
      tagline: '你的在意，会越过自己的生活半径',
      quote: '即使世界很大，你仍愿意为不只属于自己的事保留感受。',
      desc: '公平、差异、环境和更广泛的人群会进入你的价值判断。你倾向把自己放在更大的共同体里理解，而不只计算眼前的个人得失。',
    },
  },
}
