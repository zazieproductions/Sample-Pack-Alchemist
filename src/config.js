// @ts-check
/**
 * config.js
 * ----------------------------------------------------------------------------
 * Static configuration for Sample Pack Alchemist.
 *
 * These values are not "user settings"; they are the domain vocabulary and the
 * procedural heuristics that let loose audio become a catalogued sample pack.
 * Keeping them in one module makes the inference rules auditable and testable
 * without reading through the controller code.
 */

/** Extensions the pipeline accepts. Kept intentionally strict — the analysis
 * and ZIP export paths rely on browser-decoded audio. */
export const AUDIO_EXTENSIONS = ['wav', 'aiff', 'aif', 'flac', 'mp3'];

/** Canonical sample-pack folder taxonomy. */
export const CATEGORIES = [
  'Drums',
  'Loops',
  'One-Shots',
  'Bass',
  'Synths',
  'Textures',
  'Ambiences',
  'Foley',
  'Risers',
  'Impacts',
  'Vocals',
  'FX',
  'Misc',
];

/**
 * Filename keyword -> category map.
 * Order matters: the first matching keyword wins, so the map is written from
 * most specific labels to broad residue words.
 */
export const KEYWORD_MAP = {
  // Drums
  kick: 'Drums',
  snare: 'Drums',
  hihat: 'Drums',
  hat: 'Drums',
  clap: 'Drums',
  tom: 'Drums',
  perc: 'Drums',
  percussion: 'Drums',
  cymbal: 'Drums',
  crash: 'Drums',
  ride: 'Drums',
  drum: 'Drums',
  // Loops
  loop: 'Loops',
  groove: 'Loops',
  beat: 'Loops',
  rhythm: 'Loops',
  pattern: 'Loops',
  // Bass
  bass: 'Bass',
  sub: 'Bass',
  '808': 'Bass',
  lowend: 'Bass',
  // Synths
  synth: 'Synths',
  pad: 'Synths',
  lead: 'Synths',
  chord: 'Synths',
  arp: 'Synths',
  melody: 'Synths',
  // Textures
  texture: 'Textures',
  drone: 'Textures',
  noise: 'Textures',
  hiss: 'Textures',
  rumble: 'Textures',
  // Ambiences
  ambience: 'Ambiences',
  ambient: 'Ambiences',
  atmo: 'Ambiences',
  atmosphere: 'Ambiences',
  room: 'Ambiences',
  space: 'Ambiences',
  // Foley
  foley: 'Foley',
  rustle: 'Foley',
  footstep: 'Foley',
  step: 'Foley',
  door: 'Foley',
  creak: 'Foley',
  cloth: 'Foley',
  paper: 'Foley',
  // Risers
  riser: 'Risers',
  rise: 'Risers',
  build: 'Risers',
  buildup: 'Risers',
  sweep: 'Risers',
  whoosh: 'Risers',
  ascent: 'Risers',
  // Impacts
  impact: 'Impacts',
  hit: 'Impacts',
  strike: 'Impacts',
  slam: 'Impacts',
  bang: 'Impacts',
  boom: 'Impacts',
  // Vocals
  vocal: 'Vocals',
  voice: 'Vocals',
  ahh: 'Vocals',
  ohh: 'Vocals',
  eh: 'Vocals',
  chant: 'Vocals',
  whisper: 'Vocals',
  scream: 'Vocals',
  // FX
  fx: 'FX',
  effect: 'FX',
  glitch: 'FX',
  stutter: 'FX',
  transition: 'FX',
  reverse: 'FX',
  scan: 'FX',
};

/** Default values shown on first visit. The artist default is Zazie because
 * this tool is the packaging arm of Zazie Productions, not a generic utility. */
export const DEFAULT_SETTINGS = {
  artistName: 'Zazie',
  packName: 'HorrorTextures',
  defaultMood: 'Dark',
  defaultBpm: '90',
  defaultKey: 'Am',
  namingFormat: '{Artist}_{PackName}_{Category}_{Key}_{Mood}_{BPM}_{Num}',
  numberStart: 1,
  numberDigits: 3,
  presetStyle: '',
  priceRange: '$7 – $15',
  productTitle: '',
  productTags: '',
  productShortDesc: '',
  productLongDesc: '',
  licenseTerms: '',
  creditsText: '',
};

