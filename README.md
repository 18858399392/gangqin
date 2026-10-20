# NOCTURNE · 夜曲

A buildless piano/guitar learning player. Serve `dist/` as a static site; `.openai/hosting.json` retains its Sites project identity.

## Playback and modes

The page selects 樱花草 and attempts audible autoplay and native fullscreen. There is no central start button. When the browser allows audio, the score starts from the beginning after local samples are ready. When autoplay is blocked, the score and instrument still animate using a silent performance clock. A small status in the transport explains that a normal interaction can enable sound. Pointer/click/keyboard interaction retries audio and fullscreen where supported; audio joins the displayed score position. Intentional pause, manual play and menu actions cancel stale asynchronous requests. Browser autoplay policy still governs whether the first visit may produce sound without interaction.

Demonstration and step-by-step learning display real note names (C2, D2, C4) and guitar string/fret numbers. Computer shortcut labels appear only in free play, including when typing a note switches to manual play. The keyboard menu can disable these labels. Piano follows Virtual Piano's C2–C7 letter-sheet mapping, with Shift for black keys; guitar uses Musicca's official English mapping (number/Q/A/Z rows are strings 3/4/5/6, Shift+number/Q are strings 1/2). The first key of each row is an open string. PageUp/PageDown can shift the guitar fret origin 0–3. All 61 piano pitches and all 70 base guitar bindings were checked against the sources. Keyboard voices support polyphony, keyup release, same-string damping and cleanup on blur, hidden tabs, menus and mode changes.

Sources: https://virtualpiano.net/how-to-play/ and https://www.musicca.com/files/scripts/virtual-guitar/translation/English.js. These are established layouts, not an industry-wide standard.

## Interface and lessons

The main view contains compact song, instrument and menu controls and a transport. The main menu provides songs, practice, free play, About, settings and keyboard maps. About is directly alongside settings and contains six collapsible beginner chapters covering note/octave labels, piano keys, guitar strings/frets, rhythm/harmony and a first 樱花草 practice routine. Inline piano and fretboard diagrams have accessible titles. Secondary pages retain their return path and disclosure state, with keyboard focus trapping.

Practice supports speed changes without transposition, piano hand filtering, manual group stepping/audition, A–B loops and a metronome. The mobile shell uses landscape dimensions. If native orientation lock is unavailable, a rotated layout provides a landscape canvas and corrects hit coordinates; physical rotation removes the software transform. The menu stays inside the transformed shell.

## Scene and sound

`scene.js` renders physically beveled ivory/ebony keys, clearcoat lacquer, studio lighting, thick rounded note gems and particles. White-key bevels stay within the intended widths, leaving actual dark gaps. Individual fine outlines define their faces. Champagne-metal inlays accent the front, rear and sides of the case, with small corner details. Decorative outlines are excluded from key raycasts. The Canvas compatibility renderer also includes distinct key seams, outlines and a shaded gold frame.

The guitar uses a close rosewood fretboard with metallic strings/frets and pearl inlays. `music.js` assigns actual standard-tuning pitches to strings/frets and limits hand span. 樱花草 piano hand assignments come from the linked two-voice score; other songs split approximately by register. Guitar arrangements are site-specific simplified fingerstyle versions; some voices move octaves or are reduced. They do not assert an authoritative artist fingering.

Audio uses 20 local Salamander piano samples (Alexander Holm, CC BY 3.0) and 13 acoustic guitar samples (University of Iowa, edited/distributed by Nicholas Brosowsky, CC BY 3.0). Attribution and score sources remain in the secondary information page and asset attribution file. Three.js retains its MIT header.

## Verification

DOM/AudioContext checks cover allowed, pending and rejected autoplay; silent timeline progress, rate/seek/A–B looping and synchronized audio resume; ordinary-interaction unlock without a start screen; pause intent and demonstration/free-play labels; keyboard polyphony; menu/About navigation; and rotated mobile interactions. Geometry checks verify actual white-key gaps, outlines, gold accents, finite models, key/fret raycasts and desktop/landscape framing. The actual Canvas fallback painter was rendered and inspected locally. No connected browser is available, so real GPU output, physical-device fullscreen/orientation, speaker output and input latency remain unverified.
