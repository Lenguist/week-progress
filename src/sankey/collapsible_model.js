import { state, computeBreakdown } from '../core/state.js';

/** @returns {import('./sankey_types.js').SankeyNode} */
export function createInitialTree() {
  // Full breakdown tree from computeBreakdown()
  const b = computeBreakdown();
  const total = { id: 'total', name: 'Total', hours: state.totalHours, expanded: true };

  // Level 1: Asleep vs Awake
  const asleep = { id: 'asleep', name: 'Asleep', hours: b.sleep, parent: total, expanded: false };
  const awake = { id: 'awake', name: 'Awake', hours: b.awake, parent: total, expanded: true };
  total.children = [asleep, awake];

  // Level 2 under Awake: Maintenance / Active Rest / Work / Unallocated
  const maintenance = { id: 'maintenance', name: 'Maintenance', hours: b.maintenance.total, parent: awake, expanded: false };
  const activeRest = { id: 'activeRest', name: 'Active Rest', hours: b.activeRest.total, parent: awake, expanded: false };
  const work = { id: 'work', name: 'Work', hours: b.work.total, parent: awake, expanded: true };
  const unalloc = { id: 'unallocated', name: 'Unallocated', hours: b.unallocatedAwake, parent: awake, expanded: false };
  awake.children = [maintenance, activeRest, work, unalloc];

  // Level 3: Maintenance breakdown
  const eating = { id: 'eating', name: 'Eating', hours: b.maintenance.eating, parent: maintenance, expanded: false };
  const commute = { id: 'commute', name: 'Commute', hours: b.maintenance.commute, parent: maintenance, expanded: false };
  const hygiene = { id: 'hygiene', name: 'Hygiene', hours: b.maintenance.hygiene, parent: maintenance, expanded: false };
  maintenance.children = [eating, commute, hygiene];

  // Level 3: Active Rest breakdown
  const exercise = { id: 'exercise', name: 'Exercise', hours: b.activeRest.exercise, parent: activeRest, expanded: false };
  const hobby = { id: 'hobby', name: 'Hobby', hours: b.activeRest.hobby, parent: activeRest, expanded: false };
  activeRest.children = [exercise, hobby];

  // Level 3: Work breakdown
  const classes = { id: 'classes', name: 'Classes', hours: b.work.classes.total, parent: work, expanded: false };
  const nonClass = { id: 'nonClass', name: 'Non-Class Work', hours: b.work.nonClass.total, parent: work, expanded: true };
  work.children = [classes, nonClass];

  // Level 4: Classes → Lectures & HW
  const classLect = { id: 'classLectures', name: 'Class Lectures', hours: b.work.classes.classLectures, parent: classes, expanded: false };
  const classHW = { id: 'classHW', name: 'Class HW', hours: b.work.classes.classHW, parent: classes, expanded: false };
  classes.children = [classLect, classHW];

  // Level 4: Non-Class → Productive & Unproductive
  const prod = { id: 'productive', name: 'Productive', hours: b.work.nonClass.productive, parent: nonClass, expanded: false };
  const unprod = { id: 'unproductive', name: 'Unproductive', hours: b.work.nonClass.unproductive, parent: nonClass, expanded: false };
  nonClass.children = [prod, unprod];

  return total;
}

export function getColorByName(name){
  return state.colors[name] || '#888';
}

