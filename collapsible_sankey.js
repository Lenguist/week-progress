// Simple vertical, collapsible "sankey-like" icicle diagram
// Root spans full height; expanding a node reveals its children as stacked bars in the next column

import { state } from './state.js';

const COLORS = {
  Total: state.colors.Total,
  Busy: state.colors.Work,
  Free: state.colors['Active Rest'],
  Productive: state.colors.Productive,
  Unproductive: state.colors.Unproductive,
};

// Build initial tree
function createInitialTree() {
  const total = { id: 'total', name: 'Total', hours: 100, expanded: false };
  const busy = { id: 'busy', name: 'Busy', hours: 80, expanded: false, parent: total };
  const free = { id: 'free', name: 'Free', hours: 20, expanded: false, parent: total };
  const prod = { id: 'prod', name: 'Productive', hours: 10, expanded: false, parent: free };
  const unprod = { id: 'unprod', name: 'Unproductive', hours: 10, expanded: false, parent: free };
  total.children = [busy, free];
  free.children = [prod, unprod];
  return total;
}

// Layout nodes; returns array of {node, x, y, w, h, depth}
function layoutTree(root, area) {
  const { x0, y0, width, height, colWidth, colGap, padY } = area;
  const nodes = [];

  function place(node, depth, yStart, ySize) {
    const x = x0 + depth * (colWidth + colGap);
    const w = colWidth;
    nodes.push({ node, depth, x, y: yStart, w, h: ySize });

    if (!node.expanded || !node.children || node.children.length === 0) return;
    const sum = node.children.reduce((a, c) => a + c.hours, 0) || 1;
    let cursor = yStart;
    node.children.forEach((child) => {
      const hChild = Math.max(8, (child.hours / sum) * ySize);
      place(child, depth + 1, cursor, hChild);
      cursor += hChild;
    });
  }

  place(root, 0, y0 + padY, height - padY * 2);
  return nodes;
}

// Draw straight connectors between node vertical centers
function drawConnectors(svg, nodes, colGap) {
  const byNode = new Map(nodes.map(n => [n.node.id, n]));
  nodes.forEach(n => {
    const node = n.node;
    if (!node.children || !node.expanded) return;
    node.children.forEach(child => {
      const src = byNode.get(node.id);
      const dst = byNode.get(child.id);
      if (!dst) return;
      const x1 = src.x + src.w;
      const y1 = src.y + src.h/2;
      const x2 = dst.x;
      const y2 = dst.y + dst.h/2;
      const mx = (x1 + x2) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
      path.setAttribute('d', d);
      path.setAttribute('fill','none');
      path.setAttribute('stroke', COLORS[child.name] || '#999');
      path.setAttribute('stroke-width', Math.max(3, Math.min(src.h, dst.h) - 6));
      path.setAttribute('stroke-opacity','0.25');
      path.setAttribute('stroke-linecap','butt');
      svg.appendChild(path);
    });
  });
}

function drawTriangleButton(svg, xCenter, yBottom, size, id) {
  const h = size;
  const points = [
    `${xCenter - h},${yBottom - h}`,
    `${xCenter + h},${yBottom - h}`,
    `${xCenter},${yBottom}`
  ].join(' ');
  const tri = document.createElementNS('http://www.w3.org/2000/svg','polygon');
  tri.setAttribute('points', points);
  tri.setAttribute('fill', '#6c757d');
  tri.setAttribute('data-node', id);
  tri.style.cursor = 'pointer';
  svg.appendChild(tri);
  return tri;
}

export function renderCollapsibleSankey(svgSelector) {
  const svg = document.querySelector(svgSelector);
  svg.innerHTML = '';

  const width = 1000, height = 650;
  const colWidth = 26, colGap = 80, padY = 20;
  const area = { x0: 80, y0: 0, width, height, colWidth, colGap, padY };

  // State: keep expanded flags across re-renders
  if (!renderCollapsibleSankey._root) renderCollapsibleSankey._root = createInitialTree();
  const root = renderCollapsibleSankey._root;

  function draw() {
    svg.innerHTML = '';
    // Title
    const title = document.createElementNS('http://www.w3.org/2000/svg','text');
    title.setAttribute('x', 20);
    title.setAttribute('y', 24);
    title.setAttribute('fill', '#212529');
    title.setAttribute('font-size', '14');
    title.setAttribute('font-weight', '700');
    title.textContent = 'Collapsible Flow';
    svg.appendChild(title);

    const nodes = layoutTree(root, area);

    // Connectors first
    drawConnectors(svg, nodes, colGap);

    // Draw nodes
    nodes.forEach(n => {
      const color = COLORS[n.node.name] || '#ccc';
      const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
      rect.setAttribute('x', n.x);
      rect.setAttribute('y', n.y);
      rect.setAttribute('width', n.w);
      rect.setAttribute('height', n.h);
      rect.setAttribute('rx', 8);
      rect.setAttribute('fill', color);
      rect.setAttribute('opacity','0.9');
      rect.setAttribute('stroke','#fff');
      rect.setAttribute('stroke-width','2');
      svg.appendChild(rect);

      const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
      txt.setAttribute('x', n.x + n.w/2);
      txt.setAttribute('y', n.y + 14);
      txt.setAttribute('text-anchor','middle');
      txt.setAttribute('fill','#212529');
      txt.setAttribute('font-weight','700');
      txt.setAttribute('font-size','12');
      txt.textContent = `${n.node.name}: ${n.node.hours}h`;
      svg.appendChild(txt);

      if (n.node.children && n.node.children.length) {
        const tri = drawTriangleButton(svg, n.x + n.w/2, n.y + n.h - 6, 6, n.node.id);
        tri.addEventListener('click', () => {
          n.node.expanded = !n.node.expanded;
          draw();
        });
      }
    });
  }

  draw();
}


