# Draw My Slop

You submit a drawing prompt. Someone else draws it. That's pretty much it.

No accounts, no login — you get a random UUID dropped in a cookie on first visit and that's your identity.

## How it works

1. Go to the **Prompts** tab and submit something for someone to draw
2. Pick a prompt someone else submitted and claim it
3. You've got 10 minutes to draw something and submit it, otherwise the claim releases back to the pool
4. Prompts expire after 4 hours if nobody draws them

## Running it

Requires Node.js.

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, server on `http://localhost:3001`. The Vite dev server proxies `/api` and `/uploads` to the backend so you don't have to think about CORS.

Drawings are saved to `server/uploads/` as PNGs.

## Stack

- React 19 + TypeScript + Tailwind v4 (Vite 6)
- Express 5 on Node.js
- In-memory prompt store (resets on server restart)

## API

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/prompts` | Unclaimed prompts (excludes your own) |
| `POST` | `/api/prompt/submit` | Submit a new prompt |
| `POST` | `/api/prompt/claim/:id` | Claim a prompt |
| `POST` | `/api/prompt/:id/drawing` | Submit your drawing |
| `GET` | `/api/prompts/:uuid` | All prompts you've submitted |

All routes expect an `X-User-Id` header with your UUID.
