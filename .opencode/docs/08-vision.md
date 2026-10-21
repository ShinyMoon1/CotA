# 08 · The Vision: What Engram Is For, and What to Maximize

This document answers two questions the project has never answered in writing:

1. **What is the one number Engram exists to move** — and which of the many appealing numbers
   are traps?
2. **What is Engram at its final state** — not "with more features," but structurally: what
   kind of thing is it, when it is finished?

It is written after `docs/01`, `05`, `06` (the science), `02` (the field), `03` (the engine as
built), and `07` (the science the first six documents did not yet contain). It is the document
the others were building toward, and it opens the way the others do: with the most inconvenient
fact available.

---

## The exhibit

On 2026-07-05, Engram's author ran a 45-minute `/learn` session on transformer internals. It
was, by every visible measure, an excellent session: the curriculum architect built a 13-node
first-principles DAG; the tutor ran generation-first dialogue and the learner derived the
attention/FFN division and the linear-collapse argument himself; the artifact-smith built an
explorable for the threshold node; the blind assessor graded six productions and — correctly,
unflatteringly — rounded most of them down to `partial`.

Seven concepts were encoded. Seven review dates were booked. The engine did everything right.

**Then nobody came back.** Six days later: zero reviews, zero streak, no coach check-in, seven
items overdue. One session in the log. Ever.

Run Engram's own FSRS curve over Engram's own state, and the engine will tell you exactly what
that costs. This is not a mock-up — it is literal output from `engram.py decay --topic
transformers` on 2026-07-11, and the v0.6 exit criterion is that it stays reproducible:

```
node                     S(days)   R today   R in 30d (no review)
tokens-as-vectors            1.4       71%             38%
contextual-meaning           3.7       85%             55%
attention-routing            1.4       71%             38%
residual-stream              1.4       71%             38%
attention-ffn-division       1.4       71%             38%
ffn-mechanics                0.5       51%             23%
nonlinearity-necessity †     1.4       71%             38%
──────────────────────────────────────────────────────────────
MEAN                                    70%             38%

expected alive 30 days from today, untouched      :  2.7 of 7
expected alive if the 7 due reviews happen now    :  5.6 of 7   (≈ 4 minutes)
difference                                        :  2.9 concepts
```

Both arms are measured over the **same future window** — the next thirty days — so this is an
honest comparison rather than a rhetorical one: *do nothing* versus *spend four minutes*, from
today, on the same seven memories.

Four minutes is worth **2.9 concepts**. The system has always been able to compute this. **It has
never once said it.** Its entire ambient surface, on the sixth day of a memory dying on
schedule, was: `[engram] 7 reviews due (~4 min)`.

This is not a story about a lazy user. It is the product's own failure mode, executing
perfectly, on the person with the most knowledge of and investment in the product on earth. If
it happens to him, it is not a motivation problem. **It is an architecture problem**, and every
word below follows from taking that seriously.

Meanwhile, 501 people starred the repository in six days.

The demand for the *idea* is enormous. The evidence that the *loop closes* is zero.

---

## 1. What Engram actually is (as of v0.5.2)

Stated without generosity, because generosity is how projects die comfortable:

| Engram claims to be | Engram demonstrably is |
|---|---|
| a memory system | an **encoding** system with a memory system attached, unrun |
| a system that measures learning | a system that measures *encoding*, and has never computed its own north star |
| a capability builder ("meet the learner in their real work") | a **recall** builder; `transfer_probe` is authored, stored, and read by nothing |
| evidence-driven, receipts-or-it-didn't-happen | true — except the **grader that writes the receipts has never been graded** |

Every one of those is fixable, and none of them is a criticism of the design. The design is
right. `docs/01` is research-grade. The separation of powers is a genuine invention. The engine
is clean, hardened, and honest. What is missing is not intelligence — it is **the half of the
loop that happens after the learner closes the terminal**, and the instruments that would have
made its absence impossible to ignore.

---

## 2. The objective function

Everything a learning system produces reduces to one quantity:

> **How many things can this person now do or explain, that they could not before, that are
> still there in a month — divided by the hours it took.**

Formally, over a learner's concepts *c*:

```
                 Σ  Alive(c, T) × Worth(c)
   VALUE(T)  =  ───────────────────────────
                        Hours
```

- **Alive(c, T)** — can the learner *produce* c, verified by a blind grader, at time T? This is
  not a proxy. It is exactly what a `/review` is. Engram measures it natively and no other tool
  in its category does.
