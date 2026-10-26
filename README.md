# Prompt Dashboard Studio

Upload an Excel or CSV file, describe the dashboard you want, and AI builds the KPIs, charts and insights. You can build several pages and download them as PDF, PNG or Excel.

## Files

- `index.html`: the whole app (runs in the browser; your data never leaves the browser except column names, a few sample rows and chart totals sent to the AI)
- `netlify/functions/ask.mjs`: a small server function that calls the Claude API with your key
- `netlify.toml`: tells Netlify where the site and function are

## Deploy (with AI)

1. Get an API key at https://console.anthropic.com (add billing credit).
2. Put this folder in a GitHub repository.
3. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repo. Leave the build command empty; the publish directory is `.`.
4. In Netlify: **Site configuration → Environment variables**, add `ANTHROPIC_API_KEY` with your key. Optionally add `ACCESS_CODE` so only people with the code can use AI (recommended, since every prompt uses your API credit).
5. Redeploy: **Deploys → Trigger deploy**.

The green "AI ready" pill at the top means it's working.

Netlify CLI alternative: `npm i -g netlify-cli`, then in this folder run `netlify deploy --prod` and set the variable with `netlify env:set ANTHROPIC_API_KEY sk-ant-...`.

## Deploy (no AI, quickest)

Drag this folder onto https://app.netlify.com/drop. The site works right away, but drag-and-drop deploys don't run the function, so dashboards are built by simple rules instead of AI. Uploading, charts, pages and downloads still work.

## Settings

| Variable | Needed | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes, for AI | Your Claude API key |
| `ACCESS_CODE` | Optional | Visitors must enter this code to use AI |
| `ANTHROPIC_MODEL` | Optional | Model that designs dashboards (default `claude-haiku-5-5`; `claude-sonnet-5-5` gives better results but is slower and may hit Netlify's 10-second function limit on the free plan) |
| `ANTHROPIC_MODEL_QUICK` | Optional | Model that writes insights (default `claude-haiku-5-5`) |
