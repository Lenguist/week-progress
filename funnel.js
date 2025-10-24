// Simple horizontal flow diagram or D3 sankey if available
import { renderSankey } from './sankey.js';
import { renderCollapsibleSankeyBars } from './src/sankey/collapsible_render.js';
import { applyConfigToState } from './src/core/config.js';
import { state } from './src/core/state.js';

const $ = (sel) => document.querySelector(sel);

export function drawFunnel(b) {
  const svg = $("#funnel");
  svg.innerHTML = ""; // clear
  
  const W = 1000, H = 650;
  // Ensure state reflects saved configs (goal/decay/hours) before render
  applyConfigToState(state);
  // Render collapsible vertical prototype with constant height bars and width=hours
  renderCollapsibleSankeyBars('#funnel');
  
  // Legend
  updateLegend();
}

// Minimal from-scratch Sankey for: Total(100) → Busy(80) + Free(20) → Productive(10) + Unproductive(10)
function renderMiniSankey(svgSel){
  const svg = document.querySelector(svgSel);
  const W = 1000, H = 650, pad = 80;

  // Define the tiny tree
  const total = { name: 'Total', hours: 100 };
  const busy = { name: 'Busy', hours: 80, parent: total };
  const free = { name: 'Free', hours: 20, parent: total };
  const prod = { name: 'Productive', hours: 10, parent: free };
  const unprod = { name: 'Unproductive', hours: 10, parent: free };
  total.children = [busy, free];
  free.children = [prod, unprod];

  // Layout columns
  const colX = [pad, pad + 280, pad + 560];
  const band = 16; // thickness per 10h
  const k = band / 10; // px per hour
  const laneGap = 40;

  // Compute vertical positions
  const midY = H / 2;

  // Helper to draw a node rectangle representing an aggregate
  function drawNode(x, yCenter, hours, color, label){
    const h = Math.max(8, hours * k);
    const y = yCenter - h/2;
    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x', x - 8);
    rect.setAttribute('y', y);
    rect.setAttribute('width', 16);
    rect.setAttribute('height', h);
    rect.setAttribute('rx', 8);
    rect.setAttribute('fill', color);
    rect.setAttribute('opacity','0.9');
    rect.setAttribute('stroke','#fff');
    rect.setAttribute('stroke-width','2');
    svg.appendChild(rect);

    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('x', x);
    text.setAttribute('y', y - 8);
    text.setAttribute('text-anchor','middle');
    text.setAttribute('fill','#212529');
    text.setAttribute('font-weight','700');
    text.textContent = `${label} (${hours}h)`;
    svg.appendChild(text);

    return { x, y, h };
  }

  // Helper to draw a cubic path as a flow from right edge of left node to left edge of right node
  function drawFlow(src, dst, hours, color){
    const thickness = Math.max(4, hours * k);
    const x1 = src.x + 8, y1 = src.y + src.h/2;
    const x2 = dst.x - 8, y2 = dst.y + dst.h/2;
    const mx = (x1 + x2) / 2;
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
    path.setAttribute('d', d);
    path.setAttribute('fill','none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', thickness);
    path.setAttribute('stroke-linecap','butt');
    path.setAttribute('stroke-opacity','0.6');
    svg.appendChild(path);

    const label = document.createElementNS('http://www.w3.org/2000/svg','text');
    label.setAttribute('x', mx);
    label.setAttribute('y', (y1 + y2) / 2);
    label.setAttribute('dy','.35em');
    label.setAttribute('text-anchor','middle');
    label.setAttribute('fill','#212529');
    label.setAttribute('font-size','11');
    label.setAttribute('font-weight','600');
    label.textContent = `${hours}h`;
    svg.appendChild(label);
  }

  // Draw columns of nodes
  const totalNode = drawNode(colX[0], midY, total.hours, state.colors.Total, 'Total');
  const busyNode  = drawNode(colX[1], midY - laneGap, busy.hours, state.colors.Work, 'Busy');
  const freeNode  = drawNode(colX[1], midY + laneGap, free.hours, state.colors['Active Rest'], 'Free');
  const prodNode  = drawNode(colX[2], midY + laneGap - 30, prod.hours, state.colors.Productive, 'Productive');
  const unNode    = drawNode(colX[2], midY + laneGap + 30, unprod.hours, state.colors.Unproductive, 'Unproductive');

  // Draw flows
  drawFlow(totalNode, busyNode, busy.hours, state.colors.Work);
  drawFlow(totalNode, freeNode, free.hours, state.colors['Active Rest']);
  drawFlow(freeNode, prodNode, prod.hours, state.colors.Productive);
  drawFlow(freeNode, unNode, unprod.hours, state.colors.Unproductive);
}
function createSimpleFlow(b, W, H) {
  const svg = $("#funnel");
  
  // Title
  const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
  title.setAttribute("x", 20);
  title.setAttribute("y", 30);
  title.setAttribute("fill", "#212529");
  title.setAttribute("font-size", "18");
  title.setAttribute("font-weight", "bold");
  title.textContent = "Weekly Time Allocation — 168 Hours";
  svg.appendChild(title);
  
  // Simple horizontal flow with 4 main stages
  const stageWidth = 180;
  const stageHeight = 50;
  const spacing = 20;
  const startX = 20;
  const centerY = 150;
  
  // Stage 1: Total
  const total = createStage(startX, centerY, stageWidth, stageHeight, state.colors.Total, `Total ${state.totalHours}h`);
  svg.appendChild(total);
  
  // Stage 2: Asleep vs Awake
  const asleepWidth = (b.sleep / state.totalHours) * stageWidth;
  const awakeWidth = (b.awake / state.totalHours) * stageWidth;
  const stage2X = startX + stageWidth + spacing;
  
  const asleep = createStage(stage2X, centerY, asleepWidth, stageHeight, state.colors.Asleep, `Asleep ${b.sleep}h`);
  const awake = createStage(stage2X + asleepWidth, centerY, awakeWidth, stageHeight, state.colors.Awake, `Awake ${b.awake}h`);
  svg.appendChild(asleep);
  svg.appendChild(awake);
  
  // Stage 3: Awake breakdown
  const stage3X = stage2X + stageWidth + spacing;
  const breakdownWidth = stageWidth;
  const maintenanceWidth = (b.maintenance.total / b.awake) * breakdownWidth;
  const activeRestWidth = (b.activeRest.total / b.awake) * breakdownWidth;
  const workWidth = (b.work.total / b.awake) * breakdownWidth;
  const unallocatedWidth = (b.unallocatedAwake / b.awake) * breakdownWidth;
  
  let currentX = stage3X;
  
  if (b.maintenance.total > 0) {
    const maintenance = createStage(currentX, centerY, maintenanceWidth, stageHeight, state.colors.Maintenance, `Maintenance ${b.maintenance.total}h`);
    svg.appendChild(maintenance);
    currentX += maintenanceWidth;
  }
  
  if (b.activeRest.total > 0) {
    const activeRest = createStage(currentX, centerY, activeRestWidth, stageHeight, state.colors["Active Rest"], `Active Rest ${b.activeRest.total}h`);
    svg.appendChild(activeRest);
    currentX += activeRestWidth;
  }
  
  if (b.work.total > 0) {
    const work = createStage(currentX, centerY, workWidth, stageHeight, state.colors.Work, `Work ${b.work.total}h`);
    svg.appendChild(work);
    currentX += workWidth;
  }
  
  if (b.unallocatedAwake > 0) {
    const unallocated = createStage(currentX, centerY, unallocatedWidth, stageHeight, state.colors.Unallocated, `Unallocated ${b.unallocatedAwake.toFixed(1)}h`);
    svg.appendChild(unallocated);
  }
  
  // Stage 4: Productive (the important one!)
  const stage4X = stage3X + stageWidth + spacing;
  if (b.pph > 0) {
    const productive = createStage(stage4X, centerY, stageWidth, stageHeight, state.colors.Productive, `Productive ${b.pph}h`);
    svg.appendChild(productive);
    
    // Arrow to progress bar
    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const arrowPath = `M ${stage4X + stageWidth + 10} ${centerY + stageHeight/2} L ${W - 100} ${centerY + stageHeight/2} L ${W - 100} ${H - 50}`;
    arrow.setAttribute("d", arrowPath);
    arrow.setAttribute("fill", "none");
    arrow.setAttribute("stroke", state.colors.Productive);
    arrow.setAttribute("stroke-width", "4");
    arrow.setAttribute("marker-end", "url(#arrowhead)");
    svg.appendChild(arrow);
    
    // Progress bar label
    const progressLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    progressLabel.setAttribute("x", W - 50);
    progressLabel.setAttribute("y", H - 20);
    progressLabel.setAttribute("text-anchor", "middle");
    progressLabel.setAttribute("fill", state.colors.Productive);
    progressLabel.setAttribute("font-size", "12");
    progressLabel.setAttribute("font-weight", "bold");
    progressLabel.textContent = "→ Progress Bar";
    svg.appendChild(progressLabel);
  }
  
  // Create arrow marker
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "7");
  marker.setAttribute("refX", "9");
  marker.setAttribute("refY", "3.5");
  marker.setAttribute("orient", "auto");
  
  const arrowPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  arrowPolygon.setAttribute("points", "0 0, 10 3.5, 0 7");
  arrowPolygon.setAttribute("fill", state.colors.Productive);
  marker.appendChild(arrowPolygon);
  defs.appendChild(marker);
  svg.appendChild(defs);
}

function createStage(x, y, width, height, color, label) {
  const svg = $("#funnel");
  
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", Math.max(width, 2));
  rect.setAttribute("height", height);
  rect.setAttribute("rx", 8);
  rect.setAttribute("ry", 8);
  rect.setAttribute("fill", color);
  rect.setAttribute("opacity", "0.9");
  rect.setAttribute("stroke", "#fff");
  rect.setAttribute("stroke-width", "2");
  svg.appendChild(rect);
  
  if (width > 30) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x + width / 2);
    text.setAttribute("y", y + height / 2 + 5);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#fff");
    text.setAttribute("font-size", "12");
    text.setAttribute("font-weight", "bold");
    text.textContent = label;
    svg.appendChild(text);
  }
  
  return rect;
}

// Clean up - remove old functions

// Remove the old breakdown functions - we don't need them anymore

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

