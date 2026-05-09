// All assessments organized by 4-axis framework.
// Each test has type='slider' (1-N rating) or type='choice' (multi-option).

// FMPS-15 完美主义 (1-5 slider)
export const fmpsTest = {
  id: 'fmps-15',
  axis: 'behavior',
  type: 'likert',
  hasIntro: true,
  intro: {
    titleEn: 'Perfectionism',
    titleCn: '完美主义倾向',
    code: 'FMPS · Frost Multidimensional Perfectionism Scale',
    quote: '"When you finish a task, is your first thought \'it\'s not good enough\'?"',
    quoteCn: '探索你高标准的各个层面，发现卓越与自我慈悲之间的桥梁。',
    time: 'Approx. 5-7 Minutes',
  },
  title: '完美主义倾向',
  titleEn: 'FMPS · Perfectionism',
  subtitle: '高标准如何影响你的日常心流？',
  itemCount: 15,
  duration: '约 4 分钟',
  scale: 5,
  scaleLabels: ['完全不符合', '有点不符合', '不确定', '有点符合', '完全符合'],
  instruction: '下面是一些关于你做事方式的描述。请根据你平时的真实情况作答。',
  questions: [
    { id: 1, text: '做事或学习的时候若是有部分的失败，我会觉得自己完全失败了', dimension: 'CM' },
    { id: 2, text: '假如我犯错误，人们很可能会轻看我', dimension: 'CM' },
    { id: 3, text: '如果我不能做得跟别人一样好，说明我是个低人一等的人', dimension: 'CM' },
    { id: 4, text: '做事有条理有系统对我是十分重要的', dimension: 'OR' },
    { id: 5, text: '整洁对我来说是十分重要的', dimension: 'OR' },
    { id: 6, text: '我是一个有条理的人', dimension: 'OR' },
    { id: 7, text: '我的父母曾给我定下很高的标准', dimension: 'PE' },
    { id: 8, text: '我的父母曾经期望我做得特别出色', dimension: 'PE' },
    { id: 9, text: '我从不觉得自己能达到我父母为我定下的标准', dimension: 'PE' },
    { id: 10, text: '比起大多数人，我定下更高的目标', dimension: 'PS' },
    { id: 11, text: '我厌恶做事不能做得最佳', dimension: 'PS' },
    { id: 12, text: '我有极高的目标', dimension: 'PS' },
    { id: 13, text: '尽管我小心翼翼地做事，还是经常感到自己做得不太正确', dimension: 'DA' },
    { id: 14, text: '我经常对一些日常小事也犹豫不决', dimension: 'DA' },
    { id: 15, text: '为了把一件事情做好，我需要花较长的时间', dimension: 'DA' },
  ],
  computeScores(answers) {
    const dimAvg = (dim) => {
      const items = this.questions.filter(q => q.dimension === dim)
      const vals = items.map(q => answers[q.id - 1] ?? 3)
      return vals.reduce((s,v) => s+v, 0) / vals.length
    }
    return [
      { label: '失误担忧', pct: Math.round(((dimAvg('CM') - 1) / 4) * 100) },
      { label: '条理秩序', pct: Math.round(((dimAvg('OR') - 1) / 4) * 100) },
      { label: '父母期待', pct: Math.round(((dimAvg('PE') - 1) / 4) * 100) },
      { label: '个人标准', pct: Math.round(((dimAvg('PS') - 1) / 4) * 100) },
      { label: '行动疑虑', pct: Math.round(((dimAvg('DA') - 1) / 4) * 100) },
    ]
  },
  score(answers) {
    const dimMean = (items) => items.reduce((s, i) => s + (answers[i - 1] ?? 3), 0) / items.length
    const cm = dimMean([1,2,3])
    const or_ = dimMean([4,5,6])
    const pe = dimMean([7,8,9])
    const ps = dimMean([10,11,12])
    const da = dimMean([13,14,15])
    if (cm >= 3.5 && da >= 3.5) return 'high_cm_da'
    if (ps >= 3.5 && cm < 3.5 && da < 3.5) return 'high_ps_low_cm'
    if (pe >= 3.5) return 'high_pe'
    if (da >= 3.5 && cm < 3.5) return 'high_da_low_cm'
    if (or_ >= 3.5 && cm < 3 && da < 3 && pe < 3 && ps < 3) return 'high_or'
    return 'balanced'
  },
  results: {
    high_cm_da: { label: '你太怕做错了', emoji: '🎯', tagline: '', quote: '不是不想做，是太怕做错——那份停顿，是一种保护，不是懦弱。', desc: '你对犯错有很强的恐惧，同时在开始一件事之前会反复犹豫。不是不想做，是太怕做错。这种组合很常见，也很耗力气。' },
    high_ps_low_cm: { label: '你对自己有很高的要求，但不会被它压垮', emoji: '🎯', tagline: '', quote: '你的高标准是引擎，不是枷锁——这个区别，很多人花了很久才搞清楚。', desc: '你给自己设定的标准比多数人高，但你不会因为没达到就觉得自己失败。这是适应性完美主义——推动你前进，而不是拖住你。' },
    high_pe: { label: '你内化了很多来自父母的标准', emoji: '🎯', tagline: '', quote: '你用来评价自己的那把尺子，有多少是你自己选的？这个问题，值得停下来想一想。', desc: '你感受到父母对你有很高的期待，这些期待已经成了你评价自己的一把尺子。有时候你可能不太清楚，哪些标准是你真正想要的。' },
    high_da_low_cm: { label: '开始对你来说是最难的那一步', emoji: '🎯', tagline: '', quote: '你不怕做错，你怕的是做了还不够好——那道门槛，只有你自己能决定什么时候算过了。', desc: '你不太担心犯错本身，但「做完了是不是真的对」这个问题会困住你。有时候为了做好一件事，你需要比别人更长的准备时间。' },
    high_or: { label: '你喜欢秩序，但不焦虑', emoji: '🎯', tagline: '', quote: '条理对你来说是一种舒服，不是一种压力——这种完美主义，轻盈得有点让人羡慕。', desc: '整洁和条理对你很重要，但这更像是一种偏好，而不是强迫。你的完美主义是轻量的，甚至有点让人羡慕。' },
    balanced: { label: '你在「够好」和「更好」之间找到了某种平衡', emoji: '🎯', tagline: '', quote: '你知道什么时候可以放手——这种灵活，比坚持到底更难练。', desc: '你的完美主义各维度都不特别突出，说明你对「做好」这件事的态度比较灵活。不同情境下你会调整自己的标准，这是一种实用主义。' },
  },
}


