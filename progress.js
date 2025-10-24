// Progress bar and stats display module
import { state, clamp } from './state.js';

const $ = (sel) => document.querySelector(sel);

export function updateProgress(b) {
  $("#pph").textContent = b.pph.toFixed(2);
  $("#th").textContent = state.totalHours;
  const unalloc = Math.max(0, b.unallocatedAwake);
  $("#unalloc").textContent = unalloc.toFixed(2);
  const pct = clamp((state.progress / state.projectGoal) * 100, 0, 100);
  $("#progressBar").style.width = pct + "%";
  $("#progressText").textContent = `${state.progress.toFixed(1)} / ${state.projectGoal} h`;
  $("#weeksText").textContent = `Week ${state.week}`;
  $("#score").textContent = state.score;

  // vertical progress UI
  const vFill = document.getElementById('vProgressFill');
  const vLabel = document.getElementById('vProgressLabel');
  if (vFill && vLabel) {
    vFill.style.height = pct + '%';
    vLabel.textContent = Math.round(pct) + '%';
  }
}

export function showDice(d1, d2, sum) {
  $("#diceBox").style.display = "flex";
  $("#die1").textContent = d1;
  $("#die2").textContent = d2;
  $("#rollResult").textContent = `Sum = ${sum}`;
}

export function hideDice() {
  $("#diceBox").style.display = "none";
}

export function log(msg, kind="") {
  const el = document.createElement("p");
  if (kind === "good") el.style.color = "var(--good)";
  if (kind === "warn") el.style.color = "var(--ok)";
  if (kind === "bad") el.style.color = "var(--danger)";
  el.textContent = msg;
  $("#log").prepend(el);
}

