# NOCTURNE · 夜曲

A buildless piano/guitar learning player. Serve `dist/` as a static site; `.openai/hosting.json` retains its Sites project identity.

## Playback and modes

The page selects 樱花草 and attempts audible autoplay and native fullscreen. There is no central start button. When the browser allows audio, the score starts from the beginning after local samples are ready. When autoplay is blocked, the score and instrument still animate using a silent performance clock. A small status in the transport explains that a normal interaction can enable sound. Pointer/click/keyboard interaction retries audio and fullscreen where supported; audio joins the displayed score position. Intentional pause, manual play and menu actions cancel stale asynchronous requests. Browser autoplay policy still governs whether the first visit may produce sound without interaction.

Demonstration and step-by-step learning display real note names (C2, D2, C4) and guitar string/fret numbers. Computer shortcut labels appear only in free play, including when typing a note switches to manual play. The keyboard menu can disable these labels. Piano follows Virtual Piano's C2–C7 letter-sheet mapping, with Shift for black keys; guitar uses Musicca's official English mapping (number/Q/A/Z rows are strings 3/4/5/6, Shift+number/Q are strings 1/2). The first key of each row is an open string. PageUp/PageDown can shift the guitar fret origin 0–3. All 61 piano pitches and all 70 base guitar bindings were checked against the sources. Keyboard voices support polyphony, keyup release, same-string damping and cleanup on blur, hidden tabs, menus and mode changes.

Sources: https://virtualpiano.net/how-to-play/ and https://www.musicca.com/files/scripts/virtual-guitar/translation/English.js. These are established layouts, not an industry-wide standard.

## Interface and lessons

The main view contains compact song, instrument and menu controls and a transport. A sun/moon button immediately left of the menu switches day/night styling, scene lighting and the browser theme color; the existing settings switch stays synchronized. The transport shows a compact sequence/single toggle. Sequential playback is the default: finishing a score automatically starts the next one in catalog order, wrapping to the first at the end. Single mode repeats the current score. Manual previous/next still changes songs in either mode; A–B loops take precedence. Automatic advances retain open menus and keyboard focus and do not request fullscreen again. The main menu provides songs, practice, free play, About, settings and keyboard maps. About is directly alongside settings and contains six collapsible beginner chapters covering note/octave labels, piano keys, guitar strings/frets, rhythm/harmony and a first 樱花草 practice routine. Inline piano and fretboard diagrams have accessible titles. Secondary pages retain their return path and disclosure state, with keyboard focus trapping.

The bottom arrows, keyboard Left/Right and media previous/next actions switch complete songs, wrapping through the score library. Group navigation/audition lives in the Practice submenu. Song import is intentionally deferred.

Practice supports speed changes without transposition, piano hand filtering, manual group stepping/audition, A–B loops and a metronome. The mobile shell uses landscape dimensions. If native orientation lock is unavailable, a rotated layout provides a landscape canvas and corrects hit coordinates; physical rotation removes the software transform. The menu stays inside the transformed shell.

## Scene and sound

`scene.js` renders physically beveled ivory/ebony keys, clearcoat lacquer, studio lighting and a larger piano close-up. Falling notes and their lanes have been removed entirely. Piano feedback is a soft surface glow with a restrained 600 ms ripple inside each key; both move with the key pivot, fade on release, and respect reduced-motion/effects controls. The Canvas compatibility painter clips the same feedback to individual keys. Guitar retains its string/fret markers and pluck accents. White-key bevels stay within the intended widths, leaving actual dark gaps. Individual fine outlines define their faces. The case remains black and white, with all champagne/gold border inlays and corner decorations removed. Decorative key outlines are excluded from raycasts. The Canvas compatibility renderer keeps distinct key seams and outlines without a gold frame.

The guitar uses a close rosewood fretboard with metallic strings/frets and pearl inlays. `music.js` assigns actual standard-tuning pitches to strings/frets and limits hand span. 樱花草 piano hand assignments come from the linked two-voice score; other songs split approximately by register. Guitar arrangements are site-specific simplified fingerstyle versions; some voices move octaves or are reduced. They do not assert an authoritative artist fingering.

Audio uses 20 local Salamander piano samples (Alexander Holm, CC BY 3.0) and 13 acoustic guitar samples (University of Iowa, edited/distributed by Nicholas Brosowsky, CC BY 3.0). Attribution and score sources remain in the secondary information page and asset attribution file. Three.js retains its MIT header.

## Verification

DOM/AudioContext checks cover allowed, pending and rejected autoplay; silent timeline progress, rate/seek/A–B looping and synchronized audio resume; ordinary-interaction unlock without a start screen; pause intent and demonstration/free-play labels; keyboard polyphony; menu/About navigation; and rotated mobile interactions. Geometry checks verify actual white-key gaps, outlines, absence of gold border accents, finite models, key/fret raycasts, glow release/effects controls, and close/overhead framing across six desktop/landscape viewport sizes and two-to-seven-octave ranges. Transport checks cover song wrap/skip, rapid lazy-load navigation and group audition inside Practice. The actual Canvas fallback painter was rendered and inspected locally. No connected browser is available, so real GPU output, physical-device fullscreen/orientation, speaker output and input latency remain unverified.

## Expanded score library

The library contains 20 playable entries: the initial six, six complete relaxing pieces from public-domain Mutopia MIDI, and eight source-backed short pop melody studies. The new relaxing group contains Satie Gymnopédies 1 and 3, Schumann Träumerei, Debussy Clair de lune, Bach BWV846 Prelude and Chopin Op28 No4. Their MIDI staff hand annotations are retained. Compound/cut-time metronome settings use the musical beat unit.

Eight pop tracks have transcribed 8–9-measure melody studies, explicitly labeled as excerpts. 心事/嗜好/巴赫旧约 use a chosen 70 BPM practice tempo. Single-melody studies hide hand filtering and play the melody even if a previous full score used left-hand-only filtering. Source links and arranger credits remain in the info page and LIBRARY-SOURCES.json. These pop arrangements are for the existing private personal-learning site; source learning/noncommercial restrictions remain relevant to any future broader redistribution.

The vocal-listening feature, music-platform players, preview URLs, song-row shortcuts and associated UI explanations have been removed. 耀祖《给未来的自己（R&B版）》had only a recording reference and no verified score, so it is absent from the score library. The remaining pieces retain their piano/guitar note data. Songs can be searched and filtered, including the separate 舒缓 filter. Startup loads only 樱花草; other scores load on demand and retain cached data.

Validation covers note ordering/ranges, score/excerpt labels, hand annotations, guitar pitch conversion, automatic sequence advance and wrap, single repeat, A–B precedence, pause during lazy loading, playback mode continuity, quick-theme/settings synchronization, and desktop/rotated mobile navigation. No connected browser is available for real GPU/device verification.
