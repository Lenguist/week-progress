// State management for the simulation
export const state = {
  totalHours: 168,
  week: 0,
  decayPerWeek: 2,
  projectGoal: 1000,
  progress: 0,
  score: 0,
  colors: {
    Total: "#4fb3ff",
    Asleep: "#306b99",
    Awake: "#2e86ab",
    Maintenance: "#7a5af8",
    Eating: "#9a7bff",
    Commute: "#8b7bff",
    Hygiene: "#7b7bff",
    "Active Rest": "#00c2a8",
    Exercise: "#19e1c0",
    Hobby: "#21d0a9",
    Work: "#ffc857",
    Classes: "#ff9f1c",
    "Class Lectures": "#ffbf69",
    "Class HW": "#ffd08a",
    "Non-Class Work": "#ef476f",
    Productive: "#06d6a0",
    Unproductive: "#ff6b6b",
    Unallocated: "#2a3a50"
  },
  inputs: {
    sleepPerNight: 8,
    maintenance: { eating: 10, commute: 7, hygiene: 7 },
    activeRest: { exercise: 5, hobby: 10 },
    classes: { count: 4, lecture: 3, hw: 5 },
    nonClass: { productive: 8, unproductive: 4 }
  }
};

// Compute breakdown of hours
export function computeBreakdown() {
  const t = state.totalHours;
  const sleep = state.inputs.sleepPerNight * 7;

  const awake = t - sleep;

  const m = state.inputs.maintenance;
  const maintenance = m.eating + m.commute + m.hygiene;

  const a = state.inputs.activeRest;
  const activeRest = a.exercise + a.hobby;

  const c = state.inputs.classes;
  const classes = c.count * (c.lecture + c.hw);
  const classLectures = c.count * c.lecture;
  const classHW = c.count * c.hw;

  const nc = state.inputs.nonClass;
  const nonClass = nc.productive + nc.unproductive;

  const accountedAwake = maintenance + activeRest + (classes + nonClass);
  const unallocatedAwake = Math.max(0, awake - accountedAwake);

  // Productive project hours per week = Non-Class Productive
  const pph = nc.productive;

  return {
    sleep,
    awake,
    maintenance: { total: maintenance, ...m },
    activeRest: { total: activeRest, ...a },
    work: {
      total: classes + nonClass,
      classes: { total: classes, classLectures, classHW, count: c.count },
      nonClass: { total: nonClass, productive: nc.productive, unproductive: nc.unproductive }
    },
    unallocatedAwake,
    pph
  };
}

// Utility function
export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

