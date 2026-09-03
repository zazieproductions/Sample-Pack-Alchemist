// @ts-check
/**
 * audio.js
 * ----------------------------------------------------------------------------
 * Decoding + signal-measurement + filename inference.
 *
 * This is the "ears" of the tool. Nothing here writes to the DOM; it turns a
 * browser File into an object of measurable facts (duration, RMS loudness,
 * peak) and a small set of probabilistic guesses (category / BPM / key) based
 * on filename conventions. The guesses are intentionally cheap and documented
 * as heuristics — no ML, no invented transcription.
 */

/**
 * @param {string} filename
 * @returns {string} lowercased extension without the dot
 */
export function extensionOf(filename) {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot + 1).toLowerCase();
}

/**
 * Category inference is a keyword scan over the cleaned stem.
 * The map lives in config.js because it is part of the tool's vocabulary.
 * @param {string} filename
 * @param {Record<string, string>} keywordMap
 * @returns {string}
 */
export function guessCategory(filename, keywordMap) {
  const stem = filename.toLowerCase().replace(/\.[^.]+$/, '');
  for (const [keyword, category] of Object.entries(keywordMap)) {
    if (stem.includes(keyword)) return category;
  }
  return 'Misc';
}

/**
 * Pull a BPM from a filename when one is embedded, else fall back to the
 * user default. Patterns understood: `_90_`, `-90-`, `90bpm`.
 * @param {string} filename
 * @param {string} fallback
 * @returns {string}
 */
export function guessBpm(filename, fallback) {
  const explicit = filename.match(/(\d{2,3})\s*[bB][pP][mM]/);
  if (explicit) return explicit[1];
  // Accept delimited BPMs whether they sit in the middle (`_140_`), at the end
  // of the stem (`-140`), or before an extension (`130bpm` handled above).
  const delimiter = filename.match(/[_-](\d{2,3})(?:[_\-. ]|$)/);
  if (delimiter) {
    const value = Number(delimiter[1]);
    if (value >= 60 && value <= 200) return delimiter[1];
  }
  return fallback || '90';
}

/**
 * Pull a musical key from a filename (e.g. `Am`, `F#`, `C major`).
 * @param {string} filename
 * @param {string} fallback
 * @returns {string}
 */
export function guessKey(filename, fallback) {
  const match = filename.match(/\b([A-G][#b]?m?)\b/);
  if (match && /^[A-G][#b]?(m|min|major)?$/i.test(match[1])) {
    return match[1];
  }
  return fallback || 'Am';
}

/**
 * Duration drives the loop/one-shot/texture classifier. This is the least
 * scientific part of the system — real loop detection would use onset
 * analysis, which the browser does not expose without extra libraries.
 * @param {number} duration
 * @param {string} category
 */
export function classifyByDuration(duration, category) {
  if (duration < 2) {
    return { isLoop: false, category: category === 'Misc' ? 'One-Shots' : category };
  }
  if (duration < 8) {
    return { isLoop: true, category: category === 'Misc' ? 'Loops' : category };
  }
  return { isLoop: true, category: category === 'Misc' ? 'Textures' : category };
}

/**
 * One-pass measurement of the first channel. Generous with very quiet files:
 * dB is clamped at -60 so the table renders instead of showing -Infinity.
 *
 * @param {Float32Array} channel
 * @returns {{ loudnessDb: number, peakDb: number }}
 */
export function measureChannel(channel) {
  let sumSquares = 0;
  let peak = 0;
  for (let i = 0; i < channel.length; i += 1) {
    const sample = channel[i];
    sumSquares += sample * sample;
    const abs = Math.abs(sample);
    if (abs > peak) peak = abs;
  }
  const rms = Math.sqrt(sumSquares / Math.max(channel.length, 1));
  const loudnessDb = 20 * Math.log10(rms + 1e-10);
  const peakDb = 20 * Math.log10(peak + 1e-10);
  return {
    loudnessDb: Math.max(-60, Math.round(loudnessDb)),
    peakDb: Math.max(-60, Math.round(peakDb)),
  };
}

/**
 * Decode + measure one audio File.
 *
 * The AudioContext is pushed through from the controller so we only ever own
 * one decoder context for the whole session (browsers cap contexts, and some
 * mobile browsers have an autoplay-based creation policy).
 *
 * @param {File} file
 * @param {AudioContext} context
 * @param {{ keywordMap: Record<string,string>, fallbackBpm: string, fallbackKey: string }} options
 * @returns {Promise<{duration: number, loudness: number, peak: number, isLoop: boolean, category: string, bpm: string, key: string}>}
 */
export async function analyzeAudioFile(file, context, options) {
  /** @type {{ keywordMap: Record<string,string>, fallbackBpm: string, fallbackKey: string }} */
  const opts = options;
  const arrayBuffer = await file.arrayBuffer();
  // slice: decodeAudioData detaches buffers in some browsers; copy before handoff
  const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));
  const duration = audioBuffer.duration;
  const channel = audioBuffer.getChannelData(0);
  const { loudnessDb, peakDb } = measureChannel(channel);
  const namedCategory = guessCategory(file.name, opts.keywordMap);
  const { isLoop, category } = classifyByDuration(duration, namedCategory);
  return {
    duration,
    loudness: loudnessDb,
    peak: peakDb,
    isLoop,
    category,
    bpm: guessBpm(file.name, opts.fallbackBpm),
    key: guessKey(file.name, opts.fallbackKey),
  };
}
