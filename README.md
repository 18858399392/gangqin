# NOCTURNE · 夜曲

A responsive, buildless 3D music room with piano and acoustic guitar modes. Serve `dist/` through any static web server.

- Six locally bundled piano scores and twenty Salamander Grand Piano samples.
- Web Audio sample scheduling, reverb, volume, seek, shuffle, repeat and continuous playback.
- A procedurally modeled 88-key grand piano, physical lacquer materials, studio reflections, soft shadows, orbit interaction and three camera views.
- Day/night themes, immersive mode, local favorites, landscape phone and desktop layouts.
- Acoustic guitar with procedural spruce grain, soundhole, fretboard, tuners, six animated strings, thirteen bundled acoustic recordings, and playable C/Am/F/G/D/Em chord shapes. Tap a string, strum, or use keys 1–6.
- Switching instruments preserves the selected song and position. Guitar scores are folded into E2–E5 range, limited to six simultaneous pitches, and slightly staggered for a plucked arrangement.

First audible playback requires a user gesture when the browser blocks autoplay. Fonts have system fallbacks. Music, samples and Three.js are bundled locally.

Music provenance is linked in the site's About dialog. The 樱花草 piano score was transcribed from the EOP two-page arrangement. The Salamander samples by Alexander Holm are used under CC BY 3.0; their audio was not modified. Three.js is MIT licensed (license header retained).

Acoustic guitar recordings: University of Iowa, edited and distributed by Nicholas Brosowsky in [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments) under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). The redistributed MP3 files are unchanged; browser playback transposes the nearest recording when necessary.

Validation: JavaScript syntax, asset/data validation, and a DOM/Web Audio mock integration harness covering playback, song navigation, seeking, favorites, filters, theme, immersion, mute, shuffle/repeat and completion. No connected browser was available for device-level WebGL rendering and real audio output verification.
