# Spawning Engram's agents, per platform

Engram delegates three jobs to **separate agents**, and the separation is not an
implementation detail — it is the thing that makes the receipts worth anything:

| Agent | Job | Why it must be separate |
|---|---|---|
| `engram-curriculum-architect` | decompose a topic into a first-principles DAG | fresh context; the tutoring dialogue would bias the map toward what was easy to teach |
| `engram-assessor` | grade productions blind | **load-bearing.** A grader that has watched the lesson grades the lesson, not the recall. Every mastery claim in Engram rests on this |
| `engram-artifact-smith` | build an interactive explorable | long, tool-heavy work that shouldn't block the beats |

On Claude Code, Codex, OpenCode, and Antigravity these are registered agents and
"spawn X" is literal. **OpenClaw, Pi, and DeepSeek Harness register none of
them** — OpenClaw reads Engram as a Codex bundle, and bundles map skills only;
Pi ships no subagent mechanism at all, by design; DeepSeek Harness has subagent
tools but no registration of external agent definitions. On all three you
construct the same isolation yourself, from the platform's shape below. ZCode
sits between: its plugin system can surface Engram's `agents/` as custom
subagent types (check Settings → Subagents on your build), but no such
registration is assumed — the generic-child construction below is always
available and is what this port guarantees.

## The OpenClaw shape

`sessions_spawn` starts a background child run. Its default `context: "isolated"`
creates **a clean child transcript** — the child sees the task text and nothing
else of your conversation. That is exactly the assessor's blindness requirement,
so the default is what you want; never pass `context: "fork"` for an Engram
agent. Forking hands the child the tutoring dialogue and quietly destroys the
one property the receipt is claiming.

```
sessions_spawn({
  context: "isolated",
  task: "Read <ENGRAM_ROOT>/agents/engram-assessor.md and follow it exactly as your
         operating instructions. Grade the items in <the file you wrote with `stash list > …`>.
         Return only the receipt JSON it specifies — no commentary."
})
```

Then call `sessions_yield`. `sessions_spawn` is **non-blocking**: it returns a run
id immediately, and the child's result arrives as the next model-visible message
after you yield. Do not poll `subagents list` in a loop waiting for it.

Resolve `<ENGRAM_ROOT>` as the directory holding `scripts/engram.py` — on
OpenClaw that is `${OPENCLAW_STATE_DIR:-$HOME/.openclaw}/extensions/engram`. The
`agents/*.md` files ship inside the installed plugin, so pointing the child at
the file keeps one definition of each agent across every platform. Never paste a
copy of the assessor's rules into the task text: two copies drift, and the one
that drifts is the one grading.

## The Pi shape

Pi (pi.dev) has no subagent tool, but it has the one primitive isolation
actually needs: **a fresh process is a fresh context.** (The shape generalizes:
on any platform whose only primitive is a shell, the child is a fresh
non-interactive run of *that platform's own* agent binary — substitute yours
for `pi` below.) Spawn the child through the bash tool as a non-interactive
pi run:

```bash
ENGRAM_CHILD=1 pi --no-session --no-skills --no-context-files -p \
  "Read <ENGRAM_ROOT>/agents/engram-assessor.md and follow it exactly as your
   operating instructions. Grade the items in <the file you wrote with \`stash list > …\`>.
   Write the receipt JSON it specifies to <receipt path> with the write tool —
   no commentary, no other output."
```

Resolve `<ENGRAM_ROOT>` as the directory holding `scripts/engram.py` — on Pi
that is the `$ENGRAM_ROOT` its extension exports (equivalently: `$ENGRAM` as
your skill resolved it, with the trailing `/scripts/engram.py` removed). Why
each flag is load-bearing:

- `ENGRAM_CHILD=1` — makes Engram's own extension inert in the child, so the
  session-start nudge cannot leak into a grader's context. (`-p` alone already
  suppresses it — `ctx.hasUI` is false in print mode — the env var is the belt
  to that suspender.)
- `--no-session` — grading runs are ephemeral; don't litter session storage.
- `--no-skills` — the child needs no skill list; a leaner system prompt is a
  cheaper, cleaner grader.
- `--no-context-files` — the project's AGENTS.md / CLAUDE.md must not reach the
  assessor. Project context isn't lesson dialogue, but blindness is easiest to
  defend when the child sees nothing but the agent file and the items.
