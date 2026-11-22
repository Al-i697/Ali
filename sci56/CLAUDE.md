# CLAUDE.md — Separate science site for grades 5 & 6 (Oman, Cambridge-series science)

Arabic RTL, single-file web app «منظومة التحضير الذكي للعلوم — الصفان الخامس والسادس» (lesson-prep generator:
prep sheet per lesson, Word export, floating assistant). It is a SEPARATE site forked from the user's main
chemistry/environment site (`main-site-src/`, reference only — NEVER modify the main site).

## User preferences (apply always)
- Reply in Arabic, concise, no unnecessary questions; pick the best technical option yourself.
- Be usage-conscious: the user stopped a long run because it consumed their usage. Work in SMALL batches
  (one lesson or two per round), build, and tell the user what is ready.
- In science content use «المتغير الضابط» (never «المتغير الثابت»).
- Page header = the three logos of the Ministry template (QMS, Oman Vision 2040, Ministry crest) as one banner image (`LOGO_MOE` in `src/docx_moe.js`); the user supplied this header, it replaces the earlier "no logos" rule. Follow the STUDENT BOOK content (teacher guide + activity book supply activities and model answers).
- When giving the user technical steps in Arabic, put each English term (button names, shortcuts, file names) on its own line.

## Setup (once, on the user's machine)
```
python3 setup.py
```
It rewrites the hard-coded `/home/claude/work` paths in `site/tools/*` to this checkout and points `fork_sci.py` to `main-site-src/`.
Needs: python3, node (for `check.sh`), and for tests/screenshots: `pip install playwright && playwright install chromium`.
Book PDFs are NOT included (215 MB). OCR text of all six books is included (`ocr_*`). To view page images, put the PDFs in `src_pdf/`
named `sb6.pdf tb6.pdf ab6.pdf sb5.pdf tb5.pdf ab5.pdf` (sb = student book, tb = teacher guide, ab = activity book) and use `pdftoppm -r 80 -f N -l N -png`.

## Layout
- `site/app_base.html` engine/UI (forked; change only if the engine must change; `site/tools/fork_sci.py` re-forks from the main site base).
- `site/data/sci6_s1_u<unit>_l<n>[b].py` one file per prep sheet (authored content). `site/data/lib/scilib.py` authoring API.
- `site/src/docx_moe.js` the Word export in the Ministry of Education prep template (2 pages: header/schedule/outcomes/strategies/execution/resources, then formative/enrichment/closing/homework/teacher notes; three-logo banner). `tools/fork_sci.py` splices it over the main site's DOCX builder, so edit THIS file (not `app_base.html`), then run `python3 tools/fork_sci.py && python3 tools/build.py`. Check by exporting with the Word button and converting with `soffice --headless --convert-to pdf`.
- `site/src/paper_moe.js` + `site/src/paper_moe.css` the sheet shown in the site (screen, A4 preview, print) in the same Ministry template: `formHTML`, `measureFlow`, `pageBreaks`. Spliced over the main site's paper by `tools/fork_sci.py` (edit these, not `app_base.html`). The execution table is ONE row that the browser splits across pages (like Word); `pageBreaks` predicts the cuts column by column so the preview markers and `tests.py --pages` (real vs estimate) agree. `tools/layout.py` is obsolete (old layout).
- `site/tools/build.py` merges base + data (+ src/assistant + vendor) into `site/app.html` and validates everything.
- `site/server/` Cloudflare Worker for the assistant (server mode so the assistant works for everyone). Deployment guide for the main site: `deploy/دليل-نشر-الموقع.md` (same pattern: index.html + `_worker.js`).
- `ocr_*/pNNN.txt` OCR per PDF page; `./rd.sh <sb6|tb6|ab6|sb5|tb5|ab5> <first> [last]` prints cleaned text. OCR is noisy (digits/letters garbled): confirm numbers and answers visually on the page image when it matters.
- `PROGRESS.md` workflow + exact state + the next lessons' plans. READ IT FIRST.