// 边界感 (single choice, tag voting)
export const boundaryTest = {
  id: 'boundary-sense',
  axis: 'behavior',
  type: 'choice',
  hasIntro: true,
  intro: {
    titleEn: 'Boundary Sense',
    titleCn: '边界感探索',
    code: 'BS · Where Do You Draw the Line?',
    quote: '"Knowing where you end and others begin."',
    quoteCn: '你知道自己的边在哪里吗？探索你的情感、社交与内在边界。',
    time: 'Approx. 3-5 Minutes',
  },
  title: '你的边界感',
  titleEn: 'BS · Boundary Sense',
  subtitle: '在哪一类情境里，你最容易把自己放在后面？',
  itemCount: 8,
  duration: '约 3 分钟',
  instruction: '有些"答应"，并不是因为真的愿意。这个测试想看看，你在哪一类情境里更容易让步。',
  questions: [
    { id: 1, text: '已经很累了，朋友临时约你晚上出去散心，还说"只有你最懂我"。你更可能：', options: [{ tag: '情感型边界缺失', text: '明明想休息，还是答应下来，不想让她失望' }, { tag: '社交型边界缺失', text: '如果她在群里这样说，你更难当场拒绝' }, { tag: '自我型边界缺失', text: '会先愣一下，得想一会儿才知道自己到底想不想去' }] },
    { id: 2, text: '同事把原本不属于你的活顺手推给你，说"你做这个最靠谱"。你通常会：', options: [{ tag: '情感型边界缺失', text: '怕拒绝了显得不好相处，于是接下来' }, { tag: '社交型边界缺失', text: '尤其在大家都在场时，很难直接说不' }, { tag: '自我型边界缺失', text: '先接了再说，后来才意识到这其实挤占了自己的时间' }] },
    { id: 3, text: '家人希望你周末回去吃饭，但你其实只想一个人待着。你的第一反应更像：', options: [{ tag: '情感型边界缺失', text: '想到他们会失望，就很难开口拒绝' }, { tag: '社交型边界缺失', text: '如果亲戚群里都在等你回应，你更说不出口' }, { tag: '自我型边界缺失', text: '你会怀疑"是不是我太自私了"，不太确定休息算不算正当理由' }] },
    { id: 4, text: '朋友总喜欢不提前打招呼就给你打视频。你更可能：', options: [{ tag: '情感型边界缺失', text: '即使不方便也会接，怕对方多想' }, { tag: '社交型边界缺失', text: '如果旁边有人起哄说"快接呀"，你更难拒绝' }, { tag: '自我型边界缺失', text: '经常接完才发现自己其实一点都不想被打扰' }] },
    { id: 5, text: '你买了一张很想看的演出票，但朋友突然说那天想你陪她办点事。你通常会：', options: [{ tag: '情感型边界缺失', text: '虽然舍不得，还是更容易先顾她那边' }, { tag: '社交型边界缺失', text: '如果这件事被几个人一起拜托，你基本不好意思坚持自己原计划' }, { tag: '自我型边界缺失', text: '会开始权衡半天，却说不清自己到底更想去哪边' }] },
    { id: 6, text: '有人向你借钱，金额不大，但你心里并不舒服。你更像会：', options: [{ tag: '情感型边界缺失', text: '担心不借显得冷淡，最后还是借了' }, { tag: '社交型边界缺失', text: '如果对方当着别人面开口，你几乎不会拒绝' }, { tag: '自我型边界缺失', text: '你会先答应，之后才慢慢意识到自己其实不愿意' }] },
    { id: 7, text: '朋友总把负面情绪倾倒给你，一聊就是很久。某天你状态很差。你更可能：', options: [{ tag: '情感型边界缺失', text: '还是撑着陪她，怕她觉得你不在乎' }, { tag: '社交型边界缺失', text: '如果她在共同朋友圈里表现得很脆弱，你更难退出' }, { tag: '自我型边界缺失', text: '你其实分不清自己是不想听了，还是只是今天累了' }] },
    { id: 8, text: '有人问你"你想吃什么、去哪儿、怎么安排"，你最常出现的状态是：', options: [{ tag: '情感型边界缺失', text: '怕麻烦别人，常说"都可以，你定吧"' }, { tag: '社交型边界缺失', text: '只要大家已经有倾向，你就不太会提出不同意见' }, { tag: '自我型边界缺失', text: '你是真的常常答不上来，因为一时也不知道自己想要什么' }] },
  ],
  computeScores(answers) {
    const total = answers.filter(a => a !== null).length || 1
    const count = (tag) => answers.filter(a => a === tag).length
    return [
      { label: '情感型', pct: Math.round(count('情感型边界缺失') / total * 100) },
      { label: '社交型', pct: Math.round(count('社交型边界缺失') / total * 100) },
      { label: '自我型', pct: Math.round(count('自我型边界缺失') / total * 100) },
    ]
  },
  score(answers) {
    const counts = {}
    answers.forEach(a => {
      if (a) counts[a] = (counts[a] || 0) + 1
    })
    return Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || '情感型边界缺失'
  },
  results: {
    '情感型边界缺失': { label: '你更容易被"别让人失望"牵着走', emoji: '🌿', tagline: '', quote: '你在意的不是自己累不累，而是对方会不会失望。这份温柔是真的，只是有时候也需要为自己留一份。', desc: '你很在意关系里的温度，也很能共情别人，所以拒绝对你来说常常带着愧疚感。你不是不会保护自己，只是每次轮到自己时，总想再让一步。' },
    '社交型边界缺失': { label: '你更容易在群体氛围里退让', emoji: '🌿', tagline: '', quote: '你的边界在人群里会变薄——不是你变了，是场面让你先顾着气氛了。', desc: '一对一时你未必没有想法，但只要放进群体情境里，你会更在意场面是否和气、自己是否显得扫兴。很多时候，不是你没有边界，而是你太容易先照顾气氛。' },
    '自我型边界缺失': { label: '你有时还没来得及听见自己', emoji: '🌿', tagline: '', quote: '你不是不知道自己想要什么，只是还没习惯在答应之前先停一秒，问问自己。', desc: '你不是单纯不会拒绝，而是常常在做出反应之后，才慢慢意识到自己原来并不想那样。边界感对你来说，第一步也许不是说"不"，而是先更清楚地知道"我想要什么"。' },
  },
}


// 关系角色 (single choice)
export const roleTest = {
  id: 'relationship-role',
  axis: 'behavior',
  type: 'choice',
  hasIntro: true,
  intro: {
    titleEn: 'Relationship Role',
    titleCn: '关系中的你',
    code: 'IRP · Interpersonal Role Profile',
    quote: '"Are you the one who listens, cares, or speaks first?"',
    quoteCn: '在亲密关系里，你更像倾听者、照顾者，还是表达者？',
    time: 'Approx. 3-5 Minutes',
  },
  title: '关系中的你',
  titleEn: 'IRP · Interpersonal Roles',
  subtitle: '当别人靠近、失落、需要你时，你最常站在哪个位置？',
  itemCount: 10,
  duration: '约 4 分钟',
  instruction: '在亲密关系和友情里，我们常常会不自觉地扮演某种角色。这个测试想陪你看见你最常的位置。',
  questions: [
    { id: 1, text: '朋友深夜突然发来一长串消息，说自己快撑不住了。你更像会：', options: [{ tag: '倾听者', text: '先认真看完，一边安慰一边陪她把情绪说出来' }, { tag: '照顾者', text: '马上问她在哪、要不要吃点东西，开始想怎么照顾她' }, { tag: '表达者', text: '直接说出你的担心和想法，也会分享你类似的经历' }] },
    { id: 2, text: '伴侣看起来明显心情不好，但只说"没事"。你通常会：', options: [{ tag: '倾听者', text: '不逼问，陪在旁边等他愿意开口' }, { tag: '照顾者', text: '给他倒水、点外卖、把气氛先照顾好' }, { tag: '表达者', text: '主动说"我感觉你不太对劲，我们聊聊吧"' }] },
    { id: 3, text: '聚会上你注意到有个人一直被冷落。你更可能：', options: [{ tag: '倾听者', text: '走过去陪她聊几句，听听她现在的感受' }, { tag: '照顾者', text: '拉她一起去拿吃的、换个位置，让她没那么尴尬' }, { tag: '表达者', text: '直接把她介绍给大家，主动把话题带起来' }] },
    { id: 4, text: '你和很亲近的人起了小误会，对方开始变冷淡。你的第一反应通常是：', options: [{ tag: '倾听者', text: '先回想是不是她最近也有别的压力，不急着追问' }, { tag: '照顾者', text: '想着怎么补救、怎么让关系重新舒服一点' }, { tag: '表达者', text: '忍不住先把自己的委屈和想法说清楚' }] },
    { id: 5, text: '朋友失恋后反复讲同一件事，已经说了很多遍。你更像会：', options: [{ tag: '倾听者', text: '继续听她说，哪怕内容重复，也知道她还没过去' }, { tag: '照顾者', text: '带她出门、陪她吃饭，想办法让她好受一点' }, { tag: '表达者', text: '温和但直接地说出你的判断，希望她早点走出来' }] },
    { id: 6, text: '有人问你"你最近怎么样"，你心里其实有很多事。你通常会：', options: [{ tag: '倾听者', text: '笑笑带过，反而顺势问对方最近怎么样' }, { tag: '照顾者', text: '先说自己还好，担心一说出来会让别人也跟着累' }, { tag: '表达者', text: '停一下，挑几件真实的事讲出来' }] },
    { id: 7, text: '你发现一位朋友总是在关系里受委屈，却不太反抗。你多半会：', options: [{ tag: '倾听者', text: '先听她讲完，不急着替她做判断' }, { tag: '照顾者', text: '替她操心，开始想能怎么帮她脱离那个处境' }, { tag: '表达者', text: '直接说出你看到的问题，劝她别再忍了' }] },
    { id: 8, text: '一段关系里出现沉默期，对方不主动，你也难受。你更可能：', options: [{ tag: '倾听者', text: '等一等，觉得也许他需要空间' }, { tag: '照顾者', text: '还是会关心他有没有吃饭、最近忙不忙' }, { tag: '表达者', text: '先发消息把话题挑开，不想一直猜' }] },
    { id: 9, text: '朋友来找你，多半不是为了要建议，而是想被接住。你通常会：', options: [{ tag: '倾听者', text: '很自然地进入"听她说"的状态' }, { tag: '照顾者', text: '一边听一边照顾细节，比如递纸巾、点热饮、安排后续' }, { tag: '表达者', text: '会先回应她，也会把自己的感觉和理解说出来' }] },
    { id: 10, text: '回想重要关系里的你，最常出现的遗憾是：', options: [{ tag: '倾听者', text: '听了很多，却很少让别人真正知道我的感受' }, { tag: '照顾者', text: '总顾着对方舒不舒服，后来才发现自己也有点累' }, { tag: '表达者', text: '当下说得太快太满，事后又反复回想是不是说多了' }] },
  ],
  computeScores(answers) {
    const total = answers.filter(a => a !== null).length || 1
    const count = (tag) => answers.filter(a => a === tag).length
    return [
      { label: '倾听者', pct: Math.round(count('倾听者') / total * 100) },
      { label: '照顾者', pct: Math.round(count('照顾者') / total * 100) },
      { label: '表达者', pct: Math.round(count('表达者') / total * 100) },
    ]
  },
  score(answers) {
    const counts = {}
    answers.forEach(a => {
      if (a) counts[a] = (counts[a] || 0) + 1
    })
    return Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || '倾听者'
  },
  results: {
    '倾听者': { label: '你是关系里的倾听者', emoji: '👂', tagline: '', quote: '你能接住很多，只是别忘了，你自己的话也值得被人好好听完。', desc: '你很擅长接住别人的情绪，很多人会因为你的安静和稳定而靠近你。只是有时候，你太习惯把位置让给别人，自己的委屈和需要反而被轻轻放在了后面。' },
    '照顾者': { label: '你是关系里的照顾者', emoji: '🤲', tagline: '', quote: '你把温柔给了很多人，也记得留一点给自己。', desc: '你总能很快看见别人缺什么，也很自然地把温柔落到细节里。只是照顾久了，也别忘了你不是只能负责气氛的人，你也值得被认真照顾。' },
    '表达者': { label: '你是关系里的表达者', emoji: '💬', tagline: '', quote: '你没有把自己藏起来——这件事，比你想的更勇敢。', desc: '你愿意把感受放到台面上，这种坦率其实很珍贵，也让关系少一些猜测。有时你会在说完之后反复回看，但真正重要的，往往不是你说得够不够完美，而是你没有把自己藏起来。' },
  },
}


