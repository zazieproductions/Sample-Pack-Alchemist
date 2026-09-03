// @ts-check
/**
 * generate-fixtures.mjs
 * ----------------------------------------------------------------------------
 * Writes small WAV fixtures used by the screenshot script and by anyone who
 * wants to try the tool offline. The tones are intentionally crude: pure sine
 * and gentle noise so the measurements (duration / RMS / peak / loop flag)
 * produce readable, non-random results.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'test-fixtures');

/**
 * @param {string} filename
 * @param {number} durationSeconds
 * @param {number} frequency
 * @param {number} amplitude
 */
function makeWav(filename, durationSeconds, frequency, amplitude) {
  const sampleRate = 44100;
  const frames = Math.round(durationSeconds * sampleRate);
  const channelCount = 1;
  const bytesPerSample = 2;
  const dataSize = frames * channelCount * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(channelCount, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channelCount * bytesPerSample, 28);
  buffer.writeUInt16LE(channelCount * bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < frames; i += 1) {
    const t = i / sampleRate;
    const envelope = 0.65 + 0.35 * Math.sin((2 * Math.PI * i) / frames);
    const value = Math.max(-1, Math.min(1, amplitude * envelope * Math.sin(2 * Math.PI * frequency * t)));
    const sample = Math.round(value * 32767);
    buffer.writeInt16LE(sample, offset);
    offset += 2;
  }

  return buffer;
}

await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, 'drone_loop_Am_90.wav'), makeWav('drone_loop_Am_90.wav', 10, 55, 0.55));
await writeFile(join(outDir, 'bass_pulse_130bpm.wav'), makeWav('bass_pulse_130bpm.wav', 4, 220, 0.7));
await writeFile(join(outDir, 'kick_impact_one-shot.wav'), makeWav('kick_impact_one-shot.wav', 0.8, 90, 0.9));

console.log('Wrote WAV fixtures to', outDir);
