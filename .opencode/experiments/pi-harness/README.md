# The Pi verification harness

The instrument behind INSTALL-PI.md's "verified 20/20" — kept here so the claim
stays re-runnable instead of being a number you have to trust.

**What it does:** stands up a mock OpenAI-compatible provider on `127.0.0.1:8199`
that **captures every payload pi is about to send a model**, installs this repo as
a local pi package, and asserts against the captured payloads — no live LLM anywhere:

- S1 — parent shape, empty store: mock reply printed; exactly one request; the three
  skills present in the system prompt (Agent Skills `<available_skills>` XML) with
  paths into this repo; `skills/_shared/` not offered as a skill; no nudge; the
  context-file canary (below) asserted PRESENT here.
- S3/S3b/S3c — `/learn`, `/review`, `/coach` prompt templates expand with arguments.
- S2/S4 — RPC mode (the interactive-equivalent path, `ctx.hasUI` true): on a seeded
  store the `engram-nudge` text is injected as a **user-role** message with the first
  prompt (asserted), and the notify request is emitted (asserted); a direct RPC
  `bash` command proves `ENGRAM_ROOT` propagates through pi's real bash execution path.
- S2b — RPC mode again with the EMPTY store: no notify, no nudge text in the payload.
  This is the store-driven silence, asserted in the one mode where the nudge machinery
  actually runs (S1's print-mode run can't prove it — the extension is inert in `-p`
  for an unrelated reason).
- S5 — child (blind-assessor) shape, deliberately seeded store:
  `ENGRAM_CHILD=1 pi --no-session --no-skills --no-context-files -p` gets no skills,
  no nudge, and no project context files — a canary `AGENTS.md` sits in the cwd,
  asserted present in S1 and absent here, so the flag (not luck) is what excluded it.

**Run it:**

```bash
node experiments/pi-harness/harness.cjs     # needs `pi` on PATH and python3
```

Exit 0 and `20/20 checks passed` is the pass state. Scratch state lives under
`$TMPDIR/engram-pi-harness`; the harness backs up and restores
`~/.pi/agent/models.json`, and installs/removes this repo as a pi package
(`pi install <repo>` / `pi remove <repo>`) around the run — don't run it while you
have an engram pi package you care about configured.

**Version notes:** 20/20 on pi 0.83.0 (Node ≥ 22.19) and pi 0.74.2 (the
`legacy-node20` dist-tag npm serves on Node 20). Historical wrinkle the harness
caught: pi parses prompt-template frontmatter as strict YAML and silently skips a
template whose unquoted `description:` carries a second colon — which is why every
frontmatter value in `pi/prompts/*.md` is quoted.

Not wired into CI: it needs a pi binary installed globally, and CI has none.