// DISC 行为风格 (single choice with 4 dim options)
export const discTest = {
  id: 'disc',
  axis: 'behavior',
  type: 'choice',
  hasIntro: true,
  intro: {
    titleEn: 'DISC Profile',
    titleCn: 'DISC 行为风格',
    code: 'DISC · Behavioral Style Assessment',
    quote: '"How do you show up — in work, in conflict, in connection?"',
    quoteCn: '你是推动者、感染者、稳定者，还是分析者？',
    time: 'Approx. 5-7 Minutes',
  },
  title: '行为风格 DISC',
  titleEn: 'DISC · Behavior Style',
  subtitle: '你在工作和社交中的行为倾向',
  itemCount: 12,
  duration: '约 5 分钟',
  instruction: '下面是一些日常情境，请选择最像你的反应（不是你觉得最好的，而是最像你平时的）。',
  questions: [
    { id: 1, text: '团队要做一个决定，但大家迟迟没有进展。你更可能：', options: [{ tag: 'C', text: '先把所有选项的利弊列清楚，再讨论' }, { tag: 'I', text: '先把大家的想法都摆出来，让气氛活起来' }, { tag: 'D', text: '直接说出你的判断，推动做决定' }, { tag: 'S', text: '等大家都说完，再给出你的看法' }] },
    { id: 2, text: '你被交代了一个任务，但给的信息不够完整。你更可能：', options: [{ tag: 'S', text: '等信息更完整再开始，不想做一半重来' }, { tag: 'D', text: '先动起来，边做边调整' }, { tag: 'C', text: '整理出所有不确定的地方，逐一确认后再做' }, { tag: 'I', text: '先去找相关的人聊聊，搞清楚背景' }] },
    { id: 3, text: '和别人发生了分歧，对方坚持他的观点。你更可能：', options: [{ tag: 'I', text: '试着找到你们之间的共同点，把气氛缓和下来' }, { tag: 'C', text: '用数据或逻辑来支撑你的观点' }, { tag: 'S', text: '退一步，看看对方的角度有没有道理' }, { tag: 'D', text: '把你的理由再说一遍，更直接地坚持' }] },
    { id: 4, text: '你在一个新环境里认识了一群陌生人。你更可能：', options: [{ tag: 'D', text: '很快找到你想深入交流的人，主动建立连接' }, { tag: 'S', text: '先观察，等有人来和你说话' }, { tag: 'I', text: '很快和很多人聊起来，让整个场子活跃' }, { tag: 'C', text: '更关注观察这群人的互动模式，少说多看' }] },
    { id: 5, text: '你负责的一件事出了问题。你更可能：', options: [{ tag: 'I', text: '第一反应是和团队说清楚，保持透明' }, { tag: 'D', text: '马上找到解决方案，优先把问题解决' }, { tag: 'C', text: '先搞清楚问题的根本原因，再决定怎么做' }, { tag: 'S', text: '先稳住情绪和局面，再一步步处理' }] },
    { id: 6, text: '别人给你反馈说你做的东西有不足。你更可能：', options: [{ tag: 'C', text: '把反馈记下来，对照自己的标准仔细想' }, { tag: 'I', text: '看对方说的方式，如果方式不对你会先有情绪' }, { tag: 'D', text: '听完就想怎么改进，不太在意对方的措辞' }, { tag: 'S', text: '认真听，会想很久对方说的对不对' }] },
    { id: 7, text: '工作节奏突然加快，事情一下子多了很多。你更可能：', options: [{ tag: 'S', text: '默默扛着，不太会说自己的压力' }, { tag: 'C', text: '把所有事情列出来，有系统地一件件处理' }, { tag: 'I', text: '保持乐观，想办法把团队的士气带起来' }, { tag: 'D', text: '分出轻重缓急，优先搞定最重要的' }] },
    { id: 8, text: '你参与一个长期项目，中途方向变了。你更可能：', options: [{ tag: 'C', text: '想清楚变化带来的每一个影响，再决定' }, { tag: 'S', text: '需要时间适应，不喜欢半途改变' }, { tag: 'D', text: '快速评估新方向，决定要不要跟着变' }, { tag: 'I', text: '先关心团队的状态，确认大家都还在一起' }] },
    { id: 9, text: '你有一个新想法，但还不成熟。你更可能：', options: [{ tag: 'I', text: '先找几个信任的人聊，感受他们的反应' }, { tag: 'S', text: '先自己想清楚，觉得稳妥了再说' }, { tag: 'C', text: '先把逻辑梳理好，有了框架再提出来' }, { tag: 'D', text: '先说出来，在讨论中完善' }] },
    { id: 10, text: '做一件事，你更在意的是：', options: [{ tag: 'D', text: '结果——做完了，达到目标了没' }, { tag: 'C', text: '质量——每个细节有没有到位' }, { tag: 'S', text: '稳定——不出乱子，大家都好' }, { tag: 'I', text: '过程中的感受——和谁一起做，气氛怎样' }] },
    { id: 11, text: '别人说你“太……了”，你猜最可能是哪个：', options: [{ tag: 'S', text: '太没主见了' }, { tag: 'D', text: '太强势了' }, { tag: 'I', text: '太话多了' }, { tag: 'C', text: '太挑剔了' }] },
    { id: 12, text: '一天结束时，什么样的感觉会让你觉得「今天值了」：', options: [{ tag: 'C', text: '把一件复杂的事情理清楚了，做对了' }, { tag: 'S', text: '帮到了需要帮助的人，关系还在' }, { tag: 'D', text: '推动了一件重要的事，往前走了一步' }, { tag: 'I', text: '和人有真实的连接，彼此都打开了' }] },
  ],
  computeScores(answers) {
    const total = this.questions.length
    const count = (tag) => answers.filter(a => a === tag).length
    return [
      { label: 'D 主导', pct: Math.round(count('D') / total * 100) },
      { label: 'I 影响', pct: Math.round(count('I') / total * 100) },
      { label: 'S 稳健', pct: Math.round(count('S') / total * 100) },
      { label: 'C 谨慎', pct: Math.round(count('C') / total * 100) },
    ]
  },
  score(answers) {
    const counts = { D: 0, I: 0, S: 0, C: 0 }
    answers.forEach(a => { if (a) counts[a]++ })
    return Object.entries(counts).sort((a,b) => b[1]-a[1])[0][0]
  },
  results: {
    D: { label: 'D 型 · 主导者', emoji: '🔥', tagline: '你的第一反应是推动它发生。不是等，不是看，是直接去做。有时候这让你走在所有人前面，有时候让你一个人走。', quote: '你的时钟比别人快一格——不是不在乎，是你已经到下一步了。', desc: '你的第一反应是行动。问题来了，你不会在原地分析太久，你会先找到一个方向，然后动起来。大多数人还在讨论的时候，你已经开始做了。 你对结果有很强的执着。你愿意承担压力，也愿意做决定——哪怕那个决定不是所有人都同意的。在你看来，没有决定是最差的选项。 你的直接有时候会让人不适应，但那是因为你的时钟比别人快。你不是不在乎他们，是你已经到下一步了。' },
    I: { label: 'I 型 · 影响者', emoji: '✨', tagline: '你走进一个房间，气氛就不一样了。你不是刻意的，你就是这样——你的能量会渗进周围。', quote: '你的存在本身就是一种影响——你不需要刻意，能量自然就渗出去了。', desc: '你的能量是会传染的。你兴奋的时候，身边的人也会跟着兴奋；你投入地说一件事，别人会忍不住想听完。你的存在本身就是一种影响。 你在乎关系，在乎人。一个项目结束了，你记得的不是最终的数字，而是过程中那些真实的瞬间——谁说了什么，气氛在哪一刻变了，谁被看见了。 你的乐观是真实的，不是表演。你真的相信事情会好的，而且你的相信有时候会成为让事情真的好起来的原因。' },
    S: { label: 'S 型 · 稳健者', emoji: '🌿', tagline: '你是那个让人安心待在旁边的人。不是因为你什么都说好，而是你真的在，而且你不会突然消失。', quote: '你不制造混乱，你消化混乱——那是一种比大多数人意识到的都更珍贵的力量。', desc: '你不制造混乱，你消化混乱。当周围的人都在乱的时候，你会自然地成为那个稳住的人——不是因为你没感觉，而是你处理感觉的方式很安静。 你重视关系里的稳定。你不会随意撕破一段关系，你会花时间维护它、修补它。有人在你旁边待着会觉得放心，因为你不会突然变卦，不会无缘无故消失。 你对变化需要更长的适应时间。这不是缺点，是你处理新事物的方式——你需要感觉到脚是踩在地上的，才能往前走。' },
    C: { label: 'C 型 · 谨慎者', emoji: '📐', tagline: '你在意每一个细节是否到位。别人觉得够了，你还没完。这种在意是你的标准，也是你最累的地方。', quote: '你的标准是你的尺子，量出来的质量别人都看得见——只是你自己难得满意。', desc: '你的眼睛会自动扫描错误。别人看到的是整体，你看到的是某一处不对劲的地方。你不是故意挑剔，是你的感知系统就是这样设置的。 你做事之前需要想清楚。随意开始对你来说会造成焦虑，因为你知道细节里藏着风险。一旦想清楚了，你做的东西质量通常都很高。 你很难接受”差不多就好了”。不是完美主义，是你内心有一套清晰的标准，低于那条线你会难受。' },
  },
}


