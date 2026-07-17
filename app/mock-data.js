// mock-data.js — sample in-memory store for The Treehouse (local dev only).
//
// This is a stand-in for the Supabase database. It mirrors the table shapes
// described in the-treehouse-v1-spec.md so that swapping in a real backend
// (see data.js) is a drop-in change and this file can eventually be deleted.
//
// Copyright-safe by design: the poem-of-week sample is a PUBLIC-DOMAIN excerpt
// with attribution. Shelf/media items are titles + links + one-line notes only
// — never lyrics or copyrighted excerpts.

// --- Members: the three, fixed. ------------------------------------------
export const members = [
  { id: 'ben', name: 'Ben', initial: 'B', color: 'coral', email: 'ben@example.com' },
  { id: 'george', name: 'George', initial: 'G', color: 'teal', email: 'george@example.com' },
  { id: 'you', name: 'You', initial: 'X', color: 'gold', email: 'you@example.com' },
];

// --- Poem of the week (rotating curator). --------------------------------
// PUBLIC DOMAIN excerpt — safe to show. Anything under copyright would store
// only a short excerpt + attribution + link (copyright_tier: 'excerpt').
export const poemWeeks = [
  {
    id: 'pw-2026-w28',
    week: '2026-W28',
    curator: 'ben',
    title: 'O Me! O Life!',
    author: 'Walt Whitman',
    excerpt: '…that the powerful play goes on, and you may contribute a verse.',
    source_url: 'https://www.poetryfoundation.org/poems/51568/o-me-o-life',
    copyright_tier: 'public-domain',
    reactions: [
      { member: 'george', emoji: '❤️' },
      { member: 'you', emoji: '❤️' },
      { member: 'ben', emoji: '❤️' },
    ],
  },
];

// --- Wall posts (reverse-chron feed). ------------------------------------
// type: poem | quote | song | image | thought | link
export const posts = [
  {
    id: 'p1',
    type: 'thought',
    author: 'george',
    body: "been thinking about how we only really talk when it's scheduled now. grateful this thing exists tbh.",
    url: null,
    image_path: null,
    created_at: '2026-07-12T14:10:00Z',
    pinned: false,
    reactions: [
      { member: 'you', emoji: '🥹' },
      { member: 'ben', emoji: '🥹' },
    ],
    comments: [
      { member: 'you', text: 'same. sunday is my favorite hour of the week.', created_at: '2026-07-12T14:22:00Z' },
    ],
  },
  {
    id: 'p2',
    type: 'song',
    author: 'you',
    body: 'on repeat all week 👇',
    // Media = title + link only. No lyrics, no excerpts.
    url: 'https://open.spotify.com/',
    title: '"Motion Picture Soundtrack" — Radiohead',
    note: 'added to the house playlist',
    image_path: null,
    created_at: '2026-07-11T20:00:00Z',
    pinned: false,
    reactions: [{ member: 'ben', emoji: '❤️' }],
    comments: [],
  },
  {
    id: 'p3',
    type: 'quote',
    author: 'ben',
    body: '"The two most important days in your life are the day you are born and the day you find out why."',
    note: 'found this on a napkin. felt very us.',
    url: null,
    image_path: null,
    created_at: '2026-07-10T09:30:00Z',
    pinned: false,
    reactions: [
      { member: 'george', emoji: '🔥' },
      { member: 'you', emoji: '🔥' },
      { member: 'ben', emoji: '🔥' },
    ],
    comments: [],
  },
  {
    id: 'p4',
    type: 'image',
    author: 'george',
    body: 'sunset from the roof last night.',
    url: null,
    image_path: '[ shared photo ]', // placeholder — real app stores a Supabase Storage path
    created_at: '2026-07-09T21:15:00Z',
    pinned: false,
    reactions: [
      { member: 'ben', emoji: '😍' },
      { member: 'you', emoji: '😍' },
      { member: 'george', emoji: '😍' },
    ],
    comments: [],
  },
];

