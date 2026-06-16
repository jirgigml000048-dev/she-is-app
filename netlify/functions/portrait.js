const Anthropic = require('@anthropic-ai/sdk');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let completedResults;
  try {
    ({ completedResults } = JSON.parse(event.body));
  } catch (e) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!Array.isArray(completedResults) || completedResults.length < 2) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Need at least 2 results' }) };
  }

  const resultLines = completedResults.map(r =>
    `- ${r.axisName} · ${r.testTitle}：${r.resultLabel}（${(r.scores || []).join('，')}）`
  ).join('\n');

  const prompt = `你是「她也」App的内在洞察师。用户完成了以下心理测评：

${resultLines}

请写一段200-300字的个性化内在画像。要求：
1. 找到这些测评结果之间的交叉联系（比如依恋风格如何影响情绪调节策略）
2. 不要逐条列举，要综合叙述
3. 语气直觉性、非临床，犀利、冷峻、共情，参考风格韩江、伍尔夫
4. 中文，第二人称"你"，不要加任何标题或前缀`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  });

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ text: message.content[0].text }),
  };
};
