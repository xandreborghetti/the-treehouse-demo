// app.js — The Treehouse UI. Renders each section from the data layer and wires
// interactions that write THROUGH data.js (never the store directly). Every
// mutation re-renders so the app feels live locally.

import * as data from './data.js';

// In a real app the signed-in member comes from Supabase auth. Locally we act
// as "You".
const ME = 'you';

const view = document.getElementById('view');
const whoEl = document.getElementById('who');
const nav = document.getElementById('nav');

let members = [];
let membersById = {};
let currentSection = 'wall';
let openMeetingId = null;

// --- helpers ---------------------------------------------------------------
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const nameOf = (id) => membersById[id]?.name ?? id;
const colorOf = (id) => membersById[id]?.color ?? 'coral';
const initialOf = (id) => membersById[id]?.initial ?? '?';

function avatar(memberId) {
  return `<span class="av ${colorOf(memberId)}">${esc(initialOf(memberId))}</span>`;
}

function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Group reactions by emoji -> [members]
function reactionSummary(reactions) {
  const map = new Map();
  for (const r of reactions) {
    if (!map.has(r.emoji)) map.set(r.emoji, []);
    map.get(r.emoji).push(r.member);
  }
  return map;
}

// ===========================================================================
// Boot
// ===========================================================================
async function boot() {
  members = await data.getMembers();
  membersById = Object.fromEntries(members.map((m) => [m.id, m]));

  whoEl.innerHTML = members.map((m) => avatar(m.id)).join('') + '<span class="pill" style="margin-left:.4rem">Sunday</span>';

  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
    currentSection = btn.dataset.section;
    openMeetingId = null;
    render();
  });

  setupTheme();
  render();
}

// ===========================================================================
// Router
// ===========================================================================
async function render() {
  switch (currentSection) {
    case 'wall': return renderWall();
    case 'meetings': return renderMeetings();
    case 'predictions': return renderPredictions();
    case 'goals': return renderGoals();
    case 'bucket': return renderBucket();
    case 'shelf': return renderShelf();
  }
}

// ===========================================================================
// Wall (poem of week + compose + feed)
// ===========================================================================
async function renderWall() {
  const [poem, posts] = await Promise.all([data.getPoemOfWeek(), data.getPosts()]);

  const poemHTML = poem
    ? `<div class="card poem">
        <div class="eyebrow">📖 Poem of the week <span class="pill">curated by ${esc(initialOf(poem.curator))}</span>
          <span class="pill">${esc(poem.copyright_tier)}</span></div>
        <div class="verse">${esc(poem.excerpt)}</div>
        <div class="attr">— ${esc(poem.author)}, <em>${esc(poem.title)}</em></div>
        <div class="react">
          <span class="chip on">❤️ ${poem.reactions.length}</span>
          ${poem.source_url ? `<a class="chip" href="${esc(poem.source_url)}" target="_blank" rel="noopener">↗ full poem</a>` : ''}
        </div>
      </div>`
    : '';

  view.innerHTML = `
    ${poemHTML}
    <div class="sec">🧱 The wall</div>
    <div id="feed" class="chat">${posts.map(postCard).join('')}</div>
    ${composeBar()}
  `;

  wireCompose();
  wireFeed();
}

// Chat-style input bar, pinned to the bottom of the Wall view.
function composeBar() {
  return `
    <form class="chatbar" id="composeForm">
      <select id="composeType" class="chatbar-type" aria-label="Post type">
        <option value="thought">💭 thought</option>
        <option value="quote">❝ quote</option>
        <option value="song">🎧 song</option>
        <option value="link">🔗 link</option>
        <option value="poem">📖 poem</option>
        <option value="image">🖼️ image</option>
      </select>
      <input id="composeBody" class="chatbar-input" placeholder="Message the treehouse…" aria-label="Message" />
      <button type="submit" class="chatbar-send" aria-label="Send">➤</button>
      <input id="composeUrl" class="chatbar-url" placeholder="add a link (optional)…" aria-label="Link" />
    </form>`;
}

