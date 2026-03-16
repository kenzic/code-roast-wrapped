# Code Roast

A Next.js app that analyzes a public GitHub repo and generates a Wrapped-style roast video in the browser.

Uses the GitHub REST API for data, Claude (`claude-sonnet-4-6`) for structured roast generation, `@json-render/core` + `@json-render/remotion` for JSONL patch streaming, and Remotion `Player` for browser-only playback.

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your API key in `.env.local`:

```bash
AI_GATEWAY_API_KEY=your_key
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Key Files

| File                            | Purpose                                                   |
| ------------------------------- | --------------------------------------------------------- |
| `lib/catalog.ts`                | Catalog definitions (Zod props, descriptions) and prompt. |
| `lib/utils.ts`                  | `validateTimelineSpec` — enforces scene-order rules.      |
| `lib/github.ts`                 | GitHub API client: fetch repo data, parse/validate URLs.  |
| `lib/types.ts`                  | TypeScript types inferred from catalog schemas.           |
| `remotion/registry.tsx`         | Maps catalog component names to scene components.         |
| `components/wrapped-player.tsx` | Remotion Player + @json-render/remotion Renderer.         |
| `app/api/roast/route.ts`        | POST handler: fetch repo, stream roast spec via Claude.   |

## How It Works

1. User submits a GitHub URL on the home page.
2. `POST /api/roast` fetches repo metadata, commits, languages, contributors, root files, and sampled source snippets, then streams JSONL patches from Claude.
3. Client compiles patches into a spec (`createSpecStreamCompiler` from @json-render/core).
4. Spec is validated against catalog and scene-order rules (`validateTimelineSpec`).
5. Remotion `Player` with @json-render/remotion `Renderer` plays scenes in sequence.

## Catalog Constraints

Scene types: `RoastOpener`, `CrimeStat`, `ShameTimeline`, `HallOfFame`, `Verdict`.

Rules:

- `RoastOpener` first, `Verdict` last
- 4–7 total scenes
- At least one `HallOfFame`

## Scripts

| Command             | Purpose               |
| ------------------- | --------------------- |
| `npm run dev`       | Local dev server      |
| `npm run build`     | Production build      |
| `npm run start`     | Run built app         |
| `npm run lint`      | ESLint                |
| `npm run typecheck` | TypeScript type-check |
