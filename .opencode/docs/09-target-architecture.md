# 09 · Target Architecture: What the Engine Must Grow

`docs/03-architecture.md` describes the engine **as built** — and it is a good engine. This
document describes the engine **as it must become** to make the claims in `docs/08-vision.md`
true, and it is written to be executed by someone who is not me: every schema is given in
full, every new command has a signature, every invariant that must not break is named, and
every change carries the selftest that proves it.

Read `docs/03` first. This document is a *delta*, not a replacement. Where the two disagree,
`03` describes today and `09` describes the target.

---

## 1. The three structural gaps (verified, not asserted)

Engram v0.5.2 is an excellent **encoding** machine bolted to a **retention** machine that has
never run. Three gaps, each confirmed by reading the code rather than the docs:

| Gap | Evidence | Consequence |
|---|---|---|
| **The north star is not computed.** `docs/04` names "7-day and 30-day retention on scheduled reviews" as the north star. `grep` finds no such metric in `engram.py`. `stats` emits `recall_by_stability` — buckets by *memory strength*, not by *elapsed time*. | `compute_stats()` emits no time-based retention figure | The project has never measured the thing it exists to produce |
| **Adherence is invisible.** There is no signal anywhere for "was this encoded concept ever actually reviewed?" `streak_days` and `due_now` are the only proxies, and neither answers it. | No funnel in `compute_stats()` | The system cannot see its own binding constraint |
| **`transfer_probe` is dead data.** The curriculum architect authors one per node. `engram.py` stores it (`node.setdefault("transfer_probe", None)`). **Nothing ever reads it.** | `grep transfer_probe` → one `setdefault`, zero reads | "The point of the whole topic" (`skills/learn` §5) silently does not happen |

The fourth is not a gap but a hole under the foundation:

| **The oracle is unaudited.** | The blind assessor's grade drives every downstream number — mastery, retention, calibration, the schedule itself. Its agreement with any ground truth has never been measured. | If the grader is lenient, *every* number Engram reports is inflated, and the project cannot know it |

Everything below exists to close those four.

---

## 2. Invariants — the things that must never break

A cheaper model executing this roadmap will be tempted by each of these. They are not
preferences. Breaking one is a defect regardless of what it buys.

1. **The engine is stdlib-only and has no network code.** Not "no network by default" — *none*.
   `import socket`, `urllib`, `requests` are all forbidden in `engram.py`. The Commons (§7)
   works by *writing a file the human chooses to share*. This is the promise the README makes
   and the reason people trust the tool with their learning.
2. **The engine owns every number.** No LLM computes a date, an interval, a stability, an
   effect size, or an agreement statistic. If a new feature needs arithmetic, the arithmetic
   goes in `engram.py` and the model narrates the output. (Article 10.)
3. **Receipts are append-only and never rewritten.** A receipt records what was true *at
   grading time* — including the encoding medium stamp. Retroactive rewriting of evidence is
   the one unforgivable bug.
4. **State advances only through receipts.** `add-topic` strips payload-supplied `state`/`fsrs`/
   `artifact`. Any new engine-owned field must be stripped the same way.
5. **The assessor never sees the tutoring dialogue.** Blindness is the entire separation of
   powers. Any feature that leaks lesson context into the grader destroys the instrument.
6. **Confidence is picked or null, never inferred.** (v0.5.2 exists because this leaked.)
7. **Learner text never touches a shell command line.** File or stdin, always.
8. **Every mutating command takes the state lock.** New mutating commands must call
   `acquire_lock()` — the background artifact-smith races the tutor, and this is not theoretical.
9. **Defaults are backward-compatible and self-healing.** A v0.5 learner model loaded by v0.9
   must work, silently, with sensible defaults. `_deep_heal` is the mechanism; extend it, never
   bypass it.
10. **New engine behavior ships with a selftest that fails without it.** (Release protocol §1.)

---

## 3. State schema v2 (additive; migrates by self-healing)

