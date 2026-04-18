/* ── Duit Coach — Main JS ──────────────────────── */

/* ── App State ─────────────────────────────────── */
const state = {
  currentPage: 'landing',
  profile: {
    name: 'Aina',
    budget: 500,
    daysLeft: 12,
    goalName: 'Langkawi Trip',
    goalAmount: 600,
    sideIncome: 'Tuition RM 60-80 × 3/mo',
    spent: 0,
    saved: 240,
  },
  mode: 'jimat', // 'jimat' | 'pakai'
  decisions: [],
  chatHistory: [],
  monthlyStats: {
    totalSaved: 240,
    decisionsFollowed: 8,
    decisionsTotal: 11,
    bestDecision: 'Skipped Grab ×4',
    bestSaved: 60,
    worstLeak: 'Bubble tea RM 72 (12×)',
    pattern: 'You overspend on Friday evenings after 9pm. 3 of 4 ignored decisions were on Fridays.',
    experiment: 'Set a RM 15 cap on Friday night spending and track the difference next month.',
  }
};

/* ── AI Response Simulation ─────────────────────── */
const aiResponses = {
  airpods: {
    keywords: ['airpod', 'earphone', 'earbuds', 'headphone'],
    verdict: 'wait',
    response: (mode) => mode === 'jimat'
      ? `⏳ **Wait until Saturday.**\n\nYou have RM ${state.profile.budget - state.profile.spent} left for ${state.profile.daysLeft} days. After Saturday's tuition gig, you'll have ~RM ${state.profile.budget - state.profile.spent + 80}.\n\n**Impact:** Buying now = instant noodle week for 12 days. Delays your ${state.profile.goalName} savings by **3 weeks**.\n\n*Try: Shopee watchlist it. If it's still RM 450 next month after your goal, then boleh.*`
      : `⏳ **Consider waiting a few days.**\n\nYou've had a solid month — RM ${state.profile.saved} saved already. But RM 450 right now cuts your buffer thin.\n\n**Smarter move:** Check Lazada — similar quality at RM 280–320. Save RM 130+ toward ${state.profile.goalName} AC room upgrade. 😌`,
  },
  grab: {
    keywords: ['grab', 'ride', 'gojek', 'taxi', 'bas', 'bus'],
    verdict: 'wait',
    response: (mode) => mode === 'jimat'
      ? `🚌 **Skip the Grab today.**\n\nRM 25 ride = 4 days of lunch. Rapid KL + feeder bus from campus costs RM 2.10 and gets you there.\n\n**Impact:** Choosing Grab daily this week = RM 125. That's **21% of your remaining budget** on transport.\n\n*If it's raining or past 10pm, then okay — but plan ahead next time.*`
      : `👍 **Boleh, but just this once.**\n\nYou've been good this week. A RM 25 ride is fine — just don't let it become a habit. Track it.\n\n*Tip: Share the ride if your classmate is going the same way. Splits the cost to RM 12-13.*`,
  },
  food: {
    keywords: ['makan', 'lunch', 'dinner', 'food', 'mcd', 'mcdonalds', 'pizza', 'nasi', 'burger'],
    verdict: 'yes',
    response: (mode) => `✅ **Yes, go eat.**\n\nSkipping meals to save money is not a strategy — it's a health risk that hurts your study performance too.\n\n**Budget check:** If it's under RM 10–12, you're within your RM ${(state.profile.budget - state.profile.spent / state.profile.daysLeft).toFixed(0)}/day budget.\n\n${mode === 'jimat' ? '*Mamak near campus is ~RM 6–8. Canteen is RM 4–6. Both better than skipping.*' : '*Treat yourself reasonably. You deserve fuel. 😊*'}`,
  },
  bubbletea: {
    keywords: ['boba', 'bubble tea', 'teh', 'kopi', 'coffee', 'starbucks', 'chatime', 'gong cha', 'tealive'],
    verdict: 'wait',
    response: (mode) => mode === 'jimat'
      ? `☕ **Hmm. Check yourself.**\n\nYou've spent RM ${Math.floor(Math.random() * 30 + 30)} on drinks this week already. This month's bubble tea tab is tracking toward RM 70+.\n\n**Impact:** That RM 9 adds to a pattern. RM 72/month on drinks = **14% of your whole budget.**\n\n*Mixue near your 2pm lecture is RM 6. Saves RM 3, tastes fine.*`
      : `🧋 **Go for it.**\n\nYou're in Pakai mode and you've earned it. RM 9 is reasonable.\n\n*Just notice the pattern — you're on track for RM 70+ on drinks this month. Fine for now, watch it next month.*`,
  },
  shopee: {
    keywords: ['shopee', 'lazada', 'tiktok shop', 'online', 'beli online', 'order'],
    verdict: 'wait',
    response: (mode) => mode === 'jimat'
      ? `🛍️ **Wait and sleep on it.**\n\nImpulse Shopee buys are the #1 silent budget killer for students. The item will still be there tomorrow.\n\n**The 24-hour rule:** If you still want it tomorrow, check if it fits your remaining RM ${state.profile.budget - state.profile.spent} budget *after* accounting for the next ${state.profile.daysLeft} days of meals.\n\n*Watchlist it. Don't cart it tonight.*`
      : `🛍️ **Check the price first.**\n\nWhat's the item? Give me the amount and I'll tell you if it makes sense right now. Screenshot the cart and ask me again with the total. 📸`,
  },
  hoodie: {
    keywords: ['baju', 'hoodie', 'shirt', 'clothes', 'kasut', 'shoes', 'pakaian', 'dress'],
    verdict: 'wait',
    response: (mode) => mode === 'jimat'
      ? `👕 **Not this week.**\n\nRM ${120} hoodie = 8 days of food money. Your basics are covered — this is a want, not a need.\n\n**Alternative:** Mr DIY has solid hoodies at RM 35–55. Same warmth, saves RM 65+ toward ${state.profile.goalName}.\n\n*If you still want the branded one after your next tuition payment, revisit then.*`
      : `👕 **Check the price vs your buffer.**\n\nYou've got some room this month. If it's under RM 80, I'd say boleh. Above that, worth comparing with MR DIY or Shopee's local brands first — you can get quality at RM 55–70.\n\n*Style smart, not expensive. 😎*`,
  },
  generic: {
    keywords: [],
    verdict: 'wait',
    response: (input, mode) => {
      const budget = state.profile.budget - state.profile.spent;
      const daily = (budget / state.profile.daysLeft).toFixed(2);
      return `🤔 **Let me think about this...**\n\nYou have **RM ${budget}** left for **${state.profile.daysLeft} days** — that's RM ${daily}/day.\n\n${mode === 'jimat'
        ? `In Jimat mode, I'd say be cautious. Ask yourself:\n• Is this a need or a want?\n• Can you wait until after your next tuition payment?\n• Will this delay your ${state.profile.goalName} savings?`
        : `You're in Pakai mode, so enjoy — but still be aware of your daily budget. Make sure this fits within RM ${daily}/day.`}\n\n*Tell me the specific item + amount for a sharper verdict! 💬*`;
    }
  }
};

function getAIResponse(input) {
  const lower = input.toLowerCase();
  for (const [key, data] of Object.entries(aiResponses)) {
    if (key === 'generic') continue;
    if (data.keywords.some(kw => lower.includes(kw))) {
      const text = typeof data.response === 'function'
        ? data.response(state.mode)
        : data.response;
      return { verdict: data.verdict, text };
    }
  }
  // Generic fallback
  return {
    verdict: 'wait',
    text: aiResponses.generic.response(input, state.mode)
  };
}

/* ── Navigation ─────────────────────────────────── */
function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const page = document.getElementById('page-' + pageId);
  if (page) {
    page.classList.add('active');
    window.scrollTo(0, 0);
  }

  const navLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (navLink) navLink.classList.add('active');

  state.currentPage = pageId;

  // Lifecycle hooks
  if (pageId === 'dashboard') refreshDashboard();
  if (pageId === 'report') refreshReport();
}

/* ── Toast ──────────────────────────────────────── */
function showToast(msg, emoji = '✅') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>${emoji}</span> ${msg}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ── Format Helpers ─────────────────────────────── */
function fmtRM(n) { return 'RM ' + Number(n).toLocaleString('en-MY', { minimumFractionDigits: 0 }); }
function fmtPct(n) { return Math.round(n) + '%'; }

/* ── Markdown-lite renderer ─────────────────────── */
function renderMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    .replace(/• /g, '<br>• ');
}

/* ── Dashboard ──────────────────────────────────── */
function refreshDashboard() {
  const remaining = state.profile.budget - state.profile.spent;
  const goalPct = Math.min(100, (state.profile.saved / state.profile.goalAmount) * 100);
  const dailyBudget = (remaining / state.profile.daysLeft).toFixed(2);

  setEl('dash-name', `Hi, ${state.profile.name} 👋`);
  setEl('dash-remaining', fmtRM(remaining));
  setEl('dash-days', state.profile.daysLeft + ' days left');
  setEl('dash-saved', fmtRM(state.profile.saved));
  setEl('dash-goal-name', state.profile.goalName);
  setEl('dash-goal-pct', fmtPct(goalPct));
  setEl('dash-daily', 'RM ' + dailyBudget + ' / day');
  setEl('dash-goal-target', fmtRM(state.profile.goalAmount));

  const fill = document.getElementById('dash-goal-fill');
  if (fill) fill.style.width = goalPct + '%';

  // Mode toggle state
  document.querySelectorAll('.toggle-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === state.mode);
  });

  // Recent decisions
  renderDecisions();
}

function renderDecisions() {
  const container = document.getElementById('dash-decisions');
  if (!container) return;
  if (state.decisions.length === 0) {
    container.innerHTML = `<p style="color:var(--sand-dark);font-size:13px;text-align:center;padding:16px 0;">No decisions yet. Ask your first "Boleh ke?" above! 💬</p>`;
    return;
  }
  container.innerHTML = state.decisions.slice(-5).reverse().map(d => `
    <div class="decision-item fade-in">
      <div class="decision-top">
        <span class="pill ${d.verdict === 'yes' ? 'pill-green' : d.verdict === 'wait' ? 'pill-gold' : 'pill-red'}">
          ${d.verdict === 'yes' ? '✓ Yes' : d.verdict === 'wait' ? '⏳ Wait' : '✗ No'}
        </span>
        <span class="decision-time">${d.time}</span>
      </div>
      <p class="decision-q">${d.question}</p>
      <div class="decision-action">
        <span class="pill ${d.followed ? 'pill-green' : 'pill-sand'}">${d.followed ? '✓ Followed advice' : '— Ignored advice'}</span>
        ${d.followed && d.saved ? `<span style="font-size:12px;color:var(--green);font-weight:500">+ Saved ${fmtRM(d.saved)}</span>` : ''}
      </div>
    </div>
  `).join('');
}

/* ── Chat / Boleh ke ────────────────────────────── */
function initChat() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  if (!input || !sendBtn) return;

  function send() {
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    addUserBubble(q);
    showTyping();
    setTimeout(() => {
      removeTyping();
      const { verdict, text } = getAIResponse(q);
      addAIBubble(text, verdict, q);
    }, 1400 + Math.random() * 600);
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
}

function addUserBubble(text) {
  const area = document.getElementById('chat-area');
  if (!area) return;
  const div = document.createElement('div');
  div.className = 'bubble-wrap user fade-in';
  div.innerHTML = `
    <div class="bubble user">${text}</div>
    <div class="bubble-avatar" style="background:var(--gold-pale);font-size:13px;font-weight:600;color:var(--gold);">
      ${state.profile.name[0]}
    </div>`;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
  // Hide placeholder
  const ph = document.getElementById('chat-placeholder');
  if (ph) ph.style.display = 'none';
}

function addAIBubble(text, verdict, question) {
  const area = document.getElementById('chat-area');
  if (!area) return;
  const verdictHtml = verdict ? `
    <div class="verdict-box ${verdict === 'yes' ? 'verdict-yes' : verdict === 'wait' ? 'verdict-wait' : 'verdict-no'}">
      <span class="verdict-icon">${verdict === 'yes' ? '✅' : verdict === 'wait' ? '⏳' : '❌'}</span>
      <span>${verdict === 'yes' ? 'Yes, boleh!' : verdict === 'wait' ? 'Wait dulu' : 'Skip this one'}</span>
    </div>` : '';

  const div = document.createElement('div');
  div.className = 'bubble-wrap fade-in';
  div.innerHTML = `
    <div class="bubble-avatar ai-av">🪙</div>
    <div class="bubble ai">
      ${verdictHtml}
      <div class="bubble-text">${renderMd(text)}</div>
      <div class="action-btns">
        <button class="btn btn-success btn-sm" onclick="followAdvice('${verdict}', '${question.replace(/'/g,"\\'")}')">✓ Follow advice</button>
        <button class="btn btn-ghost btn-sm" onclick="ignoreAdvice('${question.replace(/'/g,"\\'")}')">Ignore</button>
      </div>
    </div>`;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}

function showTyping() {
  const area = document.getElementById('chat-area');
  if (!area) return;
  const div = document.createElement('div');
  div.id = 'typing-indicator';
  div.className = 'bubble-wrap';
  div.innerHTML = `
    <div class="bubble-avatar ai-av">🪙</div>
    <div class="bubble ai" style="padding:14px 18px;">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>`;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function followAdvice(verdict, question) {
  const saved = verdict === 'wait' || verdict === 'no' ? Math.floor(Math.random() * 60 + 30) : 0;
  state.profile.saved += saved;
  state.decisions.push({
    question, verdict,
    followed: true, saved,
    time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
  });
  state.monthlyStats.decisionsFollowed = Math.min(state.decisions.filter(d=>d.followed).length + 8, 99);
  state.monthlyStats.totalSaved += saved;
  showToast(`Smart choice! ${saved > 0 ? 'You saved ' + fmtRM(saved) + ' 🎉' : 'Good decision noted ✓'}`, '🌟');
  // Remove action buttons from this bubble
  event?.target?.closest('.action-btns')?.remove();
}

function ignoreAdvice(question) {
  const spent = Math.floor(Math.random() * 80 + 20);
  state.profile.spent += spent;
  state.decisions.push({
    question, verdict: 'ignored',
    followed: false, saved: 0,
    time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
  });
  showToast('Noted. Recorded in your monthly report.', '📝');
  event?.target?.closest('.action-btns')?.remove();
}

/* ── Profile Setup ──────────────────────────────── */
function initProfileForm() {
  const form = document.getElementById('profile-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    state.profile.name = document.getElementById('p-name').value || 'Aina';
    state.profile.budget = parseFloat(document.getElementById('p-budget').value) || 500;
    state.profile.daysLeft = parseInt(document.getElementById('p-days').value) || 12;
    state.profile.goalName = document.getElementById('p-goal-name').value || 'Langkawi Trip';
    state.profile.goalAmount = parseFloat(document.getElementById('p-goal-amount').value) || 600;
    state.profile.sideIncome = document.getElementById('p-income').value || '';
    showToast(`Profile saved! Let's coach you, ${state.profile.name}! 🚀`, '🎉');
    setTimeout(() => navigateTo('dashboard'), 800);
  });
}

