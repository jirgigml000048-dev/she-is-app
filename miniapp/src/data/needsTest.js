// 基本心理需要近况（18 题）
// 理论参照自我决定理论（SDT）的基本心理需要理论（BPNT），结构参考 BPNSFS
// 对自主、胜任、连接三类需要分别观察“满足”与“受挫”。
// 题目由「女也」原创编写，不是原版 BPNSFS，也不用于研究或诊断。

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export const needsTest = {
  id: 'needs-18',
  axis: 'motivation',
  type: 'likert',
  hasIntro: true,
  customResult: 'needs',
  intro: {
    titleEn: 'What Do You Need Now',
    titleCn: '你的心理需要近况',
    code: 'SDT · BASIC PSYCHOLOGICAL NEEDS',
    quote: '"Sometimes low motivation is not laziness — something essential may be missing."',
    quoteCn: '有时不是你不够努力，而是自主、胜任或连接中的某一部分，已经很久没有得到照顾。',
    time: 'Approx. 4-6 Minutes',
  },
  title: '你的心理需要近况',
  titleEn: 'Basic Psychological Needs · Current State',
  subtitle: '最近一个月，什么在滋养你，什么又在消耗你？',
  itemCount: 18,
  duration: '约 4 分钟',
  scale: 5,
  scaleLabels: ['完全不符合', '比较不符合', '一半一半', '比较符合', '非常符合'],
  questionPrompt: '最近一个月，这句话有多符合你？',
  instruction: '请回想最近一个月真实的生活状态作答。这里没有理想答案，也不需要按“平时的性格”回答。',
  scaleName: 'BPNSFS 六维结构参考 · 女也中文近况探索版',
  scaleNote: '理论来自自我决定理论（SDT）的基本心理需要理论，结构参考 BPNSFS；18 道中文题目由「女也」原创编写，不是原版 BPNSFS。',
  scoringNote: '自主、胜任、连接分别计算“满足”与“受挫”。两者不是简单反义词，所以结果分开呈现，不用一个总分相互抵消。',
  needs: [
    {
      id: 'autonomy',
      name: '自主空间',
      shortName: '自主',
      satisfactionDimension: 'autonomySatisfaction',
      frustrationDimension: 'autonomyFrustration',
      desc: '你是否觉得自己的行动出于真实认同，并拥有选择方式和节奏的空间。',
      supported: '你最近有一定空间按自己的意愿做决定，不必每一步都向外界交代。',
      mixed: '你并非完全没有选择，但许多决定仍夹着“我想要”和“我不得不”的拉扯。',
      absent: '你最近可能很少真正问自己想怎样，生活更多是在完成已经排到面前的事。',
      pressured: '你最近的选择空间被明显挤压，外界要求、“应该”和后果压力常常盖过自己的意愿。',
      actions: [
        '选一件影响最小的事，只按自己的偏好决定一次。',
        '把今天的事情分成“我选择”“我接受”“我被迫”，看看哪一类最多。',
        '面对一个不想立刻答应的要求，先使用“我晚一点回复你”。',
      ],
    },
    {
      id: 'competence',
      name: '胜任感',
      shortName: '胜任',
      satisfactionDimension: 'competenceSatisfaction',
      frustrationDimension: 'competenceFrustration',
      desc: '你是否感到自己能够应对挑战、看见进展，并对行动产生真实影响。',
      supported: '你最近能看见自己处理事情的能力，也有一些具体进展在确认“我做得到”。',
      mixed: '你有能做好的部分，但困难、评价或反复受阻也在动摇对自己的判断。',
      absent: '你最近可能不是经常失败，而是缺少清楚的反馈和进展，很难确认自己是否正在变得更好。',
      pressured: '要求、阻碍或反馈方式正在明显削弱你的效能感，让你容易把处境困难理解成“我不行”。',
      actions: [
        '把一个模糊目标改成今天能完成、能看见结果的最小动作。',
        '记录一件你已经处理好的具体小事，不用等到“大成功”。',
        '区分“我还不会”和“环境没有给够资源”，别把两者都算成能力不足。',
      ],
    },
    {
      id: 'relatedness',
      name: '连接感',
      shortName: '连接',
      satisfactionDimension: 'relatednessSatisfaction',
      frustrationDimension: 'relatednessFrustration',
      desc: '你是否感到被在意、被理解，并能在重要关系里真实地靠近和依靠。',
      supported: '你最近拥有一些真实而可靠的连接，至少有人愿意听见你，而不只看见你的角色。',
      mixed: '关系里既有温度，也有难以抵达的部分；你可能被陪伴着，却仍有一些感受无处安放。',
      absent: '你最近未必经历明显冲突，但真正能说话、能依靠的连接可能有些稀薄。',
      pressured: '忽视、疏离或不安全的回应正在伤害你的连接感，让靠近别人也变成一件需要防备的事。',
      actions: [
        '选一个相对安全的人，说出一件具体感受，而不只汇报发生了什么。',
        '把“最近有空吗”换成一个更具体的邀请，降低彼此靠近的门槛。',
        '留意哪些关系让你持续缩小自己；连接不等于忍受所有相处方式。',
      ],
    },
  ],
  questions: [
    { id: 1, dimension: 'autonomySatisfaction', text: '你做的大多数重要事情，是因为自己认同，而不只是为了应付要求。' },
    { id: 2, dimension: 'competenceSatisfaction', text: '面对日常任务时，你常常觉得自己有能力把它们处理好。' },
    { id: 3, dimension: 'relatednessSatisfaction', text: '你身边至少有一个人，可以让你放心说出真实的感受。' },
    { id: 4, dimension: 'autonomyFrustration', text: '你的许多安排都被外界期待推着走，很少真正由自己决定。' },
    { id: 5, dimension: 'competenceFrustration', text: '反复受阻时，你很容易怀疑自己是不是根本没有能力做好。' },
    { id: 6, dimension: 'relatednessFrustration', text: '在一些重要关系里，你会感到自己被忽视、排除或放在很后面。' },

    { id: 7, dimension: 'autonomySatisfaction', text: '在日常生活中，你仍能自己选择做事的方式、时间或节奏。' },
    { id: 8, dimension: 'competenceSatisfaction', text: '遇到问题时，你通常能找到办法，让事情继续往前走。' },
    { id: 9, dimension: 'relatednessSatisfaction', text: '当你认真表达自己时，能感受到有人愿意理解和回应你。' },
    { id: 10, dimension: 'autonomyFrustration', text: '即使很不愿意，你也常因压力或后果而觉得自己不能拒绝或调整。' },
    { id: 11, dimension: 'competenceFrustration', text: '周围的评价或反馈，常让你对自己的能力感到不确定。' },
    { id: 12, dimension: 'relatednessFrustration', text: '即使身边有人，你仍常觉得自己的需要和感受没有真正被接住。' },

    { id: 13, dimension: 'autonomySatisfaction', text: '你最近做出的选择，大体能够表达真实的想法和愿望。' },
    { id: 14, dimension: 'competenceSatisfaction', text: '你能从一些具体进展里，感到自己正在变得更有能力。' },
    { id: 15, dimension: 'relatednessSatisfaction', text: '你与重要的人之间有真实的亲近感，而不只是维持表面的联系。' },
    { id: 16, dimension: 'autonomyFrustration', text: '你的生活常被“必须”和“应该”占满，自己的选择空间被挤得很小。' },
    { id: 17, dimension: 'competenceFrustration', text: '面对的要求经常超过现有支持和资源，让你产生很强的无力感。' },
    { id: 18, dimension: 'relatednessFrustration', text: '表达需要后遭遇的冷淡、否定或疏远，让你越来越不敢靠近别人。' },
  ],
  computeProfile(answers) {
    const fallback = 3
    const cleanAnswers = this.questions.map((_, index) => {
      const value = Number(answers[index])
      return Number.isFinite(value) ? clamp(value, 1, 5) : fallback
    })
    const dimensionAverage = (dimension) => {
      const values = this.questions
        .map((question, index) => ({ question, value: cleanAnswers[index] }))
        .filter(item => item.question.dimension === dimension)
        .map(item => item.value)
      return values.reduce((sum, value) => sum + value, 0) / values.length
    }

    return this.needs.map(need => {
      const satisfaction = dimensionAverage(need.satisfactionDimension)
      const frustration = dimensionAverage(need.frustrationDimension)
      const satisfactionPct = Math.round(((satisfaction - 1) / 4) * 100)
      const frustrationPct = Math.round(((frustration - 1) / 4) * 100)
      const attentionScore = frustration + (6 - satisfaction) * 0.65
      let state = 'mixed'
      let stateLabel = '一边满足，一边拉扯'
      let interpretation = need.mixed
      if (frustration >= 3.6) {
        state = 'pressured'
        stateLabel = '正在受到挤压'
        interpretation = need.pressured
      } else if (satisfaction >= 3.6 && frustration < 3) {
        state = 'supported'
        stateLabel = '得到了一些支持'
        interpretation = need.supported
      } else if (satisfaction < 3 && frustration < 3.6) {
        state = 'absent'
        stateLabel = '有些缺席'
        interpretation = need.absent
      }
      return {
        ...need,
        satisfaction,
        frustration,
        satisfactionPct,
        frustrationPct,
        attentionScore,
        state,
        stateLabel,
        interpretation,
      }
    })
  },
  computeOverview(answers) {
    const profile = this.computeProfile(answers)
    const satisfaction = profile.reduce((sum, item) => sum + item.satisfaction, 0) / profile.length
    const frustration = profile.reduce((sum, item) => sum + item.frustration, 0) / profile.length
    let text = '你最近的心理需要状态有满足也有拉扯，适合分别看看三张卡片，而不是只给自己一个总评价。'
    if (satisfaction >= 3.7 && frustration < 2.7) {
      text = '最近的生活整体为你提供了一些心理养分。继续辨认哪些人、事和环境正在支持你。'
    } else if (frustration >= 3.6) {
      text = '最近的消耗感比较明显。它不一定说明你“不够努力”，也可能是环境持续挤压了选择、效能或连接。'
    } else if (satisfaction < 2.8) {
      text = '你最近未必处在明显冲突里，但真正能滋养动力的经验偏少，生活可能更像在维持而不是生长。'
    }
    return {
      satisfaction,
      frustration,
      satisfactionPct: Math.round(((satisfaction - 1) / 4) * 100),
      frustrationPct: Math.round(((frustration - 1) / 4) * 100),
      text,
    }
  },
  computeScores(answers) {
    return this.computeProfile(answers).map(item => {
      const support = ((item.satisfaction - 1) / 4) * 0.65
        + (1 - (item.frustration - 1) / 4) * 0.35
      return {
        label: `${item.shortName}支持`,
        pct: Math.round(clamp(support * 100, 0, 100)),
      }
    })
  },
  score(answers) {
    const profile = this.computeProfile(answers)
    const broadlySupported = profile.every(item => (
      item.satisfaction >= 3.6 && item.frustration < 2.7
    ))
    if (broadlySupported) return 'supported'
    return [...profile].sort((a, b) => b.attentionScore - a.attentionScore)[0]?.id || 'autonomy'
  },
  results: {
    autonomy: {
      label: '自主空间',
      emoji: '🪁',
      tagline: '最近，你更需要找回“这是我的选择”',
      quote: '人不是只有在自由时才行动，但长久没有选择，动力会慢慢失去自己的声音。',
      desc: '你的结果提示，自主需要目前更值得被照顾。它不是凡事只按自己来，而是在现实限制中，仍能理解并认同自己的行动，也保留一点选择方式和节奏的空间。',
    },
    competence: {
      label: '胜任感',
      emoji: '⛰',
      tagline: '最近，你更需要重新看见“我做得到”',
      quote: '有时不是能力消失了，而是任务、资源和反馈共同遮住了进展。',
      desc: '你的结果提示，胜任需要目前更值得被照顾。你可能需要的不是更严厉地要求自己，而是更清晰的目标、更合适的难度，以及能够确认进展的真实反馈。',
    },
    relatedness: {
      label: '连接感',
      emoji: '◡',
      tagline: '最近，你更需要一段能真实靠近的关系',
      quote: '身边有人不等于被连接；真正的靠近，是你不用缩小自己也能留在关系里。',
      desc: '你的结果提示，连接需要目前更值得被照顾。这里说的连接不是社交数量，而是被在意、被理解，以及能够在相对安全的关系里表达真实需要。',
    },
    supported: {
      label: '三种需要都有支点',
      emoji: '✺',
      tagline: '最近的生活，正在给你一些真实的心理养分',
      quote: '动力不全靠意志撑起来，它也会从选择、进展和连接里自然长出来。',
      desc: '你的自主、胜任和连接最近都得到了一定支持，也没有明显被持续挤压。这个结果不是“满分”，而是在提醒你留意并保护那些正在滋养你的关系、节奏与环境。',
    },
  },
}
