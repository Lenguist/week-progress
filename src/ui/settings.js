import { getSankeyConfig, getGameConfig, getHoursConfig, saveSankeyConfig, saveGameConfig, saveHoursConfig, applyConfigToState } from '../core/config.js';
import { state } from '../core/state.js';

export function initSettingsUI(){
  // Placeholder: future UI form elements can bind here
  // For now, clicking the panel backdrop closes it; Apply button could be added later
  const panel = document.getElementById('settingsPanel');
  if (!panel) return;
  // Example: when settings open, you could populate fields from config
  // const s = getSankeyConfig(); const g = getGameConfig(); const h = getHoursConfig();
}

export function applyAndRedraw(){
  applyConfigToState(state);
  const evt = new CustomEvent('app:config-applied');
  window.dispatchEvent(evt);
}


