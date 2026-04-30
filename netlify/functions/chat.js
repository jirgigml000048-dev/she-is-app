const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { results = {}, messages = [] } = JSON.parse(event.body);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Build results context (mirrors narrative.js)
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

  const systemPrompt = `你是一个深刻理解人类心理的朋友，正在和这位女孩进行关于她的测评结果的深度对话。

她的测评数据：
${dataLines.join('\n') || '（暂无测评数据）'}

对话规则：
- 每次回复100-200字以内，中文
- 温柔但清醒，有洞见但不说教
- 可以追问、反问，帮她更深入地看见自己
- 不要每次都重复数据，聚焦在她说的话上
- 把测评结果作为背景，不是主角`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 400,
    system: systemPrompt,
    messages
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply: message.content[0].text })
  };
};
