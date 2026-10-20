"""Prepare deterministic piano note data from MIDI and a transcribed piano score."""
from pathlib import Path
import json, mido, bisect

out=Path(__file__).parent/'dist/assets/music';out.mkdir(exist_ok=True)
def midi_notes(name, selected=None):
    mid=mido.MidiFile('/workspace/scratch/midi/'+name+'.mid')
    changes=[(0,500000)]
    for tr in mid.tracks:
        tick=0
        for msg in tr:
            tick+=msg.time
            if msg.type=='set_tempo': changes.append((tick,msg.tempo))
    changes=sorted(dict(changes).items());times=[0]
    for (tick,tempo),(nt,_) in zip(changes,changes[1:]):times.append(times[-1]+mido.tick2second(nt-tick,mid.ticks_per_beat,tempo))
    ticks=[x[0] for x in changes]
    def sec(t):
        i=bisect.bisect_right(ticks,t)-1
        return times[i]+mido.tick2second(t-ticks[i],mid.ticks_per_beat,changes[i][1])
    notes=[]
    for i,tr in enumerate(mid.tracks):
        if selected is not None and i not in selected:continue
        tick=0;held={}
        for msg in tr:
            tick+=msg.time
            if not msg.type.startswith('note_') or msg.channel==9:continue
            key=(msg.channel,msg.note)
            if msg.type=='note_on' and msg.velocity:
                held[key]=(tick,msg.velocity)
            elif key in held:
                start,vel=held.pop(key);t=sec(start);dur=sec(tick)-t
                if dur>.015 and 21<=msg.note<=108: notes.append([round(t,4),msg.note,round(dur,4),round(vel/127,3)])
    notes.sort();start=notes[0][0]
    for n in notes:n[0]=round(n[0]-start+.15,4)
    # Do not double a note when two piano staves share it.
    notes=list({(n[0],n[1]):n for n in notes}.values());notes.sort()
    return notes

def save(name,notes):
    duration=round(max(n[0]+n[2] for n in notes)+2.5,2)
    (out/(name+'.json')).write_text(json.dumps({'duration':duration,'notes':notes},separators=(',',':')))
    print(name,len(notes),duration)

for name,tracks in [('moonlight',None),('river',None),('golden',[0,2]),('elise',None),('canon',None)]:save(name,midi_notes(name,tracks))

# 樱花草: a 37-bar piano arrangement, transcribed from the two-page EOP score.
scale=[0,2,4,5,7,9,11]
def pitch(token,base):
    if str(token)=='0':return None
    token=str(token);return base+scale[int(token[0])-1]+(12 if 'h' in token else -12 if 'l' in token else 0)
def bar(text):
    result=[]
    for tok in text.split():
        parts=tok.split(':');result.append((parts[0],float(parts[1]) if len(parts)>1 else .5))
    assert abs(sum(d for _,d in result)-4)<.0001,(text,sum(d for _,d in result))
    return result
intro=['1 3 2 3 1 3 2:1','1 3 2 3 1:2','1 3 2 3 5:1.5 3:.25 2:.25','1:4']
verse=['1 5l 1 3 2:1 3:.75 2:.25','1 3l 6l 1 7l:1 1:.75 7l:.25','6l:1 1:.75 6l:.25 5l 0 1:.25 1:.25','4 3 2 1:.25 3:.25 2:1 3:.75 2:.25']
# Complete the third measure with its notated rest; all bars are four beats.
verse[2]='6l:1 1:.75 6l:.25 5l 0:1 1:.25 1:.25'
pre=['1:1.5 2 1:1.5 7l:.25 6l:.25','5l 1 3 4:.25 3:.25 2:1.5 3','1:1.5 1:.25 2:.25 1:1.5 7l:.25 6l:.25','5l 1 3 4:.25 3:.25 2:1 6:.75 5:.25']
chorus=['3 5 5 3:.25 2:.25 2:1 5:.75 5:.25','3 5 5 3:.25 2:.25 1:1 1:.75 2:.25','3:1 5:.75 3:.25 2:1 5:.75 3:.25','1 2 3 5 2:1 6:.75 5:.25']
right=intro+intro[:3]+['1:3 3:.75 2:.25']+verse+verse[:3]+['4 3 2 1:.25 3:.25 2:1.5 3']+pre+chorus+['3 5 5 3:.25 3:.25 2:1 6:.75 5:.25',chorus[1],chorus[2],'1 2 3 5 2:1.5 3']+['1:4']+intro[:3]+intro+['1:4']
left_intro=['1 5 1h 5 7l 5 7l 5','6l 3 6l 3 5l 2 5l:1','4l 1 4l 1 5l 2 7l:1','1 5 1h:1 0 5 2h 3h']
left_verse=['1 5 1h 3h 7l 5 7l 2h','6l 3 5l 1h 5l 2 5l 7l','4l 1 4l 6 3l 7l 3l 5','2 6 2h 4h 5l 2 5l 7l']
left_pre=['6l 3 6l 1h 4l 1 4l 6','1 5 1h 3h 5l 7l 5l 7l']*2
left_chorus=['1 5 3h 5h 7l 5 2h 5h','6l 3 1h 3h 4l 1 6l 1h','1 5 3h 5h 7l 5 2h 5h','6l 3 1h 3h 5l 2 7l 2h']
left=left_intro+left_intro[:2]+['4l 1 4l 1 5l 7l 7l:1','1 5 1h 3h 5h:1 0:1']+left_verse*2+left_pre+left_chorus*2+['1 5 1h 3h 5h:2']+left_intro[:3]+left_intro+['1 5 1h 3h 5h:2']
assert len(right)==len(left)==37
notes=[];beat=60/83
for b,(r,l) in enumerate(zip(right,left)):
    for seq,base,velocity in [(r,72,.75),(l,48,.44)]:
        cursor=b*4*beat+.15
        for token,d in bar(seq):
            p=pitch(token,base)
            if p is not None:notes.append([round(cursor,4),p,round(d*beat*.93,4),velocity])
            cursor+=d*beat
notes.sort();save('cherry',notes)
