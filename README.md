# NOCTURNE · 夜曲

A responsive, buildless 3D piano room. Serve `dist/` through any static web server.

- Six locally bundled piano scores and twenty Salamander Grand Piano samples.
- Web Audio sample scheduling, reverb, volume, seek, shuffle, repeat and continuous playback.
- A procedurally modeled 88-key grand piano, physical lacquer materials, studio reflections, soft shadows, orbit interaction and three camera views.
- Day/night themes, immersive mode, local favorites, landscape phone and desktop layouts.

First audible playback requires a user gesture when the browser blocks autoplay. Fonts have system fallbacks. Music, samples and Three.js are bundled locally.

Music provenance is linked in the site's About dialog. The 樱花草 piano score was transcribed from the EOP two-page arrangement. The Salamander samples by Alexander Holm are used under CC BY 3.0; their audio was not modified. Three.js is MIT licensed (license header retained).

Validation: JavaScript syntax, asset/data validation, and a DOM/Web Audio mock integration harness covering playback, song navigation, seeking, favorites, filters, theme, immersion, mute, shuffle/repeat and completion. No connected browser was available for device-level WebGL rendering and real audio output verification.