// 荣格认知功能 48题快速版 (1-5 slider, 8-dim profile result)
export const cognitiveTest = {
  id: 'cognitive-48',
  axis: 'trait',
  type: 'slider',
  hasIntro: true,
  intro: {
    titleEn: 'Jungian Cognitive',
    titleCn: '荣格认知功能 · 快速版',
    code: 'CF · Cognitive Functions · 48Q',
    quote: '"What is your mind\'s native language?"',
    quoteCn: '思维、感知、判断、直觉——你最常使用哪种认知过程？',
    time: 'Approx. 10 Minutes',
  },
  title: '荣格认知功能 · 快速版',
  titleEn: 'MBTI-CF Quick · Jungian Cognitive',
  subtitle: '8 个维度 × 6 题，看清你的认知偏好',
  itemCount: 48,
  duration: '约 10 分钟',
  scale: 5,
  scaleLabels: ['完全不符合', '不太符合', '有时符合', '比较符合', '完全符合'],
  instruction: '下面是一些关于你思维和感受方式的描述。请凭直觉作答。',
  customResult: 'cognitive',
  dimensions: [
    { id: 'Se', name: '外感觉 Se', desc: '关注当下环境与即时体验，善于捕捉外界变化，偏好直接行动、真实感官刺激与现场应变。' },
    { id: 'Si', name: '内感觉 Si', desc: '重视经验积累与内部参照，关注细节、稳定性与熟悉感，倾向依赖记忆和既有经验判断。' },
    { id: 'Ne', name: '外直觉 Ne', desc: '擅长从外部信息中联想到多种可能，喜欢发散、探索新点子与跨领域连接。' },
    { id: 'Ni', name: '内直觉 Ni', desc: '倾向从复杂信息中提炼核心模式与长期趋势，关注隐含意义、预感与深层洞察。' },
    { id: 'Te', name: '外思维 Te', desc: '重视客观标准、效率与执行结果，擅长组织资源、制定流程并推动任务落地。' },
    { id: 'Ti', name: '内思维 Ti', desc: '追求概念上的精确与逻辑一致，擅长拆解问题、澄清定义并建立内部理论框架。' },
    { id: 'Fe', name: '外情感 Fe', desc: '关注群体氛围与人际互动，重视关系协调、他人感受与社会情境中的恰当表达。' },
    { id: 'Fi', name: '内情感 Fi', desc: '重视个人价值、真实感受与内在道德判断，倾向依据内心认同来作出选择。' },
  ],
  questions: [
    { id: 1, text: '我通常会先注意到眼前环境中的变化，而不是先思考它的意义。', dimension: 'Se' },
    { id: 2, text: '比起长时间设想未来，我更愿意直接投入现实情境中行动。', dimension: 'Se' },
    { id: 3, text: '我对声音、颜色、气味、动作等感官信息相当敏感。', dimension: 'Se' },
    { id: 4, text: '遇到突发情况时，我往往能快速根据现场情况做出反应。', dimension: 'Se' },
    { id: 5, text: '我喜欢通过亲身体验来理解事物，而不是只看理论说明。', dimension: 'Se' },
    { id: 6, text: '在生活中，我容易被新鲜、有冲击力或有趣的现实体验吸引。', dimension: 'Se' },
    { id: 7, text: '我会自然地把当前经历与过去类似的经验进行比较。', dimension: 'Si' },
    { id: 8, text: '熟悉的流程、环境或做法，会让我更安心、更容易发挥。', dimension: 'Si' },
    { id: 9, text: '我对细节变化很敏感，常能发现"这次和以前不一样"。', dimension: 'Si' },
    { id: 10, text: '面对新事物时，我通常会先想：以前有没有类似情况可参考。', dimension: 'Si' },
    { id: 11, text: '我习惯保留对自己有用的经验，并在以后重复使用。', dimension: 'Si' },
    { id: 12, text: '我重视生活中的稳定、规律和可预期性。', dimension: 'Si' },
    { id: 13, text: '一个想法常常会让我联想到更多不同的可能性。', dimension: 'Ne' },
    { id: 14, text: '我喜欢从看似无关的事物之间发现新联系。', dimension: 'Ne' },
    { id: 15, text: '当别人提出问题时，我脑中常会一下子冒出很多种解法。', dimension: 'Ne' },
    { id: 16, text: '我对未知、变化和新奇的概念通常抱有好奇心。', dimension: 'Ne' },
    { id: 17, text: '我比起维持单一路线，更喜欢探索替代方案。', dimension: 'Ne' },
    { id: 18, text: '我容易被概念、隐喻、创意点子或脑洞式讨论激发灵感。', dimension: 'Ne' },
    { id: 19, text: '我常会从纷杂的信息中突然形成一个整体性的判断。', dimension: 'Ni' },
    { id: 20, text: '很多时候，我先有一种"就是这样"的直觉，之后才说得清理由。', dimension: 'Ni' },
    { id: 21, text: '我倾向关注事情背后的模式、趋势或深层含义。', dimension: 'Ni' },
    { id: 22, text: '面对复杂局面时，我更想找出核心线索，而不是处理所有表面细节。', dimension: 'Ni' },
    { id: 23, text: '我常会思考一件事在更长时间尺度上会如何发展。', dimension: 'Ni' },
    { id: 24, text: '我会被象征、隐喻、主题或"隐藏信息"所吸引。', dimension: 'Ni' },
    { id: 25, text: '我习惯先明确目标、标准和完成条件，再开始做事。', dimension: 'Te' },
    { id: 26, text: '我会自然地思考怎样安排资源，才能更高效地推进任务。', dimension: 'Te' },
    { id: 27, text: '我重视结果是否可衡量、可验证，而不只是"感觉不错"。', dimension: 'Te' },
    { id: 28, text: '发现流程低效时，我会想办法优化它。', dimension: 'Te' },
    { id: 29, text: '在团队中，我常会主动推动分工、排期或执行节奏。', dimension: 'Te' },
    { id: 30, text: '我倾向依据事实、数据或客观证据来判断方案优劣。', dimension: 'Te' },
    { id: 31, text: '我喜欢先弄清一个概念的定义，再继续讨论。', dimension: 'Ti' },
    { id: 32, text: '面对问题时，我会先分析其中的结构与逻辑关系。', dimension: 'Ti' },
    { id: 33, text: '如果一个说法在逻辑上不一致，我很难直接接受它。', dimension: 'Ti' },
    { id: 34, text: '我经常会在心里把复杂问题拆成几个更基础的部分。', dimension: 'Ti' },
    { id: 35, text: '我倾向独立思考，直到自己真正想明白为止。', dimension: 'Ti' },
    { id: 36, text: '我关心的不只是结论对不对，还包括推理过程是否严密。', dimension: 'Ti' },
    { id: 37, text: '我会自然关注他人的情绪变化，以及现场氛围是否融洽。', dimension: 'Fe' },
    { id: 38, text: '在群体中，我常会根据场合调整自己的表达方式。', dimension: 'Fe' },
    { id: 39, text: '如果有人被冷落或尴尬，我通常会想办法缓和局面。', dimension: 'Fe' },
    { id: 40, text: '我重视别人是否感到被理解、被尊重、被妥善对待。', dimension: 'Fe' },
    { id: 41, text: '做决定时，我会考虑这会对关系和整体氛围产生什么影响。', dimension: 'Fe' },
    { id: 42, text: '我常能察觉别人没有说出口的情绪需求。', dimension: 'Fe' },
    { id: 43, text: '我做决定时，很看重这是否真正符合自己的内心。', dimension: 'Fi' },
    { id: 44, text: '即使别人都认同，我也不会轻易违背自己的价值判断。', dimension: 'Fi' },
    { id: 45, text: '我对"真实"很敏感，不喜欢违心的表达或表演式互动。', dimension: 'Fi' },
    { id: 46, text: '我会认真分辨自己的感受，而不是只顺着外界期待行动。', dimension: 'Fi' },
    { id: 47, text: '我倾向尊重每个人独特的处境和个人选择。', dimension: 'Fi' },
    { id: 48, text: '当某件事触及我深层认同的价值时，我会非常坚定。', dimension: 'Fi' },
  ],
  score(answers) {
    const dimSums = {}
    this.dimensions.forEach(d => { dimSums[d.id] = { total: 0, count: 0 } })
    this.questions.forEach((q, i) => {
      const v = answers[i] ?? 3
      dimSums[q.dimension].total += v
      dimSums[q.dimension].count += 1
    })
    const sorted = this.dimensions.map(d => ({
      id: d.id, name: d.name, desc: d.desc,
      avg: dimSums[d.id].total / dimSums[d.id].count,
    })).sort((a, b) => b.avg - a.avg)
    return sorted[0].id
  },
  results: {},
}


