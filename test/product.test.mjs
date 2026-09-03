import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCopyFromConcept, generateCopyFromFiles } from '../src/product.js';

test('generateCopyFromFiles describes the real catalogue', () => {
  const files = [
    { category: 'Bass' },
    { category: 'Bass' },
    { category: 'Loops' },
    { category: 'Misc' },
  ];
  const copy = generateCopyFromFiles(files, {
    artistName: 'Zazie',
    packName: 'Nocturne',
    defaultMood: 'Dark',
  });
  assert.match(copy.title, /^Dark Nocturne$/);
  assert.match(copy.short, /4 carefully crafted sounds/);
  assert.match(copy.long, /- \*\*2\*\* Bass/);
  assert.match(copy.tags, /Bass/);
  assert.match(copy.credits, /Produced by Zazie/);
});

test('generateCopyFromConcept uses the concept bank as a title prompt', () => {
  const copy = generateCopyFromConcept('Bio-Mechanical Textures');
  assert.equal(copy.title, 'Bio-Mechanical Textures');
  assert.match(copy.short, /haunting collection of bio-mechanical textures/);
  assert.match(copy.tags, /atmospheric/);
});
