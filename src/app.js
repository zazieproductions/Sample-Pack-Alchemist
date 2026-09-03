// @ts-check
/**
 * app.js
 * ----------------------------------------------------------------------------
 * Controller / application boundary.
 *
 * The browser session is intentionally flat and stateful: this is an
 * instrument, not a web framework. It reads DOM, mutates one small state
 * object, re-renders the table + ZIP tree, and delegates algorithmic work to
 * the pure modules in `audio.js`, `files.js`, `product.js`, and `export.js`.
 *
 * No server, no network, no tracking: everything happens in the tab.
 */

import {
  AUDIO_EXTENSIONS,
  CATEGORIES,
  CONCEPTS,
  DEFAULT_SETTINGS,
  KEYWORD_MAP,
  PRESET_DATA,
  STORAGE_KEY,
} from './config.js';
import { analyzeAudioFile, extensionOf } from './audio.js';
import { buildRenamedName, groupByCategory, readSettings } from './files.js';
import { generateCopyFromConcept, generateCopyFromFiles } from './product.js';
import { buildMetadata, buildZip, buildZipName } from './export.js';

/**
 * @typedef {Object} SampleRecord
 * @property {number} id
 * @property {File} file
 * @property {string} name
 * @property {string} ext
 * @property {number} size
 * @property {number|null} duration
 * @property {number|null} loudness
 * @property {number|null} peak
 * @property {boolean|null} isLoop
 * @property {string} category
 * @property {string} bpm
 * @property {string} key
 * @property {boolean} analysisDone
 * @property {string} [mood]
 */

const $ = (/** @type {string} */ id) => document.getElementById(id);

/* Inline icons (stroke-based, currentColor) instead of emoji. This keeps the
 * interface glyph-stable across platforms and in headless screenshot runners
 * that have no color-emoji font installed. */