function postCard(p) {
  const mine = p.author === ME;
  const reacts = reactionSummary(p.reactions);
  const wallEmojis = ['❤️', '🔥', '🥹', '😍'];
  const known = new Set(wallEmojis);
  for (const e of reacts.keys()) known.add(e);

  const chips = [...known]
    .map((emoji) => {
      const who = reacts.get(emoji) || [];
      const on = who.includes(ME) ? 'on' : '';
      const count = who.length ? ` ${who.length}` : '';
      return `<button class="chip ${on}" data-react="${esc(emoji)}">${emoji}${count}</button>`;
    })
    .join('');

  let media = '';
  if (p.type === 'quote') {
    media = `<div class="quote">${esc(p.body)}</div>${p.note ? `<div class="lead" style="margin-top:.4rem">${esc(p.note)}</div>` : ''}`;
  } else if (p.type === 'song') {
    media = `<div class="body">${esc(p.body)}</div>
      <div class="songrow"><span class="ic">🎧</span><div>
        ${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title || 'listen')}</a>` : `<div style="font-weight:600;font-size:.9rem">${esc(p.title || '')}</div>`}
        ${p.note ? `<div class="s">${esc(p.note)}</div>` : ''}
      </div></div>`;
  } else if (p.type === 'image') {
    media = `<div class="body">${esc(p.body)}</div><div class="imgph">${esc(p.image_path || '[ shared photo ]')}</div>`;
  } else if (p.type === 'link' && p.url) {
    media = `<div class="body">${esc(p.body)}</div><div class="songrow"><span class="ic">🔗</span><div><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.url)}</a></div></div>`;
  } else {
    media = `<div class="body">${esc(p.body)}</div>`;
  }

  const comments = p.comments.length
    ? `<div class="cmts">${p.comments
        .map((c) => `<div class="cmt-line"><b>${esc(nameOf(c.member))}</b> ${esc(c.text)}</div>`)
        .join('')}</div>`
    : '';

  return `
    <div class="msg ${mine ? 'mine' : 'theirs'}" data-post="${esc(p.id)}">
      ${mine ? '' : avatar(p.author)}
      <div class="msg-col">
        ${mine ? '' : `<div class="msg-name">${esc(nameOf(p.author))}</div>`}
        <div class="bubble">${media}</div>
        <div class="msg-meta"><span class="time">${timeAgo(p.created_at)}</span></div>
        <div class="react">${chips}<button class="chip" data-toggle-comment>💬</button></div>
        ${comments}
        <form class="cmt-form" data-comment-form hidden>
          <input placeholder="reply…" aria-label="Comment" />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>`;
}

function wireCompose() {
  const form = document.getElementById('composeForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = document.getElementById('composeBody').value.trim();
    const type = document.getElementById('composeType').value;
    const url = document.getElementById('composeUrl').value.trim() || null;
    if (!body && !url) return;
    await data.addPost({ type, author: ME, body: body || '', url, title: type === 'song' ? body : null });
    renderWall();
  });
}

function wireFeed() {
  const feed = document.getElementById('feed');
  feed.addEventListener('click', async (e) => {
    const postEl = e.target.closest('[data-post]');
    if (!postEl) return;
    const postId = postEl.dataset.post;

    const reactBtn = e.target.closest('[data-react]');
    if (reactBtn) {
      await data.addReaction({ post_id: postId, member: ME, emoji: reactBtn.dataset.react });
      renderWall();
      return;
    }
    if (e.target.closest('[data-toggle-comment]')) {
      const f = postEl.querySelector('[data-comment-form]');
      f.hidden = !f.hidden;
      if (!f.hidden) f.querySelector('input').focus();
    }
  });
  feed.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-comment-form]');
    if (!form) return;
    e.preventDefault();
    const postId = e.target.closest('[data-post]').dataset.post;
    const input = form.querySelector('input');
    const text = input.value.trim();
    if (!text) return;
    await data.addComment({ post_id: postId, member: ME, text });
    renderWall();
  });
}

// ===========================================================================
// Meetings
// ===========================================================================
async function renderMeetings() {
  if (openMeetingId) return renderMeetingDetail(openMeetingId);

  const meetings = await data.getMeetings();
  view.innerHTML = `
    <div class="sec">🎙️ Meeting archive</div>
    <p class="sec-lead">Every Sunday call, filed and searchable forever.</p>
    ${meetings
      .map(
        (m) => `
      <div class="card meeting" data-meeting="${esc(m.id)}" style="cursor:pointer">
        <div class="eyebrow">🎙️ ${esc(new Date(m.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))} <span class="pill">${esc(m.duration)}</span></div>
        <h3>The recap</h3>
        <div class="lead">${esc(m.recap.slice(0, 160))}${m.recap.length > 160 ? '…' : ''}</div>
        ${m.highs_lows
          .map(
            (hl) => `<div class="row"><span><b>High</b> · ${esc(nameOf(hl.member))}</span><span class="s">${esc(hl.high)}</span></div>`
          )
          .slice(0, 1)
          .join('')}
        <button class="btn" style="margin-top:.6rem">Open full entry →</button>
      </div>`
      )
      .join('')}
  `;
  view.querySelectorAll('[data-meeting]').forEach((el) =>
    el.addEventListener('click', () => {
      openMeetingId = el.dataset.meeting;
      renderMeetings();
    })
  );
}

async function renderMeetingDetail(id) {
  const m = await data.getMeeting(id);
  if (!m) { openMeetingId = null; return renderMeetings(); }
  view.innerHTML = `
    <button class="back-link" id="backMeetings">← all meetings</button>
    <div class="card meeting">
      <div class="eyebrow">🎙️ ${esc(new Date(m.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))} <span class="pill">${esc(m.duration)}</span></div>
      <h3>The recap</h3>
      <p class="body">${esc(m.recap)}</p>

      <div class="eyebrow" style="margin-top:.9rem">What we got into</div>
      <div class="tag-list">${m.topics.map((t) => `<span>${esc(t)}</span>`).join('')}</div>

      <div class="eyebrow" style="margin-top:.9rem">Highs &amp; lows</div>
      <div class="hl">
        ${m.highs_lows
          .map(
            (hl) => `<div><span class="who-hl">${esc(nameOf(hl.member))}</span> — <b>High:</b> ${esc(hl.high)} <b>Low:</b> ${esc(hl.low)}</div>`
          )
          .join('')}
      </div>

      <div class="eyebrow" style="margin-top:.9rem">Plans</div>
      ${m.plans.map((p) => `<div class="row"><span>${esc(p)}</span></div>`).join('')}

      <div class="eyebrow" style="margin-top:.9rem">Action items</div>
      ${m.action_items
        .map(
          (a) => `<div class="row"><span><b>${esc(nameOf(a.member))}</b> · ${esc(a.what)}</span><span class="s">${esc(a.by)}</span></div>`
        )
        .join('')}

      <div class="eyebrow" style="margin-top:.9rem">A line to remember</div>
      <div class="keeper">${esc(m.keeper_quote)}</div>
    </div>
  `;
  document.getElementById('backMeetings').addEventListener('click', () => {
    openMeetingId = null;
    renderMeetings();
  });
}

// ===========================================================================
// Predictions
// ===========================================================================
async function renderPredictions() {
  const [preds, board] = await Promise.all([data.getPredictions(), data.getLeaderboard()]);

  view.innerHTML = `
    <div class="sec">🔮 Life prediction market</div>
    <p class="sec-lead">Call your shots on each other. Resolve later. Points for being right.</p>

    ${preds.map(predCard).join('')}

    <div class="card">
      <div class="eyebrow">🏆 Leaderboard</div>
      ${board
        .map(
          (b, i) => `<div class="row"><span>${i === 0 ? '👑 ' : ''}${esc(nameOf(b.member))}</span><span class="s">${b.points.toLocaleString()} pts</span></div>`
        )
        .join('')}
    </div>

    <div class="card">
      <div class="eyebrow">➕ New prediction</div>
      <form id="predForm">
        <div class="field"><label>About</label>
          <select id="predAbout">${members.map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Claim</label>
          <input id="predClaim" placeholder="X finally does Y by…" />
        </div>
        <div class="field"><label>Resolve by</label>
          <input id="predBy" type="date" />
        </div>
        <button class="btn btn-primary" type="submit">Post prediction</button>
      </form>
    </div>
  `;

  view.querySelectorAll('[data-pred]').forEach((el) => {
    el.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-vote]');
      if (!btn) return;
      await data.votePrediction({ prediction_id: el.dataset.pred, member: ME, vote: btn.dataset.vote });
      renderPredictions();
    });
  });

  document.getElementById('predForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const claim = document.getElementById('predClaim').value.trim();
    if (!claim) return;
    await data.addPrediction({
      author: ME,
      about: document.getElementById('predAbout').value,
      claim,
      resolve_by: document.getElementById('predBy').value || null,
    });
    renderPredictions();
  });
}

function predCard(p) {
  const myVote = p.votes.find((v) => v.member === ME)?.vote;
  return `
    <div class="card mini" data-pred="${esc(p.id)}">
      <div class="eyebrow">🔮 Open bet <span class="pill">${p.resolve_by ? 'resolve by ' + esc(p.resolve_by) : 'no date'}</span></div>
      <h4>“${esc(p.claim)}”</h4>
      <div class="lead">posted by ${esc(nameOf(p.author))} · about ${esc(nameOf(p.about))}</div>
      <div class="react" style="margin-top:.6rem">
        <button class="chip ${myVote === 'agree' ? 'on' : ''}" data-vote="agree">👍 likely (${p.votes.filter((v) => v.vote === 'agree').length})</button>
        <button class="chip ${myVote === 'disagree' ? 'on' : ''}" data-vote="disagree">👎 no way (${p.votes.filter((v) => v.vote === 'disagree').length})</button>
      </div>
    </div>`;
}

// ===========================================================================
// Goals
// ===========================================================================
async function renderGoals() {
  const goals = await data.getGoals();
  const barColor = { you: 'var(--teal)', ben: 'var(--gold)', george: 'var(--coral)' };

  view.innerHTML = `
    <div class="sec">🎯 Goals</div>
    <p class="sec-lead">Current goals with gentle weekly check-ins — tied to the Sunday call.</p>
    <div class="card">
      ${goals
        .map(
          (g) => `
        <div class="row" data-goal="${esc(g.id)}">
          <span>${avatar(g.member)} ${esc(nameOf(g.member))} — ${esc(g.goal)}</span>
          <span style="display:flex;align-items:center;gap:.5rem">
            <span class="bars"><b style="width:${Math.round(g.progress * 0.8)}px;background:${barColor[g.member] || 'var(--teal)'}"></b></span>
            <button class="chip" data-checkin>✓ check in</button>
          </span>
        </div>`
        )
        .join('')}
    </div>

    <div class="card">
      <div class="eyebrow">➕ Add a goal</div>
      <form id="goalForm">
        <div class="field"><label>Whose</label>
          <select id="goalMember">${members.map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Goal</label><input id="goalText" placeholder="e.g. read 20 min a day" /></div>
        <button class="btn btn-primary" type="submit">Add goal</button>
      </form>
    </div>
  `;

  view.querySelector('.card').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-checkin]');
    if (!btn) return;
    const row = e.target.closest('[data-goal]');
    await data.checkinGoal({ goal_id: row.dataset.goal });
    renderGoals();
  });

  document.getElementById('goalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const goal = document.getElementById('goalText').value.trim();
    if (!goal) return;
    await data.addGoal({ member: document.getElementById('goalMember').value, goal });
    renderGoals();
  });
}

// ===========================================================================
// Bucket list
// ===========================================================================
async function renderBucket() {
  const items = await data.getBucketList();
  const statusLabel = { someday: 'someday', 'in-progress': 'in progress', done: 'done' };

  view.innerHTML = `
    <div class="sec">🪣 Bucket list</div>
    <p class="sec-lead">Things we say we'll do. A running record of the ones we actually did.</p>
    <div class="card">
      ${items
        .map(
          (b) => `
        <div class="row" data-bucket="${esc(b.id)}">
          <span>${b.status === 'done' ? '✓ ' : ''}${esc(b.item)} <span class="s">· ${esc(nameOf(b.added_by))}</span></span>
          <span style="display:flex;align-items:center;gap:.5rem">
            <span class="s">${esc(b.done_note || statusLabel[b.status] || b.status)}</span>
            ${b.status !== 'done' ? '<button class="chip" data-done>mark done</button>' : ''}
          </span>
        </div>`
        )
        .join('')}
    </div>

    <div class="card">
      <div class="eyebrow">➕ Add to the list</div>
      <form id="bucketForm">
        <div class="field"><label>Someday we…</label><input id="bucketText" placeholder="e.g. see the northern lights" /></div>
        <button class="btn btn-primary" type="submit">Add</button>
      </form>
    </div>
  `;

  view.querySelector('.card').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-done]');
    if (!btn) return;
    const row = e.target.closest('[data-bucket]');
    await data.markBucketDone({ id: row.dataset.bucket, done_by: ME, done_note: 'done · just now' });
    renderBucket();
  });

  document.getElementById('bucketForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const item = document.getElementById('bucketText').value.trim();
    if (!item) return;
    await data.addBucketItem({ item, added_by: ME });
    renderBucket();
  });
}

// ===========================================================================
// Shelf (media links)
// ===========================================================================
async function renderShelf() {
  const links = await data.getMediaLinks();
  const icon = { song: '🎵', playlist: '🎵', movie: '🎬', book: '📖', article: '📰' };

  view.innerHTML = `
    <div class="sec">🎵 Shared shelf</div>
    <p class="sec-lead">Songs, films, books, articles. Titles + links only — never full text.</p>
    <div class="card">
      <div class="eyebrow">this week's drops</div>
      ${links
        .map(
          (l) => `<div class="row">
            <span>${icon[l.type] || '🔗'} ${l.url ? `<a href="${esc(l.url)}" target="_blank" rel="noopener" style="color:var(--teal);text-decoration:none">${esc(l.title)}</a>` : `<em>${esc(l.title)}</em>`} <span class="s">(${esc(l.type)})</span></span>
            <span class="s">${esc(l.note || nameOf(l.added_by) + ' rec')}</span>
          </div>`
        )
        .join('')}
    </div>

    <div class="card">
      <div class="eyebrow">➕ Add a drop</div>
      <form id="shelfForm">
        <div class="field"><label>Type</label>
          <select id="shelfType">
            <option value="song">🎵 song</option>
            <option value="playlist">🎵 playlist</option>
            <option value="movie">🎬 movie</option>
            <option value="book">📖 book</option>
            <option value="article">📰 article</option>
          </select>
        </div>
        <div class="field"><label>Title</label><input id="shelfTitle" placeholder="title" /></div>
        <div class="field"><label>Link (optional)</label><input id="shelfUrl" placeholder="https://…" /></div>
        <div class="field"><label>One-line note</label><input id="shelfNote" placeholder="why it's good" /></div>
        <button class="btn btn-primary" type="submit">Add to shelf</button>
      </form>
    </div>
  `;

  document.getElementById('shelfForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('shelfTitle').value.trim();
    if (!title) return;
    await data.addMediaLink({
      type: document.getElementById('shelfType').value,
      title,
      url: document.getElementById('shelfUrl').value.trim() || null,
      note: document.getElementById('shelfNote').value.trim() || null,
      added_by: ME,
    });
    renderShelf();
  });
}

// ===========================================================================
// Theme toggle (overrides prefers-color-scheme via data-theme on <html>)
// ===========================================================================
function setupTheme() {
  const btn = document.getElementById('themeToggle');
  btn.addEventListener('click', () => {
    const root = document.documentElement;
    const current =
      root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  });
}

boot();
