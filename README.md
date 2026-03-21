# AI workspace

React + TypeScript + Vite front end. The **LLM API is a separate project**: [`../ai-workspace-server`](../ai-workspace-server) (Express, keys on the server only).

## Prerequisites

- Node.js 20+

## Install & run (this repo)

```bash
npm install
npm run dev
```

Open `http://localhost:5173` (default Vite port). In development, Vite proxies `/api` → `http://127.0.0.1:3001`.

## API (separate repo)

1. Clone or open **`ai-workspace-server`** next to this folder (same parent directory).
2. In that project: `cp .env.example .env`, set **`LLM_API_KEY`**, then `npm install` and `npm run dev`.

See [ai-workspace-server README](../ai-workspace-server/README.md).

## Environment (front end)

Optional `.env`:

- **`VITE_API_BASE_URL`** — public API origin in production (e.g. `https://api.example.com`). Leave unset in local dev to use the Vite proxy.

## Feature-sliced layout

`app` → `pages` → `widgets` → `features` → `entities` → `shared`
