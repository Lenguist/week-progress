// Progress bar and stats display module (moved into src/core)
import { state, clamp } from './state.js';

const $ = (sel) => document.querySelector(sel);

export function updateProgress(b) {
  const pph = $("#pph"); if (pph) pph.textContent = b.pph.toFixed(2);
  const th = $("#th"); if (th) th.textContent = state.totalHours;
  const unalloc = Math.max(0, b.unallocatedAwake);
  const un = $("#unalloc"); if (un) un.textContent = unalloc.toFixed(2);
  const pct = clamp((state.progress / state.projectGoal) * 100, 0, 100);
  const bar = $("#progressBar"); if (bar) bar.style.width = pct + "%";
  const pt = $("#progressText"); if (pt) pt.textContent = `${state.progress.toFixed(1)} / ${state.projectGoal} h`;
  const wt = $("#weeksText"); if (wt) wt.textContent = `Week ${state.week}`;
  const sc = $("#score"); if (sc) sc.textContent = state.score;
  const scoreEl = document.getElementById('hudScore');
  if (scoreEl) scoreEl.textContent = String(state.score);

  // vertical progress UI
  const vFill = document.getElementById('vProgressFill');
  const vLabel = document.getElementById('vProgressLabel');
  const vCount = document.getElementById('vProgressCount');
  if (vFill && vLabel) {
    vFill.style.height = pct + '%';
    vLabel.textContent = Math.round(pct) + '%';
    if (vCount) vCount.textContent = `${state.progress.toFixed(1)} / ${state.projectGoal} h`;
  }
}

export function showDice(d1, d2, sum) {
  const box = $("#diceBox"); if (box) box.style.display = "flex";
  const d1El = $("#die1"); if (d1El) d1El.textContent = d1;
  const d2El = $("#die2"); if (d2El) d2El.textContent = d2;
  const rr = $("#rollResult"); if (rr) rr.textContent = `Sum = ${sum}`;
  // Also show outcome banner
  const outcome = sum >= 10 ? { cls: 'good', msg: 'Excellent project! +50 score' }
                 : sum >= 7 ? { cls: 'warn', msg: 'Decent project! +10 score' }
                 : { cls: 'bad', msg: 'Flopped project. +0 score' };
  const banner = document.getElementById('outcomeBanner');
  const backdrop = document.getElementById('outcomeBackdrop');
  const text = document.getElementById('outcomeText');
  const close = document.getElementById('outcomeClose');
  if (banner && text) {
    banner.className = `outcome-banner ${outcome.cls}`;
    text.textContent = outcome.msg;
    banner.style.display = 'flex'; if (backdrop) backdrop.style.display = 'block';
    const hide = ()=>{ banner.style.display = 'none'; if (backdrop) backdrop.style.display = 'none'; };
    if (close) close.onclick = hide;
    setTimeout(hide, 2500);
  }
}

export function hideDice() { const box = $("#diceBox"); if (box) box.style.display = "none"; }

export function log(msg, kind="") {
  const el = document.createElement("p");
  if (kind === "good") el.style.color = "var(--good)";
  if (kind === "warn") el.style.color = "var(--ok)";
  if (kind === "bad") el.style.color = "var(--danger)";
  el.textContent = msg;
  const logEl = $("#log"); if (logEl) logEl.prepend(el);
}

export * from '../../progress.js';

