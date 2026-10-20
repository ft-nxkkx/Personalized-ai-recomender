# Pairwise AI: handoff

Last updated: 2026-10-05 (creative pass two). Read this first before touching the code (humans and AI assistants alike).

## What this is

Pairwise AI is a blind, head-to-head model comparison site. A user writes a prompt, two anonymous models answer, the user votes, and only then do the model names appear. Votes update Elo ratings (K=16) per domain and build a personal "taste" profile.

## Current state

| Area | Status |
| --- | --- |
| Frontend (this repo) | Built. Runs fully on mock data in the browser. |
| Backend (FastAPI) | In progress by a teammate. Not wired in yet. |
| Auth | Mock. Any email "signs in". Real auth comes from the backend. |
| Motto copy | Placeholder in `components/Motto.tsx` (`MOTTO` constant). |
| Palette | Three colourways behind the split swatches in the nav: grape and butter (default), highlighter, signal red. Pick one, then delete the switcher. |
| Reference images | Not received yet. |

## Run it

```bash
npm install
npm run dev            # http://localhost:3000, mock data
npm run build          # production build
npm run preview        # writes preview/dist/pairwise-preview.html (one self-contained file)
```

To use the real backend, create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Remove the variable to go back to mock data. Nothing else changes.

## Where things live

```
app/layout.tsx        fonts, theme boot script (no flash of wrong theme)
app/page.tsx          renders <PairwiseApp />
app/globals.css       design tokens (light/dark + accent), .slab / .press / .display helpers
components/
  PairwiseApp.tsx     page composition, toast, footer, auth modal mount
  providers.tsx       theme, accent, session, Lenis smooth scroll, scrollTo, toast
  Nav.tsx             sticky nav, accent swatches, theme toggle, sign in
  Hero.tsx            name in the middle, email "Notify me", sign in link
  Motto.tsx           scroll-revealed motto (placeholder text)
  TravellingCube.tsx  the 3D A/B cube that travels hero -> motto -> arena
  PairCube.tsx        the cube itself (CSS 3D, no WebGL)
  Arena.tsx           domains, prompt, two responses, vote, reveal
  Leaderboard.tsx     Elo table per domain with animated reordering
  Taste.tsx           the user's favourite model per domain
  AuthModal.tsx       sign-in dialog (morphs out of the Sign in button)
  Markdown.tsx        tiny renderer for model responses
  Scribble.tsx        hand-drawn strokes and margin notes
  DecryptedText.tsx   scramble effect for the identity reveal
lib/
  api/client.ts       THE ONLY place the UI talks to a backend
  api/http.ts         fetch implementation for FastAPI
  api/mock.ts         in-browser mock (localStorage), same contract
  api/mock-data.ts    sample models, prompts and answers (delete when live)
  types.ts            shared types, fixed domains
  elo.ts              Elo, K=16 (mock only; backend owns real ratings)
  sanitization.ts     scrubs brand/self-identity text before display
  store.ts            localStorage helper used by providers
preview/              esbuild script for the single-file preview
```

## API contract (for the backend)

The frontend calls these endpoints. JSON in, JSON out, camelCase keys. Errors: any non-2xx with a text or JSON body; the UI shows the message.

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | `/battle` | `{ prompt, category }` | `{ battleId, prompt, category, responseA, responseB }` (no model names) |
| POST | `/vote` | `{ battleId, winner }` where winner is `a`, `b`, `tie` or `both_bad` | `{ battleId, winner, a: Reveal, b: Reveal }` |
| GET | `/leaderboard?category=coding` | none (omit category for overall) | `[{ rank, model: Model, winRate, matches }]` |
| GET | `/profile/taste` | none | `[{ category, votes, favourite: { name, provider, share } or null }]` |
| POST | `/auth/signin` | `{ email }` | `{ email, signedInAt }` |
| POST | `/waitlist` | `{ email }` | `{ ok: true }` |

