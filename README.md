# Chin Hymnbook — Digital Tonic Sol-fa Project

> **Current deliverable:** Hymn #11 mobile-reader prototype, **Version 2 (compact)**.  
> **Long-term scope:** Digitize **all 516 songs** in the Chin Hymnbook into accurate, editable, responsive musical data, then publish as a mobile-first hymnbook and printable edition.  
> **Project status:** Working layout prototype; **NOT a verified musical transcription**. Do not use the unproofread transcription as an authoritative edition.

---

## 1. Project mission and background

We are digitizing the user's 516-song Chin Hymnbook. The older scanned PDF is poor quality. New, high-resolution smartphone scans will become the archival source. The objective is **not** to make 516 photographs or PDFs that must be pinched and panned on a phone. Each song should be transcribed once into a **structured, editable, machine-readable Tonic Sol-fa score**. That single master record will drive multiple outputs:

1. **Mobile hymn reader**, responsive, legible without pinch-zooming; vertical scrolling is fine.
2. **Web/desktop reader** with the same musical information and optional larger line lengths.
3. **Hymn Studio/editor** displaying the source scan beside editable musical events and lyrics.
4. **Print/PDF export** preserving a professional traditional hymnbook appearance.
5. Later: an installable **offline PWA**, full hymn search, bookmarks, favorites, Bible/scripture reference lookup if appropriate, and **SATB audio/choir practice** once the musical timing is verified.

The user is comfortable with HTML/CSS/JavaScript, Firebase, web applications, and AI-assisted development and intends to continue the project **in VS Code with an AI coding agent**. Prefer understandable, modular code and safe incremental changes over one-off visual mockups.

### What the user approved in prior iterations

- Modern, clean interface, but its musical layout must follow the **original printed Chin hymnbook**.
- Use **one selected section at a time**: `Verse 1`, `Verse 2`, `Verse 3`, `Verse 4`, `Nolhnak`. **NOLHNAK means chorus**, and is **a separate tab**, not appended after a verse.
- The **selected lyric line stays between the voice pairs**, exactly this order:

  ```text
  S   soprano Tonic Sol-fa
  A   alto Tonic Sol-fa
      [ONE selected verse's lyric syllables, aligned to the notes]
  T   tenor Tonic Sol-fa
  B   bass Tonic Sol-fa
  ```

- There are **four musical parts** (S/A/T/B), not just two; **all four are visible** by default.
- Keep hymn metadata (hymn number, category, title, original/English name, key/Doh, writers, scripture, source, arranger, book page), but **as compact as in the printed document**, not inside a tall metadata card.
- **No horizontal panning when singing.** Break music into additional readable visual lines according to the phone's width. Scrolling **down** is acceptable when the selected section is taller than the screen. Font size must remain adjustable.
- Use the phone screen efficiently: **avoid large, mostly empty rectangular music cards**. Respect the alignment of rhythm, voice parts, and lyric syllables when reflowing.
- The reader has verse tabs, font controls, a dark/light switch, and an original-scan comparison viewer.

### Non-negotiable musical principles

1. **Musical accuracy wins over cosmetic symmetry.** A visually beautiful but wrong note, rhythm, barline, octave mark, lyric, or measure break is unacceptable.
2. Never change or fabricate note values to fill the screen or match a design image.
3. S/A/lyric/T/B elements for the same musical instant must remain **vertically aligned** when breaking a line.
4. Do **not** pretend to know a syllable's exact note if the source scan does not establish it; mark uncertain data for human review.
5. Keep **original high-resolution scans** even after cleanup. Make correction/review history reversible.
6. Separate **source/master data** from **renderers**. No song should need its own hand-coded HTML layout.

---

## 2. Current project status — what exists versus what is planned

### Implemented in this prototype (Version 2)

