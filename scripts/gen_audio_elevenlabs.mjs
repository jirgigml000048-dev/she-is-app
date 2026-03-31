import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { writeFileSync, readFileSync } from 'fs';

const client = new ElevenLabsClient({ apiKey: '053c37e750221105f244d43341724178758b1d60b40796aebeb2360ffe36153d' });
const VOICE_ID = 'DowyQ68vDpgFYdWVGjc3';

async function generate(textFile, outFile) {
  const text = readFileSync(textFile, 'utf-8');
  console.log(`Generating ${outFile} (${text.length} chars)...`);
  const audio = await client.textToSpeech.convert(VOICE_ID, {
    text,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
    voiceSettings: { stability: 0.5, similarityBoost: 0.75 }
  });
  const chunks = [];
  for await (const chunk of audio) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);
  writeFileSync(outFile, buffer);
  console.log(`Done: ${outFile} (${buffer.length} bytes)`);
}

await generate('/tmp/text-008.txt', 'assets/audio/story-008.mp3');
await generate('/tmp/text-009.txt', 'assets/audio/story-009.mp3');
