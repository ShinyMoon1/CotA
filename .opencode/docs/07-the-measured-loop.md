# 07 · The Measured Loop: The Science the First Six Documents Did Not Contain

`docs/01` compiled the science of **how to teach a concept**. `docs/05` compiled the science of
**why the learner shows up**. `docs/06` compiled the science of **when a picture earns its keep**.

All three assumed something that turns out to be false: **that the loop runs.**

It does not. Engram's own author encoded seven concepts on 2026-07-05 and, six days later, had
completed **zero reviews** — while 501 people starred the repository. The retention half of the
system, which is the half the entire thesis rests on, has never once executed. And the numbers
that would have made that impossible to ignore — retention, adherence, grader validity — were
never computed, because they were never built.

This document is the evidence base for fixing that. It covers the four things the first six
documents did not: **what learning rate actually is** (and why maximizing it is a category
error), **what determines whether a human comes back**, **whether the LLM that grades every
receipt can be trusted at all**, and **whether verbal recall practice transfers to doing the
thing**.

**Method.** Same discipline as `docs/05` and `docs/06`: a fan-out research pass, primary sources
fetched, and every load-bearing claim adversarially checked — meaning that for each finding, the
strongest available *refutation* was hunted before the finding was allowed to stand. Two of the
headline results below were substantially revised by that check, and one popular claim in the
project's own favour was weakened by it. Where no verifiable evidence exists, this document says
so and the design stays conservative. As with its predecessors, it prefers being **usefully
honest** to being **impressively certain**.

---

## 1 · Learning rate — the vector that isn't

**Claim.** Learners differ enormously in *where they start* and remarkably little in *how fast
they climb*. "Increase the learning rate" is therefore close to a category error, and the
levers that remain are opportunity count, opportunity quality, and not-forgetting.