- Hymn **#11 — KA THLARAU NGAI TUAH!** with its available SATB transcription.
- Compact header including: `11`, `Thangthatnak`, `Hark, Hark! My Soul!`, `F. W. Faber (1814–1863)`, `Doh: D`, `Heb. 1:14`, `S.S. 231`, `Page 12`, and arrangement credits for `C. C. Converse & Ira D. Sankey`.
- Separate verse tabs **1–4** and **Nolhnak**.
- Layout rows exactly **S → A → selected lyrics → T → B**.
- Adaptive reflow of *entire musical events*, rather than scaling the scanned printed page.
- **Balanced line breaks** (dynamic programming) to reduce wasted right-side whitespace while **preferring measure boundaries**; may split at an individual aligned-event boundary if necessary. No false barlines are inserted.
- A **continuous, lightly separated score sheet** in place of isolated full-width cards. Small, controlled horizontal spacing expansion helps use available space naturally.
- Font-size adjustment, light/dark toggle, scan viewer, section selection, and persisted user preferences (where localStorage is available).
- Single self-contained HTML demo plus the editable individual source files.
- Browser smoke tests for viewport widths **320, 375, 390, 430, 768 px**: no page-level horizontal overflow in current test fixtures.

### Not yet implemented — DO NOT present these as working

- **Authoritative, musician-approved transcription** of hymn 11 or the other 515 hymns.
- A working editor for note/lyric data (editing is currently in JSON only).
- OCR/AI song importing, scan quality scoring, or a proofreading workflow.
- Firestore database, users/roles/authentication, cloud sync, or moderation.
- Installable/offline-cache-managed PWA, hymn catalog/search, favorites, or multiple hymns.
- Reliable musical timing model, MIDI/audio playback, instrument selection, individual SATB playback, transposition.
- Export to paginated book-quality PDF/DOCX/PPTX from the structured master data.
- Automatic detection of lyric-to-note underlay for verse 4.

**Important accuracy warning:** The content in `hymn11.json` was extracted from an **earlier manually reconstructed SVG based on the user's smartphone scan**. It was NOT derived from a verified music OCR engine. All four voices, rhythm markings, barlines, punctuation, and Hakha Chin lyrics must be compared to the original scan by a qualified proofreader. **Verse 4 appears as a separate lyric stanza in the printed scan** and the `verse4` field is **provisionally distributed across note events**; do not assume its alignment is correct. The chorus starts explicitly at **NOLHNAK** in the original scan.

---

## 3. Folder and file guide

```text
Chin_Hymnbook_Hymn11_v2/
├── README.md                   ← Project brief, architecture, roadmap, agent handoff
├── AGENTS.md                   ← Quick coding-agent rules (see README for details)
├── index.html                  ← Semantic HTML; compact header, tabs, score, dialogs
├── styles.css                  ← Responsive screen layout, music rows, dark mode
├── app.js                      ← Renderer, line-wrapping algorithm, tabs, controls
├── hymn11.json                 ← EDIT THIS for hymn 11 musical/lyric corrections
├── hymn11-data.js              ← GENERATED copy: window.HYMN11 = {...}
├── original-hymn-11.jpg        ← Reference smartphone scan; preserve as received
├── sync_hymn_data.py          ← Regenerate JS from master JSON (single source of truth)
├── build_single.py             ← Generate self-contained offline HTML for quick testing
├── test_browser.py            ← Viewport, layout, tab/controls Playwright smoke checks
├── preview_v2_*.png           ← Automatically captured QA screenshots
└── legacy_svg_import.py       ← Historical one-time import script; not a general OCR

Chin_Hymn_11_Mobile_Reader_v2.html  ← Standalone output (in parent directory)
```

The standalone HTML is a **build artifact** for sharing. **Never edit it manually.** Modify `index.html`, `styles.css`, `app.js`, or `hymn11.json`, then rebuild. `hymn11-data.js` is generated from `hymn11.json`, not a second manual database.

The legacy SVG importer and its input SVG are included under `reference/` for historical provenance. The importer is **not part of the runtime** and should **not** be used on corrected songs (it overwrites the JSON). It is not a general scanning/OCR pipeline.

---

## 4. Get running in VS Code

### Fastest path (no Node.js required)

1. Unzip the source bundle and open the **`Chin_Hymnbook_Hymn11_v2` folder** in VS Code.
2. Open `index.html` with the **Live Server** extension, or open a terminal in that folder:

   ```bash
   python3 -m http.server 8000
   ```