Schema stays `1` for reads. Every field below is **additive** and defaults safely, so a v0.5
state directory works untouched under the target engine. There is no migration script; there
is `_deep_heal` and `setdefault`.

### 3.1 `learner-model.json` — additions

```jsonc
{
  "schema": 1,
  "memory": {
    "fsrs_params": null,              // reserved: full per-parameter fit (future)
    "desired_retention": 0.90,
    "interval_multiplier": 1.0,
    "last_refit": null
  },
  "challenge_band": { "target_success": 0.85, "hint_budget": 2 },
  "interests": [], "goals": [],
  "strategy_weights": { "derivation_first": 0.6, "example_first": 0.4 },
  "settings": {
    "default_mode": "standard",
    "artifacts": "threshold-only",
    "ambient": "quiet",
    "momentum": "on",
    "profile": null,

    // NEW — v0.6, the adherence layer
    "commitment": null,               // if-then plan, learner's own words, or null.
                                      //   {"cue": "when I open the terminal in the morning",
                                      //    "action": "I clear one review",
                                      //    "set": "2026-07-12"}
    "decay_notice": "on"              // "on" | "off" — the honest loss report on return (§5.2).
                                      //   Information, never pressure. Off-switchable, like momentum.
  },
  "rhythms": {},
  "accessibility": []
}
```

`commitment` is an implementation intention (`docs/07` §4). It is stored because the
learner said it, shown back at the moment it names, and **never enforced**. It is not a
reminder system; it is the learner's own sentence, repeated to them.

### 3.2 Graph node — additions

```jsonc
{
  "id": "bayes-theorem",
  "claim": "...", "probe": "...", "rubric": [...],
  "transfer_probe": "...",           // EXISTS TODAY, READ BY NOTHING. v0.8 wires it up.
  "why_chain": [...], "edges": {...},
  "arbitrary": false, "threshold": false,
  "viz": {...},

  "state": "new|learning|review",    // engine-owned
  "fsrs": {...},                     // engine-owned
  "artifact": "artifacts/…/x.html",  // engine-owned (artifact set)

  // NEW — v0.8, transfer as a first-class state, not a hope
  "transfer": {                      // engine-owned; written only by a transfer-kind receipt
    "state": "untested|probed|applied",
    "last": "2026-08-01",
    "receipts": 2
  },

  // NEW — v1.10, the grading contract can be repaired without re-authoring the topic
  "revised": [                       // engine-owned; written only by `edit-node`
    {"at": "2026-07-28", "fields": ["probe"], "receipts_under_previous": 3}
  ]
}
```

`revised` exists so that a repaired contract is **visible** rather than silent. Receipts are
append-only and carry their own `probe`/`rubric_notes`, so history stays self-describing — but
without this stamp a later reader would compare a v2 rubric against v1 verdicts and see a learner
who got worse. It obeys invariant 4 like every other engine-owned field: stripped from any payload,
carried forward across `--replace`.

A node is not "mastered" because it was recalled. It is **retained** when recall survives a
month, and **owned** when it fires on a transfer probe. Three different claims, three different
pieces of evidence, and the graph should stop conflating them.

### 3.3 Receipt — additions

```jsonc
{
  "id": "r_...", "ts": "2026-07-11",
  "topic": "...", "node": "...",
  "kind": "encode|review|transfer|audit|pretest",
  "probe": "...", "production": "...",
  "confidence": 72,                  // or null — never inferred
  "grade": "recalled|partial|lapsed",
  "rating": "again|hard|good|easy",
  "misconceptions": [...], "rubric_notes": "...",
  "source": "self|assessor",
  "s_before": 1.4, "s_after": 12.9, "interval_days": 12, "retrievability": 0.71,
  "due_next": "2026-07-23",
  "artifact": true,                  // medium stamp, at grading time

  // NEW — v0.6, closes issue #3 (double-apply on re-run)
  "sid": "s_1752...",                // stash id; apply_item REFUSES a sid already on disk

  // NEW — v0.7, the audited oracle
  "grader": "assessor@fable-5",      // which grader produced this verdict
  "days_since_encode": 27            // engine-computed; makes retention_Nd a one-pass query
}
```