**Evidence.** Koedinger et al. (2023, *PNAS*, [10.1073/pnas.2221311120](https://www.pnas.org/doi/10.1073/pnas.2221311120))
fit an individual Additive Factors Model to **1.3M practice observations from ~7,000 learners
across 27 datasets** (K–college math, science, language). Result: student *slope* variance is
tiny; student *intercept* variance is large. People do not climb at different speeds. They start
on different floors.

**Replication.** Independently refit on much larger MATHia data across six math topics (EDM
2024): student slope IQRs **0.006–0.118** (Koedinger's max was 0.102), against intercept spreads
up to **1.04 logits**. Two orders of magnitude separate the two variances. *"Students did not
start each workspace with similar levels of content knowledge"* — but they climbed alike.

**Contested — and this is the honest part.** "The 'Astonishing Regularity' Revisited"
([arXiv 2605.01690](https://arxiv.org/html/2605.01690v1)) shows the estimated *degree* of
uniformity is sensitive to **practice-sequence length**: truncating to 10 opportunities inflates
median slope-IQR by **75%**; to 5 opportunities, by **205%**; individual datasets show up to
**17-fold** increases. The mechanism is *informative observation length* — in mastery systems,
fast learners exit early (short sequences) and strugglers accumulate long ones, so the model
weights the strugglers' curves more heavily. The authors explicitly decline to call the original
wrong: observational data alone cannot resolve it.

**Confidence: HIGH on direction, MEDIUM on magnitude.** Under every reading — original,
replication, or critique — intercept variance dominates slope variance. How *completely* it
dominates is unsettled.

**Scope warning, stated plainly.** Koedinger's corpus is procedural ITS practice with
knowledge-component tagging. Engram teaches **self-directed adults hard conceptual material**.
Applying this finding to Engram's setting is an **extrapolation**, not a demonstration. It is
labelled as one here and everywhere it is used.

**Consequence for Engram.** Stop trying to make the learner climb faster; there is little
evidence that is a thing you can do. Instead: **give them more climbs** (return — §4), **make
each climb count** (generation-first encoding — `docs/01`), **stop them sliding back down**
(the schedule — §2), and **start them at the right altitude** (frontier diagnosis — which Engram
already does well). This is the single most liberating finding in this document: *Engram does
not need a smarter tutor. It needs a learner who comes back.*

---

## 2 · Retention engineering — what the schedule still owes

**The north star was never computed.** `docs/04` named "7-day and 30-day retention on scheduled
reviews" the north star in Phase 0. `grep` finds no such metric in `engram.py` to this day.
`stats` reports `recall_by_stability` — which buckets by memory *strength*, not elapsed *time*.
Naming a metric is not measuring it. (Fix: `docs/09` §4.2.)

**The honest denominator.** Any retention figure computed only over *completed* reviews silently
drops exactly the concepts the learner abandoned — which are, definitionally, the ones that
decayed. That is survivorship bias with a progress bar. Engram must never publish a retention
number without publishing what it *did not measure*. This is the same discipline as
`modality.caveat`, for the same reason, and it is non-negotiable.

**Successive relearning** (Rawson & Dunlosky) — retrieval **to criterion** within a session,
then spaced re-retrieval across sessions — is cited in `docs/01` P2 and **not implemented**.
Engram currently does one-shot-then-schedule. This is a live design question with real evidence
behind it, and it is the most promising unexploited item in the retention literature for this
codebase. **Status: flagged for v0.6+, not yet specified.** Do not implement it on the strength
of this paragraph; specify it against the primary sources first.

**`refit` is honest and coarse.** A single `interval_multiplier`, clamped [0.5, 1.5], gated at
≥50 review receipts. Full per-parameter FSRS optimization is future work, and the README says so.
It should stay that way until the review volume justifies it — a 20-parameter fit on 50
observations is not a fit, it is a fiction.

---

## 3 · The oracle — can an LLM be trusted to grade?

**This is the deepest hole in the project, and it sits directly under the foundation.**

Engram's central architectural claim is separation of powers: a blind assessor grades free-recall
productions into receipts, and receipts drive everything — mastery, retention, calibration, the
schedule itself. The constitution says *"receipts or it didn't happen"* and *"the oracle is
never a vibe."*

**The oracle has never been measured.** Not once. If it is lenient, every number Engram has ever
reported is inflated, and the project has no mechanism that could discover this.

**What the literature says, and it is worse than expected.**

*"Reliability without Validity: A Systematic, Large-Scale Evaluation of LLM-as-a-Judge Models"*
([arXiv 2606.19544](https://arxiv.org/html/2606.19544v1)), across 21 models:

| Finding | Number | Why it matters here |
|---|---|---|
| Agreement with human ground truth (Cohen's κ, MT-Bench) | **0.376–0.511**, mean ≈ **0.45** | *Moderate*. Well below the **QWK ≥ 0.70** conventionally required of automated scoring. |
| **Kappa deflation** — raw accuracy vs. chance-corrected κ | **33.8–41.2 percentage points** | "The grader looks right 85% of the time" is compatible with κ ≈ 0.45. **Raw agreement is a liar.** |
| The consistency–bias paradox | one model: test–retest **0.992**, position bias **0.192** | **High consistency + high bias = failure mode.** A judge can be perfectly reproducible and systematically wrong. |
| Verbosity bias | **< 0.011** across all 21 | A 2023-era concern that has since been *fixed*. Report it as dead. |
| Judge rankings across benchmarks | shift by up to **14 positions** | Single-benchmark validation is insufficient. |

Separately, leniency is real and model-dependent: in one 2026 clinical-grading comparison, Gemini
was more lenient than humans on **8 of 11 criteria** while GPT-5 was consistently harsher. **The
grader's identity is a confound.**

**Contested — the adversarial check on the adversarial source.** Those κ figures come from
**open-ended preference judging** (pairwise, no rubric, no reference answer). Engram's assessor
has a **canonical claim, an explicit 2–4 criterion rubric, and a reference** — a far more
constrained task, and rubric-anchored short-answer grading typically scores materially higher.
So κ ≈ 0.45 is a **floor for the hardest case, not an estimate for Engram's**. This *softens*
the alarm; it does not remove it. **The number for Engram's assessor is unknown, and unknown is
not a defence.**

**The paradox is the part that should frighten this project specifically.** Engram's assessor is
prompted to be a skeptic, to round down, to cite the rubric. It will therefore be *extremely
self-consistent*. The literature's central warning is that self-consistency **is not evidence of
correctness** — it is exactly what a reliably-lenient grader also looks like. Engram's own
constitution rejects the tutor's self-assessment as corrupt; it has been accepting the
assessor's on faith.

**Consequence for Engram — the Minimum Viable Validation Protocol.** Adapted from the paper's
MVVP to educational grading (specified in `docs/09` §4.4, shipped in v0.7):

1. **Chance-corrected metrics as the headline.** Report **QWK**, never raw agreement. Raw
   overstates by 34–41 points.
2. **A gold set, N ≥ 60**, human-adjudicated, dominated by the adversarial cases where graders
   actually fail: *fluent-but-empty*, *terse-but-correct* (the author's own real pattern),
   *confident-and-wrong*, *right-answer-wrong-reason*, *paraphrase*, *partial-credit boundary*.
3. **Signed leniency bias** — the education analogue of position bias. `mean(grader − gold)`.
   Positive means inflating. **Reject above +0.15.**
4. **Test–retest over ≥3 runs**, temperature 0, caching disabled.
5. **Audit the paradox explicitly.** When test–retest > 0.95, *verify leniency < 0.15 before
   trusting it.* High consistency plus high bias is the documented failure mode, and it is the
   one Engram's prompt design actively selects for.
6. **Teeth.** If the audit fails, `stats` stamps every retention figure `grader_unvalidated:
   true` and `/coach` must say so before reporting any number.

**And publish the result — including a bad one.** A project whose entire thesis is honest
measurement does not get to hide its own worst measurement. "Our grader agrees with human
adjudication at QWK = 0.79; here is the gold set; run it yourself" is a sentence almost nobody
in AI education can currently say. It is available to Engram for about one release of work.

---

## 4 · Adherence — the binding constraint

**The mechanism that kills spaced-repetition systems is review debt, and it is a design defect,
not a character defect.**

The consistently-reported abandonment path for Anki — the most successful SRS ever built — is:
miss a few days → the scheduler stacks every overdue card into the next session → the pile
becomes unfaceable → guilt → quit. Users describe it as burnout; the honest reading is that the
tool presents a **wall of debt** at exactly the moment the human is most fragile, and then makes
the debt the first thing they see.

**Confidence: MEDIUM, and the gap is itself a finding.** The mechanism is documented consistently
across practitioner sources and is congruent with Silverman & Barasch (2023, *JCR*, 7 studies,
~5,000 participants: a broken streak depresses subsequent engagement; **a repair/amnesty option
causally restores it, +14.5 pp**) and with Lally et al. (2010: a single missed day *"did not
materially affect"* habit formation). But **there is no rigorous published dropout curve for
Anki or any SRS.** Nobody has measured it properly. This is stated as an **OPEN** below, and it
is one of the questions Engram's own fleet could actually answer (§8).

**Implementation intentions — the highest-value, lowest-cost adherence move available.**
Gollwitzer & Sheeran (2006): **94 independent tests, N > 8,000, d = 0.65** on goal attainment.
Medium-to-large, does not shrink with sample size (robust to publication-bias correction), and it
survived the post-2015 replication crisis that trimmed much of the social-psychology canon. It
works by pre-committing a *cue* to an *action*: "when I open the terminal in the morning, I clear
one review."

**Consequence for Engram.** Three moves, all cheap, none of them a game:

1. **Ask for the if-then plan, once, at the close of `/learn`** — in the learner's own words →
   `engram.py commit`. Stored, shown back at the moment it names, **never enforced**. It is the
   learner's own sentence repeated to them, not a reminder system. (`docs/09` §3.1, v0.6.)
2. **Never present the debt.** Amnesty first, cap the session, leave the rest un-guilted. This is
   already law in `docs/05` P14 and `/review`'s return protocol; v0.6 makes the engine compute
   the honest numbers behind it.
3. **Remove the friction on the highest-value action.** The 2-minute review is currently gated
   behind *remembering to type `/review`*. The session hook announces; it does not offer. That is
   friction placed exactly where the evidence says friction is fatal, and it is a bigger loss
   than any pedagogical refinement shipped in v0.5.

**The streak question, re-adjudicated adversarially.** Engram rejects streaks (`docs/05`:
overjustification; Sailer & Homner 2020; Hanus & Fox 2015). The steelman is real — streaks are
the single most effective retention mechanic in consumer edtech, and Silverman & Barasch show the
*loss* of one is genuinely demotivating. But note precisely what that paper shows: **the harm of a
broken streak, and the benefit of amnesty.** It is evidence *for* forgiveness mechanics, not
*for* streak counters. For an already-motivated adult who values autonomy — Engram's actual user
— a streak installs a proxy goal (*don't break the chain*) in place of the real one (*still know
this in a month*), and Goodharts the very metric the constitution bans. **Verdict: the rejection
stands.** What Engram takes from the streak literature is the *amnesty*, which it already has,
and the *cue-consistency*, which is what `commit` delivers honestly.

---

## 5 · Affect — what "joy" must mean before it can be a target

**Optimizing felt-joy directly would destroy this product.** Effortful learning *feels worse and
works better*; learners abandon effective strategies precisely because effort feels like failure
(Kirk-Johnson, Galla & Fraundorf 2019 — already load-bearing in `docs/05`). A system that chases
satisfaction will smooth away exactly the friction that does the work, and it will feel like a
triumph the whole way down. That is the fluency trap, wearing a smile.

**The rigorous frame is control × value** (Pekrun's control-value theory of achievement
emotions): enjoyment in learning is produced by the sense that *effort works* (control) and that
*the material matters* (value). Both are movable **honestly** by machinery Engram already owns:

- **Control** = competence made visible — the *real* FSRS stability jump, reported as
  information, never as a score (`docs/05` P13; Deci/Koestner/Ryan 1999: informational feedback
  lifts adult intrinsic motivation **d = +0.33**, while controlling praise nets **d = −0.78**).
- **Value** = the learner's own goal, **elicited and never preached** (Canning & Harackiewicz:
  telling low-confidence learners why material matters *lowers* their interest).

**Boredom is a detectable bug, not a mood.** It is the most corrosive academic emotion and it has
a telemetry signature Engram already collects: shortening productions, rising latency,
mode-switching, session abandonment. The existing adaptation policy (`docs/03` §5) already knows
what to do — *change the activity type* — and the Focus profile already raises the sensitivity.
This is a diagnostic input. **It is not an optimization target.**

**Consequence for Engram.** **Measure return. Diagnose with affect. Never optimize the feeling.**
The only joy Engram is permitted to manufacture is the joy of *actually being able to do the
thing* — the kind that survives contact with a blind grader. Every other kind is a defect.

**Relatedness remains genuinely open.** SDT names three basic needs; Engram serves autonomy and
competence and has **zero mechanism for relatedness**. Whether a local-first, single-player,
privacy-preserving tool can or should serve it — and whether an *AI* can satisfy relatedness at
all — is an honest open question, and nothing in this document licenses building a social feature
on a hunch. See §Open.

---

## 6 · Neuroscience — actionable vs. decoration

The name is literal: an *engram* is the physical memory trace (Semon 1904; localized by Josselyn,
Tonegawa et al.). But `docs/01` P11 already stated the rule this project lives by, and it holds:
*"None of this licenses neuro-decorated marketing; all of it licenses scheduling across nights."*

**The honest position, stated so nobody has to relitigate it:** almost no memory neuroscience is
*actionable* for a terminal-based tutor beyond what the behavioral literature already licenses.
Systems consolidation says space across sleep — **FSRS already does that**, for behavioral
reasons, and the neuroscience adds confidence rather than instructions. Synaptic tagging and
capture explains *why* spacing works at the cellular level — a satisfying mechanism, and it
changes **nothing** about what the software should do. Reconsolidation plausibly underlies why
retrieval *modifies* memory rather than reading it out, which is the mechanism beneath the
hypercorrection protocol Engram **already implements**.

**The discipline: a neuroscience finding earns a feature only if it yields a software behavior
that could be A/B-tested in Engram's own experiment machinery.** Almost none do. Mechanisms that
explain existing features are welcome as *understanding* and are forbidden as *marketing*.

**Killed, permanently — do not build on these:** neurogenesis-and-exercise as a study
intervention, "brain training" far transfer (Melby-Lervåg; the field collapsed), hemispheric
dominance, binaural beats, neuro-nutrition, "learning styles have a neural basis" (they do not —
`docs/01` §Rejections), and any claim whose primary support is a rodent study without human
behavioral replication at a magnitude that matters.

**A note on honesty in naming.** The project is called Engram and it should stay called Engram —
because it *builds* engrams, not because neuroscience decorates it. If a future release ever cites
a brain region to justify a feature, that release has gone wrong.

---

## 7 · The AI-tutoring evidence — the gains and the harms

**The strongest positive result in the field is, precisely, Engram's design.**

Kestin et al. (*Scientific Reports*, June 2025) — Harvard Physical Sciences 2, **n = 194**
undergraduates, within-subject alternating design against a **highly-refined active-learning
classroom** (not a weak control — active learning is the gold standard the AI had to beat):

> **Students learned roughly 2× as much, in less time, and reported higher engagement and
> motivation.**

And the tutor that did it was built like this: expert-authored scaffolds, **one step at a time**,
**never reveal the full solution**, and **make the student attempt it first**. That is the
`skills/_shared/dialogue-grammar.md` beat sequence, arrived at independently. It is the single
strongest external validation Engram has, and it should be cited in the README.

**The critical limitation, and it is Engram's entire reason to exist.** Kestin's outcome is an
**immediate post-test**. The retention interval is ~zero. The study demonstrates *superior
encoding*; it says **nothing** about whether the knowledge is there in a month. That is not a
criticism of the study — it is the boundary of what almost every AI-tutoring study measures, and
it is **precisely the gap Engram was built to fill**. The field can now show that AI tutors teach
better. Nobody has shown that AI tutors teach *durably*, because nobody is scheduling and
re-testing at 30–90 days. Engram does that natively, as a byproduct of being useful.

**The harms ledger — take these seriously.**

| Harm | Evidence | Engram's defence |
|---|---|---|
| **Over-help destroys durable learning** | Bastani et al. 2025 (*PNAS*): students with an unguarded GPT-4 tutor did **better with it and worse without it**; a guardrailed version avoided the harm | The struggle budget, the hint ladder, the anti-sycophancy oath, "never resolve a question the learner hasn't committed to" — **this is the harm Engram's dialogue grammar exists to prevent**, and it is now Article 11 (`docs/08` §7) |
| **Speed without knowledge** | *"Faster Completion, Less Learning"* ([arXiv 2605.21629](https://arxiv.org/pdf/2605.21629)): generative AI reduced study time on math problems **and the knowledge they built** | Engram deliberately makes the learner slower. The receipt, not the completion, is the unit of progress. |
| **Fluency illusion from excellent explanations** | `docs/01` P3; Koriat & Bjork | The blind assessor. "Makes sense" is zero evidence. |
| **Sycophancy leaking into the grade** | The RLHF default is to agree and flatter | Separation of powers — **and, from v0.7, an audited oracle**, because separation of powers without measurement is just a nicer-sounding assumption (§3) |

---

## 8 · Transfer — and the sharpest critique of Engram's core loop

**Steelman first, because it is a good critique.** Engram reviews by **verbal free recall**. If
the learner's goal is *to do* — write the code, make the decision, run the filter — then
transfer-appropriate processing says the practice format should match the use format, and
Engram may be training a genuinely different skill from the one that was paid for.

**The evidence adjudicates this precisely, and it is not comfortable.** Pan & Rickard (2018,
*Psychological Bulletin*) — the definitive meta-analysis on transfer of test-enhanced learning:

| Condition | Effect |
|---|---|
| Transfer of retrieval practice, overall | **d = 0.40** |
| **When the final test requires a *different response* than practice** | **d = 0.28** |
| When response format is congruent | **d = 0.58** |
| Bonus from **elaborated** retrieval practice (elaborative feedback / post-retrieval processing) | **+d = 0.23** |
| Higher initial accuracy | → greater transfer |

**Read that carefully.** Retrieval practice *does* transfer — the effect is real and positive
under every condition. But it **roughly halves** when the response format changes. Engram's
verbal free recall will transfer strongly to *verbal explanation* and substantially less to
*doing*. The critique is **partially correct**, and pretending otherwise would be exactly the
self-flattery this project was built to refuse.

**Two things Engram already gets right.** The **+0.23 elaboration bonus** is precisely the
SELF-EXPLAIN beat and the rubric-cited feedback line — Engram is already collecting it. And
"higher initial accuracy → greater transfer" is an argument for the difficulty setpoint and the
mastery gate, both of which exist.

**Consequence for Engram — this is what v0.8 is for.**

1. **`transfer_probe` must actually fire.** The curriculum architect has been authoring one per
   node since v0.1. The engine stores it. **Nothing has ever read it.** Wiring it up is a free
   capability measurement on data already being written (`docs/09` §4.2, `docs/10` v0.8).
2. **Match the probe to the goal.** A learner whose goal is *to build* should periodically be
   asked to *build*, not only to *explain*. The `transfer_probe` is the slot for exactly this,
   and the intake already collects the goal ("what do you want to be able to **do**?").
3. **Report transfer recall separately from recall.** Never pool them. They answer different
   questions, and only one of them is the question the learner actually asked.
4. **Do not overclaim.** Until transfer receipts exist, Engram is a **memory** system and should
   say so. It is an excellent one. It is not yet a demonstrated capability system, and the
   difference is a measurement, not an argument.

**Far transfer, honestly.** The broader far-transfer literature is largely a graveyard (working-
memory training, brain training, chess/music → general ability — all collapse under design
controls). Engram should promise **near transfer within a domain**, which is well-supported, and
promise nothing else. Anyone claiming their tool produces far transfer is selling something.

---

## 9 · The n-of-1 protocol — and why Engram's current one is underpowered

Article 7 ("adapt on evidence, never taxonomy") is the article that replaces learning styles with
real per-learner measurement. The machinery that implements it — `experiment` — is **not
currently sound enough to support the claims it exists to make.** Three defects, each checkable
against the single-case experimental design (SCED) literature:

**Defect 1 — it is not randomized.** `experiment assign` allocates arms **round-robin**
(`arms[len(assignments) % len(arms)]`). Alternation is not randomization. It is perfectly
predictable, it confounds arm with position in the topic's `order`, and it forecloses the one
analysis that would make the result defensible: **the randomization test**, which is the standard
inferential tool for SCED precisely because it makes no distributional assumptions.

**Defect 2 — it is underpowered, by roughly 2.5×.** Engram's convention is `min_per_arm: 6` —
12 observations total. Engram's design is an **alternating-treatments design** (two strategies
alternated across comparable nodes), and the SCED literature puts sufficient power for that
design at **≈28–30 measurements** with independent data. WWC design standards separately require
≥3 data points per phase (preferring ≥5) and **at least three attempts to demonstrate an effect**.

> **`min_per_arm` should be ~15, not 6** — and `stats.modality`'s identical ≥6 floor inherits the
> same defect. A verdict rendered at n=6 per arm is not a cautious finding; it is noise with a
> confidence interval nobody printed.

**Defect 3 — the arms are confounded by construction, and this is already documented.**
`docs/06` §Open Q2 records it honestly: explorables are routed to threshold and high-affordance
concepts *on purpose*, so the two arms of `stats.modality` differ in **material** as well as
**medium**. The document disclosed the confound. It did not fix it. The fix is **stratified
randomization** — randomize the medium *within* a single affordance class — which is the only
form of the question that can be asked without violating the content rule `docs/06` itself
establishes.

**The defensible protocol** (specified in `docs/09` §4.5, shipped in v0.9):

| Element | Requirement | Source |
|---|---|---|
| **Design** | Alternating treatments across comparable nodes | matches Engram's structure |
| **Randomization** | Random arm assignment with a **recorded seed** — deterministic, auditable, reproducible | randomization tests require it |
| **Stratification** | Within `threshold` × `viz.affordance` × difficulty, so material cannot ride along with arm | `docs/06` §Open Q2 |
| **n** | **≈15 per arm** (≈30 total), not 6 | SCED alternating-treatments power (~28–30) |
| **Analysis** | **Randomization test**, computed by `engram.py` — never narrated by the model | SCED standard; Article 10 |
| **Rater reliability** | WWC requires inter-rater reliability on ≥20% of sessions. **Engram's rater is the assessor.** | → this is exactly what v0.7's audit provides |
| **Pre-registration** | Question, arms, metric, `min_per_arm`, analysis plan — written **before** any datum exists | the design file *is* the pre-registration |
| **Honest null** | Below n, the engine reads `underpowered` and refuses a verdict | Article 10 |

Note the quiet convergence in row 6: **the SCED literature independently requires the thing v0.7
builds.** A single-case experiment is only as good as its rater, and Engram's rater is an
unaudited LLM. **v0.7 is not merely adjacent to v0.9 — it is a precondition for it.**

**And the payoff, which is the argument of `docs/08` §6.** A properly randomized, stratified,
pre-registered n-of-1 protocol, executed identically on hundreds of machines and aggregated
opt-in, is a **series of n-of-1 trials** — a recognized and powerful design. It would let Engram
answer, with real data, questions the field currently answers with argument: *does explorable
encoding beat dialogue, and for whom? Does derivation-first beat example-first, and in which
domains? What is the optimal desired-retention for conceptual material?* None of these has an
answer today. All of them are answerable by this fleet.

---

## What remains honestly open

Nothing below has an answer this document is willing to assert. Each gets a conservative stance —
and each is a question **Engram's own fleet could actually settle**, which is the argument of
`docs/08` §6.

1. **The SRS dropout curve.** Nobody has published a rigorous abandonment curve for Anki or any
   spaced-repetition system. The review-debt mechanism is well-attested; the *magnitude* is
   folklore. → Engram's `adherence` telemetry (v0.6), aggregated opt-in (v1.0), would be the
   first real measurement of this. **The field would take it.**
2. **Engram's own grader validity.** Unknown. Not "probably fine" — **unknown**. → v0.7 measures
   it and publishes the number, including a bad one.
3. **Successive relearning in a conceptual DAG.** Strong evidence in the flashcard literature;
   untested for derivation-chained conceptual material. → Specify against primary sources before
   building; do not implement on the strength of §2.
4. **Relatedness in a single-player tool.** Whether an AI can serve SDT's third need at all is
   unsettled, and building a social feature on a hunch would violate Article 7. → No feature until
   evidence.
5. **Does AI-tutoring's encoding advantage survive to 30 days?** The field has *never measured
   this* — Kestin and essentially every other study stop at the immediate post-test. → **This is
   the question Engram is uniquely built to answer, and answering it would be a genuine
   contribution to the literature rather than to a product.**

---

## The founding question, answered

**Q: "The psychological and neuroscience approach to increase learning rate and retention on any
topic is super valuable. Which vectors should we maximize?"**

**A: The premise contains the error, and finding it is the most useful thing in this document.**

**Learning rate is not a lever.** Learners climb at strikingly similar rates; they start on
wildly different floors (§1). You cannot make someone learn faster. You can give them more
opportunities, make each one count, start them in the right place, and — above all — **stop them
forgetting**, which is the only one of the four where a piece of software has real leverage and
the only one Engram has never actually delivered.

**Neuroscience adds almost no features.** It explains, beautifully, why the behavioral findings
work. It licenses scheduling across nights, and that is roughly it (§6). A release that cites a
brain region to justify a feature has gone wrong.

**And the vector that matters was not on the list: RETURN.** It multiplies every other term to
zero, it is currently zero for the author, in production, and the system cannot even *see* it.
Below that sits a second, quieter one: **the grader that writes every receipt has never itself
been graded** (§3), which means every number above it is, at present, unearned.

Slogan version, to sit beside the others:

> *You cannot make them faster. You can only make them come back, make it count, and be honest
> about the difference — starting with the honesty of the machine that grades them.*
