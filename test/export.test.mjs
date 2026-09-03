import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMetadata, buildZip, buildZipName } from '../src/export.js';

test('buildMetadata emits the five release text files', () => {
  const metadata = buildMetadata(
    [
      { name: 'kick.wav', category: 'Drums', duration: 0.5 },
      { name: 'pad.wav', category: 'Textures', duration: null },
    ],
    {
      productTitle: 'Night Signals',
      artistName: 'Zazie',
      packName: 'Nocturne',
      licenseTerms: 'Custom license.',
      creditsText: 'Thanks.',
      productShortDesc: 'Short.',
      productLongDesc: 'Long.',
      productTags: 'dark, ambient',
      priceRange: '$7 – $15',
    },
  );
  assert.ok(metadata['README.txt'].includes('# Night Signals'));
  assert.ok(metadata['LICENSE.txt'].includes('Custom license.'));
  assert.ok(metadata['file-list.txt'].includes('Drums/kick.wav'));
  assert.ok(metadata['product-description.txt'].includes('$7 – $15'));
});

test('buildZipName makes a safe archive stem', () => {
  assert.equal(buildZipName({ artistName: 'Zazie Audio', packName: 'Dark Pack' }), 'Zazie_Audio_Dark_Pack');
});

test('buildZip arranges folders and metadata', async () => {
  const files = [
    { name: 'a.wav', category: 'Drums', file: new Blob([new Uint8Array([1, 2, 3])]) },
    { name: 'b.wav', category: 'Bass', file: new Blob([new Uint8Array([4, 5, 6])]) },
  ];
  const metadata = { 'README.txt': '# Test' };

  let savedName = '';
  let savedBlob = null;
  const result = await buildZip(files, metadata, {
    zip: (await import('jszip')).default,
    save: (blob, name) => {
      savedBlob = blob;
      savedName = name;
    },
  }, 'Test_Pack');

  assert.equal(result.filename, 'Test_Pack.zip');
  assert.ok(result.blob.size > 0);
  result.save(result.blob, result.filename);
  assert.equal(savedName, 'Test_Pack.zip');
  assert.ok(savedBlob.size > 0);

  // Decompress once to confirm structure.
  const zip = new (await import('jszip')).default();
  await zip.loadAsync(await result.blob.arrayBuffer());
  assert.ok(zip.folder('Drums'));
  assert.ok(zip.folder('Bass'));
  assert.ok(zip.folder('_metadata'));
});
