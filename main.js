// Main entry point - coordinates all modules
import { computeBreakdown } from './state.js';
import { drawFunnel } from './funnel.js';
import { bindInputs } from './hours-config.js';
import { updateProgress, log } from './progress.js';
import { nextWeek, resetAll } from './simulation.js';

const $ = (sel) => document.querySelector(sel);

function init() {
  // Bind input handlers
  bindInputs();
  
  // Initial render
  const b = computeBreakdown();
  updateProgress(b);
  drawFunnel(b);

  // Bind control buttons
  $("#nextWeek").addEventListener("click", nextWeek);
  $("#reset").addEventListener("click", resetAll);

  // Keyboard shortcut
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") nextWeek();
  });

  log("Ready. Press Enter or 'Next Week' to advance.");
}

init();

