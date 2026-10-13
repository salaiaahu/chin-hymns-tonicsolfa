(() => {
  'use strict';
  const originalData = clone(window.HYMN11);
  let data = clone(originalData);
  const root = document.documentElement;
  const reader = document.getElementById('reader');
  const score = document.getElementById('score');
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const notice = document.getElementById('notice');
  const sectionName = document.getElementById('sectionName');
  const sectionCaption = document.getElementById('sectionCaption');
  const fontCaption = document.getElementById('fontCaption');
  const dialog = document.getElementById('scanDialog');
  const scanImage = document.getElementById('scanImage');
  let activeScanSrc = scanImage.src;
  let activeScanFilename = 'original-hymn-11.jpg';
  let dataStorageKey = 'chinHymn11-edits';
  let section = '1';
  let fontSize = 18;
  let timer;
  let lastWidth = 0;
  let measureCtx = document.createElement('canvas').getContext('2d');
  let visibleVoices = {S:true,A:true,T:true,B:true};

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function settingsGet(key, fallback) {
    try {return window.localStorage.getItem(key) ?? fallback;} catch {return fallback;}
  }
  function settingsSave(key, val) {
    try {window.localStorage.setItem(key, val);} catch {}
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  }
  function currentLines() {return section==='chorus' ? data.chorusScore : data.verseScore;}
  function renderHeader() {
    document.getElementById('hymnNumber').textContent=`${data.number} · ${data.category}`;
    const title=document.getElementById('hymnTitle');title.textContent=data.title;
    title.dataset.titleLength=data.title.length>40?'very-long':data.title.length>27?'long':'';
    document.getElementById('englishTitle').textContent=data.englishTitle;
    document.getElementById('wordsMeta').innerHTML=`<strong>${escapeHtml(data.lyricist)}</strong>${data.lyricistDates ? ` · ${escapeHtml(data.lyricistDates)}` : ''}`;
    document.getElementById('keyMeta').innerHTML=`<strong>Doh is ${escapeHtml(data.key)}</strong>`;
    document.getElementById('scriptureMeta').textContent=data.scripture;
    document.getElementById('sourceMeta').innerHTML=`<strong>${escapeHtml(data.source)}</strong>${data.page ? ` · p. ${escapeHtml(data.page)}` : ''}`;
    document.getElementById('arrangersMeta').innerHTML=data.arrangers?`Arr. ${escapeHtml(data.arrangers)}`:'';
    document.getElementById('chorusTab').textContent=data.chorusLabel || 'Chorus';
  }
  function lyricFor(event) {
    return section==='chorus' ? (event.chorusLyric ?? '') :
      section==='4' ? (event.verse4 ?? '') : (event.lyrics?.[Number(section)-1] ?? '');
  }
  function preferredWidth(event) {
    const noteParts = event.notes ?? [];
    measureCtx.font = `${fontSize}px Georgia, 'Times New Roman', serif`;
    const n = Math.max(0, ...noteParts.map(t => measureCtx.measureText(t ?? '').width));
    measureCtx.font = `700 ${Math.max(14, fontSize-1)}px Georgia, 'Times New Roman', serif`;
    const l = measureCtx.measureText(lyricFor(event)).width;
    return Math.ceil(Math.max(fontSize * 1.7, n + 10, l + 12));
  }
  function lineCapacity() {
    const containerWidth = score.clientWidth || reader.clientWidth || 350;
    return Math.max(170,containerWidth-(window.innerWidth >=650 ? 52 : 37));
  }
  function intoMeasures(events) {
    const measures=[];
    for(const e of events){
      if (!measures.length || e.bar) measures.push([]);
      measures.at(-1).push(e);
    }
    return measures;
  }
  function reflowEvents(events, cap) {
    const measures=intoMeasures(events);
    const rows=[];let curr=[];let used=0;
    const push=()=>{if(curr.length){rows.push(curr);curr=[];used=0;}};
    for (const measure of measures){
      const measureWidth=measure.reduce((sum,e)=>sum+preferredWidth(e),0);
      if (measureWidth<=cap){
        if (used+measureWidth>cap && curr.length)push();
        curr.push(...measure);used+=measureWidth;
      } else {
        // A measure can be longer than a phone screen. Split only at note boundaries.
        for(const e of measure){
          const w=Math.min(preferredWidth(e),cap);
          if(used+w>cap && curr.length) push();
          curr.push(e);used+=w;
        }
      }
    }
    push();
    // Avoid a final "orphan" with only one sung syllable on its own line.
    // Moving whole note events preserves S/A/lyrics/T/B alignment.
    if (rows.length>1) {
      const last=rows.at(-1), prior=rows.at(-2);
      let lastWidth=last.reduce((n,e)=>n+preferredWidth(e),0);
      while(last.length<3 && prior.length>3){
        const candidate=prior.at(-1), w=preferredWidth(candidate);
        if(lastWidth+w>cap)break;
        prior.pop();last.unshift(candidate);lastWidth+=w;
      }
    }
    return rows;
  }
  function makeLine(events, originalSystem, final) {
    const outer=document.createElement('div');outer.className='music-line'+(final?' last-of-original':'')+(Object.values(visibleVoices).every(Boolean)?'':' filtered');
    const rows=[];
    if(visibleVoices.S)rows.push(['S','note',0,'var(--voice-height)']);
    if(visibleVoices.A)rows.push(['A','note',1,'var(--voice-height)']);
    rows.push([section==='chorus'?'♪':section+'.','lyric',null,'var(--lyric-height)']);
    if(visibleVoices.T)rows.push(['T','note',2,'var(--voice-height)']);
    if(visibleVoices.B)rows.push(['B','note',3,'var(--voice-height)']);
    outer.style.setProperty('--score-rows',rows.map(row=>row[3]).join(' '));
    const labels=document.createElement('div');labels.className='voice-labels';labels.setAttribute('aria-hidden','true');
    rows.forEach(row=>{const label=document.createElement('span');label.textContent=row[0];if(row[1]==='lyric')label.className='verse-mark';labels.appendChild(label);});
    outer.appendChild(labels);
    const group=document.createElement('div');group.className='event-group';
    let width=0;for (const e of events) width+=preferredWidth(e);
    const cap=lineCapacity();
    // If one unusual lyric word exceeds available width, reduce its column without overflowing.
    const factor=width>cap && events.length===1? Math.min(1,cap/width):1;
    for (const e of events){
      const cell=document.createElement('div');cell.className='event'+(e.bar?' bar-before':'')+(e.barStyle==='double'?' bar-double':'');
      cell.style.width=(preferredWidth(e)*factor)+'px';
      for (const row of rows) {
        const slot=row[1]==='lyric'?lyricFor(e):e.notes[row[2]];
        const el=document.createElement('div');
        el.className=row[1]+(!slot?' blank':'');
        el.textContent=slot||'·';
        if(row[1]==='lyric' && slot)el.title=slot;
        cell.appendChild(el);
      }
      if(e.barStyle==='double'){
        ['s','a','t','b'].forEach(voice=>{const divider=document.createElement('span');divider.className=`voice-divider voice-divider-${voice}`;divider.setAttribute('aria-hidden','true');cell.appendChild(divider);});
      }
      group.appendChild(cell);
    }
    outer.appendChild(group);
    outer.dataset.sourceSystem=originalSystem;
    return outer;
  }
  function render() {
    if(!score) return;
    renderHeader();
    score.replaceChildren();
    const fragment=document.createDocumentFragment();
    // All four printed systems form one continuous musical section.
    // Reflow them together so source-page line endings cannot create tiny orphan panels.
    const events=currentLines().flatMap(sys=>sys.events);
    const rows=reflowEvents(events,lineCapacity());
    for(let j=0;j<rows.length;j++)fragment.appendChild(makeLine(rows[j],null,j===rows.length-1));
    score.appendChild(fragment);
    const chorus=section==='chorus';
    sectionName.textContent=chorus?`${data.chorusLabel} · Chorus`:`Verse ${section}`;
    sectionCaption.textContent=chorus?'Chorus only':'Selected verse only';
    notice.hidden=section!=='4';
    tabs.forEach(t=>{
      const isActive=t.dataset.section===section;
      t.setAttribute('aria-selected',String(isActive));t.tabIndex=isActive?0:-1;
    });
    fontCaption.textContent=`${fontSize}px`;
  }
  function setSection(next, scroll=true) {
    if(!['1','2','3','4','chorus'].includes(next))return;
    section=next;
    render();settingsSave('chinHymn11-section',section);
    if(scroll){
      reader.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    }
  }
  function updateFont(value) {
    fontSize=Math.max(14,Math.min(24,Number(value)||18));
    root.style.setProperty('--note-size',fontSize+'px');
    root.style.setProperty('--lyric-size',Math.max(14,fontSize-1)+'px');
    root.style.setProperty('--voice-height',Math.round(fontSize*1.36)+'px');
    root.style.setProperty('--lyric-height',Math.round(fontSize*1.8)+'px');
    settingsSave('chinHymn11-font',fontSize);render();
  }
  function closeScan(){if(dialog?.open)dialog.close();}
  const editorDialog=document.getElementById('editorDialog');
  const editorBody=document.getElementById('editorBody');
  let editorScanZoom=100;
  function input(label, key, value) { return `<label class="editor-field">${label}<input name="${key}" value="${escapeHtml(value ?? '')}"></label>`; }
  function editorMarkup() {
    const score=currentLines(); const lyricLabel=section==='chorus'?'Chorus lyric':`Verse ${section} lyric`;
    const eventRows=score.flatMap(system=>system.events).map((event,index)=>{
      const lyric=lyricFor(event); const prefix=`event-${index}`;
      const note=(voice,label)=>`<input aria-label="Event ${index+1} ${label}" name="${prefix}-note-${voice}" value="${escapeHtml(event.notes[voice])}">`;
      const barStyle=event.barStyle==='double'?'double':event.bar?'single':'none';
      return `<div class="event-editor"><span class="event-number">${index+1}</span>${note(0,'S')}${note(1,'A')}<input aria-label="Event ${index+1} ${lyricLabel}" name="${prefix}-lyric" value="${escapeHtml(lyric)}">${note(2,'T')}${note(3,'B')}<span class="event-structure"><select name="${prefix}-bar-style" aria-label="Divider before event ${index+1}"><option value="none" ${barStyle==='none'?'selected':''}>None</option><option value="single" ${barStyle==='single'?'selected':''}>Shared</option><option value="double" ${barStyle==='double'?'selected':''}>Separate</option></select><button type="button" data-move-event="${index}" data-direction="-1" aria-label="Move event ${index+1} left">←</button><button type="button" data-move-event="${index}" data-direction="1" aria-label="Move event ${index+1} right">→</button></span></div>`;
    }).join('');
    const label=section==='chorus'?escapeHtml(data.chorusLabel):'Verse '+section;
    return `<details class="editor-details"><summary>Hymn details</summary><div class="editor-fields">${input('Hymn number','number',data.number)}${input('Category','category',data.category)}${input('Title','title',data.title)}${input('English title','englishTitle',data.englishTitle)}${input('Lyricist','lyricist',data.lyricist)}${input('Lyricist dates','lyricistDates',data.lyricistDates)}${input('Key / Doh','key',data.key)}${input('Scripture','scripture',data.scripture)}${input('Source','source',data.source)}${input('Book page','page',data.page)}${input('Arrangement','arrangers',data.arrangers)}${input('Chorus label','chorusLabel',data.chorusLabel)}</div></details><section class="editor-reference" aria-label="Proofreading workspace"><figure><figcaption>Original scan <span class="scan-zoom"><button type="button" data-scan-zoom="-25" aria-label="Zoom out original scan">−</button><span id="scanZoomCaption">${editorScanZoom}%</span><button type="button" data-scan-zoom="25" aria-label="Zoom in original scan">+</button></span></figcaption><div class="editor-scan-viewport"><img id="editorScan" style="width:${editorScanZoom}%" src="${escapeHtml(activeScanSrc)}" alt="Original scan of hymn ${escapeHtml(data.number)}"></div></figure><section class="editor-edit-panel"><h3>${label} edit view</h3><p>Columns stay synchronized. Shared divides S/A and T/B; Separate divides S, A, T, and B individually. Arrows move the complete S/A/lyric/T/B column.</p><div class="editor-table"><div class="editor-columns"><span>#</span><span>S</span><span>A</span><span>Lyric</span><span>T</span><span>B</span><span>Structure</span></div>${eventRows}</div></section></section>`;
  }
  function openEditor() { editorBody.innerHTML=editorMarkup(); editorDialog.showModal(); }
  function savedDataLoad() { try { const saved=localStorage.getItem('chinHymn11-edits'); if(saved) data=JSON.parse(saved); } catch {} }
  function applyEditorForm() {
    const form=new FormData(document.getElementById('editorForm'));
    ['number','category','title','englishTitle','lyricist','lyricistDates','key','scripture','source','page','arrangers','chorusLabel'].forEach(key=>data[key]=String(form.get(key) ?? '').trim());
    const events=currentLines().flatMap(system=>system.events);
    events.forEach((event,index)=>{
      event.notes=event.notes.map((_,voice)=>String(form.get(`event-${index}-note-${voice}`) ?? '').trim());
      const lyric=String(form.get(`event-${index}-lyric`) ?? '').trim();
      const barStyle=String(form.get(`event-${index}-bar-style`) ?? 'none');
      if(barStyle==='none'){delete event.bar;delete event.barStyle;}else{event.bar=true;if(barStyle==='double')event.barStyle='double';else delete event.barStyle;}
      if(section==='chorus') event.chorusLyric=lyric;
      else if(section==='4') event.verse4=lyric;
      else { event.lyrics ??=['','','']; event.lyrics[Number(section)-1]=lyric; }
    });
  }
  function saveEditor() {
    applyEditorForm();settingsSave(dataStorageKey,JSON.stringify(data)); render(); editorDialog.close();
  }
  function moveEvent(index,direction) {
    applyEditorForm();const events=currentLines().flatMap(system=>system.events);const target=index+direction;
    if(target<0||target>=events.length)return;
    [events[index],events[target]]=[events[target],events[index]];
    let offset=0;for(const system of currentLines()){const count=system.events.length;system.events=events.slice(offset,offset+count);offset+=count;}
    editorBody.innerHTML=editorMarkup();
  }
  function exportData() {
    const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}); const url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download=`hymn${data.number}.json`;link.click();URL.revokeObjectURL(url);
  }
  const importDialog=document.getElementById('importDialog');
  const importForm=document.getElementById('importForm');
  const importScan=document.getElementById('importScan');
  let importedFile;
  function blankEvent() { return {notes:['','','',''],lyrics:['','',''],verse4:''}; }
  function downloadImportedScan() {
    if(!importedFile)return;
    const url=URL.createObjectURL(importedFile);const link=document.createElement('a');link.href=url;link.download=activeScanFilename;link.click();URL.revokeObjectURL(url);
  }
  function createImportedDraft() {
    const fields=new FormData(importForm); const number=String(fields.get('number')).trim();
    data={number,title:String(fields.get('title')).trim(),englishTitle:String(fields.get('englishTitle')).trim(),category:String(fields.get('category')).trim(),page:String(fields.get('page')).trim(),lyricist:'',lyricistDates:'',key:'',scripture:'',source:String(fields.get('source')).trim(),arrangers:'',verses:4,chorusLabel:'NOLHNAK',verse4NotUnderlaid:true,transcriptionStatus:'draft-needs-proofreading',notationSource:'New scan import. All notation and lyrics require human proofreading against the preserved source scan.',reviewFlags:['No notation or lyrics have been transcribed yet.','Review every SATB token, lyric syllable, barline, and metadata field against the source scan.'],verseScore:[{sourceSystem:1,events:[blankEvent()]}],chorusScore:[{sourceSystem:1,events:[{notes:['','','',''],chorusLyric:''}]}]};
    activeScanFilename=`original-hymn-${number}.${importedFile.name.split('.').pop()}`;dataStorageKey=`chinHymnDraft-${number}`;section='1';document.title=`${number}. ${data.title || 'Untitled hymn'} — Chin Hymnbook`;
    scanImage.src=activeScanSrc;scanImage.alt=`Original scanned page for hymn ${number}`;importDialog.close();render();openEditor();exportData();
  }
  tabs.forEach(tab=>{
    tab.addEventListener('click',()=>setSection(tab.dataset.section));
    tab.addEventListener('keydown',(ev)=>{
      const k=ev.key;
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(k)) return;
      ev.preventDefault();let ix=tabs.indexOf(tab);
      if(k==='ArrowLeft')ix=(ix+tabs.length-1)%tabs.length;
      if(k==='ArrowRight')ix=(ix+1)%tabs.length;
      if(k==='Home')ix=0;if(k==='End')ix=tabs.length-1;
      tabs[ix].focus();setSection(tabs[ix].dataset.section,false);
    });
  });
  document.getElementById('decreaseFont').addEventListener('click',()=>updateFont(fontSize-1));
  document.getElementById('resetFont').addEventListener('click',()=>updateFont(18));
  document.getElementById('increaseFont').addEventListener('click',()=>updateFont(fontSize+1));
  document.getElementById('themeToggle').addEventListener('click',()=>{
    const next=root.dataset.theme==='dark'?'light':'dark';root.dataset.theme=next;
    document.getElementById('themeToggle').setAttribute('aria-label',next==='dark'?'Switch to light mode':'Switch to dark mode');
    document.getElementById('themeIcon').textContent=next==='dark'?'☀':'☾';
    settingsSave('chinHymn11-theme',next);
  });
  document.querySelectorAll('[data-voice]').forEach(button=>button.addEventListener('click',()=>{const voice=button.dataset.voice;visibleVoices[voice]=!visibleVoices[voice];settingsSave('chinHymn11-voices',JSON.stringify(visibleVoices));document.querySelectorAll('[data-voice]').forEach(control=>control.setAttribute('aria-pressed',String(visibleVoices[control.dataset.voice])));render();}));
  document.getElementById('openScan').addEventListener('click',()=>{
    if(typeof dialog.showModal==='function') dialog.showModal();
    else {scanImage.hidden=false;window.open(scanImage.src,'_blank','noopener');}
  });
  document.getElementById('closeScan').addEventListener('click',closeScan);
  dialog.addEventListener('click',ev=>{if(ev.target===dialog)closeScan()});
  document.getElementById('openEditor').addEventListener('click',openEditor);
  document.getElementById('closeEditor').addEventListener('click',()=>editorDialog.close());
  document.getElementById('editorForm').addEventListener('submit',ev=>{ev.preventDefault();saveEditor();});
  document.getElementById('addEvent').addEventListener('click',()=>{const systems=currentLines();const target=systems.at(-1);target.events.push(section==='chorus'?{notes:['','','',''],chorusLyric:''}:blankEvent());editorBody.innerHTML=editorMarkup();});
  document.getElementById('exportEdits').addEventListener('click',exportData);
  document.getElementById('resetEdits').addEventListener('click',()=>{if(window.confirm('Remove all locally saved hymn edits from this device?')){try{localStorage.removeItem(dataStorageKey)}catch{}data=clone(originalData);dataStorageKey='chinHymn11-edits';render();editorBody.innerHTML=editorMarkup();}});
  editorBody.addEventListener('click',ev=>{const button=ev.target.closest('[data-scan-zoom]');if(!button)return;editorScanZoom=Math.max(50,Math.min(250,editorScanZoom+Number(button.dataset.scanZoom)));const image=document.getElementById('editorScan');const caption=document.getElementById('scanZoomCaption');if(image)image.style.width=editorScanZoom+'%';if(caption)caption.textContent=editorScanZoom+'%';});
  editorBody.addEventListener('click',ev=>{const button=ev.target.closest('[data-move-event]');if(button)moveEvent(Number(button.dataset.moveEvent),Number(button.dataset.direction));});
  editorDialog.addEventListener('click',ev=>{if(ev.target===editorDialog)editorDialog.close()});
  document.getElementById('openImporter').addEventListener('click',()=>importDialog.showModal());
  document.getElementById('closeImporter').addEventListener('click',()=>importDialog.close());
  importDialog.addEventListener('click',ev=>{if(ev.target===importDialog)importDialog.close()});
  importScan.addEventListener('change',()=>{importedFile=importScan.files?.[0];if(!importedFile)return;activeScanFilename=`original-hymn-${String(importForm.elements.number.value || 'new').trim()}.${importedFile.name.split('.').pop()}`;activeScanSrc=URL.createObjectURL(importedFile);document.getElementById('scanFileStatus').textContent=`Selected: ${importedFile.name} (${Math.round(importedFile.size/1024)} KB)`;document.getElementById('downloadScan').disabled=false;});
  document.getElementById('downloadScan').addEventListener('click',downloadImportedScan);
  importForm.addEventListener('submit',ev=>{ev.preventDefault();if(importedFile)createImportedDraft();});
  savedDataLoad();
  const savedTheme=settingsGet('chinHymn11-theme','light');
  try { visibleVoices={...visibleVoices,...JSON.parse(settingsGet('chinHymn11-voices','{}'))}; } catch {}
  document.querySelectorAll('[data-voice]').forEach(control=>control.setAttribute('aria-pressed',String(visibleVoices[control.dataset.voice])));
  root.dataset.theme=savedTheme==='dark'?'dark':'light';
  document.getElementById('themeIcon').textContent=root.dataset.theme==='dark'?'☀':'☾';
  document.getElementById('themeToggle').setAttribute('aria-label',root.dataset.theme==='dark'?'Switch to light mode':'Switch to dark mode');
  updateFont(Number(settingsGet('chinHymn11-font','18')));
  setSection(settingsGet('chinHymn11-section','1'),false);
  // Debounced automatic music reflow on rotation, browser resize, and screen changes.
  new ResizeObserver((entries)=>{
    const w=Math.round(entries[0]?.contentRect.width||0);
    if(w && w!==lastWidth){lastWidth=w;clearTimeout(timer);timer=setTimeout(render,90);}
  }).observe(reader);
})();
