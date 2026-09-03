import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRenamedName, groupByCategory, safeSegment } from '../src/files.js';

test('groupByCategory buckets records and defaults unknown to Misc', () => {
  const groups = groupByCategory([
    { name: 'a.wav', category: 'Drums' },
    { name: 'b.wav', category: 'Drums' },
    { name: 'c.wav' },
  ]);
  assert.equal(groups.Drums.length, 2);
  assert.equal(groups.Misc.length, 1);
});

test('safeSegment strips illegal characters and collapses separators', () => {
  assert.equal(safeSegment('Dark  Metal__Bass  '), 'Dark_Metal_Bass');
  assert.equal(safeSegment('  loop::090  '), 'loop_090');
});

test('buildRenamedName interpolates tokens and pads numbers', () => {
  const values = {
    '{Artist}': 'Zazie',
    '{PackName}': 'HorrorTextures',
    '{Category}': 'Loops',
    '{Key}': 'Am',
    '{Mood}': 'Dark',
    '{BPM}': '90',
  };
  const out = buildRenamedName(
    '{Artist}_{PackName}_{Category}_{Key}_{Mood}_{BPM}_{Num}',
    values,
    1,
    3,
    'wav',
  );
  assert.equal(out, 'Zazie_HorrorTextures_Loops_Am_Dark_90_001.wav');
});

test('buildRenamedName omits unmatched tokens and prevents double dots', () => {
  const out = buildRenamedName('{Artist}_{Unknown}_{Num}', { '{Artist}': 'Z', '{Unknown}': '' }, 2, 2, 'wav');
  assert.equal(out, 'Z_02.wav');
});
