// @ts-check
/**
 * export.js
 * ----------------------------------------------------------------------------
 * ZIP assembly and metadata serialisation.
 *
 * The ZIP never leaves the browser. Every audio file is read through the
 * original `File` reference and placed in the archive with its (possibly
 * renamed) exported name. Metadata is generated at export time so stale
 * settings are never frozen into a release.
 */

import { groupByCategory } from './files.js';

/**
 * Build the five metadata text blobs that travel with a release.
 *
 * @param {Array<{ name: string, category?: string, duration?: number|null }>} files
 * @param {{
 *   productTitle?: string, artistName?: string, packName?: string,
 *   licenseTerms?: string, creditsText?: string, productShortDesc?: string,
 *   productLongDesc?: string, productTags?: string, priceRange?: string,
 * }} settings
 * @returns {Record<string, string>}
 */
export function buildMetadata(files, settings) {
  const title = settings.productTitle || 'Sample Pack';
  const artist = settings.artistName || 'Unknown';
  const pack = settings.packName || 'Sample Pack';
  const licenseSource =
    settings.licenseTerms ||
    'Royalty-free license. You may use these sounds in commercial projects. You may not resell or redistribute the raw audio files. Credit appreciated but not required.';
  const credits =
    settings.creditsText || `Produced by ${settings.artistName || 'Zazie'}\nThank you for your support.`;

  const readme = [
    `# ${title}`,
    '',
    `Artist: ${artist}`,
    `Pack: ${pack}`,
    `Files: ${files.length}`,
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    '---',
    '',
    'Thank you for downloading this sample pack.',
    'All sounds are royalty-free for use in your projects.',
    'Please see LICENSE.txt for full terms.',
    '',
    'For questions or custom requests, use the store listing contact link.',
  ].join('\n');

  const productDescription = [
    `Title: ${settings.productTitle || 'Untitled Sample Pack'}`,
    '',
    'Short Description:',
    settings.productShortDesc || '',
    '',
    'Full Description:',
    settings.productLongDesc || '',
    '',
    `Tags: ${settings.productTags || ''}`,
    '',
    `Suggested Price: ${settings.priceRange || '$7 – $15'}`,
  ].join('\n');

  const fileList = files
    .map((file) => {
      const duration = file.duration ? file.duration.toFixed(2) + 's' : '?';
      return `${file.category || 'Misc'}/${file.name}  (${duration})`;
    })
    .join('\n');

  return {
    'README.txt': readme,
    'LICENSE.txt': licenseSource,
    'CREDITS.txt': credits,
    'product-description.txt': productDescription,
    'file-list.txt': `Total: ${files.length} files\n\n${fileList}`,
  };
}

/**
 * Build the downloadable ZIP in memory.
 *
 * JSZip and saveAs are passed in as dependencies rather than accessed as
 * globals; this keeps the module unit-testable in Node while the real
 * controller passes globally loaded UMD libraries in the browser.
 *
 * @param {Array<{ name: string, category?: string, file: Blob }>} files
 * @param {Record<string, string>} metadata
 * @param {{ zip?: any, save?: (blob: Blob, filename: string) => void }} deps
 * @param {string} zipName
 * @returns {Promise<{ blob: Blob, filename: string, save: (blob: Blob, filename: string) => void }>}
 */
export async function buildZip(files, metadata, deps, zipName) {
  const zip = deps.zip || /** @type {any} */ (globalThis.JSZip);
  const save = deps.save || /** @type {(blob: Blob, filename: string) => void} */ (globalThis.saveAs);
  if (!zip || typeof zip !== 'function') throw new Error('JSZip is not available in this browser.');

  const archive = new zip();
  const groups = groupByCategory(files);
  for (const [category, items] of Object.entries(groups)) {
    const folder = archive.folder(category);
    for (const file of items) {
      const arrayBuffer = await file.file.arrayBuffer();
      folder.file(file.name, arrayBuffer);
    }
  }

  const meta = archive.folder('_metadata');
  for (const [name, text] of Object.entries(metadata)) {
    meta.file(name, text);
  }

  const blob = await archive.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const filename = typeof zipName === 'string' && zipName.length > 0 ? `${zipName}.zip` : 'Sample_Pack.zip';
  return { blob, filename, save };
}

/**
 * Build a filesystem-safe archive name from the brand + pack settings.
 *
 * @param {{ artistName?: string, packName?: string, [key: string]: unknown }} settings
 */
export function buildZipName(settings) {
  const artist = (settings.artistName || 'Artist').replace(/\s+/g, '_');
  const pack = (settings.packName || 'SamplePack').replace(/\s+/g, '_');
  return `${artist}_${pack}`;
}