const svgIcon = (/** @type {string} */ paths, /** @type {number} */ size = 18) =>
  `<svg class="icon-svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const ICON_MUSIC = svgIcon('<path d="M9 18V5l10-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>', 16);
const ICON_FILE = svgIcon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>', 16);
const ICON_FOLDER = svgIcon('<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v6"/><path d="m9 14 3-3 3 3"/>', 16);
const ICON_DOWNLOAD = svgIcon('<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 19h14"/>', 18);

/** @type {Set<number>} */
const selected = new Set();

const state = {
  /** @type {SampleRecord[]} */
  files: [],
  selected,
  analyzing: false,
  nextId: 0,
};

/* ------------------------------------------------------------------ DOM refs */

const dropZone = /** @type {HTMLElement} */ ($('dropZone'));
const fileInput = /** @type {HTMLInputElement} */ ($('fileInput'));
const folderInput = /** @type {HTMLInputElement} */ ($('folderInput'));
const browseBtn = /** @type {HTMLElement} */ ($('browseBtn'));
const folderBtn = /** @type {HTMLElement} */ ($('folderBtn'));
const clearAllBtn = /** @type {HTMLElement} */ ($('clearAllBtn'));
const fileTableBody = /** @type {HTMLElement} */ ($('fileTableBody'));
const emptyTableMsg = /** @type {HTMLElement} */ ($('emptyTableMsg'));
const fileTableCount = /** @type {HTMLElement} */ ($('fileTableCount'));
const selectAllCheck = /** @type {HTMLInputElement} */ ($('selectAllCheck'));
const batchRenameBtn = /** @type {HTMLElement} */ ($('batchRenameBtn'));
const removeSelectedBtn = /** @type {HTMLElement} */ ($('removeSelectedBtn'));
const downloadZipBtn = /** @type {HTMLButtonElement} */ ($('downloadZipBtn'));
const randomConceptBtn = /** @type {HTMLElement} */ ($('randomConceptBtn'));
const generateProductBtn = /** @type {HTMLElement} */ ($('generateProductBtn'));
const zipPreview = /** @type {HTMLElement} */ ($('zipPreview'));
const zipFileCount = /** @type {HTMLElement} */ ($('zipFileCount'));
const uploadProgress = /** @type {HTMLElement} */ ($('uploadProgress'));
const progressFill = /** @type {HTMLElement} */ ($('progressFill'));
const progressLabel = /** @type {HTMLElement} */ ($('progressLabel'));
const progressPercent = /** @type {HTMLElement} */ ($('progressPercent'));
const toastContainer = /** @type {HTMLElement} */ ($('toastContainer'));

const controls = {
  artistName: /** @type {HTMLInputElement} */ ($('artistName')),
  packName: /** @type {HTMLInputElement} */ ($('packName')),
  defaultMood: /** @type {HTMLInputElement} */ ($('defaultMood')),
  defaultBpm: /** @type {HTMLInputElement} */ ($('defaultBpm')),
  defaultKey: /** @type {HTMLInputElement} */ ($('defaultKey')),
  namingFormat: /** @type {HTMLSelectElement} */ ($('namingFormat')),
  numberStart: /** @type {HTMLInputElement} */ ($('numberStart')),
  numberDigits: /** @type {HTMLSelectElement} */ ($('numberDigits')),
  presetStyle: /** @type {HTMLSelectElement} */ ($('presetStyle')),
  productTitle: /** @type {HTMLInputElement} */ ($('productTitle')),
  productTags: /** @type {HTMLInputElement} */ ($('productTags')),
  productShortDesc: /** @type {HTMLTextAreaElement} */ ($('productShortDesc')),
  productLongDesc: /** @type {HTMLTextAreaElement} */ ($('productLongDesc')),
  licenseTerms: /** @type {HTMLTextAreaElement} */ ($('licenseTerms')),
  creditsText: /** @type {HTMLTextAreaElement} */ ($('creditsText')),
  priceRange: /** @type {HTMLSelectElement} */ ($('priceRange')),
};

const fileCountBadge = /** @type {HTMLElement} */ ($('fileCountBadge'));
const statusBadge = /** @type {HTMLElement} */ ($('statusBadge'));

/**
 * @typedef {ReturnType<typeof readSettings>} SettingsSnapshot
 */

/* ------------------------------------------------------------- persistence */

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      applySettings(DEFAULT_SETTINGS);
      return;
    }
    const parsed = JSON.parse(saved);
    applySettings({ ...DEFAULT_SETTINGS, ...parsed });
  } catch (err) {
    console.warn('Could not restore saved settings.', err);
    applySettings(DEFAULT_SETTINGS);
  }
}

/**
 * @param {Record<string, unknown>} values
 */
function applySettings(values) {
  for (const [key, element] of Object.entries(controls)) {
    const value = values[key];
    if (value !== undefined && value !== null) {
      /** @type {HTMLInputElement | HTMLTextAreaElement} */
      (element).value = String(value);
    }
  }
}

function saveSettings() {
  try {
    const snapshot = readSettings(controls);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn('Could not persist settings.', err);
  }
}

for (const element of Array.from(document.querySelectorAll('input, textarea, select'))) {
  element.addEventListener('change', saveSettings);
  element.addEventListener('blur', saveSettings);
}

/* ------------------------------------------------------------------- toast */

/**
 * @param {string} message
 * @param {'success' | 'error' | 'info'} [type]
 * @param {number} [duration]
 */
function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  window.setTimeout(() => toast.remove(), duration);
}

/* ------------------------------------------------------------- file intake */

/**
 * Filter and register audio files. Exact records are kept so the ZIP export
 * can read the original bytes; the analysis pass happens asynchronously.
 * @param {FileList | File[]} fileList
 */
function handleFiles(fileList) {
  const incoming = Array.from(fileList);
  const audioFiles = incoming.filter((file) => AUDIO_EXTENSIONS.includes(extensionOf(file.name)));
  if (audioFiles.length === 0) {
    showToast('No audio files found (WAV, AIFF, FLAC, MP3).', 'error');
    return;
  }
  for (const file of audioFiles) {
    const id = state.nextId++;
    /** @type {SampleRecord} */
    const record = {
      id,
      file,
      name: file.name,
      ext: extensionOf(file.name),
      size: file.size,
      duration: null,
      loudness: null,
      peak: null,
      isLoop: null,
      category: 'Misc',
      bpm: '',
      key: '',
      analysisDone: false,
      mood: '',
    };
    state.files.push(record);
    state.selected.add(id);
  }
  renderTable();
  renderZipPreview();
  updateCounts();
  saveSettings();
  analyzeFiles();
  showToast(`Added ${audioFiles.length} file(s). Analysing...`, 'success');
}

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragover');
  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    handleFiles(event.dataTransfer.files);
  }
});
dropZone.addEventListener('click', () => fileInput.click());
browseBtn.addEventListener('click', () => fileInput.click());
folderBtn.addEventListener('click', () => folderInput.click());

fileInput.addEventListener('change', () => {
  if (fileInput.files && fileInput.files.length > 0) {
    handleFiles(fileInput.files);
    fileInput.value = '';
  }
});
folderInput.addEventListener('change', () => {
  if (folderInput.files && folderInput.files.length > 0) {
    handleFiles(folderInput.files);
    folderInput.value = '';
  }
});

clearAllBtn.addEventListener('click', () => {
  if (state.files.length === 0) return;
  if (!window.confirm('Remove all files and reset?')) return;
  state.files.length = 0;
  state.selected.clear();
  state.nextId = 0;
  renderTable();
  updateCounts();
  renderZipPreview();
  showToast('Cleared all files.', 'info');
});

/* ----------------------------------------------------------- audio analysis */

const audioContext = new AudioContext();

/**
 * Decode each pending file, measure a few facts, and stamp the record.
 * The context is created once. No audio is played — decoding only.
 */
async function analyzeFiles() {
  const pending = state.files.filter((file) => !file.analysisDone);
  if (pending.length === 0) return;

  state.analyzing = true;
  statusBadge.textContent = 'analyzing...';
  uploadProgress.classList.remove('hidden');
  let completed = 0;
  const total = pending.length;
  const settings = readSettings(controls);
  const options = {
    keywordMap: KEYWORD_MAP,
    fallbackBpm: settings.defaultBpm,
    fallbackKey: settings.defaultKey,
  };

  for (const record of pending) {
    try {
      const metrics = await analyzeAudioFile(record.file, audioContext, options);
      record.duration = metrics.duration;
      record.loudness = metrics.loudness;
      record.peak = metrics.peak;
      record.isLoop = metrics.isLoop;
      record.category = metrics.category;
      record.bpm = metrics.bpm;
      record.key = metrics.key;
    } catch (err) {
      console.warn('Analysis failed for', record.name, err);
      record.duration = null;
      record.loudness = null;
      record.peak = null;
      record.isLoop = null;
      record.analysisDone = true;
    }
    record.analysisDone = true;
    completed += 1;
    const percent = Math.round((completed / total) * 100);
    progressFill.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    progressLabel.textContent = `Analyzing ${completed}/${total} ...`;
    await new Promise((resolve) => window.setTimeout(resolve, 10));
  }

  uploadProgress.classList.add('hidden');
  state.analyzing = false;
  statusBadge.textContent = 'ready';
  renderTable();
  renderZipPreview();
  updateCounts();
  showToast(`Analysis complete for ${completed} file(s).`, 'success');
}

/* --------------------------------------------------------------- rendering */

function renderTable() {
  if (state.files.length === 0) {
    fileTableBody.innerHTML = '';
    emptyTableMsg.style.display = 'block';
    selectAllCheck.checked = false;
    return;
  }
  emptyTableMsg.style.display = 'none';

  fileTableBody.innerHTML = state.files
    .map((record) => {
      const checked = state.selected.has(record.id) ? 'checked' : '';
      const duration = record.duration !== null ? `${record.duration.toFixed(2)}s` : '…';
      const loudness = record.loudness !== null ? `${record.loudness} dB` : '…';
      const loopBadge =
        record.isLoop === true
          ? '<span class="badge badge-gold">loop</span>'
          : record.isLoop === false
            ? '<span class="badge">one-shot</span>'
            : '<span class="badge">…</span>';
      const categoryOptions = CATEGORIES.map(
        (category) =>
          `<option value="${category}" ${record.category === category ? 'selected' : ''}>${category}</option>`,
      ).join('');
      return `
        <tr data-id="${record.id}">
          <td><input type="checkbox" class="file-check" data-id="${record.id}" ${checked} /></td>
          <td>
            <div class="file-name" title="${escapeHtml(record.name)}">${escapeHtml(record.name)}</div>
            <div class="text-xs text-muted">${loopBadge} ${record.bpm ? `${escapeHtml(record.bpm)} BPM` : ''} ${record.key ? escapeHtml(record.key) : ''}</div>
          </td>
          <td class="hide-on-mobile">${duration}</td>
          <td class="hide-on-mobile"><span class="badge">${record.ext.toUpperCase()}</span></td>
          <td class="hide-on-mobile">${loudness}</td>
          <td>
            <select class="category-select text-xs" data-id="${record.id}">
              ${categoryOptions}
            </select>
          </td>
          <td>
            <button class="btn btn-danger btn-xs remove-file" data-id="${record.id}" title="Remove">${svgIcon('<path d="M18 6 6 18M6 6l12 12"/>', 14)}</button>
          </td>
        </tr>
      `;
    })
    .join('');

  bindTableEvents();
  updateSelectAll();
}

/**
 * Minimal escaping for filenames and user-supplied strings that get rendered
 * into the table. The app intentionally avoids innerHTML for dynamic fields
 * as much as possible, but this table is one place where template markup is
 * the clearest readable structure.
 * @param {string} value
 */
function escapeHtml(value) {
  /** @type {Record<string, string>} */
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return value.replace(/[&<>"']/g, (char) => map[char]);
}

function bindTableEvents() {
  fileTableBody.querySelectorAll('.file-check').forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const id = Number(/** @type {HTMLInputElement} */ (event.target).dataset.id);
      if (/** @type {HTMLInputElement} */ (event.target).checked) state.selected.add(id);
      else state.selected.delete(id);
      updateSelectAll();
    });
  });

  fileTableBody.querySelectorAll('.category-select').forEach((select) => {
    select.addEventListener('change', (event) => {
      const id = Number(/** @type {HTMLSelectElement} */ (event.target).dataset.id);
      const record = state.files.find((item) => item.id === id);
      if (record) {
        record.category = /** @type {HTMLSelectElement} */ (event.target).value;
        renderZipPreview();
        saveSettings();
      }
    });
  });

  fileTableBody.querySelectorAll('.remove-file').forEach((button) => {
    button.addEventListener('click', (event) => {
      const id = Number(/** @type {HTMLElement} */ (event.target).dataset.id);
      removeFileById(id);
    });
  });
}

/**
 * @param {number} id
 */
function removeFileById(id) {
  const index = state.files.findIndex((record) => record.id === id);
  if (index === -1) return;
  state.files.splice(index, 1);
  state.selected.delete(id);
  renderTable();
  updateCounts();
  renderZipPreview();
}

function updateSelectAll() {
  const checks = fileTableBody.querySelectorAll('.file-check');
  const checked = fileTableBody.querySelectorAll('.file-check:checked');
  selectAllCheck.checked = checks.length > 0 && checks.length === checked.length;
}

selectAllCheck.addEventListener('change', (event) => {
  const checked = /** @type {HTMLInputElement} */ (event.target).checked;
  fileTableBody.querySelectorAll('.file-check').forEach((checkbox) => {
    const box = /** @type {HTMLInputElement} */ (checkbox);
    box.checked = checked;
    const id = Number(box.dataset.id);
    if (checked) state.selected.add(id);
    else state.selected.delete(id);
  });
});

removeSelectedBtn.addEventListener('click', () => {
  const toRemove = state.files.filter((record) => state.selected.has(record.id));
  if (toRemove.length === 0) {
    showToast('No files selected.', 'info');
    return;
  }
  if (!window.confirm(`Remove ${toRemove.length} selected file(s)?`)) return;
  const ids = new Set(toRemove.map((record) => record.id));
  state.files = state.files.filter((record) => !ids.has(record.id));
  for (const id of ids) state.selected.delete(id);
  renderTable();
  updateCounts();
  renderZipPreview();
  showToast(`Removed ${toRemove.length} file(s).`, 'info');
});

function updateCounts() {
  const count = state.files.length;
  fileCountBadge.textContent = `${count} files`;
  fileTableCount.textContent = String(count);
  zipFileCount.textContent = `${count} files`;
}

/* ----------------------------------------------------------- batch rename */

batchRenameBtn.addEventListener('click', () => {
  if (state.files.length === 0) {
    showToast('No files to rename.', 'info');
    return;
  }
  const settings = readSettings(controls);
  let counter = settings.numberStart;
  for (const record of state.files) {
    const values = {
      '{Artist}': settings.artistName || 'Unknown',
      '{PackName}': settings.packName || 'Pack',
      '{Category}': record.category || 'Misc',
      '{Key}': record.key || settings.defaultKey || 'Am',
      '{Mood}': record.mood || settings.defaultMood || 'Dark',
      '{BPM}': record.bpm || settings.defaultBpm || '90',
    };
    record.name = buildRenamedName(settings.namingFormat, values, counter, settings.numberDigits, record.ext);
    counter += 1;
  }
  renderTable();
  renderZipPreview();
  showToast(`Renamed ${state.files.length} file(s).`, 'success');
  saveSettings();
});

/* ------------------------------------------------------- product generator */

/**
 * @param {string} preset
 */
function fillPreset(preset) {
  /** @type {Record<string, { title: string; short: string; long: string; tags: string; license: string; credits: string }>} */
  const presets = PRESET_DATA;
  const data = presets[preset];
  if (!data) return false;
  controls.productTitle.value = data.title || preset;
  controls.productShortDesc.value = data.short || '';
  controls.productLongDesc.value = data.long || '';
  controls.productTags.value = data.tags || '';
  controls.licenseTerms.value = data.license || 'Royalty-free. No redistribution of raw files.';
  controls.creditsText.value = data.credits || `Produced by ${controls.artistName.value || 'Zazie'}`;
  return true;
}

generateProductBtn.addEventListener('click', () => {
  const preset = controls.presetStyle.value;
  if (preset && fillPreset(preset)) {
    showToast(`Loaded preset: ${preset}`, 'success');
  } else {
    const settings = readSettings(controls);
    const copy = generateCopyFromFiles(state.files, settings);
    controls.productTitle.value = copy.title;
    controls.productShortDesc.value = copy.short;
    controls.productLongDesc.value = copy.long;
    controls.productTags.value = copy.tags;
    controls.licenseTerms.value = copy.license;
    controls.creditsText.value = copy.credits;
    showToast('Generated product copy from your files.', 'success');
  }
  saveSettings();
});

controls.presetStyle.addEventListener('change', () => {
  if (fillPreset(controls.presetStyle.value)) saveSettings();
});

randomConceptBtn.addEventListener('click', () => {
  const concept = CONCEPTS[Math.floor(Math.random() * CONCEPTS.length)];
  const copy = generateCopyFromConcept(concept);
  controls.productTitle.value = copy.title;
  controls.productShortDesc.value = copy.short;
  controls.productLongDesc.value = copy.long;
  controls.productTags.value = copy.tags;
  showToast(`Random concept: ${concept}`, 'info');
  saveSettings();
});

/* ------------------------------------------------------------- ZIP preview */

function renderZipPreview() {
  if (state.files.length === 0) {
    zipPreview.innerHTML = '<div class="text-muted text-xs italic">No files to preview yet.</div>';
    return;
  }
  const groups = groupByCategory(state.files);
  const sortedCategories = Object.keys(groups).sort();
  let html = '';
  let fileCount = 0;
  for (const category of sortedCategories) {
    const items = groups[category];
    fileCount += items.length;
    html += `<div class="tree-item tree-depth-0"><span class="icon icon-folder">${ICON_FOLDER}</span><span class="text-soft font-medium">${escapeHtml(category)}/</span> <span class="text-muted text-xs">(${items.length})</span></div>`;
    for (const record of items) {
      html += `<div class="tree-item tree-depth-1"><span class="icon icon-file">${ICON_MUSIC}</span>${escapeHtml(record.name)}</div>`;
    }
  }
  html += `<div class="tree-item tree-depth-0 mt-2"><span class="icon icon-folder">${ICON_FILE}</span><span class="text-soft font-medium">_metadata/</span></div>`;
  for (const name of ['README.txt', 'LICENSE.txt', 'CREDITS.txt', 'product-description.txt', 'file-list.txt']) {
    html += `<div class="tree-item tree-depth-1"><span class="icon icon-file">${ICON_FILE}</span>${escapeHtml(name)}</div>`;
  }
  zipPreview.innerHTML = html;
  zipFileCount.textContent = `${fileCount} files + metadata`;
}

/* --------------------------------------------------------------- ZIP export */

downloadZipBtn.addEventListener('click', async () => {
  if (state.files.length === 0) {
    showToast('No files to export. Upload some audio first!', 'error');
    return;
  }
  if (state.analyzing) {
    showToast('Please wait, analysis still in progress...', 'info');
    return;
  }

  const button = downloadZipBtn;
  button.disabled = true;
  button.innerHTML = '<span class="spinner"></span> Building ZIP...';
  statusBadge.textContent = 'exporting...';

  try {
    const settings = readSettings(controls);
    const metadata = buildMetadata(state.files, settings);
    const zipName = buildZipName(settings);
    const result = await buildZip(state.files, metadata, { zip: globalThis.JSZip }, zipName);
    result.save(result.blob, result.filename);
    showToast(`ZIP exported: ${result.filename} (${Math.round(result.blob.size / 1024)} KB)`, 'success');
  } catch (err) {
    console.error('ZIP error:', err);
    showToast(`ZIP export failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
  }

  button.disabled = false;
  button.innerHTML = `${ICON_DOWNLOAD} Download ZIP`;
  statusBadge.textContent = 'ready';
});

/* ------------------------------------------------------------------- init */

loadSettings();
renderTable();
updateCounts();
renderZipPreview();
showToast('Sample Pack Alchemist ready. Upload your audio to begin.', 'info', 3000);

console.log('Sample Pack Alchemist initialized');
console.log(`${state.files.length} files loaded`);

/* Observation hook used by automated smoke tests and the screenshot script.
 * It exposes read-only metrics, never internals the UI depends on. */
globalThis.__SPA__ = {
  get ready() {
    return true;
  },
  get fileCount() {
    return state.files.length;
  },
  get analyzing() {
    return state.analyzing;
  },
  fileNames() {
    return state.files.map((record) => record.name);
  },
};
