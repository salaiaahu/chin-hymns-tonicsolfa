from lxml import etree
import json,re
from pathlib import Path
ROOT=Path('/mnt/data/chin_hymn_11_prototype')
TREE=etree.parse('/mnt/data/Ka_Thlarau_Ngai_Tuah_Fully_Editable.svg')
ns='{http://www.w3.org/2000/svg}'
verse4=["Ngaihchiatnak caan kha atu sau hmanhsehlaw,", "Khuamui hlawt in lawmhnak khua a ceu lai", "Retheimi kalnak lam kha a dih tikah,", "Thlarau hnangamnak suikhua kan phak lai."]
def ydata(g, system):
    ys={}
    for t in g.findall(ns+'text'):
        if t.get('class')=='note':
            y=round(float(t.get('y')))
            ys.setdefault(y,[]).append(t)
    names=sorted(ys)
    assert len(names)==4,(system, names)
    return names

def extract(g, section, s, minx=0, maxx=2000):
    ys=ydata(g,s)
    rows=[[] for _ in range(4)]
    for ri,y in enumerate(ys):
        for el in g.findall(ns+'text'):
            if el.get('class')=='note' and round(float(el.get('y')))==y:
                x=float(el.get('x'))
                if minx <= x <= maxx:
                    rows[ri].append({'x':x,'txt':el.text or ''})
    coords=sorted(set(t['x'] for row in rows for t in row))
    # SVG sometimes has one final note only in one part; unify by tolerant 3px
    unique=[]
    for x in coords:
        if unique and x-unique[-1]<4:continue
        unique.append(x)
    # create events / adapt slight x inaccuracies
    events=[{'x':x,'notes':['','','',''],'lyrics': ['', '', ''], 'chorusLyric':'', 'bar':False} for x in unique]
    for voice,row in enumerate(rows):
        for v in row:
            e=min(events,key=lambda e:abs(e['x']-v['x']))
            e['notes'][voice]=v['txt']
    # choose closest event x to each lyric, but maintain unique and ordering
    lyry={1:{1:251,2:279,3:305},2:{1:440,2:466,3:491},3:{1:619,2:647,3:675},4:{1:818,2:847,3:874}}
    otherchorus={4:851,5:1003,6:1148,7:1284}
    for el in g.findall(ns+'text'):
        if el.get('class')!='lyric':continue
        x=float(el.get('x'));y=round(float(el.get('y')))
        if not(minx<=x<=maxx):continue
        if section=='verse':
            vv=next((v for v,ly in lyry[s].items() if abs(y-ly)<4),None)
            if vv is None:continue
            txt=(el.text or '')
            txt=re.sub(r'^\s*'+str(vv)+r'\.\s*','',txt).strip()
            if not txt:continue
            ev=min(events,key=lambda ev:abs(ev['x']-x))
            ev['lyrics'][vv-1]=f"{ev['lyrics'][vv-1]} {txt}".strip()
        else:
            if abs(y-otherchorus[s])>5:continue
            txt=(el.text or '').strip()
            if not txt:continue
            ev=min(events,key=lambda ev:abs(ev['x']-x))
            ev['chorusLyric']=f"{ev['chorusLyric']} {txt}".strip()
    # barlines from SVG: x between previous note and current note, excluding double for chorus intro
    bx=[]
    for line in g.findall(ns+'line'):
        x=float(line.get('x1')); y1=float(line.get('y1'));y2=float(line.get('y2'))
        if abs(x-float(line.get('x2')))>1:continue
        # accept first row barlines only
        if minx-14 <= x <= maxx+14 and y1<=ys[0] and y2>=ys[0]: bx.append(x)
    for i,ev in enumerate(events):
        prev=events[i-1]['x'] if i else minx-50
        ev['bar']=any(prev+2 < x <= ev['x']+1 for x in bx)
    if section=='verse':
        idx=s-1
        if 0<=idx<len(verse4):
            words=verse4[idx].split()
            # Verse 4 was not underlaid in the scan; provide provisional word distribution.
            for j,w in enumerate(words):
                ix=round(j*(len(events)-1)/max(1,len(words)-1))
                ev=events[ix]
                ev['verse4']=f"{ev.get('verse4','')} {w}".strip()
    for ev in events:
        ev.pop('x')
        if not ev['bar']: ev.pop('bar')
        if section=='verse':ev.pop('chorusLyric',None)
        else:
            ev.pop('lyrics',None)
            ev.pop('verse4',None)
    return {'sourceSystem':s,'events':events}

systems={int(g.get('id').split('-')[1]):g for g in TREE.getroot().findall(ns+'g') if g.get('id','').startswith('system-')}
verse=[extract(systems[s],'verse',s,maxx=(551 if s==4 else 2000)) for s in (1,2,3,4)]
chorus=[extract(systems[s],'chorus',s,minx=(560 if s==4 else 0)) for s in (4,5,6,7)]
obj={
    'number':11, 'title':'KA THLARAU NGAI TUAH!', 'englishTitle':'Hark, Hark! My Soul!',
    'category':'Thangthatnak', 'page':12, 'lyricist':'F. W. Faber', 'lyricistDates':'1814–1863',
    'key':'D', 'scripture':'Heb. 1:14', 'source':'S.S. 231',
    'arrangers':'C. C. Converse & Ira D. Sankey', 'verses':4, 'chorusLabel':'NOLHNAK',
    'verse4NotUnderlaid':True,
    'notationSource':'Manually re-typeset SVG created from the user-supplied scan; needs musical proofreading.',
    'verseScore':verse,'chorusScore':chorus
}
(ROOT/'hymn11.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf8')
for name,sys in [('VERSE',verse),('CHORUS',chorus)]:
 print(name)
 for s in sys:
  print(s['sourceSystem'],'events',len(s['events']))
  if name=='VERSE':
   for ix in range(3):print(ix+1, ' '.join(e['lyrics'][ix] for e in s['events']))
   print('4th:',' '.join(e.get('verse4','') for e in s['events']))
  else:
   print('chorus',' '.join(e.get('chorusLyric','') for e in s['events']))
