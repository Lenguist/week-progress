const S_KEY = 'wp_sankey';
const G_KEY = 'wp_game';
const H_KEY = 'wp_hours';

export const defaultSankey = {
  BAR_HEIGHT: 44,
  LEVEL_GAP: 28,
  LEFT_PAD: 80,
  TOP_PAD: 60,
  BASE_WIDTH: 700,
  BRANCH_DEGREE: 0.10,
  FLOW_SHRINK_PX: 5,
};

export const defaultGame = {
  projectGoal: 100,
  decayPerWeek: 2,
  rewardDecent: 10,
  rewardExcellent: 50,
};

export const defaultHours = {
  sleepPerNight: 8,
  maintenance: { eating: 10, commute: 7, hygiene: 7 },
  activeRest: { exercise: 5, hobby: 10 },
  classes: { count: 4, lecture: 3, hw: 5 },
  nonClass: { productive: 8, unproductive: 4 },
};

function load(key, fallback){
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch { return fallback; }
}

export function getSankeyConfig(){ return load(S_KEY, defaultSankey); }
export function getGameConfig(){ return load(G_KEY, defaultGame); }
export function getHoursConfig(){
  const h = load(H_KEY, defaultHours);
  // deep merge minimal
  return {
    ...defaultHours,
    ...h,
    maintenance: { ...defaultHours.maintenance, ...(h.maintenance||{}) },
    activeRest: { ...defaultHours.activeRest, ...(h.activeRest||{}) },
    classes: { ...defaultHours.classes, ...(h.classes||{}) },
    nonClass: { ...defaultHours.nonClass, ...(h.nonClass||{}) },
  };
}

export function saveSankeyConfig(cfg){ localStorage.setItem(S_KEY, JSON.stringify(cfg)); }
export function saveGameConfig(cfg){ localStorage.setItem(G_KEY, JSON.stringify(cfg)); }
export function saveHoursConfig(cfg){ localStorage.setItem(H_KEY, JSON.stringify(cfg)); }

export function applyConfigToState(state){
  const g = getGameConfig();
  state.projectGoal = g.projectGoal;
  state.decayPerWeek = g.decayPerWeek;
  const h = getHoursConfig();
  state.inputs = JSON.parse(JSON.stringify(h));
}


