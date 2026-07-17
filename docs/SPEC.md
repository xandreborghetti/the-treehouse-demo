# The Treehouse — v1 Spec

A private, invite-only space for **three friends** — part shared wall, part group journal, part game room —
anchored by a weekly catch-up call. Everything is ours; nothing is public.

---

## Who & access
- **3 members**, fixed. Invite-only, no signups.
- **Auth:** magic-link email (or a shared passphrase for v1). The three emails are allowlisted.
- **Everything private.** No public pages. Meeting recordings especially.

## Architecture
A small mobile-friendly **web app** backed by a lightweight shared database, so posts appear for everyone.

- **Frontend:** plain HTML/CSS/JS (no framework, no build step) — see `app/`. Deliberately boring so
  anyone can hack on it.
- **Backend:** **Supabase** (free tier) — Postgres + auth + realtime + file storage (images, meeting audio).
  One service covers data, login, and uploads.
- **Hosting:** Vercel/Netlify (free), or GitHub Pages for the static demo.
- ⚠️ **Personal accounts only** — keep this entirely separate from any work infrastructure.

### The seam
`app/data.js` is the **only** file that changes when the backend arrives. Every function has a
`// SUPABASE:` comment showing the query to swap in. The UI never touches the store directly.

## Data model (Supabase tables)
- `members` — the three (name, email, avatar).
- `posts` — the wall: `type` (poem/quote/song/image/thought/link), `author`, `body`, `url`, `image_path`, `created_at`, `pinned`.
- `reactions` — `post_id`, `member`, `emoji`.
- `comments` — `post_id`, `member`, `text`, `created_at`.
- `poem_weeks` — `week`, `curator`, `title`, `author`, `excerpt`, `source_url`, `copyright_tier`.
- `meetings` — `date`, `audio_path`, `transcript`, `recap`, `topics[]`, `highs_lows`, `plans[]`, `action_items[]`, `keeper_quote`.
- `predictions` — `author`, `about`, `claim`, `resolve_by`, `status`, `outcome`, `votes`.
- `bucket_list` — `item`, `added_by`, `status`, `done_by`, `done_note`.
- `goals` — `member`, `goal`, `period`, `checkins[]`.
- `media_links` — `type` (song/playlist/movie/book/article), `url`, `title`, `note`, `added_by`, `week`.

## Features

### 1. The wall (home)
Reverse-chron feed. Anyone posts a poem, quote, song, image, thought, or link. Emoji **reactions** and
**comments** so it's a conversation.

### 2. Poem of the week
Pinned weekly slot, **rotating curator**, past weeks archived.
**Copyright rule (built in):** public-domain poems may show in full; anything under copyright shows only a
**short excerpt + attribution + link** — never the full text. Same for lyrics: link + title/artist only.

### 3. Meeting archive
Each weekly call → **recap, everyone's high & low, plans, action items, a line to remember** — filed by date,
searchable forever. Powered by **Granola** (which all three of us already use): it records + transcribes;
the recorder reshapes that into our format. See `meeting-recorder/`.
**Scoping rule:** the recorder reads **only** a dedicated "Treehouse" Granola folder — never anyone's other
(work/private) meetings.

### 4. Games
- **"Who Said It?"** *(daily)* — an anonymized line from the archive; guess who said it. Streaks. Gets
  better the more history we have.
- **"Treeections"** *(weekly)* — Connections-style: 16 tiles → 4 groups of 4, built from **our own** history
  ("things Ben says", "songs George overplayed", "places we keep saying we'll go"). Rotating maker; the app
  can **auto-propose** the tiles from the wall + archive.
- **"The Daily Line"** — one tap: rate your day 1–10. Three lines on a chart over time. Trivial to use;
  quietly the most important feature — you see when someone's line dips, and you call them.

### 5. Predictions
Post a prediction about a friend, set a **resolve-by** date, others weigh in (agree/disagree or wager
play-points). Resolve later; **leaderboard** of best predictors.

### 6. Bucket list · 7. Goals · 8. Shelf
Group "someday" list (mark done with a photo + note) · each member's goals with weekly check-ins ·
song/playlist/movie/book/article drops with a one-line note, filterable by type.

## Ship order
- **v1.0 — the scrapbook core:** wall (post/react/comment) · shelf · poem of the week · meeting archive.
  *(This is what's built today, in-memory.)*
- **v1.5 — structure:** predictions · goals · bucket list · Supabase behind `data.js`.
- **v2 — delight:** the three games · "on this day" · year-in-review · PWA so it feels like an app.

## Privacy & safety
- Invite-only, three members, nothing public. Meeting audio/transcripts limited to the three.
- Copyright-safe by design (poem/lyrics rule above).
- Personal hosting accounts only — never work infrastructure.
- The app never posts anywhere on our behalf; no external sends.
