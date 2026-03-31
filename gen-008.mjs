import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { writeFileSync, readFileSync } from 'fs';

const client = new ElevenLabsClient({ apiKey: '053c37e750221105f244d43341724178758b1d60b40796aebeb2360ffe36153d' });
const text = readFileSync('/tmp/text-008.txt', 'utf-8');
console.log('Text length:', text.length);

const audio = await client.textToSpeech.convert('pU9NaAwkoR3v0Mrg3uKz', {
  text,
  modelId: 'eleven_multilingual_v2',
  outputFormat: 'mp3_44100_128',
  voiceSettings: { stability: 0.5, similarityBoost: 0.75 }
});

const chunks = [];
for await (const chunk of audio) chunks.push(chunk);
const buffer = Buffer.concat(chunks);
writeFileSync('assets/audio/story-008.mp3', buffer);
console.log('Done:', buffer.length, 'bytes');
