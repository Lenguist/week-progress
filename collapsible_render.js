// Rendering for collapsible vertical sankey where HOURS control WIDTH, height is constant
import { createInitialTree, getColorByName } from './collapsible_model.js';

const BAR_HEIGHT = 44;      // constant pixel height for each node bar
const LEVEL_GAP  = 28;      // vertical gap between levels (rows)
const LEFT_PAD   = 80;      // left padding for root
const TOP_PAD    = 60;      // top padding for first row
const BASE_WIDTH = 700;     // maximum width allotted to the root; children subdivide this width

/**
 * Compute layout for visible nodes. Width scales with hours.
 * @param {import('./sankey_types').SankeyNode} root
 * @param {{width:number,height:number}} viewport
 * @returns {import('./sankey_types').LayoutNode[]}
 */
function computeLayout(root, viewport){
  /** @type {import('./sankey_types').LayoutNode[]} */
  const nodes = [];
  /** flow rectangles connecting levels */
  const flows = [];

  function place(node, depth, xStart, width){
    const y = TOP_PAD + depth * (BAR_HEIGHT + LEVEL_GAP);
    const w = Math.max(20, width);
    nodes.push({ node, depth, x: xStart, y, w, h: BAR_HEIGHT });

    if (!node.expanded || !node.children || node.children.length === 0) return;
    const sum = node.children.reduce((a,c)=>a+c.hours,0) || 1;
    let cursorX = xStart;
    node.children.forEach(child => {
      const childW = (child.hours / sum) * w;
      // record flow area from parent bottom to child top for this width slice
      flows.push({ x: cursorX, y0: y + BAR_HEIGHT, y1: TOP_PAD + (depth+1)*(BAR_HEIGHT+LEVEL_GAP), w: childW, color: getColorByName(child.name) });
      place(child, depth+1, cursorX, childW);
      cursorX += childW;
    });
  }

  place(root, 0, LEFT_PAD, BASE_WIDTH);
  return { nodes, flows };
}

function drawFlowRect(svg, f){
  const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
  r.setAttribute('x', f.x);
  r.setAttribute('y', f.y0);
  r.setAttribute('width', Math.max(1, f.w));
  r.setAttribute('height', Math.max(2, f.y1 - f.y0));
  r.setAttribute('fill', f.color);
  r.setAttribute('opacity','0.18');
  svg.appendChild(r);
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