export const cognitive80Test = {
  id: 'cognitive-80', axis: 'trait', type: 'slider', hasIntro: true,
  title: '荣格认知功能 · 深度版',
  titleEn: 'CF · Jungian Cognitive Deep',
  subtitle: '8 个维度 × 10 题，更精准的认知功能画像',
  itemCount: 80, duration: '约 20 分钟',
  scale: 5,
  scaleLabels: ['完全不符合', '不太符合', '有时符合', '比较符合', '完全符合'],
  instruction: '下面是一些关于你思维和感受方式的描述。请凭直觉作答。',
  customResult: 'cognitive',
  intro: {
    titleEn: 'Jungian Cognitive',
    titleCn: '荣格认知功能 · 深度版',
    code: 'CF · Cognitive Functions · 80Q',
    quote: '"What is your mind\'s native language?"',
    quoteCn: '思维、感知、判断、直觉——80题深度探索你的认知偏好。',
    time: 'Approx. 20 Minutes',
  },
  dimensions: [
    { id: 'Se', name: '外感觉 Se', desc: '关注当下环境与即时体验，善于捕捉外界变化，偏好直接行动、真实感官刺激与现场应变。' },
    { id: 'Si', name: '内感觉 Si', desc: '重视经验积累与内部参照，关注细节、稳定性与熟悉感，倾向依赖记忆和既有经验判断。' },
    { id: 'Ne', name: '外直觉 Ne', desc: '擅长从外部信息中联想到多种可能，喜欢发散、探索新点子与跨领域连接。' },
    { id: 'Ni', name: '内直觉 Ni', desc: '倾向从复杂信息中提炼核心模式与长期趋势，关注隐含意义、预感与深层洞察。' },
    { id: 'Te', name: '外思维 Te', desc: '重视客观标准、效率与执行结果，擅长组织资源、制定流程并推动任务落地。' },
    { id: 'Ti', name: '内思维 Ti', desc: '追求概念上的精确与逻辑一致，擅长拆解问题、澄清定义并建立内部理论框架。' },
    { id: 'Fe', name: '外情感 Fe', desc: '关注群体氛围与人际互动，重视关系协调、他人感受与社会情境中的恰当表达。' },
    { id: 'Fi', name: '内情感 Fi', desc: '重视个人价值、真实感受与内在道德判断，倾向依据内心认同来作出选择。' },
  ],
  questions: [
    { id: 1, text: '我通常会先注意到眼前环境中的变化，而不是先思考它的意义。', dimension: 'Se' },
    { id: 2, text: '比起长时间设想未来，我更愿意直接投入现实情境中行动。', dimension: 'Se' },
    { id: 3, text: '我对声音、颜色、气味、动作等感官信息相当敏感。', dimension: 'Se' },
    { id: 4, text: '遇到突发情况时，我往往能快速根据现场情况做出反应。', dimension: 'Se' },
    { id: 5, text: '我喜欢通过亲身体验来理解事物，而不是只看理论说明。', dimension: 'Se' },
    { id: 6, text: '在生活中，我容易被新鲜、有冲击力或有趣的现实体验吸引。', dimension: 'Se' },
    { id: 7, text: '我做决定时，常会参考此时此刻最真实、最直接的信息。', dimension: 'Se' },
    { id: 8, text: '我喜欢边做边调整，而不是事先把所有步骤都想清楚。', dimension: 'Se' },
    { id: 9, text: '别人可能会觉得我在现场感、临场反应或动手能力上比较强。', dimension: 'Se' },
    { id: 10, text: '当生活过于单调、缺乏刺激时，我会明显感到无聊或不满足。', dimension: 'Se' },
    { id: 11, text: '我会自然地把当前经历与过去类似的经验进行比较。', dimension: 'Si' },
    { id: 12, text: '熟悉的流程、环境或做法，会让我更安心、更容易发挥。', dimension: 'Si' },
    { id: 13, text: '我对细节变化很敏感，常能发现"这次和以前不一样"。', dimension: 'Si' },
    { id: 14, text: '面对新事物时，我通常会先想：以前有没有类似情况可参考。', dimension: 'Si' },
    { id: 15, text: '我习惯保留对自己有用的经验，并在以后重复使用。', dimension: 'Si' },
    { id: 16, text: '我重视生活中的稳定、规律和可预期性。', dimension: 'Si' },
    { id: 17, text: '我常凭借记忆中的具体印象来判断一件事是否可靠。', dimension: 'Si' },
    { id: 18, text: '别人随意改变既定安排时，我往往会感到不适或被打乱。', dimension: 'Si' },
    { id: 19, text: '我倾向于一步一步地确认信息，而不是直接跳到结论。', dimension: 'Si' },
    { id: 20, text: '我通常认为，经过时间验证的方法比全新的做法更值得信赖。', dimension: 'Si' },
    { id: 21, text: '一个想法常常会让我联想到更多不同的可能性。', dimension: 'Ne' },
    { id: 22, text: '我喜欢从看似无关的事物之间发现新联系。', dimension: 'Ne' },
    { id: 23, text: '当别人提出问题时，我脑中常会一下子冒出很多种解法。', dimension: 'Ne' },
    { id: 24, text: '我对未知、变化和新奇的概念通常抱有好奇心。', dimension: 'Ne' },
    { id: 25, text: '我比起维持单一路线，更喜欢探索替代方案。', dimension: 'Ne' },
    { id: 26, text: '我容易被概念、隐喻、创意点子或脑洞式讨论激发灵感。', dimension: 'Ne' },
    { id: 27, text: '在对话中，我常会突然想到一个别人没提过的方向。', dimension: 'Ne' },
    { id: 28, text: '我喜欢让事情保持开放，不急着过早定论。', dimension: 'Ne' },
    { id: 29, text: '同一件事在我看来，往往不只有一种解释。', dimension: 'Ne' },
    { id: 30, text: '我经常因为想到新的可能性，而临时改变原本的计划。', dimension: 'Ne' },
    { id: 31, text: '我常会从纷杂的信息中突然形成一个整体性的判断。', dimension: 'Ni' },
    { id: 32, text: '很多时候，我先有一种"就是这样"的直觉，之后才说得清理由。', dimension: 'Ni' },
    { id: 33, text: '我倾向关注事情背后的模式、趋势或深层含义。', dimension: 'Ni' },
    { id: 34, text: '面对复杂局面时，我更想找出核心线索，而不是处理所有表面细节。', dimension: 'Ni' },
    { id: 35, text: '我常会思考一件事在更长时间尺度上会如何发展。', dimension: 'Ni' },
    { id: 36, text: '我会被象征、隐喻、主题或"隐藏信息"所吸引。', dimension: 'Ni' },
    { id: 37, text: '我倾向把零散现象收束成一个统一的理解框架。', dimension: 'Ni' },
    { id: 38, text: '别人可能觉得我看问题比较深，常能看到事情的另一层。', dimension: 'Ni' },
    { id: 39, text: '当方向感明确时，我可以长期围绕一个核心目标持续投入。', dimension: 'Ni' },
    { id: 40, text: '我更重视洞察是否抓住本质，而不是是否覆盖了所有可能。', dimension: 'Ni' },
    { id: 41, text: '我习惯先明确目标、标准和完成条件，再开始做事。', dimension: 'Te' },
    { id: 42, text: '我会自然地思考怎样安排资源，才能更高效地推进任务。', dimension: 'Te' },
    { id: 43, text: '我重视结果是否可衡量、可验证，而不只是"感觉不错"。', dimension: 'Te' },
    { id: 44, text: '发现流程低效时，我会想办法优化它。', dimension: 'Te' },
    { id: 45, text: '在团队中，我常会主动推动分工、排期或执行节奏。', dimension: 'Te' },
    { id: 46, text: '我倾向依据事实、数据或客观证据来判断方案优劣。', dimension: 'Te' },
    { id: 47, text: '如果讨论迟迟没有结论，我通常会想办法把它收束到可执行层面。', dimension: 'Te' },
    { id: 48, text: '我通常认为，一个好方案应该既清晰又能真正落地。', dimension: 'Te' },
    { id: 49, text: '我不太介意显得直接，只要这能提高效率或减少混乱。', dimension: 'Te' },
    { id: 50, text: '当别人表达含糊时，我会希望把要求、规则或标准说清楚。', dimension: 'Te' },
    { id: 51, text: '我喜欢先弄清一个概念的定义，再继续讨论。', dimension: 'Ti' },
    { id: 52, text: '面对问题时，我会先分析其中的结构与逻辑关系。', dimension: 'Ti' },
    { id: 53, text: '如果一个说法在逻辑上不一致，我很难直接接受它。', dimension: 'Ti' },
    { id: 54, text: '我经常会在心里把复杂问题拆成几个更基础的部分。', dimension: 'Ti' },
    { id: 55, text: '我倾向独立思考，直到自己真正想明白为止。', dimension: 'Ti' },
    { id: 56, text: '我关心的不只是结论对不对，还包括推理过程是否严密。', dimension: 'Ti' },
    { id: 57, text: '当别人用模糊、笼统的表达时，我会想进一步厘清其中的含义。', dimension: 'Ti' },
    { id: 58, text: '我喜欢建立一套自己能自洽解释问题的理论框架。', dimension: 'Ti' },
    { id: 59, text: '哪怕别人都同意，我也会继续检验一个观点是否真的说得通。', dimension: 'Ti' },
    { id: 60, text: '我常因追求更准确的理解，而在细节上反复推敲。', dimension: 'Ti' },
    { id: 61, text: '我会自然关注他人的情绪变化，以及现场氛围是否融洽。', dimension: 'Fe' },
    { id: 62, text: '在群体中，我常会根据场合调整自己的表达方式。', dimension: 'Fe' },
    { id: 63, text: '如果有人被冷落或尴尬，我通常会想办法缓和局面。', dimension: 'Fe' },
    { id: 64, text: '我重视别人是否感到被理解、被尊重、被妥善对待。', dimension: 'Fe' },
    { id: 65, text: '做决定时，我会考虑这会对关系和整体氛围产生什么影响。', dimension: 'Fe' },
    { id: 66, text: '我常能察觉别人没有说出口的情绪需求。', dimension: 'Fe' },
    { id: 67, text: '我愿意为了维持合作和谐，适度调整自己的做法。', dimension: 'Fe' },
    { id: 68, text: '当沟通出现冲突时，我通常会先寻找双方都能接受的表达。', dimension: 'Fe' },
    { id: 69, text: '我会在意自己的行为是否符合场合中的人际期待。', dimension: 'Fe' },
    { id: 70, text: '别人可能会觉得我在人际互动中比较体贴、会顾全大局。', dimension: 'Fe' },
    { id: 71, text: '我做决定时，很看重这是否真正符合自己的内心。', dimension: 'Fi' },
    { id: 72, text: '即使别人都认同，我也不会轻易违背自己的价值判断。', dimension: 'Fi' },
    { id: 73, text: '我对"真实"很敏感，不喜欢违心的表达或表演式互动。', dimension: 'Fi' },
    { id: 74, text: '我会认真分辨自己的感受，而不是只顺着外界期待行动。', dimension: 'Fi' },
    { id: 75, text: '我倾向尊重每个人独特的处境和个人选择。', dimension: 'Fi' },
    { id: 76, text: '当某件事触及我深层认同的价值时，我会非常坚定。', dimension: 'Fi' },
    { id: 77, text: '我通常不会轻易公开情绪，但内心体验其实很深。', dimension: 'Fi' },
    { id: 78, text: '我更在意一件事是否"对我来说是对的"，而不只是是否合群。', dimension: 'Fi' },
    { id: 79, text: '我会对不公、虚伪或违背原则的事情产生强烈反应。', dimension: 'Fi' },
    { id: 80, text: '我希望自己做出的选择，能够忠于真实的自我而非外在压力。', dimension: 'Fi' },
  ],
  score(answers) {
    const dimSums = {}
    this.dimensions.forEach(d => { dimSums[d.id] = { total: 0, count: 0 } })
    this.questions.forEach((q, i) => {
      const v = answers[i] ?? 3
      dimSums[q.dimension].total += v
      dimSums[q.dimension].count += 1
    })
    const sorted = this.dimensions.map(d => ({
      id: d.id, name: d.name, desc: d.desc,
      avg: dimSums[d.id].total / dimSums[d.id].count,
    })).sort((a, b) => b.avg - a.avg)
    return sorted[0].id
  },
  results: {},
}


