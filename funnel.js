// Simple horizontal flow diagram or D3 sankey if available
import { state } from './state.js';
import { renderSankey } from './sankey.js';

const $ = (sel) => document.querySelector(sel);

export function drawFunnel(b) {
  const svg = $("#funnel");
  svg.innerHTML = ""; // clear
  
  const W = 1000, H = 650;
  try {
    // Use D3 sankey if available
    renderSankey('#funnel', b);
  } catch (e) {
    // Fallback simple flow
    createSimpleFlow(b, W, H);
  }
  
  // Legend
  updateLegend();
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

