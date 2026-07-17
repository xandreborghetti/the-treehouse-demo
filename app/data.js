// data.js — THE SEAM.
//
// This is the ONLY file that changes when The Treehouse moves from the local
// in-memory mock store to a real Supabase backend. The UI (app.js) never
// touches the store directly — it only calls the async functions exported
// here. Keep every function async and returning plain data so the swap to
// `await supabase.from(...)` is mechanical.
//
// To wire Supabase later:
//   1. Copy config.example.js -> config.js and fill in your project keys.
//   2. Load the supabase-js client (add it locally; no CDN if you want offline).
//      import { createClient } from './vendor/supabase.js'
//      import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js'
//      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
//   3. Replace each function body below with the query in its `// SUPABASE:`
//      comment. Delete mock-data.js when done.

import * as db from './mock-data.js';

// Tiny helpers so mutations feel real locally.
const clone = (v) => JSON.parse(JSON.stringify(v));
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const nowISO = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

// SUPABASE: replace with supabase.from('members').select('*')
export async function getMembers() {
  return clone(db.members);
}

// ---------------------------------------------------------------------------
// Wall: posts, reactions, comments
// ---------------------------------------------------------------------------

// SUPABASE: replace with supabase.from('posts').select('*, reactions(*), comments(*)').order('created_at', { ascending: false })
export async function getPosts() {
  return clone(db.posts).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// SUPABASE: replace with supabase.from('posts').insert(post).select().single()
export async function addPost({ type = 'thought', author, body, url = null, title = null, note = null, image_path = null }) {
  const post = {
    id: uid('p'),
    type,
    author,
    body,
    url,
    title,
    note,
    image_path,
    created_at: nowISO(),
    pinned: false,
    reactions: [],
    comments: [],
  };
  db.posts.unshift(post);
  return clone(post);
}

// SUPABASE: replace with supabase.from('reactions').insert({ post_id, member, emoji })
// (with a unique (post_id, member, emoji) constraint so a repeat toggles/removes)
export async function addReaction({ post_id, member, emoji }) {
  const post = db.posts.find((p) => p.id === post_id);
  if (!post) return null;
  const existing = post.reactions.findIndex((r) => r.member === member && r.emoji === emoji);
  if (existing >= 0) post.reactions.splice(existing, 1); // toggle off
  else post.reactions.push({ member, emoji });
  return clone(post);
}

// SUPABASE: replace with supabase.from('comments').insert({ post_id, member, text })
export async function addComment({ post_id, member, text }) {
  const post = db.posts.find((p) => p.id === post_id);
  if (!post) return null;
  post.comments.push({ member, text, created_at: nowISO() });
  return clone(post);
}

// ---------------------------------------------------------------------------
// Poem of the week
// ---------------------------------------------------------------------------

// SUPABASE: replace with supabase.from('poem_weeks').select('*').order('week', { ascending: false }).limit(1).single()
export async function getPoemOfWeek() {
  const sorted = clone(db.poemWeeks).sort((a, b) => (a.week < b.week ? 1 : -1));
  return sorted[0] || null;
}

// ---------------------------------------------------------------------------
// Meeting archive
// ---------------------------------------------------------------------------

// SUPABASE: replace with supabase.from('meetings').select('*').order('date', { ascending: false })
export async function getMeetings() {
  return clone(db.meetings).sort((a, b) => (a.date < b.date ? 1 : -1));
}

// SUPABASE: replace with supabase.from('meetings').select('*').eq('id', id).single()
export async function getMeeting(id) {
  return clone(db.meetings.find((m) => m.id === id) || null);
}

// ---------------------------------------------------------------------------
// Life prediction market
// ---------------------------------------------------------------------------

// SUPABASE: replace with supabase.from('predictions').select('*, votes(*)').order('resolve_by')
export async function getPredictions() {
  return clone(db.predictions);
}

// SUPABASE: replace with supabase.from('predictions').insert(prediction).select().single()
export async function addPrediction({ author, about, claim, resolve_by }) {
  const prediction = {
    id: uid('pred'),
    author,
    about,
    claim,
    resolve_by,
    status: 'open',
    outcome: null,
    votes: [],
  };
  db.predictions.push(prediction);
  return clone(prediction);
}

// SUPABASE: replace with supabase.from('prediction_votes').upsert({ prediction_id, member, vote, points })
export async function votePrediction({ prediction_id, member, vote, points = 50 }) {
  const p = db.predictions.find((x) => x.id === prediction_id);
  if (!p) return null;
  const existing = p.votes.find((v) => v.member === member);
  if (existing) {
    existing.vote = vote;
    existing.points = points;
  } else {
    p.votes.push({ member, vote, points });
  }
  return clone(p);
}

// SUPABASE: replace with supabase.from('leaderboard').select('*').order('points', { ascending: false })
export async function getLeaderboard() {
  return clone(db.leaderboard).sort((a, b) => b.points - a.points);
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

// SUPABASE: replace with supabase.from('goals').select('*')
export async function getGoals() {
  return clone(db.goals);
}

// SUPABASE: replace with supabase.from('goals').insert(goal).select().single()
export async function addGoal({ member, goal, period = 'weekly' }) {
  const g = { id: uid('g'), member, goal, period, progress: 0, checkins: [] };
  db.goals.push(g);
  return clone(g);
}

// SUPABASE: replace with supabase.from('goal_checkins').insert({ goal_id, date }) and bump progress
export async function checkinGoal({ goal_id }) {
  const g = db.goals.find((x) => x.id === goal_id);
  if (!g) return null;
  g.checkins.push(nowISO().slice(0, 10));
  g.progress = Math.min(100, g.progress + 15);
  return clone(g);
}

// ---------------------------------------------------------------------------
// Bucket list
// ---------------------------------------------------------------------------

// SUPABASE: replace with supabase.from('bucket_list').select('*')
export async function getBucketList() {
  return clone(db.bucketList);
}

// SUPABASE: replace with supabase.from('bucket_list').insert(item).select().single()
export async function addBucketItem({ item, added_by }) {
  const b = { id: uid('b'), item, added_by, status: 'someday', done_by: null, done_note: null };
  db.bucketList.push(b);
  return clone(b);
}

// SUPABASE: replace with supabase.from('bucket_list').update({ status: 'done', done_by, done_note }).eq('id', id)
export async function markBucketDone({ id, done_by, done_note = 'done' }) {
  const b = db.bucketList.find((x) => x.id === id);
  if (!b) return null;
  b.status = 'done';
  b.done_by = done_by;
  b.done_note = done_note;
  return clone(b);
}

// ---------------------------------------------------------------------------
// Shared media / shelf
// ---------------------------------------------------------------------------

// SUPABASE: replace with supabase.from('media_links').select('*').order('week', { ascending: false })
export async function getMediaLinks() {
  return clone(db.mediaLinks);
}

// SUPABASE: replace with supabase.from('media_links').insert(link).select().single()
export async function addMediaLink({ type = 'article', title, url = null, note = null, added_by }) {
  const ml = { id: uid('ml'), type, title, url, note, added_by, week: currentWeek() };
  db.mediaLinks.push(ml);
  return clone(ml);
}

// ---------------------------------------------------------------------------
// Utility (local only — Supabase would compute week server-side if needed)
// ---------------------------------------------------------------------------
function currentWeek() {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}
