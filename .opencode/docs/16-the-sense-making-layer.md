# 16 · Intuition: The Sense-Making Layer, Audited

> **Status: proposal, adversarially verified.** First drafted 2026-08-18 from a three-track
> research pass; put through the house gauntlet (§Method) the same day — three refute-first
> verifiers against primary sources — which **corrected 9 claims, reframed 9 more, killed or
> rewrote 6 design rules, surfaced one new load-bearing objection, and found two defects
> upstream in `docs/11` (corrected with this release)** — all folded in below, with the
> original errors kept on the record. **Implemented in v1.14.0** on the founder's sign-off:
> WO-A…F shipped (grammar, /learn, /review, architect, assessor, engine opaque-storage,
> the `contrast-first` experiment preset, gold items g_087–089); the fluency track remains
> parked per §6.

The founder's question, verbatim-ish: *"Research intuition and intuition-building in
learning science. I personally am a HUGE intuitive person and most often need to build my
intuition over a topic before I can understand it — see how this fits Engram and whether we
should integrate it."* — with the binding scope directive that followed: **Engram is used by
thousands of learners; only what is solid and aligned with the vision and the as-is state
may integrate. This is not about one learner's style.**

The verdict, stated up front so the rest can be checked against it:

> **Intuition is not a learning style and Engram must not treat it as one — it is the third
> KLI process, sense-making, which `docs/11` already admitted Engram leaves unrouted.** The
> literature defines *skilled* intuition mechanistically (recognition: fast,
> working-memory-free retrieval of learned cue patterns) and prescribes how to build it.
> Four moves survive the gauntlet, all *upgrades to existing beats and edges*, not new
> machinery: (1) concept nodes that pass a four-way gate open with **contrasting cases and
> multiple committed attempts**; (2) resolution is **built from the learner's own attempts,
> dialogically** — the strongest *significant* fidelity contrast in the corpus, though not
> the criterion that survives every model-ranking method its meta-analysis ran; (3) the
> CONNECT beat's analogy becomes a **guided compared pair** — the bare form is the tested
> weak arm; (4) `contrasts_with` edges finally earn their keep as **within-session
> discrimination drills for concepts** — shipped as a hypothesis with its experiment
> attached, because the concept-induction evidence is visual and ours is text. Everything
> else — the perceptual-fluency track (whose large-scale RCT results the gauntlet
> exhumed: an order of magnitude smaller than the within-subject numbers), validity
> tagging, concreteness-fading-as-law, p-prim doctrine — is parked with its gate named.
> **And none of this narrows Engram or adapts to a "learner type": the moves are licensed
> by the material and the learner's measured prior knowledge, never by trait — the
> constitution's ban on style-routing survives this document fully intact.**

---

## Method — three tracks, one bar, then the gauntlet

Three research agents produced the draft: a full pedagogy map of the as-is codebase; the
cognitive science of intuition; and instructional methods with meta-analytic numbers. The
production bar applied throughout: **(a)** meta-analytic or independent multi-lab evidence
with boundary conditions mapped; **(b)** extends the as-is doctrine rather than amending
the constitution; **(c)** known failure modes have gates in the current system, or the
gate is one cheap flag.

The draft was then handed to **three refute-first verifiers** — acquisition claims (§3),
comparison & discrimination claims (§4–5), mechanism & measurement claims (§2, §6, §7) —
instructed to *break* each claim against primary sources. Between them they read the full
texts of Sinha & Kapur 2021, Loibl et al. 2017, Schwartz & Bransford 1998, Schwartz &
Martin 2004, Gentner et al. 2003, Loewenstein et al. 1999, Gick & Holyoak 1983, Brunmair &
Richter 2019, Kornell & Bjork 2008, Ashman et al. 2020, Kahneman & Klein 2009, Alfieri et
al. 2011, Mettler et al. 2016, the Massey et al. 2016 IES poster, and Krasne et al. 2021.
Scorecard, kept honestly:

| Outcome | Count | The load-bearing ones |
|---|---|---|
| **Confirmed, numbers exact** | ~17 | PS-I g = 0.36; fidelity 0.56 vs 0.20; Gentner 48% vs 19%; LTG99 ~3×; Brunmair 0.42 / words −0.39; Kornell & Bjork adult d = 0.99/1.28; both Schwartz F-statistics + in-paper teacher replication F(1,98) = 4.4; Alfieri −0.38 [−.44, −.31]; Loibl's boundary condition near-verbatim; Krasne's numbers; Tetzlaff ±0.505/−0.428 |
| **Corrected** | 9 | ">12k participants" (appears nowhere — dropped); age is **not monotonic** (undergrads 0.28 sit *below* 6th–10th's 0.50); Gick & Holyoak's real magnitudes (one analog ~30% vs ~10% base — a tripling, not "barely moves"; two-plus-comparison 40–45%, not "most"); "visual 0.67" is the **paintings** cell only; Kornell & Bjork's strict figure is **78%/78%**, and the non-updating is largely *source-memory failure*; Tetzlaff is Simonsmeier, Peters & Brod, and "strongest in higher education" holds only on the novice-benefit side (expert-harm side: −0.09, p = .749); Ashman Exp 1's transfer was null and the outcome is procedurally scored; the IES PLM trial **was** reported — 2016 poster, ES .14–.48, never journal-published; "largely one lab" has one true independent RCT (Champagne 2021) whose gain was gone at six months |
| **Overclaimed → reframed** | 9 | "largest fidelity lever" (largest *significant*; drops out under forward/backward selection and multimodel inference); "doubles the effect" (observational subgroup, not a manipulation); Gentner's encoding mechanism "pinned" (argued, consistent, not dissociated); K&K as "adversarial collaboration, strongest evidentiary structure" (no new data; the label is Kahneman's later one); the two K&K conditions gate *validity*, not formation; G2's "would wrongly read no effect" (neither source tested free recall — the licensed claim is weaker and sufficient); Alfieri's −0.38/0.50 pairing spliced two meta-analyses; Evans & Stanovich have **two** defining features (autonomy was dropped — the one with teeth); Chase & Simon's flat relational/surface dichotomy (chunks are partly position-specific; N = 3) |
| **Design rules killed or rewritten** | 6 | "maximally surface-different pairs" (contradicted by G&H Exp 6: no net transfer difference; distance raises ceiling *and* failure rate); "no hints during invention" → **content firewall, not support firewall**; one-sentence alignment → the **guided** form (bare comparison left ~60% with poor schemas); `threshold: true` as trigger → a four-way conjunction with **novice-gate-wins**; "one comparison per principle" → a budget, not a finding; the no-receipt sibling rule → a house decision with an open question, not an inheritance |
| **New objection surfaced** | 1 | **The duration confound** (§3) — fidelity's slope *reverses* for interventions spanning a few hours, and an Engram session is short |
| **Upstream defects in `docs/11`, corrected with this release** | 2 | The Brunmair adjacency moderator quoted without its weight (k = 17, four studies, "spaced" = 10–30 *seconds*); "expertise reversal strongest in higher education" (novice side only) |

Data-integrity note discovered in passing: **Sinha & Kapur's published Tables 4–5 are
internally corrupted** — seven bracketed intervals do not contain their own point estimate
(e.g. undergraduates 0.28 [−0.46, 0.24]). Table 3 (fidelity) is internally consistent.
Rule adopted below: quote Table 4–5 point estimates without their brackets; Table 3 may
keep them. The pooled g = 0.36 [0.20, 0.51] is from the running text and is safe.

## 1 · The audit: what is already braced (more than the docs admit)

The striking finding of the codebase pass: **Engram already implements roughly half of the
intuition-building literature under other names, without doctrine.** "Intuition" appears in
the design docs twice, both times dismissively; yet:

| Research principle | As-is implementation | Where |
|---|---|---|
| Generation before instruction (PS-I) | The 8 beats ARE a lean PS-I loop: OPEN A GAP → PREDICT/ATTEMPT → STRUGGLE → RESOLVE | dialogue grammar; `docs/01` P5 |
| Guided discovery, never unassisted | Explorable Contract's prediction gate + predict→act→explain + recall embeds — the guided-discovery moderator (d = 0.50) inside Alfieri et al. 2011's *enhanced-discovery* meta-analysis (overall d = 0.30, 360 comparisons), against their *separate* unassisted-discovery meta-analysis (d = −0.38 [−.44, −.31], 580 comparisons, vs explicit instruction). Not two cells of one contrast. Same moderator table: bare *generation* d = −0.15 favoring other instruction, and enhanced discovery did **not** beat worked examples (d = 0.06, n.s.) | `explorable-contract.md`; P15 |
| Errorful generation + elaborated feedback | Hypercorrection protocol; blind `misconceptions[]`; error catalogs seeded by the architect | oath; assessor spec |
| Worked-example ladder with asymmetric fading | P16, complete with the Tetzlaff ±0.505/−0.428 reversal already cited | `docs/11`/`docs/12` |
| Discrimination by juxtaposition — **procedures only** | P17: `discriminates_from` siblings served adjacently behind a naming beat, within-session | `problem-grammar.md` |
| Confidence excluded from scheduling | Confidence is calibration metadata; FSRS runs on grades — precisely Kahneman & Klein's prohibition, already law | confidence integrity ⚠ |
| Analogical encoding, variation theory | **Licensed in P8 since the constitution was written — and never implemented.** `analogous_to` and `contrasts_with` edges exist as data; CONNECT pulls a single told analogy; no beat compares, no beat discriminates concepts | P8 vs `dialogue-grammar.md` beat 6 |

That last row is the shape of the whole gap: **the constitution already contains the
licenses; the grammar never built the moves.** `docs/11` §2 said it precisely: KLI names
three learning processes — memory & fluency, induction & refinement, understanding &
sense-making — "and Engram routes everything through the first two."

## 2 · The gap, given its mechanism

The literature's convergent definition of **skilled** intuition (Simon 1992, p. 155, quoted
and endorsed by Kahneman & Klein 2009 — a joint heuristics-and-biases/NDM paper by two
authors who expected to disagree and largely did not; note it reports **no new data**, so
it is strong as *convergence* and carries no evidentiary weight of its own): *"Intuition is
nothing more and nothing less than recognition."* K&K are explicit that this defines
intuition **when it is skilled**; unskilled intuitions arise too, and are heuristic
substitution rather than recognition. Building the skilled kind means building four
separable things, each with a measurable signature:

