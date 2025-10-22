// Simulation runner module
import { state, computeBreakdown } from './state.js';
import { drawFunnel } from './funnel.js';
import { updateProgress, showDice, hideDice, log } from './progress.js';

const $ = (sel) => document.querySelector(sel);

function rollDie() {
  return Math.floor(Math.random()*6) + 1;
}

function maybeCompleteProjects() {
  let completions = 0;
  while (state.progress >= state.projectGoal) {
    state.progress -= state.projectGoal;
    completions++;
    // Roll 2 dice
    const d1 = rollDie(), d2 = rollDie(), sum = d1 + d2;
    showDice(d1, d2, sum);
    if (sum >= 10) { state.score += 50; log(`Excellent project (sum ${sum}). +50 score.`, "good"); }
    else if (sum >= 7) { state.score += 10; log(`Decent project (sum ${sum}). +10 score.`, "warn"); }
    else { log(`Flopped project (sum ${sum}). +0 score.`, "bad"); }
  }
  if (completions === 0) hideDice();
}

export function nextWeek() {
  const b = computeBreakdown();
  const gain = b.pph;
  state.week += 1;
  state.progress += gain;
  state.progress = Math.max(0, state.progress - state.decayPerWeek);
  maybeCompleteProjects();
  updateProgress(b);
  drawFunnel(b);
  log(`Week ${state.week}: +${gain.toFixed(2)}h, −${state.decayPerWeek}h decay → progress ${state.progress.toFixed(1)}h.`);
}

export function resetAll() {
  state.week = 0;
  state.progress = 0;
  state.score = 0;
  $("#log").innerHTML = "";
  hideDice();
  const b = computeBreakdown();
  updateProgress(b);
  drawFunnel(b);
  log("Simulation reset.");
}