3. Visit `http://localhost:8000` in your browser. Use Chrome/Edge DevTools device emulation or Safari Responsive Design Mode.
4. To open it from a smartphone on the same Wi-Fi, you can host via your computer's LAN address if your firewall/network permits. For testing on real iPhones and Android phones, an **HTTPS static host** such as GitHub Pages or Netlify is often more reliable; mobile preview apps sometimes show HTML as inert text.
5. To distribute a **single offline HTML file** after editing:

   ```bash
   python3 sync_hymn_data.py
   python3 build_single.py
   ```

   The result is `../Chin_Hymn_11_Mobile_Reader_v2.html`.

### Edit from the reader (development admin mode)

The **Edit** button opens an editor for the hymn header plus every visible aligned
musical event: soprano, alto, tenor, bass, and the selected verse or chorus lyric.
It currently has no login or permission check, as requested for development.

**Save changes** keeps a device-local draft in the browser and redraws the score;
font zoom and theme settings remain separate. This is useful for immediate review,
but a static browser page cannot write to a project file on the computer. To make a
draft permanent in the source code, use **Export JSON**, replace `hymn11.json` with
the downloaded file, then run `python3 sync_hymn_data.py`.

### Start a new hymn from a scan

Use **New hymn** in the reader to select a high-resolution JPG, PNG, or WebP scan
and enter its basic metadata. The importer preserves a downloadable scan copy and
creates/downloads a JSON draft with explicit `draft-needs-proofreading` status and
review flags. It creates only blank, aligned SATB/lyric events: it does not claim to
read tonic-sol-fa notation automatically. In the editor, use **Add event** while
transcribing and checking each entry against the scan. Put the exported JSON and
scan into a new hymn folder, then run the data sync/build step for that song.

### Make a musical-data change from source

1. Change **`hymn11.json`** (do not edit `hymn11-data.js` independently).
2. Run:

   ```bash
   python3 sync_hymn_data.py
   python3 build_single.py
   ```

3. Refresh the live browser (or reopen the standalone HTML).
4. Compare **every affected note and lyric** with `original-hymn-11.jpg`.
5. Run the browser smoke tests before accepting the change.

### Automated browser checks (optional development dependency)

```bash
python3 -m pip install playwright
python3 -m playwright install chromium
python3 test_browser.py
```

The tests verify mobile widths, header height, horizontal overflow, rendering, the Nolhnak tab, Verse 4 warning, font controls, theme, and scan dialog. This **does not verify musical correctness**. For automatic screenshot review, inspect the generated `preview_v2_390.png` and `preview_v2_chorus_390.png` too.

### Recommended initial VS Code tasks

- Get the existing demo running **unchanged** and compare with the provided screenshot.
- Open `app.js` and understand `lyricFor`, `preferredWidth`, `reflowEvents`, `makeLine`, `render`, `setSection`, `updateFont`.
- Compare the original scan and `hymn11.json` side by side. Create a note/lyric correction checklist; **do not invent corrections**.
- Add useful unit tests before major refactors, especially for reflow and event alignment.

---

## 5. Current notation schema (prototype / v1)

The file `hymn11.json` is a **structured reading prototype**, not yet a complete symbolic music interchange format. Example (illustrative field subset from this project):

```json
{
  "number": 11,
  "title": "KA THLARAU NGAI TUAH!",
  "englishTitle": "Hark, Hark! My Soul!",
  "category": "Thangthatnak",
  "key": "D",
  "verses": 4,
  "chorusLabel": "NOLHNAK",
  "verse4NotUnderlaid": true,
  "verseScore": [
    { "sourceSystem": 1, "events": [
      { "notes": ["m", "d", "s", "d"],
        "lyrics": ["Ka", "Hla", "Lamlha-"],
        "bar": true, "verse4": "Ngaihchiatnak" }
    ]}
  ],
  "chorusScore": [
    { "sourceSystem": 4, "events": [
      { "notes": ["s", "d", "m", "d"], "chorusLyric": "Biakam" }
    ]}
  ]
}
```

The above **sample is explanatory**, not a complete score or a statement that every displayed event is musically verified; consult the actual JSON and source scan.

**Current field contracts:**

