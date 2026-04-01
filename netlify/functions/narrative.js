const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { results } = JSON.parse(event.body);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // 构建用户数据摘要
  const dataLines = [];
  if (results.cognitive) dataLines.push(`认知类型: ${results.cognitive.summary}`);
  if (results['cognitive-48']) dataLines.push(`认知类型: ${results['cognitive-48'].summary}`);
  if (results.hsp) dataLines.push(`高敏感得分: ${results.hsp.score?.total ?? results.hsp.score}，结论: ${results.hsp.summary}`);
  if (results.erq) dataLines.push(`情绪调节策略: ${results.erq.summary}`);
  if (results.ecr) dataLines.push(`依恋类型: ${results.ecr.topDimension}，${results.ecr.summary}`);
  if (results.fmps) {
    const s = results.fmps.score;
    const total = typeof s === 'object' ? Object.values(s).reduce((a, b) => a + b, 0) : s;
    dataLines.push(`完美主义倾向总分: ${total}，结论: ${results.fmps.summary}`);
  }
  if (results['boundary-sense']) {
    const s = results['boundary-sense'].score;
    const total = typeof s === 'object' ? (s.total ?? Object.values(s).reduce((a, b) => a + b, 0)) : s;
    dataLines.push(`边界感得分: ${total}，结论: ${results['boundary-sense'].summary}`);
  }

  const userDataSummary = dataLines.join('\n');

  const systemPrompt = `你是一个深刻理解人类心理的写作者，同时也是这个人的老朋友。
你正在为她写一段「交叉解读」——把她做过的多个心理测评的结果融合起来，说出只有了解她的人才能说出来的那句话。

写作要求：
- 400字以内，中文
- 不是报告，不是分析，是"你终于被看见了"的那种感觉
- 语气：温柔但不滥情，清醒但不冷漠，像一个真正懂你的人在说你
- 结构：不要分点列举，要像2-3段有呼吸感的散文，段落之间留出空间（用换行分隔）
- 要写出维度之间真正的张力和共鸣，不是把每个维度单独描述一遍
- 不要说"根据你的测评结果"这种话，直接说这个人是什么样的
- 最后一句要留有余地，不要总结性收尾，而是把她推向下一个可能`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 600,
    system: systemPrompt,
    messages: [{ role: 'user', content: `以下是她的测评数据：\n${userDataSummary}\n\n请写这段交叉解读。` }]
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ narrative: message.content[0].text })
  };
};
