#!/usr/bin/env python3
"""The §4.7 fuzz gate — read paths degrade, they never brick.

RELEASE_PROTOCOL §4.7 describes this harness and the CHANGELOG quotes its numbers every
release; until v1.9.1 it lived only on the release engineer's disk, so a reader could not
re-run the one gate whose results are quoted as measurements. It ships now.

    LC_ALL=en_US.UTF-8 python3 scripts/fuzz.py        # 600 states, 3 seeds, exit 1 on any crash

Every field of every state file is randomized to every JSON type — `nodes` as a string,
`fsrs` as a list, an unhashable `topic`, a `retired` that is the word "retired". A guarded
`die()` (SystemExit) is a pass; an unhandled exception is a defect. The `LC_ALL` pin is not
decoration: v1.2.1 shipped a filter that only crashed under a UTF-8 locale, and a gate that
passes because of an unset environment variable has not run.
"""
import json, os, random, sys, tempfile
sys.path.insert(0, "scripts")
JUNK = [None, 5, -1, 0.5, True, False, "", "x", [], [1,2], {}, {"a":1}, "2026-13-45",
        {"restored": None}, {"restored": "x"}, "retired", [{"ts":"x"}]]
def rnd(r): return r.choice(JUNK)
def build(r, home):
    os.makedirs(os.path.join(home, "graphs"), exist_ok=True)
    os.makedirs(os.path.join(home, "receipts"), exist_ok=True)
    m = {"schema":1,"memory":{"desired_retention":rnd(r),"interval_multiplier":rnd(r)},
         "challenge_band":{},"settings":{"commitment":rnd(r),"decay_notice":rnd(r),
         "default_mode":rnd(r),"profile":rnd(r)},"rhythms":{},"accessibility":[]}
    json.dump(m, open(os.path.join(home,"learner-model.json"),"w"))
    for t in ("t1","t2"):
        nodes = {}
        for i in range(r.randint(0,4)):
            nodes["n%d"%i] = {"claim":rnd(r),"probe":rnd(r),"state":r.choice(["new","review","learning",rnd(r)]),
                "fsrs":r.choice([{"s":rnd(r),"d":rnd(r),"due":rnd(r),"last":rnd(r),"reps":rnd(r),"lapses":rnd(r)}, rnd(r)]),
                "retired": rnd(r), "edges": r.choice([{"requires":rnd(r)}, rnd(r)]),
                "kind": rnd(r), "practice": rnd(r), "transfer_probe": rnd(r),
                # v1.10: `doctor` now scans the grading contract (probe_rubric_gaps), so
                # `rubric` and `revised` are read paths and must be fuzzed. Adding the
                # feature without adding its fields here is how a gate comes back green
                # about code it never executed (§4.7).
                "rubric": r.choice([rnd(r), [rnd(r)], ["connects it to scale", rnd(r)]]),
                "revised": rnd(r)}
        g = {"topic":t,"title":rnd(r),"order":r.choice([list(nodes), rnd(r)]),
             "nodes": r.choice([nodes, rnd(r)]) if r.random()<0.85 else nodes, "goal":rnd(r)}
        json.dump(g, open(os.path.join(home,"graphs","%s.json"%t),"w"))
        with open(os.path.join(home,"receipts","%s.jsonl"%t),"w") as f:
            for i in range(r.randint(0,3)):
                f.write(json.dumps({"id":"r%d"%i,"ts":rnd(r),"topic":t,"node":rnd(r),
                    "kind":r.choice(["encode","review","transfer",rnd(r)]),"grade":rnd(r),
                    "rating":rnd(r),"due_next":rnd(r),"s_after":rnd(r),"confidence":rnd(r),
                    # v1.10: doctor cross-references assessor-flagged criteria out of the
                    # receipt log, so a hand-edited `probe_gap` is a read path too.
                    "probe_gap":rnd(r)})+"\n")
    with open(os.path.join(home,"sessions.jsonl"),"w") as f:
        f.write(json.dumps({"ts":rnd(r),"kind":rnd(r)})+"\n")
    # v1.11.2 (issue #17): the stash is a read path in its own right (`stash list`/`count` are
    # read-only sub-actions of a MUTATING command, which is the amendment §4.7 had to add after
    # `experiment status` went 600 states unfuzzed), and `make_receipt` now reads it too. A gate
    # that never writes the file cannot report on the code that reads it.
    with open(os.path.join(home,"pending-verify.jsonl"),"w") as f:
        for i in range(r.randint(0,3)):
            f.write(json.dumps({"sid":rnd(r),"topic":rnd(r),"node":rnd(r),"probe":rnd(r),
                                "production":rnd(r),"confidence":rnd(r),
                                "production_truncated":rnd(r),"ts":rnd(r)})+"\n")
        f.write(json.dumps(rnd(r))+"\n")        # a non-object line: pure corruption, valid JSON

import engram as E
READS = ["stats","adherence","retention","decay","topics","due","next","topic-status",
         "gold","grader-health","session-start","report","doctor","transfer","path",
         # v1.11.2: the stash's own read sub-actions. `stash list` is the blind assessor's
         # ENTIRE input, so a brick here is a settle that cannot happen at all.
         "stash-list","stash-count",
         # v1.15.0: enumerated from the dispatch table per §4.7's amendment ritual and
         # found three read paths this harness had never fed: the adaptation proposals
         # and their append-only ledger, plus the external-adjudication scorer. `propose`
         # and `adaptations` read experiment/ledger state; `adjudication-stats` parses a
         # JSONL upload whose shape a contributor controls.
         "propose","adaptations","adjudication-stats"]
crashes = 0; runs = 0
for seed in (11, 22, 33):
    r = random.Random(seed)
    for it in range(200):
        home = tempfile.mkdtemp()
        os.environ["ENGRAM_HOME"] = home; os.environ["ENGRAM_TODAY"] = "2026-08-01"
        build(r, home)
        E._RECEIPTS_CACHE.clear()
        for name in READS:
            fn = {"stats":E.cmd_stats,"adherence":E.cmd_adherence,"retention":E.cmd_retention,
                  "decay":E.cmd_decay,"topics":E.cmd_topics,"due":E.cmd_due,"next":E.cmd_next,
                  "topic-status":E.cmd_topic_status,"gold":E.cmd_gold,"grader-health":E.cmd_grader_health,
                  "session-start":E.cmd_session_start,"report":E.cmd_report,"doctor":E.cmd_doctor,
                  "transfer":E.cmd_transfer,"path":E.cmd_path,
                  "stash-list":E.cmd_stash,"stash-count":E.cmd_stash,
                  "propose":E.cmd_propose,"adaptations":E.cmd_adaptations,
                  "adjudication-stats":E.cmd_adjudication_stats}[name]
            for args in ([E._ns(topic="t1"), E._ns(), E._ns(cap=3), E._ns(order="savings"),
                          E._ns(cap=2, topic="t1")] if name == "due" else
                         [E._ns(action="list")] if name == "stash-list" else
                         [E._ns(action="count")] if name == "stash-count" else
                         [E._ns(topic="t1"), E._ns()]):
                runs += 1
                try:
                    E._capture(fn, args)
                except SystemExit:
                    pass
                except Exception as ex:
                    crashes += 1
                    if crashes <= 5:
                        print("CRASH %s(%s): %r" % (name, getattr(args,'cap',None), ex))
print("states=%d calls=%d CRASHES=%d" % (600, runs, crashes))
sys.exit(1 if crashes else 0)