`days_since_encode` is the single field that makes the north star computable without a second
pass over the graph. Compute it at `apply_item` time from the node's first receipt.

### 3.4 New files

```
~/.claude/learning/
├── gold/assessor-gold.jsonl       # NEW v0.7 — shipped with the plugin, copied on init
├── audits/<date>.json             # NEW v0.7 — grader audit results, append-only
└── exports/<date>-anon.json       # NEW v1.0 — what you would share, written for you to READ first
```

---

## 4. The engine's new surface

Nine new commands. Each is deterministic, each takes the lock if it mutates, each ships with
selftests.

| Command | Purpose | Release |
|---|---|---|
| `adherence` | The funnel: encoded → due → first-review-done. The binding-constraint metric. | 0.6 |
| `retention [--at 7\|30\|90]` | **The north star, finally computed.** Recall rate at elapsed-day buckets, with honest denominators. | 0.6 |
| `decay --topic T` | What is dying right now, and what 4 minutes would save. Real FSRS numbers. | 0.6 |
| `commit --cue "…" --action "…"` | Record the learner's implementation intention. Store; never enforce. | 0.6 |
| `assessor-audit --file F` | Grade the gold set; report agreement (exact, QWK, leniency bias, confusion matrix). | 0.7 |
| `grader-health` | Read the latest audit; emit a health block. `stats` embeds it. | 0.7 |
| `transfer --topic T` | Serve a transfer probe for a mature node. Feeds `kind: transfer` receipts. | 0.8 |
| `experiment` (rewrite) | Randomized, stratified, pre-registered, powered. Engine computes the verdict. | 0.9 |
| `export` | Write a shareable, **text-stripped** receipt bundle **to a file**. No network, ever — the *agent* posts it, on consent, via `gh`. | 1.0 |

### 4.1 `adherence` — the metric that would have screamed

```jsonc
// python3 engram.py adherence
{
  "loop_closure": {                 // THE binding-constraint number
    "encoded_past_due": 7,          // concepts encoded whose first review is now due-or-overdue
    "first_review_done": 0,         // …of which this many were actually reviewed
    "rate": 0.0,                    // 0/7 — the number that should have been screamed on day 6
    "read": "the loop has never closed"
  },
  "return": {
    "sessions_7d": 0, "sessions_30d": 1,
    "days_since_last_session": 6,
    "median_gap_days": null,
    "reviews_due_and_missed": 7
  },
  "funnel": {                       // where learners actually fall out
    "topics_started": 1,
    "nodes_encoded": 7,
    "nodes_reaching_first_due": 7,
    "nodes_first_reviewed": 0,      // ← the cliff
    "nodes_retained_30d": 0
  },
  "read": "encoding works; the loop does not close. 7 concepts are past due and unreviewed."
}
```

Pure computation over `receipts/*.jsonl` + `sessions.jsonl` + `graphs/*.json`. **No schema
change. No new state. This is a read-only view of data Engram already has and has never looked
at.** It is the single highest-value, lowest-risk change in this entire document, and it should
ship first.

### 4.2 `retention` — the north star, at last