// === Slider tests already done previously: ECR, HSP, ERQ ===

export const ecrTest = {
  id: 'ecr-36', axis: 'emotion', type: 'likert', hasIntro: true,
  intro: {
    titleEn: 'Attachment Style',
    titleCn: '成人依恋类型',
    code: 'ECR · Experiences in Close Relationships',
    quote: '"How do you love, and how do you let yourself be loved?"',
    quoteCn: '在亲密关系里，你是往前靠的那个，还是悄悄后退的那个？',
    time: 'Approx. 8-10 Minutes',
  },
  title: '成人依恋类型', titleEn: 'ECR · Attachment Style',
  subtitle: '你在关系里，习惯靠近还是保持距离？',
  itemCount: 36, duration: '约 8–12 分钟',
  scale: 7,
  scaleLabels: ['非常不同意', '不同意', '略不同意', '中立', '略同意', '同意', '非常同意'],
  instruction: '下面是一些关于恋爱关系中感受的描述。请根据你在恋爱关系中的一般体验来作答。',
  questions: [
    { id: 1, text: '总的来说，我不喜欢让恋人知道自己内心深处的感觉', text_en: "Generally, I prefer not to let my partner know how I truly feel deep down.", reverse: false },
    { id: 2, text: '我担心我会被抛弃', text_en: "I worry about being abandoned.", reverse: false },
    { id: 3, text: '我觉得跟恋人亲近是一件惬意的事情', text_en: "I find it comfortable to be close to my partner.", reverse: true },
    { id: 4, text: '我很担心我的恋爱关系', text_en: "I worry a lot about my romantic relationship.", reverse: false },
    { id: 5, text: '当恋人开始要跟我亲近时，我发现我自己在退缩', text_en: "When my partner starts getting close, I find myself pulling away.", reverse: false },
    { id: 6, text: '我担心恋人不会像我关心他/她那样地关心我', text_en: "I worry that my partner won't care about me as much as I care about them.", reverse: false },
    { id: 7, text: '当恋人希望跟我非常亲近时，我会觉得不自在', text_en: "I feel uneasy when my partner wants to be very close.", reverse: false },
    { id: 8, text: '我有点担心会失去恋人', text_en: "I'm somewhat worried about losing my partner.", reverse: false },
    { id: 9, text: '我觉得对恋人开诚布公，不是一件很舒服的事情', text_en: "Being completely open with my partner doesn't feel comfortable.", reverse: false },
    { id: 10, text: '我常常希望恋人对我的感情和我对恋人的感情一样强烈', text_en: "I often wish my partner's feelings for me were as strong as mine for them.", reverse: false },
    { id: 11, text: '我想与恋人亲近，但我又总是会退缩不前', text_en: "I want to get close to my partner, but I keep pulling back.", reverse: false },
    { id: 12, text: '我常常想与恋人形影不离，但有时这样会把恋人吓跑', text_en: "I often want to be inseparable from my partner, but sometimes that scares them away.", reverse: false },
    { id: 13, text: '当恋人跟我过分亲密的时候，我会感到内心紧张', text_en: "When my partner gets too intimate, I feel tense inside.", reverse: false },
    { id: 14, text: '我担心一个人独处', text_en: "I worry about being alone.", reverse: false },
    { id: 15, text: '我愿意把我内心的想法和感觉告诉恋人，我觉得这是一件自在的事情', text_en: "I'm comfortable sharing my inner thoughts and feelings with my partner.", reverse: true },
    { id: 16, text: '我想跟恋人非常亲密的愿望，有时会把恋人吓跑', text_en: "My desire for extreme closeness sometimes scares my partner away.", reverse: false },
    { id: 17, text: '我试图避免与恋人变得太亲近', text_en: "I try to avoid getting too close to my partner.", reverse: false },
    { id: 18, text: '我需要我的恋人一再地保证他/她是爱我的', text_en: "I need my partner to repeatedly reassure me that they love me.", reverse: false },
    { id: 19, text: '我觉得我比较容易与恋人亲近', text_en: "I find it relatively easy to get close to my partner.", reverse: true },
    { id: 20, text: '我觉得自己在要求恋人把更多的感觉，以及对恋爱关系的投入程度表现出来', text_en: "I feel like I'm always asking my partner to show more feelings and commitment.", reverse: false },
    { id: 21, text: '我发现让我依赖恋人，是一件困难的事情', text_en: "I find it hard to let myself depend on my partner.", reverse: false },
    { id: 22, text: '我并不是常常担心被恋人抛弃', text_en: "I don't often worry about being abandoned by my partner.", reverse: true },
    { id: 23, text: '我倾向于不跟恋人过分亲密', text_en: "I tend to avoid being overly close to my partner.", reverse: false },
    { id: 24, text: '如果我无法得到恋人的注意和关心，我会心烦意乱或者生气', text_en: "If I can't get my partner's attention and care, I get upset or angry.", reverse: false },
    { id: 25, text: '我跟恋人什么事情都讲', text_en: "I tell my partner everything.", reverse: true },
    { id: 26, text: '我发现恋人并不愿意像我所想的那样跟我亲近', text_en: "I find that my partner doesn't want to be as close as I'd like.", reverse: false },
    { id: 27, text: '我经常与恋人讨论我所遇到的问题以及我关心的事情', text_en: "I often discuss my problems and concerns with my partner.", reverse: true },
    { id: 28, text: '如果我还没有恋人的话，我会感到有点焦虑和不安', text_en: "When I'm not in a relationship, I feel somewhat anxious and uneasy.", reverse: false },
    { id: 29, text: '我觉得依赖恋人是很自在的事情', text_en: "I feel comfortable depending on my partner.", reverse: true },
    { id: 30, text: '如果恋人不能像我所希望的那样在我身边时，我会感到灰心丧气', text_en: "When my partner can't be with me as much as I'd like, I feel discouraged.", reverse: false },
    { id: 31, text: '我并不在意从恋人那里寻找安慰、听取劝告、得到帮助', text_en: "I don't mind turning to my partner for comfort, advice, and help.", reverse: true },
    { id: 32, text: '如果在我需要的时候，恋人却不在我身边，我会感到沮丧', text_en: "When I need my partner and they're not there, I feel frustrated.", reverse: false },
    { id: 33, text: '在需要的时候，我向恋人求助，是很有用的', text_en: "Reaching out to my partner for help when I need it works well.", reverse: true },
    { id: 34, text: '当恋人不赞同我时，我觉得确实是我不好', text_en: "When my partner disagrees with me, I feel like it's my fault.", reverse: false },
    { id: 35, text: '我会在很多事情上向恋人求助，包括寻求安慰和得到承诺', text_en: "I turn to my partner for many things, including comfort and reassurance.", reverse: true },
    { id: 36, text: '当恋人不花时间和我在一起时，我会感到怨恨', text_en: "When my partner doesn't spend time with me, I feel resentful.", reverse: false },
  ],
  computeScores(answers) {
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
    const av = calc(avoidanceItems)
    const ax = calc(anxietyItems)
    return [
      { label: '回避', pct: Math.round(((av - 1) / 6) * 100) },
      { label: '焦虑', pct: Math.round(((ax - 1) / 6) * 100) },
    ]
  },
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
    const av = calc(avoidanceItems)
    const ax = calc(anxietyItems)
    const scores = {
      secure:      av * 3.2893296 + ax * 5.4725318 - 11.5307833,
      fearful:     av * 7.2371075 + ax * 8.1776448 - 32.3553266,
      preoccupied: av * 3.9246754 + ax * 9.7102446 - 28.4573220,
      dismissing:  av * 7.3654621 + ax * 4.9392039 - 22.2281088,
    }
    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
  },
  results: {
    secure: {
      label: '安全型', emoji: '🌿',
      tagline: '你知道怎么爱，也知道怎么被爱',
      quote: '你在关系里很少处于戒备。别人靠近的时候，你能接住；别人需要距离的时候，你不会因此动摇。这种稳定不是运气，是真实发生过的事情慢慢累积出来的。',
      desc: '<p>在关系里，你有一种很少被打扰的安定。别人靠近的时候，你不会本能地后退；别人需要空间的时候，你也不会觉得那是一种遗弃。这种稳定感长在身体里，不需要反复确认。</p><p>你能说出自己的需要，也能听见对方的。这件事听起来简单，做到的人很少。情感在你这里有来有回，像呼吸一样自然——不用屏住，不用加速。</p><p>遇到摩擦的时候，你的第一反应很少是关门或者逃跑。你会有情绪，但通常能把情绪和事情分开来处理。吵完了，关系还在那里。</p><p>你对爱的信任不是盲目的乐观。你见过关系里的复杂，也经历过失望和修复。正因为这些经历没有摧毁你对连接的信心，这份信任才格外扎实。</p>',
    },
    fearful: {
      label: '恐惧型', emoji: '🌊',
      tagline: '你想靠近，但靠近本身让你害怕',
      quote: '你想要的和你害怕的，恰好是同一件事。靠近让你感到温暖，也让你感到危险。这两种感受都是真的，它们不矛盾，只是都需要被看见。',
      desc: '<p>你心里同时住着两种力量：一种拼命想靠近，一种拼命想逃开。它们同时存在，同时拉扯，让你在关系里常常感到一种深层的撕裂感。这两个需要都是真实的。</p><p>靠近一个人的时候，你能感受到温暖，也几乎同时感受到危险。亲密让你放松的那一刻，某种警报就会响起——好像太近了，好像要受伤了，好像应该退回去了。</p><p>你对被拒绝有很深的恐惧，但你害怕的不只是被拒绝。你也害怕被接受之后的脆弱，害怕打开自己之后发现那个人终究会走。所以你学会了一种特殊的距离感：看起来在，但没有完全交出自己。</p><p>你对爱的感受比大多数人都浓烈，也比大多数人都复杂。那些矛盾是你的情感系统在用它知道的唯一方式保护你。你值得一种不需要时刻自我保护的亲密。</p>',
    },
    preoccupied: {
      label: '专注型', emoji: '🔥',
      tagline: '你爱得很用力，有时用力到把人吓跑',
      quote: '你爱得很认真。认真到有时候忘了，你的感知力是一种能力，而不只是一种焦虑。那些停不下来的念头，是你对关系在意的证据，不是你的错。',
      desc: '<p>你爱一个人的时候，全部感官都会打开。对方的一个表情、一句语气的变化、一条消息的回复速度——你都能接收到信号。这种敏锐让你在关系里活得很用力，也很累。</p><p>内心深处有一个声音反复在问：我够好吗？你还在吗？你会留下来吗？你需要确认，需要回应，需要被看见的证据。</p><p>你给出爱的方式往往是加倍付出——更多的关心、更密的联系、更主动的靠近。你以为只要自己做得足够多，对方就不会离开。这个逻辑让你精疲力竭，但你很难停下来。</p><p>你对爱的渴望是真实的，你的投入也是真实的。那些焦虑的背后，藏着一颗极其认真对待关系的心。你需要学会的，是在没有回应的间隙里，依然相信自己值得被留下。</p>',
    },
    dismissing: {
      label: '冷漠型', emoji: '🧊',
      tagline: '你习惯靠自己，但其实你也想被接住',
      quote: '你习惯靠自己解决，包括情绪。这让你很可靠，但有时候也很重。你不是不需要别人——只是很久没有练习开口了。',
      desc: '<p>你习惯了靠自己。遇到问题的时候，第一反应是内部消化，而不是找人倾诉。这种独立是你真正信赖的生存方式，是你很早就学会的事情。</p><p>当关系变得太近、对方的需要变得太多，你会感到一种本能的压迫感。你需要空间，需要退后一步才能呼吸。这个退后的动作，常常被误读为冷漠。</p><p>情绪在你这里是被管理的。你很少让自己陷入强烈的情感波动，也很少让别人看到你脆弱的部分。你知道脆弱存在，但你不觉得展示它是安全的，或者有用的。</p><p>你内心的情感需求从来没有消失过，它们只是被放在了一个很深、很安静的地方。偶尔，在某个不设防的瞬间，你也能感觉到那些需求在那里，完好无损地等着你。</p>',
    },
  },
}

