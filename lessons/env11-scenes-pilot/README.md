# Scene-style explanation slides: pilot (env-sci 11, lesson 3-2)

Why: the teacher prefers explanation slides in the style of illustrated infographics (one large scene per concept, labelled parts), not text cards.
Nothing in `lessons/env11-3-2-feeding/` was changed.

## Files
- `scene1-thermocline.html`: one scene, drawn in code (SVG + CSS motion), click by click.
  Lead-in question, then 5 steps: photic zone, warm/cold water and the thermocline, nutrients below the barrier, the balance (light above, nutrients below), and a still-vs-mixed comparison (tropics vs upwelling / polar summer).
  Labels are real Arabic text from the student book (pp. 93-94). The drawing, the balance and the comparison toggle are marked "من عندي" in the teacher note.
  On a portrait phone the stage is turned on its side so the text stays readable.
- `scene2-chemosynthesis.html` (built from `scene2.src.html` + `vent.webp` by `build_scene2.py`): second pilot in the look of the teacher's infographic images. The vent illustration is cropped, text-free, from one of the slides he sent (no logo/watermark in the crop); the ribbon cards, molecule and bacteria icons and the text (student book pp. 93-94) are ours.
- `deck.html` (built from `deck.src.html` + `art/*.webp` by `build_deck.py`): a small deck engine for the infographic-style slides, with the first four slides using the teacher's ChatGPT art: factors of primary productivity (6a), chemosynthesis (7a), tropical vs upwelling (8a), the fate of sunlight (9a). Slide kinds: full-bleed scene with labels and leader lines, or illustration beside ribbon cards. Each has a lead-in question, click-by-click steps, a teacher note. Slides so far (7): factors, chemosynthesis, tropical vs upwelling, fate of sunlight, algal bloom (zoom on the four panels of 8b), predation (4a + prey/predator adaptation tiles from 4b), energy equation C=P+R+F+U (tiles cut from 10a). Not used: 3b (its arrows run the wrong way: needs regenerating, see the notes to the teacher).
- `art/`: the accepted generated images (1a, 2a, 3a, 4a, 5a, 6a, 7a, 8a, 9a, 10a). Icon sheets are transparent PNG.
- `prompts.html`: ready-to-copy prompts (shared style + 9 scenes, two icon sheets) for an image tool. The images must contain no text; the Arabic text is added by us in code so it stays correct.

## Plan if the pilot is approved
1. The teacher generates text-free scenes with the prompts (or we keep the code-drawn scene) and sends them.
2. Each scene becomes a lesson slide: image as the explanation scene + hotspots + labels that appear click by click.
3. The first scene replaces `factors`/`photic` points in the lesson only after approval.

## Checks done
Playwright: question (wrong/right), 5 steps, mixed toggle, back, keyboard, note panel, no JS errors; chips stay above the caption bar; portrait and landscape phone sizes.