- **Leave extensions on** (no `--no-extensions`): custom model providers arrive
  as pi extensions, and the child must reach whatever provider the parent uses.
  Engram's extension self-silences via the two guards above.

**Collect the receipt from the file you named, never from stdout.** `-p` prints
the model's final prose, and models garnish stdout; the write-tool file is the
reliable channel. Read it, validate it, then proceed exactly as on any other
platform. A grading run takes a minute or two — raise your bash timeout rather
than concluding the child hung.

The architect and the smith spawn the same way — swap the agent file and the
task text. The child uses the learner's configured default pi model; pass
`--model` only when they asked for a specific one.

## The ZCode shape

ZCode ships an **Agent tool** whose children start fresh: a new Agent call runs
in its own context and sees *only* the prompt you hand it — never the parent
conversation. That process boundary is exactly the isolation blindness needs,
so the construction mirrors the OpenClaw shape with ZCode's spelling:

```
Agent(
  subagent_type: "general-purpose",
  description:  "Blind-grade engram receipts",
  prompt: "Read <ENGRAM_ROOT>/agents/engram-assessor.md and follow it exactly as
           your operating instructions. Grade the items in <the file you wrote
           with `stash list > …`>. Return only the receipt JSON it specifies —
           no commentary."
)
```

- If your build lists the engram agents under Settings → Subagents (ZCode can
  surface a plugin's `agents/` directory as subagent types), spawning the named
  type directly is equivalent — **provided** it is a fresh-context spawn. A
  child that inherits this conversation is not blind; skip any such mode.
- Resolve `<ENGRAM_ROOT>` with the same waterfall the skills run — echo
  `$ZCODE_PLUGIN_ROOT` first, then fall back as in SKILL.md. On the clone route
  (`~/.agents/engram` or a checkout) it lands wherever you installed; on the
  marketplace route the plugin cache root carries everything including
  `agents/`.
- Do not paste stash contents into the prompt. Write `stash list > <file>` and
  pass the path (see "Rules that do not bend" below).

## Rules that do not bend

- **Items go by file path, never inline.** Learner productions in a task string
  are the same command-injection hole as learner text on a shell command line,
  and the task string is also a prompt-injection surface. Write the JSON, pass
  the path.
- **One child per independent judgment.** The coach's grader audit spawns the
  assessor three times *because* three independent contexts disagree usefully.
  Reusing one child for all three runs produces one opinion stated thrice.
- **No dialogue in the task text.** Not the lesson, not your read on how the
  session went, not "they seemed to get it." The assessor sees claims, rubrics,
  probes, productions, and pre-feedback confidence — that list is exhaustive.
- **If your platform's spawn mechanism is unavailable, stop and say so.** This
  bullet is for the construct-it-yourself platforms above — where "spawn X" is
  literal (a registered subagent/Task tool), just use it; this is not a licence
  to halt because some *other* platform's tool is absent. On OpenClaw,
  `sessions_spawn` sits behind tool policy: the `coding` and `full` profiles
  include it, `messaging` and `minimal` do not — tell the user to set
  `tools.profile: "coding"` or add `tools.alsoAllow: ["sessions_spawn",
  "sessions_yield"]`, and do not issue receipts until they have. On Pi, the
  same rule binds: if the `pi -p` child cannot be spawned from the bash tool,
  stop and say so — do not grade inline. Either way, without the spawn there
  is no blind grader, and Engram has no degraded mode where the tutor grades
  its own learner.

## The DeepSeek Harness shape

dsh registers TWO delegation tools by default, and the choice is load-bearing:

- **`subagent`** (spawn provider) — a fresh-context child that "does not see this
  conversation". **The only one you may use.**
- **`subagent_fork`** — seeds the child with every completed turn of THIS
  conversation. **Never use it for engram agents**: a forked assessor has read
  the tutoring dialogue, and a grader that saw the lesson is not blind — the
  receipt it writes looks valid and is worthless.

Neither tool knows engram's agent definitions. Construct the child like the
OpenClaw shape: instruct it to `Read <ENGRAM_ROOT>/agents/engram-assessor.md`
(resolve `<ENGRAM_ROOT>` with the same waterfall the skills run — on dsh that
lands at `~/.agents/engram`) `and follow it exactly`, and pass work items by
file path, never by pasting stash contents into the task text.