| Field | Meaning |
|---|---|
| `verseScore` | Ordered printed-source systems for the shared verse melody. Renderer concatenates and reflows their events. |
| `chorusScore` | Ordered events for the **NOLHNAK** chorus only, not attached to a verse. |
| `events[]` | A synchronized vertical column containing four voice tokens and selected verse lyric(s). |
| `notes[0]` | Soprano token (S). |
| `notes[1]` | Alto token (A). |
| `notes[2]` | Tenor token (T). |
| `notes[3]` | Bass token (B). |
| `lyrics[0..2]` | Lyric syllables for printed verses 1, 2, and 3 (only one displayed). |
| `verse4` | **Provisional** lyric association, NOT verified underlay; mark as needing review. |
| `chorusLyric` | Chorus/NOLHNAK lyric text for the corresponding event. |
| `bar: true` | An **actual barline before** this event as interpreted from the transcribed source. Wrapping alone must never set `bar`. |
| `sourceSystem` | Original printed line/system reference for proofreading, not required to remain a visual line on mobile. |

A musical event must never be split across visual lines. A lyric syllable and the S/A/T/B tokens in the same event travel as **one atomic vertical column**.

### Preserve original notation semantics

Tonic Sol-fa symbols can include `d r m f s l t`, `:`, `.`, `,`, prime marks/apostrophes, digits/subscripts, rests, sustained-note dashes, barlines, and potentially other signs in other hymns. **Do not normalize or strip punctuation** casually: for example `.,r`, `r`, `r'`, `r₁`, `.r`, and `:r` can convey different musical information. Do not “simplify” symbols just because they look unusual in a web font. Verify the book's exact conventions with a knowledgeable reader. Preserve Unicode consistently (UTF-8).

### Why this schema must evolve

The prototype stores printed symbol strings but **not verified rhythmic durations or exact musical timing**. A robust 516-hymn engine should have stable event IDs, phrase/measure IDs, musical beats/ticks, note/voice details, original-symbol fidelity, verse-to-event lyric alignment, uncertainty/proofreading annotations, revision history, and flexible time signatures/keys where applicable.

Proposed *direction*, not an implemented schema:

```ts
type Voice = 'S' | 'A' | 'T' | 'B';
type ReviewState = 'draft' | 'needs-review' | 'verified' | 'published';
interface SolfaEventV2 {
  id: string;
  measureId: string;
  positionTicks: number | null; // null until timing proofread
  durationTicks: number | null;
  voices: Record<Voice, { printedToken: string; parsedPitch?: unknown }>;
  lyricBySection: Record<string, string>; // e.g. "verse1" -> "Ka"
  source: { scanId: string; system: number; crop?: [number,number,number,number] };
  review: { state: ReviewState; notes?: string };
}
```

**Do not migrate all data blindly.** First validate several simple/complex hymns, including pickup measures, slurs/ties, unusual notes, lyric melisma, changing harmony, and repeat endings; then version the schema and write an explicit migration. Keep `printedToken` so the traditional score can be reproduced exactly even if a parsed symbolic representation is also available.

---

## 6. How the mobile renderer works today

Read `app.js` in this order:

1. **`currentLines()`** chooses the independent verse/chorus score.
2. **`lyricFor(event)`** selects Verse 1/2/3/4 or chorus text **without changing the shared notes**.
3. **`preferredWidth(event)`** uses canvas font measurement to determine the minimum readable horizontal space for the longest of the four notes and selected lyric.
4. **`lineCapacity()`** computes width available after voice labels, padding, and borders.
5. **`reflowEvents(events, cap)`** performs a small **dynamic-programming line-break optimization**. It minimizes aggregate unused line space, favors breaks before `bar: true` events, and accepts non-barline breaks at complete musical-event boundaries when necessary. It does **not** insert musical barlines.
6. **`makeLine()`** produces S/A/lyrics/T/B rows and preserves original `bar` markings. A limited 17% maximum expansion of columns makes normally full lines more even, without stretching short lines all the way across.
7. **`render()`** rebuilds the selected score whenever the tab or font size changes.
8. A **ResizeObserver** reruns line breaking on width changes/phone rotation.

### Layout constraints for future edits

