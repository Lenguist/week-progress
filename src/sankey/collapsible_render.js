// Rewritten entry to source params from config
import { createInitialTree, getColorByName } from './collapsible_model.js';
import { getRendererParams } from './renderer_params.js';

let _root;

function computeLayout(root){
  const p = getRendererParams();
  const nodes = [], flows = [];
  function place(node, depth, xStart, width){
    const y = p.TOP_PAD + depth * (p.BAR_HEIGHT + p.LEVEL_GAP);
    const w = Math.max(20, width);
    nodes.push({ node, depth, x: xStart, y, w, h: p.BAR_HEIGHT });
    if (!node.expanded || !node.children || node.children.length === 0) return;
    const sum = node.children.reduce((a,c)=>a+c.hours,0) || 1;
    const extra = w * p.BRANCH_DEGREE;
    const n = node.children.length;
    const gap = (n > 1) ? (extra / (n - 1)) : 0;
    let cursorX = xStart; let accumShare = 0;
    node.children.forEach(child => {
      const share = child.hours / sum;
      const childW = share * w;
      const topX = xStart + accumShare * w;
      const botX = cursorX;
      const yTop = y + p.BAR_HEIGHT;
      const yBot = p.TOP_PAD + (depth+1)*(p.BAR_HEIGHT+p.LEVEL_GAP);
      flows.push({ x0: topX, w0: childW, y0: yTop, x1: botX, w1: childW, y1: yBot, color: getColorByName(child.name) });
      place(child, depth+1, cursorX, childW);
      cursorX += childW + gap; accumShare += share;
    });
  }
  place(root, 0, p.LEFT_PAD, p.BASE_WIDTH);
  return { nodes, flows };
}

function drawFlow(svg, f){
  const p = getRendererParams();
  const w0 = Math.max(1, f.w0); const w1 = Math.max(1, f.w1);
  const inset0 = Math.min(w0/2 - 1, p.FLOW_SHRINK_PX);
  const inset1 = Math.min(w1/2 - 1, p.FLOW_SHRINK_PX);
  const x0L = f.x0 + inset0, x0R = f.x0 + w0 - inset0;
  const x1L = f.x1 + inset1, x1R = f.x1 + w1 - inset1;
  const y0 = f.y0, y1 = f.y1;
  const cy = (y1 - y0) * 0.45;
  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  const d = `M ${x0L} ${y0} C ${x0L} ${y0+cy}, ${x1L} ${y1-cy}, ${x1L} ${y1} L ${x1R} ${y1} C ${x1R} ${y1-cy}, ${x0R} ${y0+cy}, ${x0R} ${y0} Z`;
  path.setAttribute('d', d); path.setAttribute('fill', f.color); path.setAttribute('opacity','0.22');
  svg.appendChild(path);
}

function drawBar(svg, n){
  const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
  rect.setAttribute('x', n.x); rect.setAttribute('y', n.y);
  rect.setAttribute('width', n.w); rect.setAttribute('height', n.h);
  rect.setAttribute('rx', 8);
  rect.setAttribute('fill', getColorByName(n.node.name));
  rect.setAttribute('opacity','0.9'); rect.setAttribute('stroke','#fff'); rect.setAttribute('stroke-width','2');
  svg.appendChild(rect);
  const label = document.createElementNS('http://www.w3.org/2000/svg','text');
  label.setAttribute('x', n.x + 8); label.setAttribute('y', n.y + n.h/2 + 4);
  label.setAttribute('fill','#212529'); label.setAttribute('font-weight','700'); label.setAttribute('font-size','12'); label.setAttribute('text-anchor','start');
  label.textContent = `${n.node.name}: ${n.node.hours}h`; svg.appendChild(label);
  if (n.node.children && n.node.children.length){
    const tri = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    const size = 8; const xc = n.x + n.w - 14, yb = n.y + n.h - 6;
    const pts = n.node.expanded ? `${xc-size},${yb-size} ${xc+size},${yb-size} ${xc},${yb}` : `${xc-size},${yb} ${xc+size},${yb} ${xc},${yb-size}`;
    tri.setAttribute('points', pts); tri.setAttribute('fill','#6c757d'); tri.style.cursor='pointer';
    tri.addEventListener('click', ()=>{ n.node.expanded = !n.node.expanded; redraw(svg); }); svg.appendChild(tri);
  }
}

function redraw(svg){
  if (!_root) _root = createInitialTree();
  svg.innerHTML = '';
  const { nodes, flows } = computeLayout(_root);
  flows.forEach(f => drawFlow(svg, f));
  nodes.forEach(n => drawBar(svg, n));
}

export function renderCollapsibleSankeyBars(sel){
  const svg = document.querySelector(sel);
  redraw(svg);
}