// --- Meeting archive (from the Granola-powered recorder). -----------------
// Shape matches meeting-recorder/SPEC.md + sample-archive-entry.md.
export const meetings = [
  {
    id: 'm-2026-07-12',
    date: '2026-07-12',
    duration: '47 min',
    audio_path: null, // private Supabase Storage path in the real app
    recap:
      "A good one. We started on jobs and drifted, as always, into the bigger stuff — whether we're " +
      'building the lives we actually want or just the ones that look right. Ben\'s still deciding on the ' +
      'move, George is three chapters from finishing the book, and we spent a while arguing about whether ' +
      'AI is making us sharper or lazier (jury\'s out).',
    topics: [
      "The move — Ben's 70/30 on taking it",
      "George's book, and the fear of finishing",
      'The Japan trip: actually picking dates this time',
      'The "are we lazy now?" debate',
      'New coffee spot recommendations',
    ],
    highs_lows: [
      { member: 'ben', high: 'got the offer.', low: 'the deciding is harder than the wanting.' },
      { member: 'george', high: 'wrote 4,000 words this week.', low: 'felt lonely mid-week.' },
      { member: 'you', high: 'the new apartment feels like home.', low: "missed a friend's birthday." },
    ],
    plans: [
      'Lock the Japan dates before next Sunday.',
      'George reads us the last chapter when it\'s done.',
      'Try to do one in-person hang this month.',
    ],
    action_items: [
      { member: 'ben', what: 'share the offer details so we can help him think', by: 'this week' },
      { member: 'you', what: 'put 3 Japan date options on the wall', by: 'by Wed' },
      { member: 'george', what: 'send the coffee spot list', by: 'whenever' },
    ],
    keeper_quote: 'We keep waiting for the version of ourselves that has it figured out. Maybe this is it.',
  },
];

// --- Life prediction market. ---------------------------------------------
// status: open | resolved ; vote: 'agree' | 'disagree'
export const predictions = [
  {
    id: 'pred1',
    author: 'you',
    about: 'ben',
    claim: 'Ben finally books the Japan trip before fall.',
    resolve_by: '2026-09-01',
    status: 'open',
    outcome: null,
    votes: [
      { member: 'you', vote: 'agree', points: 50 },
      { member: 'george', vote: 'disagree', points: 50 },
    ],
  },
];

// Running leaderboard of best predictors (play points).
export const leaderboard = [
  { member: 'george', points: 1240 },
  { member: 'you', points: 980 },
  { member: 'ben', points: 610 },
];

// --- Goals with lightweight weekly check-ins. ----------------------------
// progress is 0..100 for the little bars.
export const goals = [
  { id: 'g1', member: 'you', goal: 'run 3×/wk', period: 'weekly', progress: 55, checkins: ['2026-07-05', '2026-07-12'] },
  { id: 'g2', member: 'ben', goal: 'finish the book', period: 'ongoing', progress: 28, checkins: ['2026-07-12'] },
  { id: 'g3', member: 'george', goal: 'call mom weekly', period: 'weekly', progress: 72, checkins: ['2026-06-28', '2026-07-05', '2026-07-12'] },
];

// --- Shared bucket list. -------------------------------------------------
// status: someday | in-progress | done
export const bucketList = [
  { id: 'b1', item: 'Road trip, no maps', added_by: 'you', status: 'someday', done_by: null, done_note: null },
  { id: 'b2', item: 'Learn to surf', added_by: 'ben', status: 'in-progress', done_by: null, done_note: null },
  { id: 'b3', item: 'Camp under the stars', added_by: 'george', status: 'done', done_by: 'george', done_note: 'done · Jun' },
];

// --- Shared media links / shelf. -----------------------------------------
// type: song | playlist | movie | book | article. Title + link + note only.
export const mediaLinks = [
  { id: 'ml1', type: 'playlist', title: 'House playlist', url: 'https://open.spotify.com/', note: '+4 songs', added_by: 'you', week: '2026-W28' },
  { id: 'ml2', type: 'movie', title: 'Perfect Days', url: null, note: 'Ben rec', added_by: 'ben', week: '2026-W28' },
  { id: 'ml3', type: 'book', title: 'Four Thousand Weeks', url: null, note: 'You rec', added_by: 'you', week: '2026-W28' },
  { id: 'ml4', type: 'article', title: '"The case for a slower internet"', url: null, note: 'George rec', added_by: 'george', week: '2026-W28' },
];
