// @ts-check
/**
 * files.js
 * ----------------------------------------------------------------------------
 * Pure file-list transforms: grouping, folder naming, and the batch-rename
 * template engine. No DOM access, no state mutation — the controller decides
 * when to apply these to an array of records.
 */

/**
 * @template T
 * @param {Array<{ category?: string } & T>} files
 * @returns {Record<string, Array<{ category?: string } & T>>}
 */
export function groupByCategory(files) {
  /** @type {Record<string, Array<{ category?: string } & T>>} */
  const groups = {};
  for (const file of files) {
    const category = file.category || 'Misc';
    if (!groups[category]) groups[category] = [];
    groups[category].push(file);
  }
  return groups;
}

/**
 * Convert a segment of a generated filename into a filesystem-safe token.
 * The final assembled filename uses underscores as the only glue, matching
 * how sample packs are commonly shipped.
 * @param {string} segment
 * @returns {string}
 */
export function safeSegment(segment) {
  return segment
    .replace(/[^\w-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_');
}

/**
 * Apply a naming format template to one record.
 *
 * Templates are deliberately simple (`{Placeholder}`). A regex-based replace
 * is fine here because the vocabulary is closed and user controlled; if the
 * vocabulary grew, this would move to a tokenizer + parser.
 *
 * @param {string} format
 * @param {Record<string, string>} values
 * @param {number} counter
 * @param {number} digits
 * @param {string} extension
 * @returns {string}
 */
export function buildRenamedName(format, values, counter, digits, extension) {
  const number = String(counter).padStart(digits, '0');
  const tokens = { ...values, '{Num}': number };
  const stem = Object.entries(tokens).reduce(
    (name, [token, value]) => name.replace(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value || ''),
    format,
  );
  const cleanStem = safeSegment(stem).replace(/\.{2,}/g, '.');
  return `${cleanStem}.${extension}`;
}

/**
 * Read the current settings from a form and give the controller a single
 * immutable snapshot. The function is intentionally left dumb.
 *
 * @param {Record<string, { value: string }>} elements
 */
export function readSettings(elements) {
  /** @param {string} name */
  const read = (name) => (elements[name] ? elements[name].value : '');
  return {
    artistName: read('artistName'),
    packName: read('packName'),
    defaultMood: read('defaultMood'),
    defaultBpm: read('defaultBpm'),
    defaultKey: read('defaultKey'),
    namingFormat: read('namingFormat'),
    numberStart: Number(read('numberStart')) || 1,
    numberDigits: Number(read('numberDigits')) || 3,
    presetStyle: read('presetStyle'),
    priceRange: read('priceRange'),
    productTitle: read('productTitle'),
    productTags: read('productTags'),
    productShortDesc: read('productShortDesc'),
    productLongDesc: read('productLongDesc'),
    licenseTerms: read('licenseTerms'),
    creditsText: read('creditsText'),
  };
}