- **Preserve the row order:** 2 voices on top; lyrics; 2 voices below.
- **Never use `justify-content: space-between` on arbitrary notes** if it would destroy shared timing columns. The whole event element gets a calculated width; all its rows share that same column.
- Do not reintroduce a fixed width, scaled original-page image, or a horizontally scrolling notation canvas as the default reading mode.
- **Do not create a visual barline just because an event begins a wrapped line.** Original bars are musical data; visual line breaks are layout.
- The last line can be shorter than the others; don't distort it just to look full.
- Reflow should prefer measure ends, but may break at aligned event boundaries when necessary on small screens. For a production-quality notation engine, phrase/rhythm-aware constraints should improve these rules.
- Treat very long lyric syllables and unusual symbols as test cases. Do not clip them, replace them with ellipses, or sacrifice note correctness to hide overflow.
- Keep layout legible at common 320–430px portrait widths and test browser font rendering on **both iOS Safari and Android Chrome**.
- Ensure enlarged text (A+) still keeps S/A/lyrics/T/B in the correct order and on the same x-columns.

### Current UI layout pieces

- `.masthead` / `.credits`: very compact heading and writer/key/source information.
- `.tabs-wrap`: sticky selection controls so users can switch verses or chorus while singing.
- `.score`: **one continuous sheet** with thin dividers; avoids big empty card rectangles.
- `.music-line`, `.voice-labels`, `.event-group`, `.event`: main score layout.
- `.footer-tools`: compact sticky A− / Aa / A+, theme, scan buttons.

---

## 7. Smartphone scanning plan (516 hymns)

The existing full-book PDF is low quality. The user intends to rescan the physical book with a smartphone (hymn 11 scan is an example). Establish a repeatable capture pipeline **before** scanning hundreds of pages:

1. **Capture:** Use a stable overhead phone mount; camera parallel to paper; even diffused lighting on both sides; avoid curvature, glare, shadows, and motion blur. Use the main high-resolution camera. Capture page edges and reference numbers.
2. **Archive raw files:** Save the highest-quality **original full-color photo**, untouched. An aggressive black-and-white filter can erase tiny dots, commas, prime marks, and note markings.
3. **Derivative processing:** Make a separate cropped, deskewed, gently contrast-corrected copy for recognition. Never overwrite the raw scan.
4. **Page metadata:** Record book/edition, print page number, hymn numbers on that page, scan date, and any cropped/missing areas. One physical page may contain parts of more than one song.
5. **Quality gate:** Confirm small Sol-fa symbols remain identifiable when zoomed; redo unclear pages immediately.
6. **Recognition:** Use OCR/AI to **propose** metadata, lyrics, musical tokens, and coordinates. Recognized items must carry confidence/uncertainty information. Ordinary OCR is insufficient to safely interpret every four-part music alignment.
7. **Structured reconstruction:** Convert proposals into the reviewed versioned score format (never direct HTML-only output).
8. **Two-stage review:** Text/spelling review + musical SATB review by someone able to read this notation. Keep a side-by-side original scan reference and record corrections.
9. **Publish:** Only publish approved versions. Retain originals, derivative scans, the structured record, and audit history.

Suggested stable IDs: `hymn-001` ... `hymn-516`, with source-page IDs independent of hymn numbers. A scan/page should be able to link to multiple songs and each song to multiple pages.

### Important review cases

- Dots vs dirt/speckles, commas/subscripts, apostrophes/prime signs, barline placement, ties, rests, rhythm dots, octave distinctions, lyric hyphenation, slurs, chorus entrances.
- A verse printed **without note-by-note underlay** (as with hymn 11, verse 4).
- Songs where different verses have different syllable counts or musical underlays.
- Songs with multiple choruses, repeated passages, alternative endings, or unusual choir voicings.

---

## 8. Planned architecture for all 516 hymns

**Current prototype remains lightweight vanilla HTML/CSS/JS.** Do not rebuild it immediately just because the long-term platform may use a framework. First prove a correct rendering/data model and editor workflow for representative songs.

**Recommended long-term stack (proposal, not installed here):**

