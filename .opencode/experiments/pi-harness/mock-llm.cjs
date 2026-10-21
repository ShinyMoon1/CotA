// Mock OpenAI-compatible chat-completions server for the engram×pi harness.
// Captures every request body to MOCK_CAPTURE (JSONL: {n, url, body}) and
// replies with scripted responses (MOCK_SCRIPT json: array of steps,
// {text} or {tool, args}) — default step: {text:"MOCK-OK"}.
const http = require("http");
const fs = require("fs");

const PORT = Number(process.env.MOCK_PORT || 8199);
const CAP = process.env.MOCK_CAPTURE || "/tmp/mock-capture.jsonl";
let script = null;
if (process.env.MOCK_SCRIPT) script = JSON.parse(fs.readFileSync(process.env.MOCK_SCRIPT, "utf8"));
let n = 0;

function sseChunk(res, obj) {
  res.write("data: " + JSON.stringify(obj) + "\n\n");
}

function chunkShell(delta, finish) {
  return {
    id: "chatcmpl-mock",
    object: "chat.completion.chunk",
    created: 1,
    model: "mock-1",
    choices: [{ index: 0, delta, finish_reason: finish || null }],
  };
}

http
  .createServer((req, res) => {
    let b = "";
    req.on("data", (c) => (b += c));
    req.on("end", () => {
      if (!req.url.includes("/chat/completions")) {
        // model listing or anything else — empty ok
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ object: "list", data: [] }));
        return;
      }
      let body = {};
      try {
        body = JSON.parse(b);
      } catch {}
      fs.appendFileSync(CAP, JSON.stringify({ n, url: req.url, body }) + "\n");
      const step = (script && script[Math.min(n, script.length - 1)]) || { text: "MOCK-OK" };
      n++;

      const usage = { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 };
      if (body.stream === false) {
        const message = step.tool
          ? {
              role: "assistant",
              content: null,
              tool_calls: [
                {
                  id: "call_mock_1",
                  type: "function",
                  function: { name: step.tool, arguments: JSON.stringify(step.args || {}) },
                },
              ],
            }
          : { role: "assistant", content: step.text };
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            id: "chatcmpl-mock",
            object: "chat.completion",
            created: 1,
            model: "mock-1",
            choices: [
              { index: 0, message, finish_reason: step.tool ? "tool_calls" : "stop" },
            ],
            usage,
          }),
        );
        return;
      }

      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      });
      if (step.tool) {
        sseChunk(res, chunkShell({ role: "assistant", content: "" }));
        sseChunk(
          res,
          chunkShell({
            tool_calls: [
              {
                index: 0,
                id: "call_mock_1",
                type: "function",
                function: { name: step.tool, arguments: "" },
              },
            ],
          }),
        );
        sseChunk(
          res,
          chunkShell({
            tool_calls: [
              { index: 0, function: { arguments: JSON.stringify(step.args || {}) } },
            ],
          }),
        );
        const fin = chunkShell({}, "tool_calls");
        fin.usage = usage;
        sseChunk(res, fin);
      } else {
        sseChunk(res, chunkShell({ role: "assistant", content: "" }));
        sseChunk(res, chunkShell({ content: step.text }));
        const fin = chunkShell({}, "stop");
        fin.usage = usage;
        sseChunk(res, fin);
      }
      res.write("data: [DONE]\n\n");
      res.end();
    });
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log("mock-llm listening on " + PORT);
  });