## Build / test
```
cd site
python3 tools/lint_titles.py      # phase titles > 18 chars
python3 tools/build.py            # -> app.html ; expect "injected: {'sci6/s1': N}"
bash tools/check.sh               # "syntax ok" (main script must be the LAST <script>)
python3 tools/tests.py --pages    # page counts (2-3 print pages), mobile width, page errors
python3 tools/asst_test.py        # assistant tests (asst_test2..6 optional)
python3 tools/shot.py site/app.html 'sci6~3-1' out_prefix   # screenshots *_d.png / *_m.png
```
Lesson URL hash: `#sci6~<unit>-<n>` (split sheets `#sci6~3-1b`).

## Content rules (enforced by build.py; violations fail the build)
- Period = 40 minutes. ONE continuous execution table per sheet with per-period opener band (prior learning + warm-up) and closer band (exit/formative question, answer, criterion).
- Print = 2–3 pages (three-period lessons print 4 pages in the Ministry template). Lessons with > 3 periods are split into sheets of 2–3 periods: keys "1","1b" (same `code`), titles "…: أ. …" / "…: ب. …".
- Every period sums to 40 min and has at least one row tied to an objective; every objective is covered by some row. Total minutes = periods × 40.
- Row 1 of a sheet = `R("التمهيد", …)` with q = warm.question and ans = warm.expected, objs `[]`. Last row = `R("الختام","بطاقة الخروج",5,[],…)` whose q/ans equal `exit`.
- Periods ≥ 2 start with `OPEN(…)` (5 min, no objectives); non-last periods end with `CLOSE(…)` (5 min, no objectives).
- Phase title ≤ 18 characters (except «تعلم قبلي وتمهيد» and exit-ticket rows). Formative questions unique within a sheet.
- Warnings only (not errors): teacher item > 150 chars, q+ans > 125 chars.
- Authoring API: `from scilib import *`; `Unit("sci6", semester, unitNum, "الوحدة …: …", "short").lesson(key, title, code=, objectives=[(code, text, [(t45, t90, teacher, student, eval)])], periods=[[rows]], prior={items, technique, qs:[{q,a}]}, warm={stimulus, question, expected}, exit={q,a,crit}, homework, support, enrich, resources, strategies, lab, misconception, guideAnswers)`.
  Rows: `R(phase, strategy, minutes, [objective indexes], [teacher items], [student items], tool, q, ans, criterion)`, `OPEN(teacher, student, q, ans, crit)`, `CLOSE(...)`. File ends with `DB, AUTHORED, PERIODS = U.DB, U.AU, U.PER`.
  Copy any existing file (e.g. `site/data/sci6_s1_u3_l1.py`, `…_l1b.py`) as the template.
- Objective codes: content `6Be1–6Be6` (environment), `6Bh*` (human body), `6Cc1–6Cc5` (material changes; see PROGRESS.md), inquiry `6Eo1..9`, `6Ep1,2,3,4,5,6,7` (see wording used in existing files; reuse the exact Arabic wording).

## Where things stand
See PROGRESS.md. Summary: grade 6 semester 1 — Unit 1 (جسم الإنسان, 10 sheets) and Unit 2 (الكائنات الحية في البيئة, 14 sheets) are DONE and published;
Unit 3 (تغيّرات المادة) is in progress: 3-1 … 3-5 are authored (build passes, 33 sheets total; 3-4 follows the teacher's handwritten plan) but NOT yet published; then grade 5 semester 1;
semester 2 books of both grades were not provided yet.
Published copy lives at a claude.ai Artifact (https://claude.ai/artifact/18gjGusRxhFqcvp7s3vQjN) — it can only be updated from a claude.ai session;
from Claude Code deliver `site/app.html` (single file) to the user instead, or deploy it with the worker guide.