| Layer | Candidate | Reason |
|---|---|---|
| Reader UI | React + TypeScript (Vite) | Scalable multi-hymn UI; editor can reuse components |
| Notation renderer | Pure layout engine + HTML/CSS/SVG | Independent, testable musical reflow; accessible text |
| Styling | CSS variables, optionally Tailwind | Maintain compact print-like style and themes |
| Master records | Versioned JSON/typed schema | One source for mobile, print, and editor |
| Data store | Firestore or equivalent | Hymn catalog, revisions, review states, metadata |
| Scan storage | Object storage (e.g. Firebase Storage) | Preserve raw and processed images separately |
| Authentication | Firebase Authentication + Security Rules | Separate readers, editors, and approvers |
| Offline | PWA service worker + IndexedDB | Explicit complete-hymnbook download and version checks |
| Recognition | Pluggable OCR/AI import service | Proposals, not unverified automatic publication |
| Audio (later) | Structured beat-accurate score + MIDI/synthesis | Voice playback only after correct timing |
| Print (later) | Independent paginated layout renderer | Book PDFs, page numbers, headers, TOC |

### Recommended long-term separation

```text
apps/
  reader/              # Mobile-first public reader (web/PWA)
  studio/              # Login, scan comparison, transcribe, proofread, publish
packages/
  notation-model/      # Versioned data types, schema validation, parser
  solfa-layout/        # Pure musical columns, measure/phrase line breaking
  solfa-renderer/      # Screen DOM/SVG presentation
  print-renderer/      # Paginated/PDF hymnbook edition
  import-pipeline/     # Scan ingestion, AI proposals, uncertainty markings
shared/
  fixtures/            # Hymn 11 plus diverse verified sample hymns
  tests/               # Reflow, symbol preservation, music/lyric assertions
```

Do **not** commit API keys, service-account credentials, or private admin secrets into web source. For AI recognition, any sensitive or paid service calls belong behind secure server-side endpoints. Implement appropriate authorization for edits, approval, and publishing. Confirm necessary rights for Chin translations/arrangements before public distribution.

---

## 9. Roadmap with concrete acceptance criteria

### Phase 0 — Current compact reader layout (done, pending user phone review)

- [x] Reduce header/metadata height.
- [x] Preserve writer/key/scripture/arrangement/source/page.
- [x] Reflow music by vertically aligned S/A/lyric/T/B events.
- [x] Reduce obvious empty right-side music-card space.
- [x] Keep separate verse and Nolhnak tabs.
- [x] Run initial multi-width browser smoke checks.
- [ ] Obtain **user feedback from a real phone** (especially iOS Safari if used).
- [ ] Validate hymn 11 music/lyrics with qualified human review.

### Phase 1 — Correct musical model + notation engine

- [ ] Thoroughly proofread all existing hymn 11 data against the original scan.
- [ ] Define versioned event/measure/rhythm/tie/underlay schema.
- [ ] Create fixtures for long words, single long measures, differing verse lengths, repeats, dotted tokens, narrow screens, and large font sizes.
- [ ] Make layout function pure and unit-testable; produce deterministic breaks at the same width/font.
- [ ] Preserve actual rhythm, octave punctuation, braces/barlines, and musical semantics.
- [ ] Introduce data-driven metadata rather than repeating hymn 11's fixed header HTML.

### Phase 2 — Visual transcription/editor (first 10–15 songs)

- [ ] Side-by-side scan and notation on desktop, including zoom and scan-region highlights.
- [ ] Edit individual S/A/T/B tokens, lyrics, barlines, and metadata while retaining alignment.
- [ ] Flag low-confidence entries and mark provisional underlays clearly.
- [ ] Autosave drafts, revision history, audit/undo, and reviewer approval workflow.
- [ ] Demonstrate accurate rendering of multiple differently structured hymns.

### Phase 3 — Entire catalog and offline reader

- [ ] Ingest all 516 source hymns through a repeatable queue.
- [ ] Song navigation by hymn number, title, original/English lyrics, and categories.
- [ ] Search, favorites, next/previous hymn, memorized preferences.
- [ ] Download **all verified notation data** explicitly for dependable offline use.
- [ ] Screen-awake option, accessible reading controls; optional auto-scroll.
- [ ] Confirm reader performance on low-end phones and during real singing.

### Phase 4 — Publishing and music features

- [ ] Print-ready hymnbook PDF, index, contents, cover, and edition/version info.
- [ ] Optional individual song Word/PowerPoint exports where practical.
- [ ] MIDI/part playback **only** after correct beat/duration transcription.
- [ ] Quality metrics: scanned, transcribed, reviewed, approved, published totals.

