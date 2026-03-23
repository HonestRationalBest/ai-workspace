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

Required `.env`:

- **`VITE_API_BASE_URL`** — API origin (e.g. local `http://127.0.0.1:3001` to match the Vite dev proxy, or production `https://api.example.com`). The app throws at runtime if this is missing.

## Chat UX

- Assistant replies **stream** token-by-token (`POST /api/chat/stream` on the API).
- **Stop** aborts the stream; **Regenerate** retries the last assistant reply; **Edit** on a user message rewrites it and resends from that point.

## Feature-sliced layout

`app` → `pages` → `widgets` → `features` → `entities` → `shared`
