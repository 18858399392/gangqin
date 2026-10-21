"""Convert the reviewed numbered two-hand score; no scans or recordings required."""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'sources/will-transcription.json'
TARGET = ROOT / 'dist/assets/music/will.json'


def convert(data):
    bars = data['bars']
    assert [b['number'] for b in bars] == list(range(1, 114))
    assert sum(b['beats'] for b in bars) == 454
    assert [b['number'] for b in bars if b['beats'] != 4] == [4]
    assert bars[3]['beats'] == 6
    scale = (0, 2, 4, 5, 7, 9, 11)
    notes, previous, ties, bar_map = [], {}, [], []
    beat = 0
    for bar in bars:
        bar_map.append({'number': bar['number'], 'beat': beat, 'beats': bar['beats']})
        for hand in ('L', 'R'):
            end = 0
            for event in bar[hand]:
                at, duration = event['at'], event['dur']
                assert at >= end and duration > 0 and at + duration <= bar['beats'], (bar['number'], hand, event)
                end = at + duration
                for p in event['pitches']:
                    assert 1 <= p['degree'] <= 7
                    pitch = 66 + scale[p['degree'] - 1] + 12 * p['octave'] + p.get('alter', 0)
                    assert 21 <= pitch <= 108
                    onset = beat + at
                    key = hand, pitch
                    if event.get('tieIn'):
                        prior = previous.get(key)
                        assert prior is not None and prior[0] + prior[2] == onset, (bar['number'], hand, p, prior)
                        prior[2] += duration
                        ties.append({'bar': bar['number'], 'at': at, 'hand': hand, 'pitch': pitch})
                    else:
                        # Source has no dynamics; keep melody gently above accompaniment.
                        note = [onset, pitch, duration, .76 if hand == 'R' else .56, hand]
                        notes.append(note)
                        previous[key] = note
        beat += bar['beats']
    notes.sort(key=lambda n: (n[0], n[1], n[4]))
    factor = 60 / 113
    seconds = [[round(.15 + n[0] * factor, 5), n[1], round(n[2] * factor, 5), n[3], n[4]] for n in notes]
    result = {
        'duration': round(.15 + beat * factor + 2.5, 3),
        'notes': seconds,
        'attribution': {
            'title': '会不会', 'artist': '刘大壮', 'arranger': 'wza67865385',
            'source': data['source'],
            'edition': 'EveryonePiano five-page two-hand numbered arrangement, bars 1–113',
            'conversion': 'Reviewed manual transcription; Gb major; quarter=113; original staff hands; ties merged, including across pages. Source has no dynamics: gentle hand-balanced velocities added. 0.15s lead-in and 2.5s release tail.',
            'scope': 'Existing owner-private personal learning; no scan, lyrics or original recording bundled.',
            'transcriptionSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        },
        'score': {'barCount': 113, 'quarterBeats': beat, 'bpm': 113, 'key': 'Gb major', 'barMap': bar_map, 'mergedTieCount': len(ties)},
    }
    return result, ties


if __name__ == '__main__':
    result, ties = convert(json.loads(SOURCE.read_text()))
    TARGET.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(json.dumps({'bars': 113, 'beats': 454, 'notes': len(result['notes']), 'tiesMerged': len(ties), 'duration': result['duration']}))
