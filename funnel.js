// Funnel visualization module
import { state } from './state.js';

const $ = (sel) => document.querySelector(sel);

export function drawFunnel(b) {
  const svg = $("#funnel");
  svg.innerHTML = ""; // clear
  const W = 1000, H = 650, padX = 140, padY = 20, bandH = 70, gap = 12;
  const scale = (hours) => (hours / state.totalHours) * (W - padX*2);

  // gridlines (every 20h)
  const grid = document.createElementNS("http://www.w3.org/2000/svg","g");
  for (let h=0; h<=state.totalHours; h+=20) {
    const x = padX + scale(h);
    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", x); line.setAttribute("y1", padY);
    line.setAttribute("x2", x); line.setAttribute("y2", H - padY);
    line.setAttribute("class","gridline");
    grid.appendChild(line);

    const t = document.createElementNS("http://www.w3.org/2000/svg","text");
    t.setAttribute("x", x); t.setAttribute("y", padY - 6);
    t.setAttribute("text-anchor","middle");
    t.setAttribute("class","hours");
    t.textContent = h + "h";
    grid.appendChild(t);
  }
  svg.appendChild(grid);

  let y = padY + 20;

  function rect(x,y,w,h, fill){ const r = document.createElementNS("http://www.w3.org/2000/svg","rect");
    r.setAttribute("x",x); r.setAttribute("y",y); r.setAttribute("width",Math.max(0,w)); r.setAttribute("height",h);
    r.setAttribute("fill",fill); r.setAttribute("rx", 8); r.setAttribute("ry", 8);
    r.setAttribute("opacity","0.95"); return r;
  }
  function label(x,y, txt, cls="label", anchor="end") {
    const t = document.createElementNS("http://www.w3.org/2000/svg","text");
    t.setAttribute("x", x); t.setAttribute("y", y); t.setAttribute("text-anchor", anchor);
    t.setAttribute("class", cls); t.textContent = txt; return t;
  }

  const laneX = padX, laneW = W - padX*2;

  // Level 0: Total
  const totalW = scale(state.totalHours);
  svg.appendChild(rect(laneX, y, laneW, bandH, state.colors.Total));
  svg.appendChild(label(laneX - 12, y + bandH/2, `Total (${state.totalHours}h)`, "label"));
  y += bandH + gap;

  // Level 1: Asleep vs Awake
  const asleepW = scale(b.sleep);
  const awakeW = scale(b.awake);
  svg.appendChild(rect(laneX, y, asleepW, bandH, state.colors.Asleep));
  svg.appendChild(rect(laneX + asleepW + 6, y, awakeW - 6, bandH, state.colors.Awake));
  svg.appendChild(label(laneX - 12, y + bandH/2, `Asleep (${b.sleep}h)`, "label"));
  svg.appendChild(label(laneX + asleepW + awakeW + 6 + 8, y + bandH/2, `Awake (${b.awake}h)`, "label","start"));
  const awakeY = y; // remember Y to branch under it
  y += bandH + gap;

  // Level 2 under Awake: Maintenance / Active Rest / Work / Unallocated
  const mW = scale(b.maintenance.total);
  const aW = scale(b.activeRest.total);
  const wW = scale(b.work.total);
  const uW = scale(b.unallocatedAwake);
  const underX = laneX + scale(b.sleep) + 6; // align under Awake start

  let xCursor = underX;
  svg.appendChild(rect(xCursor, y, mW, bandH, state.colors.Maintenance));
  svg.appendChild(label(xCursor - 8, y + bandH/2, `Maintenance (${b.maintenance.total}h)`, "label"));
  xCursor += mW + 6;
  svg.appendChild(rect(xCursor, y, aW, bandH, state.colors["Active Rest"]));
  svg.appendChild(label(xCursor - 8, y + bandH/2, `Active Rest (${b.activeRest.total}h)`, "label"));
  xCursor += aW + 6;
  svg.appendChild(rect(xCursor, y, wW, bandH, state.colors.Work));
  svg.appendChild(label(xCursor - 8, y + bandH/2, `Work (${b.work.total}h)`, "label"));
  xCursor += wW + 6;
  if (uW > 0) {
    svg.appendChild(rect(xCursor, y, uW, bandH, state.colors.Unallocated));
    svg.appendChild(label(xCursor - 8, y + bandH/2, `Unallocated (${b.unallocatedAwake.toFixed(1)}h)`, "label"));
  }
  const level2Y = y;
  y += bandH + gap;

  // Level 3: Maintenance breakdown
  let xM = underX;
  svg.appendChild(rect(xM, y, scale(b.maintenance.eating), bandH, state.colors.Eating));
  svg.appendChild(label(xM - 8, y + bandH/2, `Eating (${b.maintenance.eating}h)`));
  xM += scale(b.maintenance.eating) + 6;
  svg.appendChild(rect(xM, y, scale(b.maintenance.commute), bandH, state.colors.Commute));
  svg.appendChild(label(xM - 8, y + bandH/2, `Commute (${b.maintenance.commute}h)`));
  xM += scale(b.maintenance.commute) + 6;
  svg.appendChild(rect(xM, y, scale(b.maintenance.hygiene), bandH, state.colors.Hygiene));
  svg.appendChild(label(xM - 8, y + bandH/2, `Hygiene (${b.maintenance.hygiene}h)`));

  // Level 3: Active Rest breakdown
  let xA = underX + mW + 6;
  svg.appendChild(rect(xA, y, scale(b.activeRest.exercise), bandH, state.colors.Exercise));
  svg.appendChild(label(xA - 8, y + bandH/2, `Exercise (${b.activeRest.exercise}h)`));
  xA += scale(b.activeRest.exercise) + 6;
  svg.appendChild(rect(xA, y, scale(b.activeRest.hobby), bandH, state.colors.Hobby));
  svg.appendChild(label(xA - 8, y + bandH/2, `Hobby (${b.activeRest.hobby}h)`));

  // Level 3: Work breakdown
  let xW = underX + mW + 6 + aW + 6;
  svg.appendChild(rect(xW, y, scale(b.work.classes.total), bandH, state.colors.Classes));
  svg.appendChild(label(xW - 8, y + bandH/2, `Classes (${b.work.classes.total}h)`));
  xW += scale(b.work.classes.total) + 6;
  svg.appendChild(rect(xW, y, scale(b.work.nonClass.total), bandH, state.colors["Non-Class Work"]));
  svg.appendChild(label(xW - 8, y + bandH/2, `Non-Class (${b.work.nonClass.total}h)`));
  const level3Y = y;
  y += bandH + gap;

  // Level 4: Classes → Lectures & HW
  let xC = underX + mW + 6 + aW + 6;
  svg.appendChild(rect(xC, y, scale(b.work.classes.classLectures), bandH, state.colors["Class Lectures"]));
  svg.appendChild(label(xC - 8, y + bandH/2, `Class Lectures (${b.work.classes.classLectures}h)`));
  xC += scale(b.work.classes.classLectures) + 6;
  svg.appendChild(rect(xC, y, scale(b.work.classes.classHW), bandH, state.colors["Class HW"]));
  svg.appendChild(label(xC - 8, y + bandH/2, `Class HW (${b.work.classes.classHW}h)`));

  // Level 4: Non-Class → Productive & Unproductive
  let xNC = underX + mW + 6 + aW + 6 + scale(b.work.classes.total) + 6;
  svg.appendChild(rect(xNC, y, scale(b.work.nonClass.productive), bandH, state.colors.Productive));
  svg.appendChild(label(xNC - 8, y + bandH/2, `Productive (${b.work.nonClass.productive}h)`));
  xNC += scale(b.work.nonClass.productive) + 6;
  svg.appendChild(rect(xNC, y, scale(b.work.nonClass.unproductive), bandH, state.colors.Unproductive));
  svg.appendChild(label(xNC - 8, y + bandH/2, `Unproductive (${b.work.nonClass.unproductive}h)`));

  // Legend
  updateLegend();
}

export function updateLegend() {
  const legendEl = $("#legend");
  legendEl.innerHTML = "";
  [
    ["Asleep","Asleep"],["Awake","Awake"],
    ["Maintenance","Maintenance"],["Eating","Eating"],["Commute","Commute"],["Hygiene","Hygiene"],
    ["Active Rest","Active Rest"],["Exercise","Exercise"],["Hobby","Hobby"],
    ["Work","Work"],["Classes","Classes"],["Class Lectures","Class Lectures"],["Class HW","Class HW"],
    ["Non-Class Work","Non-Class Work"],["Productive","Productive"],["Unproductive","Unproductive"],
    ["Unallocated","Unallocated"]
  ].forEach(([name,key])=>{
    const b = document.createElement("div"); b.className="badge";
    const d = document.createElement("span"); d.className="dot"; d.style.background = state.colors[key] || "#888";
    const t = document.createElement("span"); t.textContent = name;
    b.appendChild(d); b.appendChild(t); legendEl.appendChild(b);
  });
}