export const hspTest = {
  id: 'hsp-22', axis: 'emotion', type: 'likert', hasIntro: true,
  intro: {
    titleEn: 'High Sensitivity',
    titleCn: '高敏感度特质',
    code: 'HSP · Highly Sensitive Person Scale',
    quote: '"Do you feel things more deeply than others around you?"',
    quoteCn: '感受力有多细腻？探索你对世界的感知方式，理解敏感背后的天赋。',
    time: 'Approx. 3-5 Minutes',
  },
  title: '高敏感度特质', titleEn: 'HSP · High Sensitivity',
  subtitle: '探索你的感受力与环境敏感度',
  itemCount: 22, duration: '约 5–8 分钟',
  scale: 7,
  scaleLabels: ['完全不符合', '不符合', '略不符合', '中立', '略符合', '符合', '完全符合'],
  instruction: '请根据你平时的实际状态作答，不是你希望自己是什么样，而是你通常就是这样。',
  questions: [
    { id: 1, text: '我很容易注意到环境中细微的变化' },
    { id: 2, text: '别人的情绪会比较强烈地影响到我' },
    { id: 3, text: '我对疼痛比较敏感' },
    { id: 4, text: '在繁忙的一天后，我需要找一个安静的地方独处、恢复' },
    { id: 5, text: '我对咖啡因比较敏感' },
    { id: 6, text: '强光、强烈气味、粗糙布料或附近的嘈杂声会让我感到困扰' },
    { id: 7, text: '我有丰富而复杂的内心世界' },
    { id: 8, text: '我会被某些艺术、音乐或文学深深打动' },
    { id: 9, text: '当我需要同时处理很多事情时，会感到混乱和焦虑' },
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
  computeScores(answers) {
    const avg = (indices) => {
      const vals = indices.map(i => answers[i] ?? 4)
      return vals.reduce((s,v) => s+v, 0) / vals.length
    }
    return [
      { label: '感官敏感', pct: Math.round(((avg([0,2,4,5,15]) - 1) / 6) * 100) },
      { label: '情绪感染', pct: Math.round(((avg([1,11,14,19]) - 1) / 6) * 100) },
      { label: '美的感受', pct: Math.round(((avg([7,21]) - 1) / 6) * 100) },
      { label: '过度唤醒', pct: Math.round(((avg([3,8,9,10,12,16,17,18]) - 1) / 6) * 100) },
    ]
  },
  score(answers) {
    const mean = answers.reduce((s, v) => s + (v ?? 4), 0) / answers.length
    return mean >= 4.5 ? 'high' : mean >= 3.0 ? 'mid' : 'low'
  },
  results: {
    high: { label: '高敏感人格', emoji: '🌸', tagline: '你接收到的世界，比大多数人更密、更深', quote: '你接收到的本来就比别人多——那些多出来的部分，你一直在独自消化。', desc: '你比大多数人接收到更多。声音、光线、别人语气里微妙的变化、一个房间里没有人说出口的紧张感。你的神经系统像一台增益开得很大的收音机，信号和噪音一起进来。别人充电一小时能用一天，你可能需要整个下午才能缓过来。你感受世界的方式是昂贵的。' },
    mid:  { label: '中等感受力', emoji: '🌤', tagline: '你能感知细节，也保有不过载的弹性', quote: '你能被一首歌击中，也能在十分钟后继续过自己的日子。这种弹性，比你以为的更难得。', desc: '有些场景你会被深深触动，有些你可以自然滑过去。一首歌可能突然让你鼻酸，但十分钟后你已经忘了它在放什么。你能共情，但不至于被别人的情绪淹没。大多数时候你掌握着那个旋钮。' },
    low:  { label: '低敏感倾向', emoji: '🪨', tagline: '你和世界之间有一层让你稳定的缓冲', quote: '别人的情绪像浪，打过来的时候你已经站稳了。你的重心，比大多数人低一点。', desc: '你的情绪系统波动不大，不容易被外界突然扰动。别人可能已经被一件事搅得心神不宁了，你还保持着自己的步调。乱局里你往往是最清醒的那个。' },
  },
}

export const erqTest = {
  id: 'erq-10', axis: 'emotion', type: 'slider', hasIntro: true,
  intro: {
    titleEn: 'Emotion Regulation',
    titleCn: '情绪调节策略',
    code: 'ERQ · Emotion Regulation Questionnaire',
    quote: '"Do you think your way through pain, or quietly hold it inside?"',
    quoteCn: '难过时，你是换个角度想通，还是先把情绪压下去？',
    time: 'Approx. 3-5 Minutes',
  },
  title: '情绪调节策略', titleEn: 'ERQ · Emotion Regulation',
  subtitle: '压力来临时，你更常用哪种调节策略？',
  itemCount: 10, duration: '约 3–5 分钟',
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
  computeScores(answers) {
    const rItems = this.questions.filter(q => q.dimension === 'reappraisal').map(q => q.id - 1)
    const sItems = this.questions.filter(q => q.dimension === 'suppression').map(q => q.id - 1)
    const avg = (indices) => {
      const vals = indices.map(i => answers[i] ?? 4)
      return vals.reduce((s,v) => s+v, 0) / vals.length
    }
    return [
      { label: '认知重评', pct: Math.round(((avg(rItems) - 1) / 6) * 100) },
      { label: '表达抑制', pct: Math.round(((avg(sItems) - 1) / 6) * 100) },
    ]
  },
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
    high_reappraisal_low_suppression:  { label: '思考派', emoji: '💡', tagline: '你习惯换个角度看事情', quote: '你学会了用思维重新理解痛苦——不是逃开，而是换一个角度站稳。', desc: '遇到情绪风暴，你更倾向于在脑子里重新理解发生了什么——"也许不是我想的那样"，"从长远看没那么严重"。这是一种相对健康的应对方式，也意味着你不容易被情绪淹没。' },
    high_reappraisal_high_suppression: { label: '双管派', emoji: '⚡', tagline: '你用很多方式管理自己的情绪', quote: '你既能调整思路，也能管住表达——情绪在你这里从来不是随便流出来的。', desc: '你既会调整思维框架，也会管控情绪的外在表达。这双重策略有时有效，有时会让你感觉内外都在用力。不妨问问自己：有没有什么情绪，你不需要管它？' },
    low_reappraisal_high_suppression:  { label: '压下去派', emoji: '🔒', tagline: '你更习惯把情绪藏起来', quote: '你习惯先把情绪压住，但那些没说出口的，其实一直都在。', desc: '你处理情绪的方式，更多是不让它们流出来。这样做能保持表面平静，但情绪本身还在。长期来看，给它们找一个出口——无论是写、说、还是跑步——会让你轻松一些。' },
    low_reappraisal_low_suppression:   { label: '随流派', emoji: '🌀', tagline: '你不太主动调节情绪，让它自然流动', quote: '你不太管情绪，让它来，也让它走——有时候这是一种智慧，有时候只是还没找到出口。', desc: '你不太用力去管理情绪，更多是让它自己来、自己走。这有时是一种自然的韧性，有时也意味着情绪会在你身上停留更久。没有对错，只是了解自己的一个入口。' },
  },
}