- **Worth(c)** — revealed by choice. The learner picked the topic; autonomy makes Worth
  self-reporting, and the system never gets to second-guess it.
- **Hours** — from `sessions.jsonl`.

And Alive decomposes — this is the whole argument:

```
   Alive  =  Encoded  ×  Retained  ×  [Transferred]
                            ▲
                            └── which requires Reviews
                                          ▲
                                          └── which requires RETURN
```

**These terms multiply. They do not add.** A learner with world-class encoding, a perfect
scheduler, and zero return has `Alive = 0`. Not "diminished." Zero. That is not a hypothetical:
it is §The exhibit, and it is the current state of the founder's own account.

The most important structural fact about learning systems, and the one Engram's roadmap has
never reflected: **the terms are ordered, and the binding constraint moves.** Optimizing a term
that is not currently binding produces nothing. Engram has spent five releases optimizing
encoding quality — brilliantly — while the term multiplying it sat at zero.

---

## 3. The vectors — which to maximize, and which are traps

The founder proposed five candidates: *learning rate, retention, confidence, joy of learning,
UX*. Four of them need surgery, and the one that matters most is not on the list.

### 3.1 Learning rate — **do not optimize this. It is close to a category error.**

The intuition is that some people learn faster, and that a great system makes you learn faster.
The evidence points the other way, and it is among the most striking findings in modern
education research.

Koedinger et al. (2023, *PNAS*) fit an individual Additive Factors Model to **1.3 million
practice observations from ~7,000 learners across 27 datasets** and found an *astonishing
regularity in student learning rate*: once each student's **initial** knowledge is modeled, the
**rate** of learning per practice opportunity is remarkably uniform. Learners differ enormously
in where they *start* and strikingly little in how fast they *climb*.

