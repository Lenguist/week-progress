// Hours configuration interface module
import { state, computeBreakdown } from './state.js';
import { drawFunnel } from './funnel.js';
import { updateProgress } from './progress.js';

const $ = (sel) => document.querySelector(sel);

export function bindInputs() {
  const map = [
    ["#sleepPerNight", v => state.inputs.sleepPerNight = +v],
    ["#eat", v => state.inputs.maintenance.eating = +v],
    ["#commute", v => state.inputs.maintenance.commute = +v],
    ["#hygiene", v => state.inputs.maintenance.hygiene = +v],
    ["#exercise", v => state.inputs.activeRest.exercise = +v],
    ["#hobby", v => state.inputs.activeRest.hobby = +v],
    ["#classCount", v => state.inputs.classes.count = +v],
    ["#classLecture", v => state.inputs.classes.lecture = +v],
    ["#classHW", v => state.inputs.classes.hw = +v],
    ["#ncProd", v => state.inputs.nonClass.productive = +v],
    ["#ncUnprod", v => state.inputs.nonClass.unproductive = +v],
  ];
  
  map.forEach(([sel, fn]) => {
    const el = $(sel);
    el.addEventListener("input", () => {
      fn(el.value);
      const b = computeBreakdown();
      updateProgress(b);
      drawFunnel(b);
    });
  });
}

