# The Treehouse 🌳

A private clubhouse for three friends — part shared wall, part group journal, part game room —
anchored by a weekly catch-up call.

**[▶ See the live demo](https://xandreborghetti.github.io/the-treehouse-demo/)** — click around; nothing you do
there is saved (it's sample data).

---

## What it is
One small, private space where the three of us can:
- **🧱 The wall** — drop a poem, a song, a thought, a photo. React, reply.
- **📖 Poem of the week** — rotating curator, pinned up top.
- **🎙️ Meeting archive** — our weekly call → recap, everyone's high & low, plans, action items.
- **🔮 Predictions** — bets about each other's lives, scored later. Leaderboard.
- **🎯 Goals** · **🪣 Bucket list** · **🎵 Shelf** (songs/films/books/articles we send each other).

## Run it locally
The app is a plain HTML/CSS/JS project — **no npm, no build step, no installs.**

```bash
cd app
python3 -m http.server 8000
# then open http://localhost:8000
```
> It must be served over http (ES modules don't load from `file://`).

## Rebuild the shareable demo
`index.html` at the repo root is a **generated** single-file build of `app/` (inline CSS+JS, opens by
double-click, and is what GitHub Pages serves).

```bash
python3 build.py    # regenerates ./index.html from app/
```
**If you change anything in `app/`, re-run this** or the demo page drifts from the source.

## Structure
| Path | What |
|---|---|
| `app/index.html` · `styles.css` | the app shell + design |
| `app/app.js` | renders every section, wires interactions |
| **`app/data.js`** | **the seam** — every function has a `// SUPABASE:` note showing the query to swap in. This is the *only* file that changes when we add a real backend. |
| `app/mock-data.js` | sample data (3 members, posts, a meeting, predictions, goals…) |
| `build.py` | flattens `app/` → root `index.html` |
| `meeting-recorder/` | how a Granola call becomes an archive entry |
| `docs/SPEC.md` | the full v1 spec (features, data model, architecture) |

## Where it's going
Right now everything is **in-memory** — reload and it resets. That's intentional: get the shape right first.

**Next up:**
1. **Backend** — Supabase (Postgres + auth + file storage) wired in behind `app/data.js`. Invite-only, just us three.
2. **Games** —
   - **"Who Said It?"** — a daily anonymized line from the archive; guess who said it. Streaks.
   - **"Treeections"** — weekly Connections-style puzzle built from *our own* history (the app can auto-propose the 16 tiles).
   - **"The Daily Line"** — one tap, rate your day 1–10; three lines on a chart over time.
3. **Meeting recorder** — our Granola call → auto recap + highs/lows (see `meeting-recorder/`).

## House rules
- **Private, always.** Invite-only, just the three of us. Nothing public, ever.
- **Copyright-safe:** public-domain poems can show in full; anything under copyright = a short attributed
  excerpt + a link. Never full poems or song lyrics. Shelf items are titles + links only.
- Meeting audio/transcripts are sensitive — private storage, the three of us only.

## Want to hack on it?
Open `app/` and go. It's deliberately boring tech (no framework) so anyone can jump in. If you touch
`app/`, run `python3 build.py` before pushing so the demo stays in sync.
