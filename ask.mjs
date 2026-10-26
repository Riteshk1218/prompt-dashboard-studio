// Netlify Function: forwards dashboard prompts to the Claude API.
// Your API key stays on the server and is never sent to the browser.
//
// Environment variables (Netlify > Site configuration > Environment variables):
//   ANTHROPIC_API_KEY    required. Your key from https://console.anthropic.com
//   ACCESS_CODE          optional. If set, visitors must enter this code to use AI.
//   ANTHROPIC_MODEL      optional. Model for building dashboards (default claude-haiku-5-5).
//   ANTHROPIC_MODEL_QUICK optional. Model for writing insights (default claude-haiku-5-5).

const MAX_PROMPT_CHARS = 60000;

export default async (req) => {
  const key = process.env.ANTHROPIC_API_KEY;
  const code = process.env.ACCESS_CODE || "";

  // Health check: the page calls this on load to decide whether AI is on.
  if (req.method === "GET") return Response.json({ ok: Boolean(key), needsCode: Boolean(code) });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY is not set on this site." }, { status: 500 });
  if (code && req.headers.get("x-access-code") !== code) return Response.json({ error: "Access code required." }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "Request body must be JSON." }, { status: 400 }); }
  const prompt = typeof body?.prompt === "string" ? body.prompt : "";
  if (!prompt) return Response.json({ error: "Missing prompt." }, { status: 400 });
  if (prompt.length > MAX_PROMPT_CHARS) return Response.json({ error: "Prompt is too long." }, { status: 413 });

  const model = body.tier === "quick"
    ? (process.env.ANTHROPIC_MODEL_QUICK || "claude-haiku-5-5")
    : (process.env.ANTHROPIC_MODEL || "claude-haiku-5-5");

  let r, j;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
    });
    j = await r.json().catch(() => ({}));
  } catch (e) {
    return Response.json({ error: "Could not reach the Claude API." }, { status: 502 });
  }
  if (!r.ok) {
    console.error("Claude API error", r.status, j?.error?.message);
    return Response.json({ error: j?.error?.message || "Claude API error." }, { status: r.status === 429 ? 429 : 502 });
  }
  const text = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
  return Response.json({ text, truncated: j.stop_reason === "max_tokens" });
};

export const config = { path: "/api/ask" };