// === Master collection + 4-axis structure ===

export const allTests = [
  cognitiveTest, cognitive80Test,
  hspTest, ecrTest, erqTest,
  fmpsTest, boundaryTest, roleTest, discTest,
]

export const testsById = Object.fromEntries(allTests.map(t => [t.id, t]))

export const axes = [
  {
    id: 'trait', num: '01', name: '特质轴', nameEn: 'Trait Axis',
    desc: '你的思维操作系统',
    tests: ['cognitive-48', 'cognitive-80'],
    placeholders: [],
  },
  {
    id: 'emotion', num: '02', name: '情绪轴', nameEn: 'Emotion Axis',
    desc: '你的情绪处理方式',
    tests: ['hsp-22', 'ecr-36', 'erq-10'],
    placeholders: [],
  },
  {
    id: 'behavior', num: '03', name: '行为轴', nameEn: 'Behavior Axis',
    desc: '你与世界的互动方式',
    tests: ['fmps-15', 'boundary-sense', 'relationship-role', 'disc'],
    placeholders: [],
  },
  {
    id: 'motivation', num: '04', name: '动机轴', nameEn: 'Motivation Axis',
    desc: '你为什么会成为现在的你',
    tests: [],
    placeholders: [
      { name: '九型人格', nameEn: 'Enneagram', desc: '你的核心驱动力与防御机制' },
      { name: '霍兰德职业兴趣', nameEn: 'Holland RIASEC', desc: '你内在的职业兴趣模式' },
    ],
  },
]
