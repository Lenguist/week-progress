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

  // Settings modal toggle
  const root = document.documentElement; // use body class toggles
  document.body.classList.add('settings-hidden');
  const settingsPanel = document.getElementById('settingsPanel');
  const toggleBtn = document.getElementById('toggleSettings');
  const backdrop = document.getElementById('backdrop');
  function toggleSettings() {
    const isHidden = document.body.classList.contains('settings-hidden');
    document.body.classList.toggle('settings-hidden', !isHidden);
    document.body.classList.toggle('settings-visible', isHidden);
  }
  toggleBtn.addEventListener('click', toggleSettings);
  backdrop.addEventListener('click', toggleSettings);

  // Keyboard shortcut
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") nextWeek();
  });

  log("Ready. Edit hours in the panel to see your time allocation flow!");

  // HUD score sync
  const scoreEl = document.getElementById('hudScore');
  if (scoreEl) scoreEl.textContent = String(0);
}

init();