/* ── Mode Toggle ────────────────────────────────── */
function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.toggle-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  const label = document.getElementById('mode-label');
  if (label) {
    label.textContent = mode === 'jimat'
      ? '💰 Jimat Mode — I\'ll be strict with you'
      : '🎉 Pakai Mode — Let\'s enjoy, smartly';
  }
  showToast(mode === 'jimat' ? 'Jimat mode on. Let\'s save! 💪' : 'Pakai mode. Enjoy, tapi kena aware! 🎉', mode === 'jimat' ? '💰' : '🎉');
}

/* ── Monthly Report ─────────────────────────────── */
function refreshReport() {
  const s = state.monthlyStats;
  const followed = state.decisions.filter(d => d.followed).length + 8;
  const total = state.decisions.length + 11;
  const savedTotal = state.profile.saved;
  const goalPct = Math.min(100, (savedTotal / state.profile.goalAmount) * 100);

  setEl('rep-saved', fmtRM(savedTotal));
  setEl('rep-followed', followed + '/' + total);
  setEl('rep-goal-pct', fmtPct(goalPct));
  setEl('rep-follow-pct', Math.round((followed / total) * 100) + '%');

  const fill = document.getElementById('rep-goal-fill');
  if (fill) fill.style.width = goalPct + '%';
}

/* ── Utility ────────────────────────────────────── */
function setEl(id, content) {
  const el = document.getElementById(id);
  if (el) el.textContent = content;
}

/* ── Init ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Nav links
  document.querySelectorAll('.nav-link[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // Mode toggles
  document.querySelectorAll('.toggle-opt[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  // Init pages
  initChat();
  initProfileForm();

  // Start on landing
  navigateTo('landing');
});