/** Where settings are persisted. */
export const STORAGE_KEY = 'spa_settings';

/** Curated product-copy presets. These are the tool's fictional catalogue —
 * every string is crafted copy for a hypothetical release, which is exactly
 * why they are data rather than code. */
export const PRESET_DATA = {
  'Psychological Horror Toolkit': {
    title: 'Psychological Horror Toolkit',
    short: 'A curated set of haunted textures, brittle foley fragments, unstable drones, and cinematic tension materials for psychological horror, experimental film, and dark ambient production.',
    long: 'Delve into the unsettling with the Psychological Horror Toolkit — a handcrafted collection of 40+ eerie sound assets designed to provoke unease, dread, and psychological tension.\n\nCarefully sourced from field recordings, analog degradation, and modular synthesis, this pack delivers:\n\n• 14 dark ambient drones & textures\n• 9 brittle foley & found sounds\n• 8 tension risers & stingers\n• 6 impact hits & sub booms\n• 5 haunting vocal fragments\n• 2 bonus loopable atmospheres\n\nPerfect for horror game audio, arthouse film, podcast scoring, and experimental music. All files are 24-bit WAV, royalty-free, and meticulously tagged for rapid workflow integration.',
    tags: 'horror, psychological, dark ambient, foley, tension, game audio, film scoring, drones, impacts, risers',
    license: 'Royalty-free license. You may use these sounds in commercial projects, games, films, and music. You may not resell or redistribute the raw audio files. Credit appreciated but not required.',
    credits: 'Pack curated and produced by Zazie.\nField recordings by Zazie & collaborators.\nModular synthesis and processing by Zazie.\nSpecial thanks to the dark ambient community.',
  },
  'Industrial Noise Pack': {
    title: 'Industrial Noise Pack',
    short: 'Harsh metallic clashes, grinding machinery, distorted drones, and aggressive percussive elements for industrial music, sound design, and game audio.',
    long: 'Heavy machinery, crumbling infrastructure, and raw aggression — the Industrial Noise Pack delivers 35+ gritty, high-impact sounds for producers and sound designers working in industrial, EBM, and noise genres.\n\nIncludes:\n• 12 metallic impacts & slams\n• 8 grinding drone loops\n• 6 percussive hits & bursts\n• 5 distorted risers\n• 4 atmospheric noise beds\n\nAll sounds are 24-bit WAV, 44.1kHz, royalty-free.',
    tags: 'industrial, noise, metallic, grinding, distortion, EBM, sound design, heavy',
    license: 'Royalty-free. Commercial use allowed. No redistribution of raw files. Credit optional.',
    credits: 'Produced by Zazie Industrial Works.\nField recordings captured at decommissioned factories.',
  },
  'Haunted Foley Pack': {
    title: 'Haunted Foley Pack',
    short: 'Ghostly creaks, disembodied whispers, rattling chains, and spectral footsteps — authentic haunted house foley for horror media.',
    long: 'Step into the abandoned manor with the Haunted Foley Pack — 30 meticulously recorded foley sounds capturing the essence of supernatural dread.\n\nEvery sound was performed and captured using vintage props, wooden structures, and analog processing to achieve an authentic, timeless quality.\n\nContents:\n• 8 creaking doors & floorboards\n• 6 ghostly whispers & breath\n• 5 rattling chains & metal\n• 4 footsteps on various surfaces\n• 4 eerie cloth & fabric movements\n• 3 unexplained ambiences\n\n24-bit WAV, 48kHz, fully loopable for game implementation.',
    tags: 'haunted, foley, horror, ghost, creak, whisper, footsteps, ambience, game audio',
    license: 'Royalty-free for commercial projects. No resale of raw samples. Attribution appreciated.',
    credits: 'Foley performance and recording by Zazie.\nLocation: The Old Mill Studio.',
  },
  'Dark Ambient Textures': {
    title: 'Dark Ambient Textures',
    short: 'Deep evolving drones, subterranean rumbles, ethereal pads, and cinematic noise beds for dark ambient, drone, and experimental composition.',
    long: 'Immerse yourself in shadow and depth. Dark Ambient Textures is a collection of 25 expansive, evolving soundscapes crafted for composers, sound healers, and experimental artists.\n\nEach texture is a journey — from sub-bass rumbles to shimmering harmonic clouds.\n\nIncludes:\n• 10 long-form drone textures (2-8 min)\n• 6 evolving pad swells\n• 5 granular noise beds\n• 4 subterranean rumble loops\n\n24-bit WAV, 44.1kHz, royalty-free.',
    tags: 'dark ambient, drone, texture, pad, rumble, cinematic, experimental, soundscape',
    license: 'Royalty-free. May be used in commercial music, film, and games. No raw redistribution.',
    credits: 'Created by Zazie using modular synths, granular processing, and field recordings.',
  },
  'Lo-Fi Tape Loops': {
    title: 'Lo-Fi Tape Loops',
    short: 'Warm, saturated tape loops with vinyl crackle, analog drift, and nostalgic charm for lo-fi hip-hop, chillwave, and ambient pop.',
    long: 'Embrace imperfection. Lo-Fi Tape Loops delivers 20 lovingly degraded tape loops recorded from vintage cassette machines and reel-to-reel units.\n\nEach loop carries the warmth of analog saturation, the flutter of worn tape, and the gentle crackle of age.\n\nPerfect for:\n• Lo-fi hip-hop beats\n• Chillwave & vaporwave\n• Ambient & downtempo\n• Film & game nostalgia scenes\n\nAll loops are 24-bit WAV, royalty-free, with BPM and key info embedded.',
    tags: 'lo-fi, tape, loop, warm, crackle, analog, hip-hop, chillwave, nostalgic',
    license: 'Royalty-free. Use in your music freely. Do not redistribute raw loops. Thank you!',
    credits: 'Recorded and processed by Zazie.\nHardware: TASCAM 414, Sony TC-377, various found cassettes.',
  },
  'Cinematic Impacts and Risers': {
    title: 'Cinematic Impacts and Risers',
    short: 'Massive trailer impacts, tension-building risers, and explosive hit points for cinematic sound design and trailer music.',
    long: 'Epic scale, intense energy. Cinematic Impacts and Risers is a powerhouse collection of 40+ sounds designed for trailer music, cinematic score, and game audio.\n\nFrom earth-shaking sub hits to soaring orchestral risers, every sound is mixed and mastered for immediate impact.\n\nIncludes:\n• 12 massive impacts (sub + layered)\n• 10 tension risers (short & long)\n• 8 explosive hit points\n• 6 orchestral stabs\n• 4 transition sweeps\n• 2 bonus braaams\n\n24-bit WAV, 96kHz, royalty-free.',
    tags: 'cinematic, impact, riser, trailer, braaam, orchestral, epic, sound design',
    license: 'Royalty-free for media production. No resale of raw samples. Credit: Zazie.',
    credits: 'Designed by Zazie using hybrid orchestral processing and sound design.',
  },
  'Experimental Percussion': {
    title: 'Experimental Percussion',
    short: 'Unconventional percussion sounds from found objects, prepared instruments, and digital synthesis — for avant-garde and experimental music.',
    long: 'Break the rhythm mold. Experimental Percussion is a collection of 35+ unique percussive sounds crafted from everyday objects, prepared pianos, and modular chaos.\n\nIncludes:\n• 8 found object strikes (glass, metal, wood, plastic)\n• 6 prepared piano plucks & mallets\n• 5 granular percussion hits\n• 4 glitchy digital bursts\n• 4 loopable rhythmic patterns\n• 8 bonus one-shots\n\n24-bit WAV, 44.1kHz, royalty-free. Ideal for experimental, IDM, and contemporary composition.',
    tags: 'experimental, percussion, found sound, glitch, IDM, avant-garde, prepared piano',
    license: 'Royalty-free. Use freely in your art. No raw redistribution. Appreciate you!',
    credits: 'Conceived and performed by Zazie.\nObjects sourced from Junkyard Studio.',
  },
  'Found Sound Library': {
    title: 'Found Sound Library',
    short: 'A diverse collection of everyday sounds turned into musical and sound design assets — from kitchen clatter to urban atmospheres.',
    long: 'The world is an instrument. Found Sound Library captures 50+ everyday sounds and transforms them into usable production assets.\n\nEach sound is cleaned, edited, and categorised for instant musical or sound design use.\n\nCategories:\n• Kitchen & household (10)\n• Urban & street (8)\n• Nature & water (8)\n• Tools & machinery (6)\n• Paper & cloth (6)\n• Metals & glass (6)\n• Bonus: melodic found sounds (6)\n\n24-bit WAV, 48kHz, royalty-free.',
    tags: 'found sound, foley, field recording, urban, nature, household, sound design',
    license: 'Royalty-free. Commercial use OK. No resale of raw recordings. Share your art!',
    credits: 'Recorded on location by Zazie.\nGear: Zoom H6, Contact microphones, binaural rig.',
  },
  'Game Audio Horror Kit': {
    title: 'Game Audio Horror Kit',
    short: 'A complete horror game audio toolbox: monster vocals, environmental dread, jump scares, and interactive stingers.',
    long: 'Everything you need to terrify players. The Game Audio Horror Kit is purpose-built for indie and AAA horror game development.\n\nDesigned for interactive implementation with multiple variations, loops, and layering options.\n\nIncludes:\n• 8 monster vocalisations & growls\n• 6 jump scare stingers\n• 6 creepy ambience loops\n• 5 footstep sets (wood, metal, gravel, water, flesh)\n• 4 impact & hit reactions\n• 3 heartbeat & tension loops\n• 3 door & interaction sounds\n\n24-bit WAV, 48kHz, with metadata for Wwise and FMOD integration.',
    tags: 'game audio, horror, monster, ambience, stinger, footstep, interactive, Wwise, FMOD',
    license: 'Royalty-free for game development. No redistribution of raw assets. Credit appreciated.',
    credits: 'Game audio design by Zazie.\nVocal processing and sound design by Zazie Studio.',
  },
  'Trailer Sound Design Pack': {
    title: 'Trailer Sound Design Pack',
    short: 'Hollywood-caliber trailer sounds: cinematic impacts, soaring risers, sub drops, and tension builders for your next trailer.',
    long: 'Make every second count. Trailer Sound Design Pack delivers 45+ professional trailer sounds used by working sound designers.\n\nFrom the deepest sub drops to the most intricate tension textures — this pack has everything you need to craft compelling trailer audio.\n\nIncludes:\n• 12 cinematic impacts (layered, sub-heavy)\n• 10 tension risers (5 short, 5 long)\n• 8 sub drops & booms\n• 6 orchestral hits\n• 4 transition whooshes\n• 3 braaam variations\n• 2 bonus loopable tension beds\n\n24-bit WAV, 96kHz, royalty-free. Ready for immediate use in your DAW or video editor.',
    tags: 'trailer, cinematic, impact, riser, sub drop, braaam, orchestral, Hollywood, sound design',
    license: 'Royalty-free for commercial media production. No raw resale. Credit: Zazie.',
    credits: 'Sound design by Zazie.\nInspired by the great trailer houses.',
  },
};

/** The "random concept" bank. Kept small on purpose: randomness is a prompt,
 * not a feature. It feeds the title/copy generator, never the audio. */
export const CONCEPTS = [
  'Abandoned Cathedral Drones',
  'Neon Cyberpunk Foley',
  'Subterranean Pulse Loops',
  'Witch House Ritual Kit',
  'Bio-Mechanical Textures',
  'Ghost Radio Frequencies',
  'Obsidian Impact Suite',
  'Crystal Cave Ambiences',
  'Dystopian Cityscape',
  'Analog Horror Toolkit',
  'Nocturnal Field Recordings',
  'Rust & Glass Percussion',
  'Vaporwave Dream Loops',
  'Funeral Choir Textures',
  'Industrial Heartbeat',
];