1. **A chunk library** — cue→response patterns encoding relational structure (Chase &
   Simon 1973 — **three subjects**: one master, one class-A, one beginner; the signature is
   structured-vs-scrambled performance *divergence*, not disappearance — Gobet & Simon 1996
   showed strong players keep a small reliable advantage even on random positions, and
   mirror-image reflection impairs recall, so chunks are partly position-specific. Read
   "relational rather than *purely* surface" as the claim; the flat dichotomy is false).
2. **Discriminative selectivity** — classifying *novel* instances correctly (Kellman's
   **discovery effects** — his term; Reber 1967's 79%-correct judgments on novel strings by
   subjects who could not state the rules. Perruchet & Pacteau 1990 showed the same
   performance is obtainable from *explicit fragment* knowledge, so this evidences transfer
   to novel instances, not unconscious rule abstraction).
3. **Correct cueing priorities** — the right pattern firing in the right context across
   varied surface framings (the surface-similarity retrieval problem: Gick & Holyoak 1983;
   Gentner, Loewenstein & Thompson 2003 — §4. diSessa 1993 describes the same phenomenon
   in p-prim vocabulary, but §6 parks that framework below trial grade, so it is not cited
   here as load-bearing).
4. **Automatization** — retrieval that is *autonomous* (runs to completion once triggered,
   hard to suppress) **and** consumes no working memory. Those are Evans & Stanovich
   2013's **two** defining Type-1 features; fast/slow, conscious/not, parallel/serial are
   typical *correlates* that, in their words, do not constitute the distinction. Autonomy
   is the half with teeth for us: a wrong pattern, once automatized, is hard to suppress —
   which is why §3's leash is not optional.

