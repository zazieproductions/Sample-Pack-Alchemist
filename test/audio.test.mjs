import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyByDuration,
  extensionOf,
  guessBpm,
  guessCategory,
  guessKey,
  measureChannel,
} from '../src/audio.js';

const MAP = {
  kick: 'Drums',
  loop: 'Loops',
  bass: 'Bass',
  drone: 'Textures',
};

test('extensionOf is case insensitive', () => {
  assert.equal(extensionOf('kick.WAV'), 'wav');
  assert.equal(extensionOf('drop.Aiff'), 'aiff');
  assert.equal(extensionOf('nofile'), '');
});

test('guessCategory scans filename keywords', () => {
  assert.equal(guessCategory('sub_kick_01.wav', MAP), 'Drums');
  assert.equal(guessCategory('dark_bass_loop.wav', MAP), 'Loops');
  assert.equal(guessCategory('nonsense_file.wav', MAP), 'Misc');
});

test('guessBpm reads explicit and delimited BPM, falls back', () => {
  assert.equal(guessBpm('beat_90bpm.wav', '90'), '90');
  assert.equal(guessBpm('beat-140.wav', '90'), '140');
  assert.equal(guessBpm('beat_999.wav', '90'), '90'); // out of musical range
  assert.equal(guessBpm('unnamed.wav', '120'), '120');
});

test('guessKey parses key names without creating false matches', () => {
  assert.equal(guessKey('dark_am_loop.wav', 'Am'), 'Am');
  assert.equal(guessKey('beat.wav', 'C'), 'C');
});

test('classifyByDuration groups by duration heuristic', () => {
  assert.deepEqual(classifyByDuration(1, 'Misc'), { isLoop: false, category: 'One-Shots' });
  assert.deepEqual(classifyByDuration(5, 'Misc'), { isLoop: true, category: 'Loops' });
  assert.deepEqual(classifyByDuration(12, 'Misc'), { isLoop: true, category: 'Textures' });
  // explicit category wins over duration guess
  assert.deepEqual(classifyByDuration(5, 'Drums'), { isLoop: true, category: 'Drums' });
});

test('measureChannel computes RMS and peak_dB', () => {
  const track = new Float32Array([0.5, -0.5, 0.0]);
  const metrics = measureChannel(track);
  assert.ok(metrics.loudnessDb < 0);
  assert.equal(metrics.peakDb, -6);
});
