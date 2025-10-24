import { state } from '../core/state.js';

/** @returns {import('./sankey_types.js').SankeyNode} */
export function createInitialTree() {
  const total = { id: 'total', name: 'Total', hours: 100, expanded: true };
  const busy = { id: 'busy', name: 'Busy', hours: 80, expanded: false, parent: total };
  const free = { id: 'free', name: 'Free', hours: 20, expanded: true, parent: total };
  const prod = { id: 'prod', name: 'Productive', hours: 10, expanded: false, parent: free };
  const unprod = { id: 'unprod', name: 'Unproductive', hours: 10, expanded: false, parent: free };
  total.children = [busy, free];
  free.children = [prod, unprod];
  return total;
}

export function getColorByName(name){
  return state.colors[name] || '#888';
}

