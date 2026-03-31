import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { writeFileSync } from 'fs';

const client = new ElevenLabsClient({ apiKey: '053c37e750221105f244d43341724178758b1d60b40796aebeb2360ffe36153d' });

const audio = await client.textToSpeech.convert('pU9NaAwkoR3v0Mrg3uKz', {
  text: '你好，这是一段测试。每个人都需要一个痛苦的剂量，这是小舟说的话。她从广西出发，一路读博，来到北京，开始了一个人的生活。',
  modelId: 'eleven_multilingual_v2',
  outputFormat: 'mp3_44100_128',
  voiceSettings: { stability: 0.5, similarityBoost: 0.75 }
});

const chunks = [];
for await (const chunk of audio) chunks.push(chunk);
const buffer = Buffer.concat(chunks);
writeFileSync('/Users/gigi/.openclaw/workspace/shared/she-is-app/assets/audio/voice-test-new.mp3', buffer);
console.log('Done:', buffer.length, 'bytes');
