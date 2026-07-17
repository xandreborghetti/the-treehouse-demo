# The Treehouse Meeting Recorder — Granola-powered

Turns your weekly Sunday call — recorded in **Granola**, which all three of you already use — into a warm
The Treehouse **archive entry**: a recap, everyone's high & low, plans, and action items. Granola already does
the hard part (record + transcribe + AI notes); the recorder just reshapes that into the The Treehouse voice.

## How it works
1. You have your Sunday call. Granola records + transcribes it as usual.
2. The recorder pulls **that one meeting** from Granola and reads its transcript + notes.
3. It reshapes them into the The Treehouse format:
   - **Recap** — a few warm sentences on what the hour was.
   - **What we got into** — the topics.
   - **Highs & lows** — one high + one low per person.
   - **Plans** — anything you decided or want to do.
   - **Action items** — `who · what · by when` (drafted; nobody's auto-assigned).
   - **A line to remember** — a quote or moment worth keeping.
4. Posts it to the The Treehouse **meeting archive** + drops a "last Sunday" card on the wall.

## ⚠️ CRITICAL scoping (the whole reason this is safe)
Your Granola is full of **work meetings** (Relish/RIC/LWH client calls) and some **private personal** ones
(health, etc.). The recorder must therefore:
- Process **only the clubhouse meeting** — never scan or pull your whole Granola.
- **Best practice:** keep your Sunday calls in a dedicated Granola **folder named "The Treehouse,"** and point
  the recorder at *that folder only*. It never touches anything outside it.
- Never route work/client or unrelated personal content into The Treehouse; keep the transcript private to the
  three of you.

## Prototype status
- ✅ **Granola read access is LIVE** — the tool can list and pull meetings (confirmed 2026-07-11).
- ✅ **Transform + format defined** (below) and demoed on a **synthetic** Sunday call — **no real work or
  personal meeting was processed.**
- ⏭️ **To go live:** create a "The Treehouse" folder in Granola, record your first Sunday call into it, and
  point the recorder at that folder. It produces the real archive entry, scoped to only that.

## Data it writes (for the real app)
A `meetings` row: `date`, `duration`, `recap`, `topics[]`, `highs_lows` (per member), `plans[]`,
`action_items[]`, `keeper_quote`, and a link to the private audio (stored in Supabase, access = the three).
