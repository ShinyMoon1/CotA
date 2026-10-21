#!/usr/bin/env node
// Deterministic validation harness for the engram Pi port.
// No live LLM anywhere: a mock openai-completions provider captures every
// payload pi sends, and RPC mode drives the real bash path directly.
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const HARNESS = __dirname;
const ENGRAM = path.resolve(__dirname, "../..");
const WORK = path.join(os.tmpdir(), "engram-pi-harness");
const PROJ = path.join(WORK, "proj");
const STORE_EMPTY = path.join(WORK, "store-empty");
const STORE_SEEDED = path.join(WORK, "store-seeded");
const CAPTURE = path.join(WORK, "capture.jsonl");
const MODELS_JSON = path.join(os.homedir(), ".pi/agent/models.json");
const CANARY = "CANARY_AGENTS_MD_9f3e";
const PORT = 8199;

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass, detail: detail || "" });
  console.log((pass ? "PASS" : "FAIL") + "  " + name + (detail ? "  — " + detail : ""));
}

function captureLines() {
  if (!fs.existsSync(CAPTURE)) return [];
  return fs
    .readFileSync(CAPTURE, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

function msgToText(m) {
  if (typeof m.content === "string") return m.content;
  if (Array.isArray(m.content))
    return m.content.map((c) => (typeof c === "string" ? c : c.text || "")).join("\n");
  return "";
}
function reqText(req) {
  return (req.body.messages || []).map((m) => (m.role || "") + ": " + msgToText(m)).join("\n---\n");
}

function runPi(args, env, opts) {
  const r = spawnSync("pi", args, {
    cwd: (opts && opts.cwd) || PROJ,
    env: { ...process.env, ...env },
    encoding: "utf8",
    timeout: 90000,
  });
  return r;
}

async function main() {
  // ---- setup ------------------------------------------------------------
  fs.rmSync(WORK, { recursive: true, force: true });
  for (const d of [WORK, PROJ, STORE_EMPTY, STORE_SEEDED]) fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(PROJ, "AGENTS.md"), "# proj\n" + CANARY + "\n");

  // seed the store: one stashed production => session-start speaks
  const seed = path.join(WORK, "seed.json");
  fs.writeFileSync(
    seed,
    JSON.stringify([{ topic: "test-topic", node: "n1", probe: "What is X?", production: "X is a thing" }]),
  );
  let r = spawnSync("python3", [path.join(ENGRAM, "scripts/engram.py"), "init"], {
    env: { ...process.env, ENGRAM_HOME: STORE_SEEDED },
    encoding: "utf8",
  });
  r = spawnSync("python3", [path.join(ENGRAM, "scripts/engram.py"), "stash", "add", "--file", seed], {
    env: { ...process.env, ENGRAM_HOME: STORE_SEEDED },
    encoding: "utf8",
  });
  if (r.status !== 0) throw new Error("seeding failed: " + r.stderr);

  // mock provider config (backup any existing models.json)
  const hadModels = fs.existsSync(MODELS_JSON);
  if (hadModels) fs.copyFileSync(MODELS_JSON, MODELS_JSON + ".harness-bak");
  fs.mkdirSync(path.dirname(MODELS_JSON), { recursive: true });
  fs.writeFileSync(
    MODELS_JSON,
    JSON.stringify(
      {
        providers: {
          mock: {
            baseUrl: "http://127.0.0.1:" + PORT + "/v1",
            api: "openai-completions",
            apiKey: "mock",
            models: [
              {
                id: "mock-1",
                name: "Mock 1",
                reasoning: false,
                input: ["text"],
                contextWindow: 128000,
                maxTokens: 32000,
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
              },
            ],
          },
        },
      },
      null,
      2,
    ),
  );

  // install engram as a local-path pi package (global settings)
  r = runPi(["install", ENGRAM], {}, { cwd: HARNESS });
  console.log("pi install:", (r.stdout || "").trim(), (r.stderr || "").trim());
  const list = runPi(["list"], {}, { cwd: HARNESS });
  check("package installed (pi list)", (list.stdout || "").includes(ENGRAM), (list.stdout || "").trim());

  // mock server up
  const mock = spawn("node", [path.join(HARNESS, "mock-llm.cjs")], {
    env: { ...process.env, MOCK_PORT: String(PORT), MOCK_CAPTURE: CAPTURE },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((res) => mock.stdout.once("data", res));

  const piArgs = ["--no-session", "--provider", "mock", "--model", "mock-1"];

  try {
    // ---- S1: parent shape, empty store — skills discovered, no nudge ----
    let before = captureLines().length;
    r = runPi(["-p", ...piArgs, "hello there"], { ENGRAM_HOME: STORE_EMPTY });
    check("S1 pi -p exits 0 and prints mock reply", r.status === 0 && r.stdout.includes("MOCK-OK"), "status=" + r.status);
    let reqs = captureLines().slice(before);
    check("S1 exactly one LLM request", reqs.length === 1, "got " + reqs.length);
    const s1 = reqs[0] ? reqText(reqs[0]) : "";
    const sys = reqs[0] ? msgToText((reqs[0].body.messages || [])[0] || {}) : "";
    check(
      "S1 skills in system prompt (exactly the three)",
      ["learn", "review", "coach"].every((s) => sys.includes("skills/" + s + "/SKILL.md")) &&
        (sys.match(/\/SKILL\.md/g) || []).length === 3,
    );
    check("S1 skills presented in Agent Skills XML form", sys.includes("<available_skills>"));
    check("S1 skill paths point into the engram repo", sys.includes(ENGRAM + "/skills/"));
    check("S1 _shared not offered as a skill", !sys.includes("_shared/SKILL.md"));
    check("S1 no nudge on empty store", !s1.includes("[engram]"));
    const s1Canary = s1.includes(CANARY);
    check("S1 context-file canary present (proves S5's absence is the flag, not luck)", s1Canary);

    // ---- S3: prompt template expansion ----------------------------------
    before = captureLines().length;
    r = runPi(["-p", ...piArgs, "/learn kalman filters"], { ENGRAM_HOME: STORE_EMPTY });
    reqs = captureLines().slice(before);
    const s3 = reqs[0] ? reqText(reqs[0]) : "";
    check(
      "S3 /learn template expanded with args",
      s3.includes("Load Engram's tutor") && s3.includes("kalman filters"),
    );
    before = captureLines().length;
    r = runPi(["-p", ...piArgs, "/review quick"], { ENGRAM_HOME: STORE_EMPTY });
    reqs = captureLines().slice(before);
    const s3b = reqs[0] ? reqText(reqs[0]) : "";
    check("S3b /review template expanded", s3b.includes("Load Engram's review loop") && s3b.includes("quick"));
    before = captureLines().length;
    r = runPi(["-p", ...piArgs, "/coach dashboard"], { ENGRAM_HOME: STORE_EMPTY });
    reqs = captureLines().slice(before);
    const s3c = reqs[0] ? reqText(reqs[0]) : "";
    check("S3c /coach template expanded with args", s3c.includes("Load Engram's coach") && s3c.includes("dashboard"));

    // ---- S2+S4: RPC mode — nudge injection + bash env propagation -------
    before = captureLines().length;
    const rpc = spawn("pi", ["--mode", "rpc", ...piArgs], {
      cwd: PROJ,
      env: { ...process.env, ENGRAM_HOME: STORE_SEEDED },
      stdio: ["pipe", "pipe", "pipe"],
    });
    const rpcLines = [];
    let rpcBuf = "";
    rpc.stdout.on("data", (d) => {
      rpcBuf += d;
      let i;
      while ((i = rpcBuf.indexOf("\n")) >= 0) {
        const line = rpcBuf.slice(0, i);
        rpcBuf = rpcBuf.slice(i + 1);
        if (line.trim()) rpcLines.push(line);
      }
    });
    const rpcErr = [];
    rpc.stderr.on("data", (d) => rpcErr.push(String(d)));
    const waitFor = (pred, ms) =>
      new Promise((res) => {
        const t0 = Date.now();
        const iv = setInterval(() => {
          const hit = pred();
          if (hit || Date.now() - t0 > ms) {
            clearInterval(iv);
            res(hit || null);
          }
        }, 100);
      });
    const findResp = (id) =>
      rpcLines
        .map((l) => {
          try {
            return JSON.parse(l);
          } catch {
            return null;
          }
        })
        .find((o) => o && o.type === "response" && o.id === id);

    await new Promise((res) => setTimeout(res, 2500)); // extension load + session start
    rpc.stdin.write(JSON.stringify({ id: "b1", type: "bash", command: "echo ROOTPROBE=$ENGRAM_ROOT" }) + "\n");
    let resp = await waitFor(() => findResp("b1"), 20000);
    const bashOut = resp && resp.data && (resp.data.output || resp.data.stdout || JSON.stringify(resp.data));
    check(
      "S4 ENGRAM_ROOT propagates through the real bash path",
      !!bashOut && String(bashOut).includes("ROOTPROBE=" + ENGRAM),
      String(bashOut || "no response").slice(0, 200),
    );

    rpc.stdin.write(JSON.stringify({ id: "p1", type: "prompt", message: "hello from rpc" }) + "\n");
    await waitFor(() => captureLines().length > before, 20000);
    await new Promise((res) => setTimeout(res, 500));
    reqs = captureLines().slice(before);
    const s2 = reqs.map(reqText).join("\n=====\n");
    const nudgeAsUser = reqs.some((req) =>
      (req.body.messages || []).some(
        (m) =>
          m.role === "user" &&
          (typeof m.content === "string" ? m.content : (m.content || []).map((c) => c.text || "").join("")).includes(
            "[engram] 1 production awaiting assessor grading",
          ),
      ),
    );
    check("S2 nudge injected as a user-role message on first RPC prompt (seeded store)", nudgeAsUser, s2.includes("[engram]") ? "" : "nudge text absent entirely");
    const notifySeen = rpcLines.some((l) => l.includes("notify") && l.includes("[engram]"));
    check("S2 RPC notify request emitted (the TUI-notice half)", notifySeen);
    rpc.kill();

    // ---- S2b: RPC with EMPTY store — extension live (hasUI true), must stay silent.
    // The print-mode empty-store check (S1) cannot prove this: in -p the extension
    // is inert for an unrelated reason. This is the store-driven silence, asserted
    // in the one mode where the nudge machinery actually runs.
    before = captureLines().length;
    const rpc2 = spawn("pi", ["--mode", "rpc", ...piArgs], {
      cwd: PROJ,
      env: { ...process.env, ENGRAM_HOME: STORE_EMPTY },
      stdio: ["pipe", "pipe", "pipe"],
    });
    const rpc2Lines = [];
    let rpc2Buf = "";
    rpc2.stdout.on("data", (d) => {
      rpc2Buf += d;
      let i;
      while ((i = rpc2Buf.indexOf("\n")) >= 0) {
        const line = rpc2Buf.slice(0, i);
        rpc2Buf = rpc2Buf.slice(i + 1);
        if (line.trim()) rpc2Lines.push(line);
      }
    });
    await new Promise((res) => setTimeout(res, 2500)); // extension load + probe resolves
    rpc2.stdin.write(JSON.stringify({ id: "p1", type: "prompt", message: "hello from rpc" }) + "\n");
    await waitFor(() => captureLines().length > before, 20000);
    await new Promise((res) => setTimeout(res, 500));
    reqs = captureLines().slice(before);
    const s2b = reqs.map(reqText).join("\n=====\n");
    const notify2 = rpc2Lines.some((l) => l.includes("notify") && l.includes("[engram]"));
    check("S2b empty store over live RPC UI: no notify, no nudge in payload", !notify2 && !s2b.includes("[engram]"));
    rpc2.kill();

    // ---- S5: child shape — inert extension, no skills, no context -------
    before = captureLines().length;
    r = runPi(["-p", "--no-skills", "--no-context-files", ...piArgs, "Grade the items please"], {
      ENGRAM_HOME: STORE_SEEDED,
      ENGRAM_CHILD: "1",
    });
    reqs = captureLines().slice(before);
    const s5 = reqs.map(reqText).join("\n=====\n");
    const s5sys = reqs[0] ? msgToText((reqs[0].body.messages || [])[0] || {}) : "";
    check("S5 child run exits 0 with mock reply", r.status === 0 && r.stdout.includes("MOCK-OK"), "status=" + r.status);
    check("S5 no skills offered to the child", !s5sys.includes("SKILL.md"));
    check("S5 no nudge in child context (seeded store!)", !s5.includes("[engram]"));
    check("S5 no project context files in child (the canary S1 proved present)", !s5.includes(CANARY));

    // dump payload summaries for the record
    fs.writeFileSync(
      path.join(WORK, "summary.txt"),
      captureLines()
        .map((c, i) => "#" + i + " msgs=" + (c.body.messages || []).length + " roles=" + (c.body.messages || []).map((m) => m.role).join(","))
        .join("\n"),
    );
  } finally {
    // ---- cleanup ---------------------------------------------------------
    try {
      mock.kill();
    } catch {}
    r = runPi(["remove", ENGRAM], {}, { cwd: HARNESS });
    console.log("pi remove:", (r.stdout || r.stderr || "").trim());
    if (hadModels) {
      fs.copyFileSync(MODELS_JSON + ".harness-bak", MODELS_JSON);
      fs.unlinkSync(MODELS_JSON + ".harness-bak");
    } else {
      fs.rmSync(MODELS_JSON, { force: true });
    }
  }

  const failed = results.filter((r) => !r.pass);
  console.log("\n== " + (results.length - failed.length) + "/" + results.length + " checks passed ==");
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error("harness error:", e);
  process.exit(2);
});
