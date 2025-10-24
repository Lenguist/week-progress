// State management for the simulation
export const state = {
  totalHours: 168,
  week: 0,
  decayPerWeek: 2,
  projectGoal: 100,
  progress: 0,
  score: 0,
  colors: {
    Total: "#0d6efd",
    Asleep: "#6610f2",
    Awake: "#0dcaf0",
    Maintenance: "#d63384",
    Eating: "#fd7e14",
    Commute: "#ffc107",
    Hygiene: "#20c997",
    "Active Rest": "#198754",
    Exercise: "#0d6efd",
    Hobby: "#6f42c1",
    Work: "#6c757d",
    Classes: "#e83e8c",
    "Class Lectures": "#fd7e14",
    "Class HW": "#ffc107",
    "Non-Class Work": "#0dcaf0",
    Productive: "#198754",
    Unproductive: "#dc3545",
    Unallocated: "#adb5bd"
  },
  inputs: {
    sleepPerNight: 8,
    maintenance: { eating: 10, commute: 7, hygiene: 7 },
    activeRest: { exercise: 5, hobby: 10 },
    classes: { count: 4, lecture: 3, hw: 5 },
    nonClass: { productive: 8, unproductive: 4 }
  }
};

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

export function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }


