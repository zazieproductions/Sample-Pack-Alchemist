// @ts-check
/**
 * product.js
 * ----------------------------------------------------------------------------
 * Product-copy generation.
 *
 * This module is the marketing arm of the alchemy pipeline. It is deliberately
 * string-only and deterministic apart from the random-concept bank in
 * config.js. It does not touch audio or the DOM.
 */

/**
 * Generate discounted-store copy from the actual uploaded file catalogue.
 * This is the "custom" generator the UI invokes when no curated preset is
 * selected.
 *
 * @param {{ category?: string }[]} files
 * @param {{ artistName: string, packName: string, defaultMood: string }} settings
 * @returns {{
 *   title: string,
 *   short: string,
 *   long: string,
 *   tags: string,
 *   license: string,
 *   credits: string,
 * }}
 */
export function generateCopyFromFiles(files, settings) {
  const categoryCounts = /** @type {Record<string, number>} */ ({});
  for (const file of files) {
    const category = file.category || 'Misc';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }
  const total = files.length;
  const artist = settings.artistName || 'Unknown';
  const pack = settings.packName || 'Sample Pack';
  const mood = settings.defaultMood || 'Dark';

  const sortedCats = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const categoryLine = sortedCats
    .filter(([category]) => category !== 'Misc')
    .map(([category, count]) => `${count} × ${category}`)
    .join(', ');

  const title = `${mood} ${pack}`;
  const short = `A curated collection of ${total} carefully crafted sounds — ${categoryLine || 'diverse audio assets'} — for ${mood.toLowerCase()} production, game audio, and sound design.`;
  const long = [
    `# ${title}`,
    '',
    `**${total} high-quality sounds** — ready for immediate use in your DAW, game engine, or video editor.`,
    '',
    "## What's inside",
    ...sortedCats.map(([category, count]) => `- **${count}** ${category}`),
    '',
    'All files are 24-bit WAV, royalty-free, and meticulously tagged for rapid workflow integration.',
    '',
    'Perfect for:',
    '- Music production (any genre)',
    '- Game audio & interactive design',
    '- Film & video post-production',
    '- Sound design & experimental art',
    '',
    `Created by ${artist}.`,
  ].join('\n');

  const tags = [...new Set([mood, pack, ...Object.keys(categoryCounts)])].join(', ');
  const license = 'Royalty-free license. You may use these sounds in commercial projects. You may not resell or redistribute the raw audio files. Credit appreciated but not required.';
  const credits = `Produced by ${artist}.\nThank you for supporting independent sound design.`;
  return { title, short, long, tags, license, credits };
}

/**
 * Generate copy from a random concept bank entry. This is a prompt, not AI:
 * a fixed set of evocative nouns with a fixed description shape.
 *
 * @param {string} concept
 */
export function generateCopyFromConcept(concept) {
  const short = `A haunting collection of ${concept.toLowerCase()} — crafted for producers and sound designers who work in the shadows.`;
  const long = `# ${concept}\n\nAn immersive set of carefully designed sound assets built for atmospheric production, game audio, and experimental composition.\n\nAll sounds are 24-bit WAV, royalty-free, and ready to use.\n\nCreated with attention to texture, depth, and emotional impact.`;
  const tags = `${concept.replace(/\s+/g, ', ').toLowerCase()}, sound design, atmospheric`;
  return { title: concept, short, long, tags };
}