```jsonc
// python3 engram.py retention
{
  "buckets": {                      // windows PARTITION [0,inf) — nothing is ever dropped
    "early":  {"recalled": 0, "partial": 0, "lapsed": 0, "n": 0, "rate": null},  //   0-3d
    "7d":     {"recalled": 0, "partial": 0, "lapsed": 0, "n": 0, "rate": null},  //   4-14d
    "30d":    {"recalled": 0, "partial": 0, "lapsed": 0, "n": 0, "rate": null},  //  15-59d  <- headline
    "90d":    {"recalled": 0, "partial": 0, "lapsed": 0, "n": 0, "rate": null},  //  60-179d
    "180d+":  {"recalled": 0, "partial": 0, "lapsed": 0, "n": 0, "rate": null}   // 180d+
  },
  "definition": "of retrievals attempted N days after a concept was FIRST encoded, the fraction "
                "graded recalled-or-partial. `early` is re-encoding, NEVER pooled into retention.",
  "coverage": {                     // MUST be complete. Disjoint windows silently drop reviews:
    "reviews_bucketed": 0,          // the first cut of this used 5-10/25-40/80-110 and a live
    "reviews_total": 0,             // test caught a real day-11 review vanishing into a gap.
    "complete": true                // A metric that quietly discards data is worse than none.
  },
  "unmeasured": {                   // THE HONEST DENOMINATOR — the anti-survivorship guard
    "past_due_now": 7,          // THE honest denominator: not retrieved since it came due
    "never_reviewed": 7,        // of those, never retrieved even once
    "note": "UNKNOWN, not absent. Reporting retention without them is survivorship bias. NOTE: "
            "v0.6.0 scoped this to never-reviewed nodes, which exempted a node the moment it was "
            "retrieved once — a learner who reviewed 10 concepts then vanished for 200 days saw "
            "'100% recall, 0 unmeasured'. Past-due-NOW is the only honest scope."
  },
  "projected_if_never_reviewed": 0.41,   // real FSRS R(t) over the unreviewed set
  "read": "insufficient-data (n=0 reviews) — but 7 concepts are decaying unmeasured"
}
```

**The `unmeasured` block is the honest core.** Any retention number computed only over
completed reviews flatters the system — it silently drops exactly the concepts the learner
abandoned. Engram must never publish a retention figure without publishing what it did not
measure. This is the same discipline as `modality.caveat`, and for the same reason.

### 4.3 `decay` — the number the system already knows and never says

```jsonc
// python3 engram.py decay --topic transformers
{
  "topic": "transformers",
  "encoded": 7, "days_since": 6,
  "now":  {"mean_recall": 0.70, "expected_alive": 4.9},
  "at_horizon_no_review":       {"mean_recall": 0.38, "expected_alive": 2.7},
  "at_horizon_if_reviewed_today": {"mean_recall": 0.80, "expected_alive": 5.6, "minutes": 4},
  "saved_by_reviewing_today": 2.9,
  "read": "four minutes today is worth 2.9 concepts over the next 30 days"
}
```

These are **real numbers from the engine's own FSRS curve**, not motivational copy. Run against
the founder's actual state on 2026-07-11 they produce exactly the figures above. The system has
always been able to compute this. It has never once said it.

The rule that keeps this honest (`docs/05` P13, and it is a hard rule): **this is information,
never pressure.** It reports a fact about a forgetting curve the way a lab notebook reports a
result. It never says "you should," never scolds, never nags, and it is off-switchable
(`settings.decay_notice = "off"`). Surfaced **once on return**, alongside amnesty and a
two-minute path — never every session. A wall of debt is the churn trigger, not the cure
(Silverman & Barasch; `docs/05` P14).

### 4.4 `assessor-audit` — measuring the oracle

The gold set ships with the plugin: `gold/assessor-gold.jsonl`, N ≥ 60 items, each a
`(claim, rubric, probe, production, adjudicated_grade)` tuple with human adjudication and a
recorded rationale. It must contain the adversarial cases, because those are where a grader
fails:

- **fluent-but-empty** — beautifully written, states the consequence, never names the mechanism
- **terse-but-correct** — five words, mechanism present, no polish (the founder's actual pattern)
- **confident-and-wrong** — the hypercorrection case; a lenient grader marks it `partial`
- **right-answer-wrong-reason** — arrives at the claim through a broken derivation
- **paraphrase** — correct mechanism in entirely different words (tests meaning-over-wording)
- **partial-credit boundary** — genuinely ambiguous; tests whether the grader rounds *down*

Flow: `/coach audit` spawns the real `engram-assessor` on the gold set → its output JSON goes to
`engram.py assessor-audit --file <out>` → the engine computes agreement and writes
`audits/<date>.json`.

```jsonc
{
  "n": 60, "grader": "assessor@fable-5", "ts": "2026-08-01",
  "exact_agreement": 0.83,          // REPORTED BUT NEVER THE HEADLINE — see below
  "qwk": 0.79,                      // quadratic weighted kappa vs. adjudicated grade — THE headline
  "leniency_bias": +0.11,           // mean(grader_score − gold_score); >0 = inflating
  "test_retest": 0.97,              // ≥3 runs, temperature 0 — consistency, NOT correctness
  "confusion": {"lapsed→partial": 4, "partial→recalled": 3, "…": 0},
  "by_case_type": {"fluent-but-empty": 0.60, "terse-but-correct": 0.90, "…": 0.85},
  "read": "acceptable, but inflates fluent-but-empty productions — the exact failure the "
          "separation of powers exists to prevent",
  "verdict": "pass|warn|fail"
}
```

**Three rules, each traceable to a number in `docs/07` §3:**

1. **QWK is the headline; raw agreement is never quoted alone.** Raw accuracy overstates
   chance-corrected agreement by **33.8–41.2 percentage points** in the measured literature. "The
   grader looks right 85% of the time" is compatible with κ ≈ 0.45. Raw agreement is a liar and
   must never appear in a README badge without its κ beside it.

2. **Audit the consistency–bias paradox explicitly.** This is the failure mode Engram's own prompt
   design *actively selects for*: the assessor is told to be a skeptic, round down, and cite the
   rubric — so it will be **extremely self-consistent**. The literature's central warning is that
   self-consistency is **not evidence of correctness** (one measured model: test–retest **0.992**,
   position bias **0.192** — perfectly reproducible, systematically wrong). Therefore:
   **when `test_retest > 0.95`, the engine must verify `leniency_bias < 0.15` before reporting
   `pass`.** High consistency plus high bias is a `fail`, not a `pass`.

3. **Teeth.** If `leniency_bias > 0.15` or `qwk < 0.60` (floor; **0.70** is the conventional
   threshold for automated scoring and is the target), `stats` marks every retention figure
   `grader_unvalidated: true`, and `/coach` must say so before reporting any number.
   **An unaudited oracle makes every downstream claim unearned, and this constitution does not
   permit unearned claims.**

This is the feature no other tool in the ecosystem — and very few in the literature — can match.
"Our grader agrees with human adjudication at QWK = 0.79, here is the gold set, here is the audit,
run it yourself" is a sentence almost nobody in AI education can currently say. It is available to
Engram for about one release of work.

### 4.5 `experiment` — the rewrite

Today's `experiment assign` is **round-robin, not randomized**, unstratified, unpowered, and the
verdict is narrated by the model. Every one of those is a methodological defect. The target:

```jsonc
// experiment start --file design.json   (PRE-REGISTERED — written BEFORE data exists)
{
  "id": "x_...",
  "question": "does derivation-first beat example-first for me, on math topics?",
  "arms": ["derivation_first", "example_first"],
  "metric": "first_review_recall",     // engine-computed, from blind receipts
  "randomize": true,
  "seed": 20260801,                    // deterministic, auditable, reproducible
  "stratify_by": ["threshold", "viz.affordance"],  // KILLS the confound that broke stats.modality
  "min_per_arm": 15,                   // ≈30 total: SCED alternating-treatments power (docs/07 §9).
                                       //   TODAY'S VALUE IS 6 — underpowered by ~2.5×.
  "analysis": "randomization-test",    // pre-declared
  "started": "2026-08-01", "status": "active",
  "assignments": [], "verdict": null
}
```

`experiment settle` is computed **by the engine**: the effect, its interval, and — the part
that matters — an honest `"underpowered"` read when n is short, rather than a narrated vibe.
This is the machinery that finally lets `docs/06`'s open question 2 (the modality confound) be
answered instead of merely disclosed: randomize the medium *within* one affordance class, and
the material stops riding along with the medium.

### 4.6 The Commons — how the data gets out, and why it is **attributed**

**The mistake this section originally made, corrected.** The first draft specced an *anonymous*
export (`learner: sha256:…`) and hand-waved "the human decides how to share it." Then the obvious
transport was proposed — `gh` is already installed and authenticated on most Claude Code
machines — and it breaks the scheme on contact: **a GitHub issue, discussion, or PR posted from
your account carries your identity.** The salted hash is theatre the moment the envelope is
signed. You cannot have one-keystroke `gh` upload *and* anonymity. Pick one, and say which out
loud.

**Engram picks attribution — and it is the stronger design, for the science rather than despite
it.**

A retention study lives or dies on **longitudinal linkage**: following *the same learner across
months* is the entire point, because the question is what survives at 30 and 90 days. Anonymous
one-shot dumps at n = 500 are scientifically weaker than attributed, linkable series at n = 100.
Attribution also buys deduplication, fabrication detection, the ability to ask a contributor a
follow-up — and the ability to **credit them**, which is the only honest incentive on offer.

So this is not anonymous telemetry. It is **a consenting, named, informed participant in an open
study** — which is what every good study has always been.

| | |
|---|---|
| **Consent** | Explicit, **per submission**. `CONTRIBUTING-DATA.md` is a real informed-consent document, not a privacy policy. |
| **The payload** | **All free text still stripped** — productions, probes, claims, rubrics, goals, interests, misconception text, topic strings, node ids. What leaves: grades, timings, stability numbers, arms, and the grader's measured QWK. |
| **The identity** | Your GitHub handle, **stated plainly in the consent step** — *"this posts publicly as @you"* — because it does. |
| **Withdrawal** | It is a GitHub post. You can delete it. Say so. |

```jsonc
{
  "engram_version": "1.0.0", "exported": "2026-09-01",
  "contributor": "@nagisanzenin",      // ATTRIBUTED, and the consent step says so.
                                       //   A gh-posted "anonymous" hash would be a lie.
  "receipts": [{
    "topic_class": "ml/architectures", // generalized taxonomy, NOT the topic string
    "node_hash": "sha256:41ab…",       // node ids can be identifying; text NEVER leaves
    "kind": "review", "grade": "recalled", "rating": "good",
    "confidence": 70, "days_since_encode": 27,
    "s_before": 1.4, "s_after": 12.9,
    "artifact": true, "arm": "derivation_first",
    "grader_qwk": 0.79                 // the receipt carries its oracle's measured validity
  }],
  "stripped": ["production", "probe", "claim", "rubric", "goal", "interests",
               "misconception_text", "topic_string", "node_id"]
}
```

**The transport — and why the invariant survives it:**

```
engram.py export      →  writes exports/<date>.json      ← STDLIB. NO NETWORK. EVER.
       ↓
/coach contribute     →  shows you the exact file, in full
       ↓                  gh auth status
       ├─ gh absent / unauthenticated / offline → print the path, one line, stop.
       │                                          No error. No nag. No retry.
       └─ gh present → arrow-key consent, NAMING the handle it will post under
                       → gh posts a Discussion to `nagisanzenin/engram-data`
```

**The engine still contains zero network code.** It writes a file. The **agent** — which already
has Bash, already reaches the network for WebSearch, and is already trusted with the machine —
does the posting, only after an explicit human yes. The 100%-local badge stays *structurally*
true, because the thing that badge is about (`engram.py`) never grows a socket. That is not a
loophole; it is the correct place to put the boundary.

**Graceful degradation is mandatory**, in the same register as the session hook (*"degrade to
silence on any failure"*) and `/coach`'s `open` / `xdg-open` / `explorer.exe` cascade. **`gh` is
never a dependency — only a convenience.** Without it you still have the file, and losing nothing
by declining is what makes the consent real.

**A separate `engram-data` repo**, not this one: Discussions there keep the issue tracker for
bugs, the corpus stays readable by anyone, and the aggregation scripts and published findings sit
beside the data that produced them.

**And the gate that makes any of it worth doing:** every shared receipt carries its grader's
measured QWK (§4.4). *A finding aggregated from unaudited oracles is not a finding.* **v0.7
blocks v1.0**, and that is not negotiable.

That is how Engram becomes a scientific instrument without becoming a data business.

---

## 5. Changes to the skills

The engine can grow all it likes; **most of Engram's behavior lives in prose**, and prose is
where the loop actually fails.

### 5.1 The hook must offer, not merely announce

Today the SessionStart hook prints *"7 reviews due (~4 min) · /review to clear"* — and then the
learner must remember to type `/review`. That is a friction step at precisely the moment the
evidence says friction is fatal. **The hook's job is not to inform. It is to make the
highest-value action the easiest one in the terminal.**

The change is small and entirely within the calm-surface doctrine: when reviews are due and the
learner has not declined this session, the ambient line becomes an **offer** the learner can
accept with one key. Declined once → silent for the session (the existing rule). Never a
modal, never a block, never a nag. Autonomy is preserved: it asks, it does not start.

### 5.2 `/review` opens with the honest number, once

On return after a gap, before the queue: amnesty (already specified, `docs/05` P14), then **one
line of `decay` output** — what is dying, what four minutes saves — then the capped offer.
Information, then a real choice. Never a wall of debt.

### 5.3 `/learn` ends by booking the return

A `/learn` session currently closes with a curiosity gap and a due date. It should also close
by **collecting the commitment**, once, in the learner's own words: *"when will you clear
these?"* → `engram.py commit`. That single sentence is the highest-effect-size adherence
intervention in the literature that costs nothing and steers no one (`docs/07` §4).

### 5.4 `/coach` gains three duties

- Report `adherence.loop_closure` **first**, before any other number. If it is 0, nothing else
  in the dashboard is real, and the coach must say so.
- Run the grader audit on a cadence, and refuse to report retention as fact when the oracle is
  unvalidated.
- Settle experiments from the engine's computed verdict, never from narration.

---

## 6. What this architecture refuses

- **No cloud, no account, no sync.** The engine has no network code. That is a structural
  property, not a setting.
- **No streaks-as-goal, no XP, no badges, no leaderboards.** (`docs/05`; and see `docs/07` for
  the honest adjudication of the streak question, which does not change this.)
- **No engagement optimization.** Engram's success is measured by what the learner can do
  *without* it. A metric that rewards time-in-app is a metric that rewards the wrong thing.
- **No unearned claims.** No mastery without a receipt; no retention number without its
  unmeasured denominator; no aggregate finding without an audited oracle; no causal claim from
  a confounded arm.

---

## 7. Order of operations (and why)

The dependency chain is strict, and it is the reason the roadmap is ordered the way it is:

```
  adherence + retention + decay     ← you cannot fix what you cannot see,
        (v0.6, the loop)              and you cannot claim what you never measured
              │
              ▼
     assessor audit + gold set      ← you cannot trust a number a lenient grader produced
        (v0.7, the oracle)
              │
              ▼
      transfer receipts             ← you cannot claim capability while measuring only memory
        (v0.8, the claim)
              │
              ▼
   randomized n-of-1 experiments    ← you cannot learn from a confounded arm
        (v0.9, the method)
              │
              ▼
     consenting export + commons    ← you cannot aggregate what you cannot trust
        (v1.0, the science)
```

Each layer is load-bearing for the next. Skipping ahead produces a beautiful number that is not
true — which is the one failure mode this project was built to make impossible.
