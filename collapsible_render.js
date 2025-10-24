// Rendering for collapsible vertical sankey where HOURS control WIDTH, height is constant
import { createInitialTree, getColorByName } from './collapsible_model.js';

const BAR_HEIGHT     = 44;      // constant pixel height for each node bar
const LEVEL_GAP      = 28;      // vertical gap between levels (rows)
const LEFT_PAD       = 80;      // left padding for root
const TOP_PAD        = 60;      // top padding for first row
const BASE_WIDTH     = 700;     // maximum width allotted to the root; children subdivide this width
const BRANCH_DEGREE  = 0.10;    // 10% branching spread: adds horizontal breathing room for children rows
const FLOW_SHRINK_PX = 5;       // connectors are inset by ~5px on each side at both levels

/**
 * Compute layout for visible nodes. Width scales with hours.
 * @param {import('./sankey_types').SankeyNode} root
 * @param {{width:number,height:number}} viewport
 * @returns {import('./sankey_types').LayoutNode[]}
 */
function computeLayout(root, viewport){
  /** @type {import('./sankey_types').LayoutNode[]} */
  const nodes = [];
  /** flow ribbons connecting levels */
  const flows = [];

  function place(node, depth, xStart, width){
    const y = TOP_PAD + depth * (BAR_HEIGHT + LEVEL_GAP);
    const w = Math.max(20, width);
    nodes.push({ node, depth, x: xStart, y, w, h: BAR_HEIGHT });

    if (!node.expanded || !node.children || node.children.length === 0) return;
    const sum = node.children.reduce((a,c)=>a+c.hours,0) || 1;
    const extra = w * BRANCH_DEGREE;                 // total additional width to spread across row
    const n = node.children.length;
    const gap = (n > 1) ? (extra / (n - 1)) : 0;     // distribute ONLY between children (no outer margins)
    let cursorX = xStart;                             // left start aligns with parent left edge
    let accumShare = 0;                               // fraction of parent's width consumed by previous siblings (for top position)

    node.children.forEach((child, idx) => {
      const share = (child.hours / sum);
      const childW = share * w;                      // content width stays proportional to parent width
      // Top (inside parent): start based on share position within parent width
      const topX = xStart + accumShare * w;
      const topW = childW;
      // Bottom (children row): true content width with only BETWEEN gaps
      const botX = cursorX;
      const botW = childW;
      const yTop = y + BAR_HEIGHT;
      const yBot = TOP_PAD + (depth+1)*(BAR_HEIGHT+LEVEL_GAP);
      flows.push({ x0: topX, w0: topW, y0: yTop, x1: botX, w1: botW, y1: yBot, color: getColorByName(child.name) });
      place(child, depth+1, cursorX, childW);
      cursorX += childW + gap;                       // add gap between siblings (no outer margins)
      accumShare += share;
    });
  }

  place(root, 0, LEFT_PAD, BASE_WIDTH);
  return { nodes, flows };
}

function drawFlowRect(svg, f){
  // Smoothly widen from top (x0..x0+w0) to bottom (x1..x1+w1)
  const w0 = Math.max(1, f.w0);
  const w1 = Math.max(1, f.w1);
  const inset0 = Math.min(w0 / 2 - 1, FLOW_SHRINK_PX);
  const inset1 = Math.min(w1 / 2 - 1, FLOW_SHRINK_PX);
  const x0L = f.x0 + inset0, x0R = f.x0 + w0 - inset0;
  const x1L = f.x1 + inset1, x1R = f.x1 + w1 - inset1;
  const y0 = f.y0, y1 = f.y1;
  const cy = (y1 - y0) * 0.45; // vertical curvature
  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  const d = [
    `M ${x0L} ${y0}`,
    `C ${x0L} ${y0 + cy}, ${x1L} ${y1 - cy}, ${x1L} ${y1}`,
    `L ${x1R} ${y1}`,
    `C ${x1R} ${y1 - cy}, ${x0R} ${y0 + cy}, ${x0R} ${y0}`,
    'Z'
  ].join(' ');
  path.setAttribute('d', d);
  path.setAttribute('fill', f.color);
  path.setAttribute('opacity', '0.22');
  path.setAttribute('stroke', 'none');
  svg.appendChild(path);
}

function drawBar(svg, n){
  const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
  rect.setAttribute('x', n.x);
  rect.setAttribute('y', n.y);
  rect.setAttribute('width', n.w);
  rect.setAttribute('height', n.h);
  rect.setAttribute('rx', 8);
  rect.setAttribute('fill', getColorByName(n.node.name));
  rect.setAttribute('opacity','0.9');
  rect.setAttribute('stroke','#fff');
  rect.setAttribute('stroke-width','2');
  svg.appendChild(rect);

  const label = document.createElementNS('http://www.w3.org/2000/svg','text');
  label.setAttribute('x', n.x + 8);
  label.setAttribute('y', n.y + n.h/2 + 4);
  label.setAttribute('fill', '#212529');
  label.setAttribute('font-weight', '700');
  label.setAttribute('font-size', '12');
  label.setAttribute('text-anchor','start');
  label.textContent = `${n.node.name}: ${n.node.hours}h`;
  svg.appendChild(label);

  if (n.node.children && n.node.children.length){
    const tri = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    const size = 8;
    const xc = n.x + n.w - 14, yb = n.y + n.h - 6;
    const pts = n.node.expanded
      ? `${xc-size},${yb-size} ${xc+size},${yb-size} ${xc},${yb}`
      : `${xc-size},${yb} ${xc+size},${yb} ${xc},${yb-size}`;
    tri.setAttribute('points', pts);
    tri.setAttribute('fill', '#6c757d');
    tri.style.cursor = 'pointer';
    tri.addEventListener('click', ()=>{ n.node.expanded = !n.node.expanded; redraw(svg); });
    svg.appendChild(tri);
  }
}

let _root;
function redraw(svg){
  const W = 1000, H = 650;
  svg.innerHTML = '';
  if (!_root) _root = createInitialTree();
  const { nodes, flows } = computeLayout(_root, {width: W, height: H});
  flows.forEach(f => drawFlowRect(svg, f));
  nodes.forEach(n => drawBar(svg, n));
}

export function renderCollapsibleSankeyBars(svgSelector){
  const svg = document.querySelector(svgSelector);
  redraw(svg);
}