It **replicated** independently — Zhang et al. (EDM 2024) refit it on much larger MATHia data
across six math topics: student *slope* IQRs of 0.006–0.118 (Koedinger's max was 0.102), against
student *intercept* spreads up to **1.04 logits**. Two orders of magnitude separate how
differently people start from how differently people climb.

**And the honest caveat, which matters:** a 2026 re-analysis ("The 'Astonishing Regularity'
Revisited") shows the *magnitude* of estimated rate-uniformity is sensitive to practice-sequence
length — capping sequences at 10 opportunities inflates median slope-IQR by 75%, at 5
opportunities by 205% — because in mastery systems fast learners exit early and strugglers
accumulate long sequences ("informative observation length"). The authors explicitly decline to
call the original wrong; they say observational data alone cannot settle it. So: **the direction
is robust and replicated; the exact degree of uniformity is contested.** And Koedinger's corpus
is procedural ITS practice (K–college math/science/language), not self-directed adults on hard
conceptual material — applying it to Engram is an extrapolation, and is labelled as one.
(Full treatment: `docs/07` §1.)

None of that rescues "learning rate" as a lever. Under every reading — original, replication, or
critique — **intercept variance dwarfs slope variance.** The levers are:

| Not this | But this |
|---|---|
| make the learner climb faster | **give them more climbs** (opportunities → *return*) |
| — | **make each climb count** (encoding quality → generation, difficulty setpoint) |
| — | **stop them sliding back down** (retention → the schedule) |
| — | **start them at the right altitude** (frontier diagnosis → Engram already does this well) |

This is *good news*, and it is the most actionable finding in this entire document: it means
Engram does not need a smarter tutor. **It needs a learner who comes back.** The ceiling on
learning is not cognitive. It is behavioral.

### 3.2 Retention — **yes. This is the north star. It has never been measured.**

`docs/04` named "7-day and 30-day retention on scheduled reviews" the north star in Phase 0.
`grep` finds no such metric in the engine. `stats` reports `recall_by_stability` — which buckets
by memory *strength*, not elapsed *time*, and which is empty anyway, because there have been
zero reviews.

The north star is correct. It must actually be computed, and it must be computed **with its
honest denominator** — including the concepts that came due and were never reviewed. A retention
figure that quietly drops the abandoned concepts is survivorship bias with a progress bar.
(Spec: `docs/09` §4.2.)

### 3.3 Confidence — **no. Optimize calibration, and confidence is a hazard.**

This one is a trap with a body count. High confidence that is not earned is the **fluency
illusion** — the single most destructive force in self-directed learning, and the thing Engram
was built to defeat (`docs/01` P3, P9). A system that maximizes felt confidence maximizes
exactly the signal that makes learners stop studying too early.

The right target is **calibration**: does the learner's stated confidence track their actual
accuracy? Brier score → 0. Engram already collects confidence-before-feedback and already
computes calibration. It is not a vector to *raise*; it is a **guardrail that must not degrade**
while other vectors rise. (See §4.)

The honest reframe of what the founder wants: not confidence, but **earned confidence** — which
is just calibration plus competence. You get it by making the competence real and the mirror
honest. You never get it by tuning the mirror.

### 3.4 Joy of learning — **not directly. Optimize return; treat joy as a diagnostic.**

This is the subtlest trap in the list, and getting it wrong would destroy the product.

Effortful learning **feels worse and works better**. Learners abandon effective strategies
precisely *because* the effort feels like failure (Kirk-Johnson, Galla & Fraundorf 2019 —
already load-bearing in `docs/05`). A system that optimizes felt-joy will, with perfect
sincerity, walk straight into fluency theater: smoother explanations, fewer struggles, prettier
artifacts, higher satisfaction, less learning. It would feel like a triumph the entire way down.

So joy is not the objective. But it is not nothing either — because **joy's behavioral
consequence is return, and return is the binding constraint.** The resolution:

> **Measure return. Diagnose with affect. Never optimize the feeling directly.**

`docs/07` supplies the rigorous frame (Pekrun's control-value theory): enjoyment in learning is
produced by **control** × **value** — the sense that effort works, and that the material
matters. Both are things Engram can move *honestly*: control is competence made visible (the
real stability jump — Pillar 13); value is the learner's own goal, *elicited* and never
preached (Canning & Harackiewicz — `docs/05` P14). And boredom, the most corrosive academic
emotion, is a **detectable bug** with a telemetry signature Engram already collects.

The joy Engram is allowed to produce is the joy of *actually being able to do the thing* — the
kind that survives contact with a blind grader. Every other kind is a fluency trap wearing a
smile.

### 3.5 UX — **yes, but its job is friction, not delight.**

Engram's UX target is not beauty. It is: **`time_to_first_retrieval` → 0.**

The 2-minute review is the highest-value action in the entire product and it is currently gated
behind *remembering to type `/review`* — a friction step placed at exactly the moment where the
evidence says friction is fatal. The hook announces; it does not offer. That is a UX failure
worth more than every visual feature shipped in v0.5.

### 3.6 The two vectors that were not on the list — and are the ones that matter

**RETURN.** The multiplier on everything. Currently zero for the author. Nothing else in this
document can be true until this is non-zero, and no amount of pedagogical excellence
substitutes for it. **This is the binding constraint, and it is where the next release goes.**

**ORACLE VALIDITY.** The blind assessor's grade drives mastery, retention, calibration, and the
schedule itself. Its agreement with any ground truth has **never been measured**. If it is
lenient, every number Engram reports is inflated — and the project would have no way to know.
The constitution says *"receipts or it didn't happen"* and *"the oracle is never a vibe."*
Right now the oracle **is** a vibe: a very good one, unaudited. That is the deepest hole in the
project, and it sits directly under the foundation.

---

## 4. The frame, assembled

```
                       THE ONE NUMBER
        verified concepts still alive at 30 days, per hour
                   (blind-graded. no exceptions.)
                              ▲
      ┌───────────┬───────────┴───────────┬───────────┐
      │           │                       │           │
   RETURN     ENCODING              RETENTION     TRANSFER
  the gate    the yield             the schedule   the point
      │           │                       │           │
 loop_closure  first_review_recall   retention_30d  transfer_recall
 return_rate   partial_rate          review_minutes  applied_in_real_work
 time_to_first_retrieval             lapse_rate
      │           │                       │           │
      └───────────┴───────────┬───────────┴───────────┘
                              │
                        GUARDRAILS
        these must not degrade while the above rise
    ┌─────────────────┬──────────────────┬──────────────────┐
    │  CALIBRATION    │  ORACLE VALIDITY │    AUTONOMY      │
    │  Brier → 0      │  QWK vs. gold    │  no dependence,  │
    │  (anti-fluency) │  (anti-flattery) │  no dark patterns│
    └─────────────────┴──────────────────┴──────────────────┘
```

**Why guardrails and not vectors:** each of the three can be traded against the north star, and
each trade is invisible from inside. Retention rises if the grader gets lenient. Return rises if
you add streaks and manufactured urgency. Encoding "improves" if you make it fluent and easy.
All three would show up as *wins* on the dashboard. Guardrails are the tripwires that make
those wins impossible to book.

### The banned metrics (Goodhart bait — never ship these)

Completion %. Streak length as a goal. Minutes spent. Cards created. XP, points, badges, levels.
Topics started. Nodes "covered." Sessions logged. Anything that goes up when the learner does
more *of the system* rather than more *of the learning*.

`docs/04` banned most of these already. The list is now closed and constitutional.

---

## 5. The final state

Engram's finished form is **not a better tutor**. Three layers, strictly gated — each one
load-bearing for the next, and each one currently un-earned.

### Layer 1 · THE LOOP — *a tutor whose retention half actually runs*

The 2-minute review becomes the lowest-friction action in the terminal. The system tells you,
honestly and once, what is dying and what four minutes would save. It books your return in your
own words. Retention is computed — with its unmeasured denominator — and shown.

**Gate:** *you cannot be an instrument if your own loop does not run.*

### Layer 2 · THE INSTRUMENT — *an honest mirror, with an audited oracle*

Every claim Engram makes about a learner traces to a grade, and **every grade traces to a grader
whose agreement with human adjudication has been measured and published**. The learner sees:
what they know, how durably, how well-calibrated they are, and *how much to trust the grade
itself*. The n-of-1 experiment engine becomes methodologically defensible — randomized,
stratified, pre-registered, powered, and settled by the engine rather than narrated by a model.

**Gate:** *you cannot aggregate what you cannot trust.*

### Layer 3 · THE COMMONS — *the science*

Opt-in. Anonymized. Aggregate. **The engine still never touches the network** — it writes a
file you read, and you decide.

And then something becomes possible that has not been possible before.

---

## 6. What psychology and neuroscience actually dreamed about

The founder's claim is that Engram could be "THE learning platform that psychology and
neuroscience dreamed about." That is worth taking literally, because the field has been quite
explicit about its dreams, and they are all still open:

| The dream, in the field's own words | Status | Engram's shot |
|---|---|---|
| **Bloom (1984):** find a scalable method as effective as one-to-one mastery tutoring — "the 2-sigma problem," posed as the field's grand challenge | open for 40 years | step-level AI tutoring at zero marginal cost is the first honest attempt (VanLehn: step-based ITS d≈0.76 — see `docs/07` §7 for what 2σ *really* replicates at) |
| **Ebbinghaus → Cepeda:** we have known the forgetting curve for 140 years, and almost nobody lives on an optimal schedule | open | FSRS, fitted per person, free, on any subject |
| **Dunlosky et al. (2013):** we *know* which techniques work (practice testing, distributed practice — the only two rated "high utility"), and students overwhelmingly use the ones that don't | open | the high-utility techniques become the **default behavior of the tool**, requiring no willpower and no knowledge of the literature |
| **The metacognition literature:** learners systematically misjudge what they know, and it is fixable, and nobody fixes it | open | confidence-before-feedback, on every item, forever, shown back to its owner |
| **The ITS/AIED field:** 40 years of hand-building a domain model per subject — the content bottleneck | **dissolved, 2023–2026** | an LLM writes the domain model in 90 seconds, for any topic, for free |
| **The replication crisis in learning science:** the evidence base is built on undergraduates, word-pair stimuli, and 20-minute retention intervals. Almost nothing tests self-directed adults, on genuinely hard conceptual material, at 30–90 day horizons, with free-recall grading. | **wide open, and nobody is even close** | ← **this one** |

That last row is the vision.

The field's own evidence base is weakest in **exactly the place Engram is structurally
strongest**. Engram produces, natively and as a byproduct of being useful:

- **blind-graded free recall** — real ground truth, not self-report, not multiple choice
- **on real, hard, self-chosen material** — not word pairs, not a lab passage
- **at real horizons** — 30, 60, 90 days, because the scheduler is *made* of horizons
- **with the schedule and the teaching strategy under experimental control**
- **with append-only, auditable receipts** — cleaner provenance than most published studies
- **on hundreds of machines already**, at 83 stars/day

Anki has scale but no ground truth (you grade yourself). Labs have ground truth but no scale and
no ecological validity. Duolingo has both and publishes almost nothing, on shallow material.
**Nobody has blind-graded, long-horizon, real-material, strategy-randomized learning data at
scale — because until 2026, grading free recall at scale was impossible.** It is not impossible
anymore. It costs a fraction of a cent.

So the final state, stated plainly:

> **Engram is the instrument that closes the loop between learning science and learning
> practice — in both directions.**
>
> **Downward:** the best-verified findings become the default behavior of a tutor anyone can
> install in thirty seconds and never think about again.
>
> **Upward:** every learner's honest receipts — opt-in, consenting, text-stripped — flow back into a
> public evidence base that can settle questions the field has never been able to settle,
> because it has never had this data.
>
> Not a platform that *applies* the science. **A platform that runs it.**

The open questions in `docs/06` — *does explorable encoding actually beat dialogue? for whom?* —
stop being disclaimers and become **experiments the fleet can settle**. So does *does
derivation-first beat example-first, and for which domains?* So does *what is the optimal desired
retention for conceptual material?* — a question the FSRS community can only answer for
flashcards, because flashcards are all they have.

Each of those is a real open question. Engram is the only system on earth positioned to answer
any of them with blind-graded, free-recall, long-horizon data. That is not a feature roadmap.
That is a scientific instrument that happens to be useful enough that people install it for
selfish reasons — which is precisely why it will get the data that funded studies cannot.

---

## 7. What Engram refuses to become

The vision is expansive; the refusals are what keep it honest.

- **Not a cloud service.** The engine contains no network code. Not "off by default" — *absent*.
- **Not a course platform.** No fixed content, ever. Content is generated per learner, per goal.
- **Not a game.** No XP, no badges, no levels, no leaderboards, no streak-as-goal. (`docs/05`;
  `docs/07` re-adjudicates the streak question adversarially and reaches the same verdict for
  this user base.)
- **Not an engagement product.** No metric that rewards time-in-app. No manufactured urgency. No
  dark patterns. **The system should be entirely comfortable with you not needing it.**
- **Not a credential.** No certificates, no scores as status. The receipt is for the learner.
- **Not a flatterer.** The assessor is blind, and — from v0.7 — audited, publicly, against a
  gold set anyone can inspect.
- **Not a data business.** Aggregation is opt-in, consenting, free-text-stripped and human-triggered;
  the file is written for the learner to *read before* they share it. And it is **attributed, and
  says so** — a `gh`-posted "anonymous" hash would be a lie, because the envelope carries the
  identity (`docs/09` §4.6). Engram would rather ask for real consent than fake anonymity.

### Article 11 — the new constitutional article

The existing ten articles (`docs/04`) govern how Engram teaches. One is missing, and it governs
what Engram is *for*:

> **11. The system's success is measured by what the learner can do without it.**
>
> Every other software product on earth optimizes for your return. Engram optimizes for your
> *retention* — which means it must be willing to become unnecessary for everything it has
> already taught you. An AI tutor that makes you dependent has not taught you; it has rented you
> a capability (Bastani et al. 2025, *PNAS*: an unguarded AI tutor made students better *with*
> it and **worse** without it). The review is, structurally, a test of independence: can you
> produce this with the machine silent? That is the only question Engram ever really asks, and
> the only answer it is allowed to count.

---

## The founding question, answered

**Q: "Which vectors should we maximize? Learning rate, retention, confidence and joy of
learning, user experience?"**

**A: One of those is a category error, two are traps, one is right but has never been measured,
and the two that matter most are not on the list.**

- **Learning rate** — do not optimize. Learners climb at strikingly similar rates; what differs
  is where they *start* and how many climbs they get (Koedinger 2023, replicated EDM 2024; the
  degree of uniformity is contested, the direction is not). This is *liberating*: it means
  Engram does not need a smarter tutor. **It needs a learner who comes back.**
- **Retention** — correct, and it is the north star. Now compute it, with the honest denominator
  that counts the concepts you abandoned rather than quietly dropping them.
- **Confidence** — a trap. Unearned confidence *is* the fluency illusion, the thing Engram
  exists to kill. Optimize **calibration** and treat confidence as a guardrail that must not
  degrade.
- **Joy** — a trap if targeted directly, because effortful learning feels worse and works better,
  and a system chasing felt-joy will smooth away exactly the friction that does the work.
  Measure **return**; diagnose with affect; produce the only joy that survives a blind grader —
  the joy of actually being able to do the thing.
- **UX** — yes, but its job is **friction**, not delight: `time_to_first_retrieval → 0`.
- **RETURN** — *not on the list, and it is the binding constraint.* It multiplies everything else
  and it is currently zero, for the author, in production.
- **ORACLE VALIDITY** — *not on the list, and it sits under the foundation.* The grader that
  writes every receipt has never itself been graded.

Slogan version, to sit beside the engine's and the affective layer's:

> *Derive what can be derived, memorize only the arbitrary, test everything, schedule everything
> — and then: **come back, measure what you kept, audit the thing that grades you, and give the
> numbers away.***