Two conditions are necessary for the recognition that develops to be **valid** — not for
the machinery to form (Kahneman & Klein 2009, p. 520 and p. 524): **an environment of
sufficiently high validity** (stable cue→outcome regularities — poker qualifies,
stock-picking does not) and **adequate opportunity to learn it: prolonged practice with
feedback that is both rapid and unequivocal**. K&K are equally explicit that intuitions
form anyway where validity is low — they are simply wrong and confident. So this is a
filter on *what Engram should drill*, not a precondition for the beats. And two things are
explicitly *not* evidence of skill: verbalization (Reber; K&K describe expert cues as
"tacit knowledge … difficult for the expert to articulate" — difficult, not impossible;
NDM's stated program is identifying them from outside) and felt confidence ("there is no
subjective marker that distinguishes correct intuitions from intuitions that are produced
by highly imperfect heuristics").

Consequence for Engram, stated against ourselves: **a system whose every probe is verbal
free recall can neither build components 1–2 and 4 nor see them.** Free recall is the
optimal instrument for declarative durability (P1) — and it is format-incongruent with
pattern recognition the same way it was format-incongruent with procedures before P17.
This document routes what can be routed inside the current instrument (components 2 and 3,
via contrast, comparison, and discrimination — all open productions) and parks what cannot
(components 1 and 4 want a timed classification instrument; §6).

## 3 · Pillar 18 — Concepts enter by contrast: cases first, resolution from the learner's own attempts

**Claim.** A `concept` node that passes a four-way gate opens not with a lone question but
with **contrasting cases** (3–5 instances varying one deep feature at a time), against
which the learner commits **at least two candidate rules or explanations, ranked**; and
RESOLVE is delivered **dialogically, built explicitly on those attempts** — quoting them,
naming which deep feature each one missed — never as generic exposition.

**Evidence — the license.**
- **PS-I, honestly sized:** attempt-before-instruction beats instruction-first on
  conceptual knowledge and transfer at **g = 0.36 [0.20, 0.51]** (Sinha & Kapur 2021,
  45 articles / 53 studies / 166 comparisons; funnel plot, Egger's test (p = .219) and
  trim-and-fill all clean), with **no detected procedural cost (g = −0.03, n.s., 95% CI
  [−0.20, 0.15], n = 51 comparisons — the CI admits a small cost; say it this way)**.
  Already constitution (P5) and already adopted for concept nodes by `docs/11` §3.
- **The fidelity moderators, at their real weight:** instruction *built on student
  solutions* **g = 0.56 [0.07, 0.64] vs 0.20 [0.01, 0.40]** (p = .02 — the largest
  *significant* fidelity contrast and the smallest p of the seven criteria, ranked first
  by stepwise regression; state honestly that it drops out under forward/backward
  selection and is absent from the multimodel-inference top four); dialogue-dominant vs
  monologue-dominant consolidation **0.55 vs 0.24** (p = .05, marginal); documented
  *multiple*-attempt generation **0.47 vs 0.16** (p = .05). The three criteria selected by
  *both* of the paper's model-ranking procedures: multiple-attempt generation, group work,
  dialogue-dominant instruction — two of the three are exactly moves (1) and (2); the
  third is the one thing a solo tutor cannot do. Overall fidelity linearly predicts effect
  size (β = 0.0065, p < .001 [0.0044, 0.0087]).
- **Why cases, specifically:** analyzing contrasting cases before the telling beat
  summarizing the same content on *prediction of novel outcomes* (Schwartz & Bransford
  1998 **Exp. 2**, F(1,16) = 17.73, p < .01 — n = 18 graduate students); the same paper's
  **Exp. 1** (24 undergraduates, both arms hearing the same lecture) shows the benefit on
  prediction, F(1,18) = 29.3, while verification sat **at a 93% ceiling in both arms** and
  was blind to it — a ceiling-limited null, which is what §7's G2 rests on. Invention over
  cases prepared learners to exploit later instruction where tell-and-practice did not
  (Schwartz & Martin 2004, three-way interaction F(1,91) = 4.9, **replicated in-paper by
  four classroom teachers, F(1,98) = 4.4** — ninth-graders, invention done in groups of
  2–5 with teachers present; no adult estimate exists for this design). Telling-first
  suppressed deep ratio-structure learning (d ≈ .30) and delayed transfer (d ≈ .33) even
  when word-problem performance was equal (Schwartz, Chase, Oppezzo & Chin 2011 —
  eighth-graders; in their Exp. 2 the procedural edge, where any existed, went to
  telling-first). Loibl, Roll & Rummel (2017) converge from the mechanism side
  (vote-count review, not pooled): PS-I helps *only* with contrasting cases and/or
  attempt-built instruction — "without these design elements, the effects … can even be
  negative."
- **Population:** the effect trends upward with age but **is not monotonic** — 2nd–5th
  graders −0.09, 6th–10th graders 0.50, undergraduates **0.28**, postgraduates and
  professionals **1.03**. The undergraduate cell — the middle of Engram's audience — sits
  *below* the school-age cell above it, and the paper's "n.s." for it means "did not
  differ from the other age groups," not "zero." The age gradient is confounded with
  fidelity (F(3,162) = 6.485, p = .0004). Quote these point estimates without their
  brackets (§Method's data-integrity note). Direction is roughly uniform above middle
  school; magnitude is not pinned.
- **The duration confound, stated against ourselves — the strongest live objection to
  this pillar.** Fidelity is confounded with intervention length (mean fidelity 74.45 in
  multi-day interventions vs 42.01 in multi-hour; Welch t = 8.504, p < .001). The authors
  modelled it: fidelity raises effect size overall (β = 0.0173, p = .0005) but the slope
  **reverses** for interventions spanning a few hours (β = −0.0116, p = .0546) —
  "cramming too many design features within a short amount of time may not be optimal" —
  and they entertain that intervention length, not fidelity, may drive the pooled effect.
  **An Engram session is short.** So P18 ships in its *lean* form only — one authored
  contrast set, individual attempts, immediate attempt-built consolidation — never the
  full classroom stack; and whether even the lean form pays in a chat session is G2's
  real question, not a footnote.

**Evidence — the leash.**
- **Two gates already in the machine:** low prior knowledge → instruction-first
  (assistance helps novices **d = +0.505 [0.260, 0.750]**; withholding it helps experts
  **d = −0.428 [−0.647, −0.209]** — Tetzlaff, Simonsmeier, Peters & Brod 2025, 60 studies,
  N = 5,924; the pretest and shaky-`requires` signal already route this). Their asymmetry
  note is adopted as the tie-breaker: "rather provide assistance than withhold it when in
  doubt." Procedural objective → the P16 ladder, untouched (PS-I buys nothing there).
- **One gate that needs a flag:** high element interactivity → instruction-first outright.
  Direct sequence evidence: Ashman, Kalyuga & Sweller 2020, two fully randomized
  experiments — Exp. 1 (N = 64) d = .56 on similar problems but **null on transfer**
  (p = .06); Exp. 2 (N = 71, higher interactivity) d = .57 similar, d = .56 transfer —
  on **Year-5 children (~10)**, and on a **procedurally scored** outcome, the class where
  PS-I buys nothing anyway. The adult license is indirect twice over — by age and by
  outcome — resting on core CLT plus Tetzlaff, whose higher-education elevation holds
  only on the *novice-benefit* side (0.99, p = .003; expert-harm side −0.09, p = .749,
  and the moderator "is partially confounded with age"). Quote it at that weight.
- **A content firewall, not a support firewall.** What PS-I withholds is the canonical
  solution and correctness feedback — *not* all assistance. In the source studies the
  invention phase is socially scaffolded (teachers present, peers available), and
  prompting learners to predict across the contrasting cases made them find and revise
  their own errors more than unprompted access to the same cases (Roll et al., via Loibl
  2017). A blanket "no hints" would push the design into Alfieri's penalized unassisted
  cell (d = −0.38; bare *generation* d = −0.15). Design rule: the hint ladder's
  **answer-bearing rungs (H3–H4) are suppressed during invention; its orienting rungs
  (H1–H2) stay live.**
- **Consolidation is mandatory.** A session that ends after attempts without RESOLVE is a
  defect, not a variant — without attempt-built consolidation the sequence collapses
  toward the unassisted cell (Alfieri 2011; Loibl 2017).
- **The solo extrapolation, with one real mitigation and one labeled invention.** The
  mitigation is quotable: "for shorter interventions, designing the problem-solving phase
  to accommodate individual work yields a better predictive estimate" (β = 0.7395,
  p = .0023, Sinha & Kapur). **State the other side: the group-work main effect runs
  strongly against solo** (0.49 vs 0.19, p = .04), and group work survives both of the
  paper's model-ranking procedures. The "solution gallery" (tutor shows 2–3 plausible
  *other* attempts) is **this document's invention with no evidence behind it** — Metcalfe
  2017 flags observing a peer's error as an unstudied question, and Alfieri codes "work
  with a naïve peer" at d = −0.47. It is a hypothesis for the n-of-1 machinery, never a
  mitigation to lean on.