`Model = { id, name, provider, rating, wins, losses, ties }`
`Reveal = { modelId, name, provider, ratingBefore, ratingAfter, delta }`

Rules the backend must keep:
- `/battle` must never include model identity. The UI also scrubs text, but the server is the real guarantee.
- `category` is free text: `coding`, `research`, `system`, or any domain the user added.
- CORS must allow the frontend origin with credentials (`credentials: 'include'` is set).
- The model API keys stay on the server. The browser never sees them.

Exact TypeScript shapes: `lib/types.ts`. If the backend uses snake_case, map it inside `lib/api/http.ts` and nowhere else.

## Design rules

- Chunky and hand-made: 2.5 to 3px ink outlines, hard offset shadows with no blur, paper grain and dotted-notebook background.
- Radius rule: cards 20px, inputs 14px, anything you press is a full pill. Sections like the leaderboard and footer are 32px slabs.
- Colours only through tokens in `app/globals.css` (`bg`, `surface`, `sunken`, `ink`, `muted`, `accent`, `on-accent`, `accent-2`, `on-accent-2`). Never a raw hex in a component. `accent` is the loud colour (CTAs, the A face), `accent-2` the supporting one (stickers, highlights, B face).
- Domain accent: anything inside a `data-domain` wrapper gets `domain` / `on-domain` (cyan for coding, amber for research, steel for system design, `accent-2` for custom domains). It tweens on switch. Use it with restraint: the domain sticker, the prompt card shadow, card tape, duelist headbands and pedestals, the code gutter. Never for text or CTAs.
- Fonts: Archivo (expanded uppercase for display, normal width for body) and Gochi Hand for margin notes only (`.hand`, `<Note>`). Instrument Serif italic for margin pull quotes only (`.quote`, `<PullQuote>`). Code blocks use the system monospace. No fifth font.
- Variable type: the hero wordmark letters load narrow and thin and stretch to full width and weight; section `h2.display` does the same as it scrolls into view (scroll-driven CSS, skipped where unsupported). `.stretchy` widens a label when it is hovered or selected.
- Human touches, used sparingly: `<Note>` margin notes, `<Scribble>` marker strokes, `.marker` highlighter swipes, `.tape` on cards, cards tilted under 1 degree that straighten on hover. One or two per section, never more.
- Copy has a voice: plain, a bit dry, occasionally funny. No buzzwords.
- Motion must mean something: the cube carries you between sections, the Sign in button becomes the dialog, the "your pick!" sticker moves from the vote button to the chosen answer, leaderboard rows slide when ratings change. In the arena two duelists (`components/Duelist.tsx`, A round, B boxy) square up around the VS badge: they enter per domain (out of a terminal, up from behind a paper stack, assembled from blocks), fidget while answers stream, and after a vote the winner jumps in while the loser gets knocked over. Answer cards use the same per-domain entrance and sit at different angles and heights. Everything respects reduced motion.
- Commentary after a vote is per domain (`CALLS` in `components/Arena.tsx`), e.g. an upset in coding reads "The champ falters. Hotfix incoming." Custom domains get the plain sports version.

## Decisions made

- 2026-10-05, pass two: Priya asked for less generic, more human. Dropped monospace and square corners, added purple and yellow, texture, hand-drawn notes.
- Rebuilt the UI from scratch on 2026-10-05; the earlier glassmorphism version is in the original zip if anything needs recovering.
- Mock first, real API later, behind `lib/api/client.ts`.
- Elo K=16. Both bad = -2 for each model (mock rule; backend may differ).
- Fixed domains: Coding, Research, System design. Users can add their own.

## Open questions

- Final motto wording.
- Which colourway: grape and butter, highlighter or signal red.
- Real sign-in method (magic link, Google, password?).
- Do we keep History and Settings pages from the old version?

## How to keep this file useful

Update it at the end of every working session: change the status table, add to "Decisions made", and move answered items out of "Open questions". Keep it short enough that someone can read it in two minutes. Anything an AI assistant should always follow (like the design rules) can also go in `CLAUDE.md`.
