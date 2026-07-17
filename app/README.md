# The Treehouse — app scaffold

A private clubhouse for three friends. Part Tumblr, part group journal, part
game room, anchored by a weekly Sunday call. This is the **local scaffold**:
plain HTML/CSS/JS ES modules, **zero `npm install`**, works offline. The UI is
fully wired against an in-memory mock store so it feels live — and it's
structured so a Supabase backend plugs in later without rewriting the UI.

## Run it

ES modules must load over HTTP (not `file://`), so serve the folder:

```sh
cd ~/the-treehouse/app
python3 -m http.server 8000
```

Then open **http://localhost:8000**.

> Opening `index.html` directly with `file://` will NOT work — browsers block
> ES-module imports over the file protocol. Always use the server above.

Nothing is persisted: reload and the mock data resets. That's expected until
Supabase is wired.

## What's here

| File               | Role |
|--------------------|------|
| `index.html`       | App shell — sticky header (wordmark + 3 avatars), tab nav (Wall · Meetings · Predictions · Goals · Bucket List · Shelf), render container. |
| `styles.css`       | The full design — warm "zine" palette (cream/ink + coral/teal/gold), serif display + sans body, rounded cards. Mobile-first (~34rem), light/dark via `prefers-color-scheme` + a `data-theme` override toggle. |
| `app.js`           | ES module. Imports the data layer, renders each section from data, wires interactions (compose a post, react, comment, add a prediction/goal/bucket item/shelf link, check in a goal, vote a prediction). Every write goes through `data.js`, then re-renders. |
| `data.js`          | **THE SEAM.** All async data functions. Today they read/write the mock store; each has a `// SUPABASE:` comment with the query to swap in. This is the only file that changes when the backend arrives. |
| `mock-data.js`     | Sample data for every section — 3 members (Ben, George, You), wall posts, a public-domain poem-of-week, a meeting archive entry (recorder format), 1 open prediction + leaderboard, 3 goals, bucket items, shelf links. |
| `config.example.js`| Placeholder `SUPABASE_URL` / `SUPABASE_ANON_KEY`. Copy to `config.js` (gitignored) when wiring the backend. |
| `.gitignore`       | Ignores `config.js` and `.DS_Store`. |

## Sections

- **Wall** — reverse-chron feed. Poem of the week (pinned, rotating curator),
  compose (thought/quote/song/link/poem/image), emoji reactions, comments.
- **Meetings** — archive of Sunday calls in the Granola recorder format: recap,
  topics, highs & lows per member, plans, action items, a line to remember.
- **Predictions** — life prediction market: call shots on each other, vote
  agree/disagree, resolve later, leaderboard of best predictors.
- **Goals** — each member's goals with lightweight weekly check-ins.
- **Bucket List** — group "someday" list; mark items done.
- **Shelf** — shared media (song/playlist/movie/book/article): titles + links
  + one-line notes only.

## Copyright-safe by design

- Poem of the week ships a **public-domain** excerpt (Walt Whitman) with
  attribution and a link. Anything under copyright would store only a short
  excerpt + attribution + link (`copyright_tier: 'excerpt'`), never full text.
- Shelf/media items are **titles + links + one-line notes only** — never
  lyrics or copyrighted excerpts.

## How to wire Supabase (the single seam)

Everything backend-related is isolated in **`data.js`**. `app.js` never touches
the store directly — it only calls the exported async functions. So the swap is
mechanical:

1. Create a personal Supabase project (free tier). Keep it fully separate from
   any work infrastructure.
2. Create the tables from `the-treehouse-v1-spec.md` (`members`, `posts`,
   `reactions`, `comments`, `poem_weeks`, `meetings`, `predictions`,
   `bucket_list`, `goals`, `media_links`), enable Row Level Security, and
   allowlist the three members' emails.
3. `cp config.example.js config.js` and fill in `SUPABASE_URL` /
   `SUPABASE_ANON_KEY`.
4. Add a local `supabase-js` client (drop the ESM build into e.g.
   `./vendor/supabase.js` to stay CDN-free / offline), then in `data.js`:
   ```js
   import { createClient } from './vendor/supabase.js';
   import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
   ```
5. Replace each function body with the query in its `// SUPABASE:` comment.
6. Delete `mock-data.js`.

The UI, styles, and interactions don't change.