### Definition of done for an individual song

1. Raw scan archived and traceable.
2. Metadata and complete lyric spellings proofread.
3. Every note/voice/rhythm symbol/bar verified against source.
4. All verses and chorus correctly separated; lyric underlay verified or marked unresolved.
5. Usable 320/375/390/430px + tablet/desktop layout without page-level horizontal scroll.
6. Print preview faithful enough to the book's notation conventions.
7. Approved by designated reviewer with date/version record.
8. Available in offline data package, with scan and revision history retained.

---

## 10. Specific instructions for the VS Code AI coding agent

Use the following priorities when modifying this repository:

1. **Read this whole README and `AGENTS.md` before editing.** Begin each task by stating what will change and which musical invariants may be affected.
2. **Preserve ALL four SATB voice rows and verse-to-event alignment.** Do not visually optimize by dropping T/B or combining notes from different events.
3. **Only make requested, reviewable changes.** Favor small diffs in `styles.css` for styling requests, `app.js` for reflow/interaction requests, `hymn11.json` for user-verified transcription corrections.
4. **Never silently 'correct' the original Chin lyrics or notation** from guesses, AI image-generation mockups, or conventional Western hymn versions. Ask the human proofreader when uncertain; add an explicit review flag.
5. **No hard-coded hymn-specific layout rules** for future imports. Long-term renderer should be entirely data driven.
6. Do not edit compiled standalone HTML or generated `hymn11-data.js` by hand. Regenerate them.
7. Maintain accessible buttons, sticky tabs/footer, light/dark mode, original scan viewer, and reading-size preferences.
8. **After each layout change**, run screenshots at 320/375/390/430 px and a tablet size. Inspect for clipping, sideways scroll, tiny font, large unused card areas, and incorrect note/syllable alignment.
9. **After data changes**, compare with the original scan and clearly label anything not verified. Running unit tests is not enough to validate music.
10. Prefer a simple working local project now; only introduce React, Firestore, OCR services, or substantial dependencies after confirming the current reader and model meet the user's needs.
11. Preserve the distinction: *a chorus tab labeled Nolhnak* is **not** a fourth voice, and *verse 4* is its own verse with provisional lyric alignment.
12. Update the README's status/roadmap when you complete a real feature. Do not mark proposals as implemented.

**Suggested first agent prompt:**

> Read `README.md` and `AGENTS.md` fully. This is a 516-song Chin Tonic Sol-fa digitization project. Start from the working hymn-11 v2 prototype. Verify it launches and inspect it at a 390px phone viewport. Do not alter or invent musical content. My next change request is: [INSERT REQUEST]. Preserve the compact header, separate verse/Nolhnak tabs, and S/A → selected lyrics → T/B alignment. Explain the intended change, make the smallest reasonable edit, run browser checks, and report any unresolved notation issues.

---

## 11. Known limitations / follow-up questions

- Notation is **unverified**; treat the source scan as the reference, not the earlier AI-created presentation illustrations.
- Verse 4's lyrics were printed separately and its alignment has not been confirmed.
- The current balanced layout may break a measure at a synchronized **event boundary** to avoid a large empty region. This is a visual layout decision, not a change to the musical meter; more advanced phrase-aware rules are future work.
- `canvas.measureText()` approximates glyph widths, which can differ slightly by device/font. Test iOS, Android, and font zoom after every significant change.
- A standalone local HTML file can be opened offline on some devices, but iOS file preview apps may not execute its JavaScript. Static HTTPS hosting is the recommended phone-testing workflow.
- No automated audio generation should happen until pitches and durations are validated.
- Future copyrights/permissions for translated lyrics and arrangements should be reviewed before public release.

### Success criteria for the overall project

A person opens any of the **516 hymns**, sees a compact original-style title and credits, taps **one verse or NOLHNAK**, and can comfortably sing while reading **all four correctly aligned Sol-fa parts** on their phone **without horizontal zoom/panning**. The same verified master score can also be edited, reviewed, exported to print, searched, and used offline. The underlying scanned evidence and every published revision remain traceable.