- **Misconception entrenchment:** errorful generation is safe *when corrective feedback
  analyzes the reasoning that produced the error* (Metcalfe 2017 — high-confidence errors
  correct *more* readily; already the constitution's P-frame). On self-produced vs shown
  errors, cite narrowly: established for experimenter-presented wrong answers in cued
  recall; the classroom version is explicitly unstudied. Attempt-built consolidation IS
  the required analysis — a plausible reason it carries the strongest fidelity contrast.
  "Doubles the effect" would be a causal claim from an observational subgroup; do not
  make it.

**Design consequence.** For `concept` nodes, `dialogue-grammar.md` beat 2 gains a
**contrast-first form**, triggered by a conjunction the evidence actually licenses —
**conceptual/transfer objective AND node-level prior knowledge above the novice floor AND
low element interactivity AND an authored contrast set** — strategy-weighted otherwise.
`threshold: true` is a *heuristic correlate* of the first condition, not the trigger: no
source here operationalizes threshold-ness, and threshold nodes are often exactly where
prior knowledge is lowest, so a bare `threshold` default would fire hardest where the
Tetzlaff leash says instruction-first. **When the default and the novice gate disagree,
the novice gate wins.** The form: serve the case set → elicit ≥2 ranked candidate rules
(committed before any feedback, exactly like today's PREDICT; H1–H2 orienting hints only)
→ beat 4's RESOLVE **quotes the attempts verbatim and names the deep feature each
missed**, as questions where possible ("why did your rule 2 break on case C?"). Attempts
land in the stash as production context. Beats 1, 3, 5–8 bind unchanged; `arbitrary: true`
and `procedure` nodes untouched. The architect authors the case set per gated node (one
deep feature varying per adjacent pair — variation theory finally operationalized), stored
as `practice`-style opaque metadata (WO-D).

## 4 · Pillar 19 — The comparison move: a schema is extracted between two cases, never inside one

**Claim.** When CONNECT plays the analogy card, it plays **two structure-identical,
surface-different cases and elicits the alignment in guided form** — correspondences
first, then the shared relation, then the tutor states the principle. A told analogy is
the weak arm of every experiment in this literature; so is a bare "what do these share?"

**Evidence — the license.** A multi-decade, multi-lab program, unusually consistent. The
cleanest result: comparing two analogous cases vs studying the same two separately, with
the *number of cases equated* — **48% vs 19% transfer**, χ²(1, N = 128) = 11.85, p < .01
(Gentner, Loewenstein & Thompson 2003, Exp. 2, undergraduates). Their Exp. 3 carries the
same ordering into a face-to-face negotiation: guided alignment 90% > bare comparison 70%
> separate study 55% > none 37% — **proportions of negotiating dyads, ~20 per cell
(N = 79)**; only two contrasts were tested (comparison vs non-comparison groups,
χ²(1, N = 79) = 9.74, p < .01, plus a linear trend, p < .01) — **the guided-vs-bare
pairwise contrast is never itself tested**; read the ladder as a trend. In management
students, ~3× strategy transfer: 48% vs 16% of dyads, χ²(1, N = 58) = 6.91, p < .01
(Loewenstein, Thompson & Gentner 1999) — where *labelling* the principle changed nothing
(30% vs 32%), so naming a schema is not comparing cases; and where the dyads' actual
negotiated-money advantage was 0.5%, n.s. — the transfer measure moved, the money did not.
The canonical antecedent at its real magnitudes: against a ~10% base rate, one analog
leaves roughly seven in ten failing to transfer spontaneously (~30% pre-hint), and two
analogs plus describe-the-similarities reaches **40–45% pre-hint** — better, and still not
most; majorities appear only when the comparison is *augmented* with a stated principle
(→ 62%) or structural diagrams (→ 57%) (Gick & Holyoak 1983, Exps 4–6 — who also did not
equate case count, as Gentner et al. themselves flag: that line is evidence for *dose plus
comparison*). The mechanism the authors argue is **encoding** — comparison forces
structural alignment, promoting shared relations and demoting surface detail — and the
reminding data are consistent with it (68% reported no reminding; 34% vs 30% by
condition, untested, self-report, and the authors warn the reminding prompt itself may
have raised transfer). Consistent, not "pinned": no encoding-vs-retrieval dissociation was
run. Already licensed verbatim in P8; this pillar is its missing design consequence.

**Evidence — the leash.**
- **Schema-specific:** transfer of a principle appeared iff the compared cases embodied
  *that* principle (untrained-principle use 20% vs 13%, n.s.). A comparison does not
  create "analogical skill." **One comparison episode per principle is our budget, not the
  literature's finding:** specificity says which cases, not how many times; the dose
  evidence runs the other way (transfer scales with comparison intensity — Gentner Exp. 3;
  Kurtz et al. 2001), and nobody has contrasted one episode with two.
- **Surface distance is a trade-off, not a rule.** The >80%-surface-remindings fact (Ross
  tradition) is about *retrieval cues* — it is why `analogous_to` pulled toward the
  learner's interests is the right fuel but the wrong delivery when served alone. It does
  **not** license "maximally different": the only experiment manipulating surface
  similarity *between the compared pair* found no net transfer difference (Gick & Holyoak
  Exp. 6, N = 189) — dissimilar analogs produced more good schemas when scaffolded (65%
  vs 44%) but left poor-schema learners far worse off (12% vs 44% pre-hint solving).
  Surface distance raises the ceiling and the failure rate together — a second,
  independent argument for the guided form.
- **Grade the schema, and know what the grade is worth.** Gentner et al. scored stated
  principles 0/1/2; the score tracked transfer in their Exp. 2 (20%/40%/46%,
  χ²(2, N = 128) = 7.13, p < .05 — the jump is 0→1) and in LTG99 (53% vs 28%, p < .05),
  was **only a n.s. trend in their Exp. 3** (p = .18), and split in Gick & Holyoak — who
  also name the confound: "it may be that people who are skillful problem solvers write
  good schemas and also apply analogies well." The alignment score is a *correlate* of
  transfer, possibly person-level — a legitimate production to stash and blind-grade
  (WO-F), not proof that raising the score raises transfer.

**Design consequence.** `dialogue-grammar.md` beat 6 (CONNECT): when the node carries an
`analogous_to` edge (or the tutor reaches for an interest-analogy), serve the pair — the
node's canonical case beside the analog, surface-different — and **elicit the alignment
before confirming it, in the guided form the evidence rewards**: ask for the
correspondences ("what plays the role of X here?"), then the shared relation, and follow
the learner's commitment by **stating the principle explicitly**. The bare form is the
tested weak arm: a plain describe-the-similarities left ~60% of Gick & Holyoak's subjects
with poor schemas; adding a stated principle (40% → 62%) or structure diagrams (37% → 57%)
raised spontaneous transfer sharply; Gentner's own "bare" prompt was four questions, and
their guided arm is the 90% one. The committed statement is stashed with the node's
production context. Cost: one extra elicitation and one extra tutor sentence inside an
existing beat. No new beat, no new data, no engine change.

## 5 · P17, amended: concepts get the juxtaposition rule too — as a hypothesis with its experiment attached

P17 already holds, for procedures (`docs/11` §4). Brunmair & Richter 2019 (k = 238, 59
papers) put the pooled interleaving effect at **g = 0.42 [0.34, 0.50]**, and the doctrine
that matters here is that the effect lives or dies on the *material*: **paintings 0.67
[0.57, 0.77]** (the cell the headline numbers come from), naturalistic photographs 0.35,
mathematical tasks 0.34, **expository texts n.s.**, **words −0.39 [−0.64, −0.14]
(blocking wins)**. Say the uncomfortable part out loud: a concept-discrimination drill
delivered as text sits nearer the expository-text and words cells than the paintings cell.
Brunmair's own hedge — "the lack of an overall effect for expository texts … does not
imply that interleaving is ineffective when used with these learning materials" — is the
only thing between us and a null, so **§5 ships as a hypothesis with an experiment
attached (§7 item 7), not as a settled magnitude.** Two moderators are permissive and
banked: retention vs transfer was not a moderator (k = 64, p = .45), and simultaneous vs
successive presentation was not a moderator (0.44 vs 0.29, k = 26, p = .31) — serving both
cases in one prompt is fine. Concept induction is where the effect was *discovered*:
Kornell & Bjork 2008, UCLA undergraduates, **d = 0.99 (within-Ss, n = 120) and d = 1.28
(between-Ss, n = 72)** on classifying novel exemplars, first test block — single-study
values on the paintings paradigm, for which the pooled estimate including this study is
0.67; quote 0.67 when a magnitude is needed. Plus the finding that binds our telemetry
doctrine: **78% of participants learned better interleaved while 78% said massing was as
good or better** (85%/83% for the ≥ versions), judged *after* the test — with much of the
miss attributable to source-memory failure (participants were at chance identifying which
artists had been massed). Learner format preference is anti-evidence, which the
constitution already knew.

**The amendment.** When a `concept` node under review has a `contrasts_with` sibling, the
review serves a **discrimination step behind the naming beat, within the same session**:
two minimal cases (or claims) presented adjacently — "which is which, and what single
feature decides it?" — as open production, graded as part of the due node's review. The
sibling's own schedule is untouched and no receipt is minted against it — **a house
decision, not an inheritance.** No study in this corpus has an asymmetric design;
Brunmair's inclusion criteria require equal items per category, and in Kornell & Bjork
boundary classification *is* the credited learning measure for every category in the pair.
We take the no-receipt route for grader economy and schedule stability, and accept its
named risk: an uncredited successful discrimination is an uncounted retrieval, so FSRS's
model of the sibling will run pessimistic (§7 item 8). Exemptions: `arbitrary: true` nodes
are **exempt by default** (words: −0.39, blocking wins — a default rather than a law,
because the meta-analysts disown that cell's generality: "too few empirical studies … the
negative effect for words … might not be caused by the use of words"), and the drill pays
only between genuinely confusable siblings — which is what `contrasts_with` was always
supposed to mean. **Prompt-level change to `skills/review/SKILL.md` and the grammar; the
edge data has existed since v0.1, unconsumed.**

Scheduling doctrine, restated with its warrant at honest weight: **spacing is the
between-session lever (FSRS's job); discrimination is a within-session lever (the
grammar's job).** The usual citation — immediate succession g = 0.73 [0.51, 0.95] vs
temporally spaced g = 0.22 [−0.13, 0.45] n.s. — is a **k = 17 subgroup resting on four
studies in the non-adjacent cells**, held out of the main meta-regression by its authors
("to minimize noise"), in which "immediate succession" means **under 2 seconds** and
"temporally spaced" means **10 or 30 seconds**; where spacing was unreported, immediate
was assumed. It measures presentation lag, not scheduling. What it does contain, and what
we actually cite for a dialogue-embedded drill, is its third level: with **distractors
interposed, the effect survives — g = 0.51 [0.07, 0.96]**. So: serve the pair together in
one presentation; treat "never across days" as an a-fortiori inference from a
seconds-scale finding, not a measured result. (`docs/11` §4 stated this moderator in the
same over-strong form; corrected with this release.)

## 6 · What this deliberately does not build

- **The perceptual-fluency track — parked, and the gauntlet hardened the parking.** Rapid
  classification of novel instances against accuracy *and* response-time criteria is what
  builds components 1 and 4, with large but **uncontrolled** within-subject effects
  (accuracy d = 0.9–3.2, fluency 2.5–3.1 — Krasne et al. 2021, 269 medical students + 112
  EM residents, adults, but pre/post with **no control arm**; the one-year "durability" is
  delayed-test-vs-pretest across a year of clinical ECG exposure). **Under randomized
  control the effect shrinks by an order of magnitude:** the IES efficacy trial of this
  exact technology (R305A120288, ~2,100 sixth-graders, 41 schools, within-teacher
  randomization) found **ES .14–.48**, half the modules null in the replication cohort, a
  one-year composite of .31/.21, and a *negative* −.19 on non-PLM control curriculum in
  one cohort — results reported in a 2016 IES PI-meeting poster (Massey, Porter, Desimone
  & Kellman) and **never in a peer-reviewed journal**, which is the honest form of the
  publication complaint. Kellman, Massey & Son 2010 is school-age throughout with weak or
  absent controls; Mettler, Massey & Kellman 2016 supports adaptive RT-driven
  *scheduling* on factual paired associates at n = 16/cell — against the strict
  yoked-item control, adaptive was marginal at immediate test and n.s. at delay; the
  clean wins are against the shuffled arm. The one clearly independent RCT (Champagne et
  al. 2021, *Can J Anesth*, n = 26 vs 26, TEE ejection-fraction estimation) found a real
  immediate gain **gone at six months** (abstract-verified only — flag for a second
  reader). It fails the bar three ways: effect collapses under randomized control, the
  strong numbers are one lab's uncontrolled designs, and it collides with Constitution
  art. 1. `docs/11` §5 parked timed fluency on a fourth ground — "latency in chat is
  noise" — and that one objection now has an answer: **the explorable is Engram's one
  honestly-timed surface.** Parking upgraded to **experiment-ready**: an opt-in
  `experiments/` preset (explorable-embedded classification drill on high-validity
  threshold nodes, novel instance per trial, receipts riding the `audit` kind), with the
  doctrine carve-out — novel-instance classification cannot be passed by recognition of a
  studied answer — **to be earned by the experiment's data, not granted by this
  document.** A `validity` node tag (K&K's gate) is deferred with it.
- **Concreteness fading as an ordering law.** No pooled meta-estimate exists; the key
  adult study is one lab (McNeil & Fyfe 2012); Fyfe & Nathan (2019) call the constructs
  underspecified. The as-is posture — a `strategy_weights` dial and an explicitly open
  question (`docs/07` §425) — is the epistemically correct one and stays. One sentence of
  tightening rides WO-A: when example-first fires, the concrete→abstract transition is
  stated explicitly, never a silent notation swap.
- **p-prim doctrine.** Knowledge-in-pieces rests on clinical think-aloud interviews with
  small samples; the ontology is unsettled against framework theory and untestable
  between them at trial grade. The solid core of error pedagogy (Metcalfe 2017) is
  already the hypercorrection protocol. The one durable idea — a wrong answer is often a
  *mis-cued resource with a context where it's right* — is worth a line in the
  hypercorrection move, not a pillar.
- **Any learner-type routing.** Intuition-first sequencing is licensed by the material
  and measured prior knowledge — never by trait. The founder being "a HUGE intuitive
  person" is a motivation fact, not a routing input; `docs/01`'s Rejections and the
  coach's adaptation-family ban bind this document as they bind everything.
- **MCQ, still banned.** Every elicitation in P18/P19/§5 is open production into the
  stash, blind-graded. The only classification-shaped interaction proposed anywhere is
  inside the parked experiment, on novel instances, behind its own gate.

## 7 · What remains honestly open (with its gate or its instrument)

1. **G1 — the gauntlet: DONE** (§Method). Nine corrections, nine reframings, six design
   rules killed or rewritten, one new objection, two upstream `docs/11` defects — all
   applied above in the same release.
2. **G2 — the measurement blind spot, restated at its licensed strength.** Neither source
   tested free recall: Schwartz & Bransford's blind instrument was **verification at a
   93% ceiling in both arms**; Schwartz & Martin's was a **sequestered problem-solving**
   item (their no-resource cells: invention 30.4% vs tell-and-practice 32.0% — invention
   nominally *behind*). The licensed claim is weaker and sufficient: **this benefit has
   repeatedly failed to appear on sequestered, resource-free measures, and Engram's
   receipts are that family — so a null on them is not evidence against P18.** That free
   recall specifically would read "no effect" is a prediction the experiment must test,
   not a finding to assume. The evaluating experiment carries transfer-sensitive outcome
   items (a prediction probe on a novel case; optionally a resource-embedded probe),
   riding the existing `transfer` kind. It must also answer §3's duration confound: does
   even lean-form contrast-first pay inside a single short session?
3. **The solo-adaptation question.** The corpus is classroom-heavy; the individual-work
   moderator favors solo in short interventions, the group-work main effect runs the
   other way, and the solution gallery is an unevidenced invention with two
   counter-signals. Instrument: the `contrast_first` arm joins `strategy_weights` (WO-E)
   beside `derivation_first`/`example_first`; the preset compares 7-day retention *plus*
   the G2 transfer items.
4. **The assessor on alignment quality.** Scoring a schema statement 0/1/2 goes into the
   gold set before P19 receipts count — knowing the score is a transfer *correlate*,
   possibly person-level, never a target to optimize.
5. **Moderators on the record:** PS-I effects were larger in Asian (0.64) **and
   Australian (0.95)** samples than European/North American (0.19/0.24) — the split is
   not Western/non-Western, and only the Asia contrast was significant against the rest.
   Quasi-experiments ran higher than randomized (0.46 vs 0.25, n.s.), and randomized
   studies had far lower fidelity (32.36 vs 76.78) — a confound the authors tested and
   could not resolve (interaction p = .79). Neither kills the effect; both say the pooled
   0.36 is an optimistic-side estimate.
6. **The fluency experiment** (§6): design, `validity` tag, RT instrumentation inside the
   Explorable Contract, and the carve-out question it would settle — now with the IES
   poster's .14–.48 as the honest prior, not the within-subject d ≈ 3.
7. **The material-type gate on §5.** The concept-induction evidence is overwhelmingly
   visual (paintings 0.67); Brunmair's verbal cells are null or negative. Engram's drill
   is verbal text. Whether the effect transfers to text-delivered conceptual boundaries
   is untested and is the first thing the WO-C arm must measure. Until then §5 is a
   design with a direction, not a magnitude.
8. **The uncredited-retrieval question.** A `contrasts_with` sibling drilled without a
   receipt is a retrieval FSRS never sees; its model of the sibling will drift
   pessimistic. Instrument: compare sibling lapse rates against never-drilled nodes; if
   drilled siblings are over-scheduled, mint a discounted receipt.

## 8 · The machinery (work orders, all small)

| WO | Change | Files | Engine? |
|---|---|---|---|
| A | Contrast-first form of beat 2 (four-way conjunction trigger, novice-gate-wins, H1–H2 hints only) + attempt-quoting RESOLVE rule + fading-transition sentence | `skills/_shared/dialogue-grammar.md`, `skills/learn/SKILL.md` | none |
| B | CONNECT guided pair-comparison (correspondences → relation → tutor states principle) | `skills/_shared/dialogue-grammar.md` | none |
| C | Concept discrimination step in review (`contrasts_with`, within-session, `arbitrary` exempt) — **ships with its measurement arm (§7.7)** | `skills/review/SKILL.md`, grammar | none |
| D | Architect authors per-gated-node case sets + `interactivity` flag, `viz`-pattern opaque storage | `agents/engram-curriculum-architect.md`; shape-check + `setdefault` in `cmd_add_topic`; surface in `due_items` | ~30 lines, no math |
| E | `contrast_first` strategy arm + experiment preset with G2 transfer-sensitive outcome items + duration-confound question | `skills/coach/SKILL.md`, `experiments/` | none |
| F | Assessor rubric extension: alignment-quality 0/1/2 (correlate, not target); gold-set items | `agents/engram-assessor.md`, gold set | none |
| — | (parked) fluency-track experiment preset + `validity` tag | `experiments/` | with its own doc |

Five of six need zero engine change; WO-D rides the established opaque-metadata covenant.
Companion corrections to `docs/11` §4 (adjacency moderator weight; higher-education
claim) ship with this document.

## 9 · The founding question, answered

**Does intuition-building fit Engram?** Better than expected — because Engram already half
built it. The 8 beats are a lean PS-I loop; the Explorable Contract is the
guided-discovery cell of the literature; the constitution licensed analogical encoding and
variation theory in P8 and then never spent the license. What the research adds is not a
new philosophy but the **fidelity criteria associated with the corpus's larger effects**
(association, not a within-study manipulation — and see §3's duration caveat) — cases
before commitment, multiple attempts, resolution built from the attempts, schemas from
guided pairs, boundaries from adjacent contrast.

**Should we integrate it?** Yes — four moves, production-bar filtered and
gauntlet-corrected, all upgrades to existing beats and edges, with §5 explicitly shipping
as an instrumented hypothesis and G2's experiment carrying the burden of proof the
sequestered receipts cannot. And no — to the fluency track (its RCT evidence is an order
of magnitude below its marketing; earn the carve-out by experiment), to fading-as-law
(the dial is already honest), to p-prims (a stance, not evidence), and permanently to
learner-type routing.

**In one sentence, the slogan gains its third clause:** derive what can be derived,
memorize only the arbitrary, practice what must be performed — and **let what must be
*seen* enter by contrast: cases before claims, comparisons before definitions, boundaries
drawn next to the thing they bound.**
