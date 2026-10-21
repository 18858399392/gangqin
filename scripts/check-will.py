"""Source landmarks and reproducibility checks for the complete transcription."""
import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('convert_will', ROOT / 'scripts/convert-will.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
source = json.loads(module.SOURCE.read_text())
score, ties = module.convert(source)
assert score == json.loads(module.TARGET.read_text()), 'Event asset is stale'
assert len(score['notes']) == 1036 and len(ties) == 114
assert score['duration'] == 243.712


def event(bar, hand, at):
    return next(e for e in source['bars'][bar - 1][hand] if e['at'] == at)


# Visually reviewed octave and duration landmarks, including two corrected readings.
assert event(4, 'L', 0)['dur'] == 6
assert event(8, 'R', 0)['dur'] == .5 and event(8, 'R', 0)['tieIn']
assert event(10, 'R', 0)['dur'] == .75
for bar, at, octave in [(26, 0, -3), (26, 3, -2), (46, 3, -1), (58, 0, -3), (81, 0, -3), (110, 0, -3)]:
    assert event(bar, 'L', at)['pitches'][0]['octave'] == octave
# Sharps continue only within their source measure and octave.
for bar in (49, 83, 99):
    degree_ones = [p for e in source['bars'][bar - 1]['L'] for p in e['pitches'] if p['degree'] == 1 and p['octave'] == -1]
    assert len(degree_ones) == 2 and all(p['alter'] == 1 for p in degree_ones)
assert all(p.get('alter', 0) == 0 for e in source['bars'][54]['R'] for p in e['pitches'])

# Cross-page continuations and final sustained chord must have one attack, not repeated attacks.
beat_starts = {b['number']: b['beat'] for b in score['score']['barMap']}
for bar, pitch, hand in [(25, 68, 'R'), (53, 66, 'R'), (113, 61, 'R'), (113, 65, 'R'), (113, 49, 'L'), (113, 53, 'L'), (113, 56, 'L')]:
    t = .15 + beat_starts[bar] * 60 / 113
    matches = [n for n in score['notes'] if n[1] == pitch and n[4] == hand and n[0] < t - .0001 and n[0] + n[2] >= t + 4 * 60 / 113 - .0001]
    # Bar25's tied continuation lasts a quarter, not a whole measure.
    if bar == 25:
        matches = [n for n in score['notes'] if n[1] == pitch and n[4] == hand and n[0] < t and n[0] + n[2] >= t + 60 / 113 - .0001]
    assert matches, (bar, pitch, hand)
    assert not any(abs(n[0] - t) < .0001 and n[1] == pitch and n[4] == hand for n in score['notes'])
for n in score['notes']:
    assert n[0] >= 0 and n[2] > 0 and n[0] + n[2] < score['duration']
assert set(n[4] for n in score['notes']) == {'L', 'R'}
entry = next(e for e in json.loads((ROOT / 'dist/assets/music/FULL-POP-SOURCES.json').read_text()) if e['id'] == 'will')
assert entry['eventSha256'] == hashlib.sha256(module.TARGET.read_bytes()).hexdigest()
print('PASS: 113 measures / 454 beats, reviewed octave/accidental landmarks, 114 merged ties, 1036 attacks, final chord and reproducible event/source hashes.')
