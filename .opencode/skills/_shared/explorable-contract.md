# The Explorable Contract (v2)

Binding spec for every HTML artifact Engram generates (enforced by the artifact-smith agent; spot-checked by /coach). An artifact that fails any clause is a defect, however beautiful. Rationale: Mayer's multimedia principles + ICAP + the mnemonic medium (`docs/01-foundations.md` P6; `docs/02-prior-art.md` §C) — audited and sharpened by the verified evidence pass in `docs/06-visual-encoding.md` (P15: guidance inside the artifact is the active ingredient; interactivity is spent on cognition, never navigation).

## The seven clauses

1. **Prediction gate.** The artifact opens with a question the reader must commit to (click, slider, typed guess) before the core content unlocks. No commitment → no reveal.
2. **Guided manipulable model.** At least one interactive model (slider/drag/toggle) of the concept's causal structure, exposing only the content-relevant degrees of freedom — and wrapped in the **predict → act → explain** micro-cycle: the reader predicts its behavior *before first touch*, and after a meaningful manipulation is asked one self-explanation line ("why did that happen?", answer hidden until attempted; self-explanation g = 0.46). **Scaffold gate:** at scaffold level *novice*, the model opens with one **worked drive** — a demonstrated run stepped under "what happens next?" gates — before free manipulation unlocks; at *comfortable*, manipulation is direct. Never a bare sandbox (docs/06: scaffolded beats identical unscaffolded, g+ = 0.60; unassisted discovery loses, d = −0.38).
3. **Embedded retrieval.** ≥2 inline free-recall prompts (mnemonic-medium style), positioned after the relevant segment, answers hidden until attempted — prose productions, not sketch inputs (visual retrieval formats are an open question; docs/06 §Open). The artifact's closing text tells the reader to report their answers back to Engram so they become receipts.
4. **Mayer-minimal.** Zero decoration — every pixel carries meaning (coherence; seductive details reliably hurt, g ≈ −0.16…−0.33). Structure is signaled. **Text never runs concurrently with motion:** explanation sits before the dynamic (the prediction) or after it (the resolution), never over it. The reader advances **between** segments; **within** a segment the dynamic runs itself (segmentation helps, d ≈ 0.42; playback/scrub control per se is worth nothing, g = 0.05). Labels sit on the thing they label (contiguity). Conversational tone (personalization).
5. **Self-contained + both themes.** One offline HTML file: no CDNs, no external fonts/images/fetches. Light and dark via CSS tokens (`prefers-color-scheme` plus `:root[data-theme=…]` overrides). Under ~120 KB.
6. **Blank-page ending.** The final section asks the reader to close/cover the artifact and reconstruct the argument skeleton from nothing — with a reveal to check against.
7. **Versioned + registered + regenerable.** Header comment: node id, topic, generated date, learner-model snapshot hash inputs (interests used, scaffold level). Saved to `~/.claude/learning/artifacts/<topic>/<node>.html` and **registered on the graph**: `python3 "$ENGRAM" artifact set --topic <t> --node <n> --path <file>` (run by the smith right after writing — registration is what makes regeneration tracking and the modality telemetry true; Article 10). Regenerated (not patched) when mastery state or misconceptions change materially; re-register after regenerating.

## Widget vocabulary (grow it, but start here)

- **parameter-slider sim** — continuous cause → visible effect (curves, distributions, systems)
- **feature-space navigator** — several sliders, each one dimension; one holistic output (a face, a curve, a system) morphing live — *the* widget for "features/dimensions" concepts (causal-parameter kind)
- **predict-then-reveal plot** — commit a value/shape, then overlay reality
- **drag-to-order chain** — reconstruct a causal/derivation sequence (chain of necessity, literally)
- **contrast-pair toggle** — flip one dimension, watch what changes (variation theory)
- **worked-example stepper** — learner-advanced steps, each gated by "what happens next?" — doubles as the clause-2 worked drive at novice scaffold
- **DAG mini-map** — where this node sits; mastery-colored; edges labeled

Pick the widget from the node's `viz.kind` when present (`dynamic-process`, `causal-parameter`, `structural`, `distributional`, `procedural`, `comparative`) and build the manipulation named in `viz.hook` — it was written to kill the likely misconception.

## QA checklist (artifact-smith must self-audit before returning)

- [ ] Clause 1: what is gated, and by what commitment?
- [ ] Clause 2: which model; where is the pre-touch prediction; quote the post-manipulation self-explanation prompt; does the scaffold gate match the given level (novice → worked drive first)?
- [ ] Clause 3: quote both retrieval prompts
- [ ] Clause 4: name one thing you deleted for coherence; confirm no text runs over motion
- [ ] Clause 5: file opens from `file://` offline; both themes checked
- [ ] Clause 6: quote the reconstruction prompt
- [ ] Clause 7: header comment present; correct path; `artifact set` run and its JSON echoed in the report
