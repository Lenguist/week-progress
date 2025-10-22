// D3 Sankey renderer for weekly hours
import { state } from './state.js';

export function renderSankey(svgSelector, breakdown) {
  const svg = d3.select(svgSelector);
  svg.selectAll('*').remove();

  const width = 1000;
  const height = 650;
  const margin = { top: 40, right: 80, bottom: 40, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // Build nodes and links for Sankey
  const nodes = [
    { name: 'Week' },                  // new leftmost source
    { name: 'Total' },                 // flows from Week
    { name: 'Asleep' },
    { name: 'Awake' },
    { name: 'Maintenance' },
    { name: 'Active Rest' },
    { name: 'Work' },
    { name: 'Unallocated' },
    { name: 'Classes' },
    { name: 'Non-Class' },
    { name: 'Productive' }
  ];

  const idx = Object.fromEntries(nodes.map((n, i) => [n.name, i]));

  const links = [
    { source: idx['Week'], target: idx['Total'], value: state.totalHours, color: state.colors.Total },
    { source: idx['Total'], target: idx['Asleep'], value: breakdown.sleep, color: state.colors.Asleep },
    { source: idx['Total'], target: idx['Awake'], value: breakdown.awake, color: state.colors.Awake },
    { source: idx['Awake'], target: idx['Maintenance'], value: breakdown.maintenance.total, color: state.colors.Maintenance },
    { source: idx['Awake'], target: idx['Active Rest'], value: breakdown.activeRest.total, color: state.colors['Active Rest'] },
    { source: idx['Awake'], target: idx['Work'], value: breakdown.work.total, color: state.colors.Work },
    { source: idx['Awake'], target: idx['Unallocated'], value: breakdown.unallocatedAwake, color: state.colors.Unallocated },
    { source: idx['Work'], target: idx['Classes'], value: breakdown.work.classes.total, color: state.colors.Classes },
    { source: idx['Work'], target: idx['Non-Class'], value: breakdown.work.nonClass.total, color: state.colors['Non-Class Work'] },
    { source: idx['Non-Class'], target: idx['Productive'], value: breakdown.work.nonClass.productive, color: state.colors.Productive }
  ];

  // Custom alignment: place nodes by depth (left-aligned), except force 'Productive' to the far right
  const customAlign = (d, n) => (d.name === 'Productive' ? n - 1 : d.depth);

  // Order within each column so 'Non-Class' and 'Work' sink to the bottom
  const orderWeight = {
    'Asleep': 1, 'Awake': 2,
    'Maintenance': 1, 'Active Rest': 2, 'Unallocated': 3, 'Work': 4,
    'Classes': 1, 'Non-Class': 2,
    'Week': 1, 'Total': 1, 'Productive': 3
  };

  const sankey = d3.sankey()
    .nodeWidth(14)
    .nodePadding(28)
    .size([innerWidth, innerHeight])
    .nodeAlign(customAlign)
    .nodeSort((a,b)=>d3.ascending(orderWeight[a.name]||0, orderWeight[b.name]||0))
    .iterations(64);

  const graph = sankey({
    nodes: nodes.map(d => ({ ...d })),
    links: links.map(d => ({ ...d }))
  });

  // Nudge non-productive terminal nodes left so they don't touch the right edge
  const rightMargin = 40; // keep a gap to the right
  graph.nodes.forEach(n => {
    const isProductive = n.name === 'Productive';
    if (!isProductive && n.x1 > innerWidth - rightMargin) {
      const shift = n.x1 - (innerWidth - rightMargin);
      n.x0 -= shift;
      n.x1 -= shift;
    }
  });

  // Push 'Productive' node to the lowest position in its column
  const prod = graph.nodes.find(n => n.name === 'Productive');
  if (prod) {
    const nodeHeight = prod.y1 - prod.y0;
    const bottomMargin = 20;
    prod.y0 = innerHeight - nodeHeight - bottomMargin;
    prod.y1 = prod.y0 + nodeHeight;
    sankey.update(graph);
  }

  // Draw links
  const linkG = g.append('g')
    .attr('fill', 'none')
    .attr('stroke-opacity', 0.35)
    .selectAll('path')
    .data(graph.links)
    .join('path')
      .attr('d', d3.sankeyLinkHorizontal())
      .attr('stroke', d => d.color || '#999')
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('stroke-linecap', 'butt')
      .append('title')
        .text(d => `${graph.nodes[d.source.index].name} → ${graph.nodes[d.target.index].name}: ${d.value}h`);

  // Draw nodes
  const node = g.append('g')
    .selectAll('g')
    .data(graph.nodes)
    .join('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

  node.append('rect')
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => state.colors[d.name] || '#666')
      .attr('stroke', '#fff');

  // Node titles (name) just above each node, centered
  node.append('text')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', -6)
      .attr('text-anchor', 'middle')
      .text(d => `${d.name}`);

  // Values on nodes
  node.append('text')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', d => (d.y1 - d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-weight', '700')
      .text(d => {
        const incoming = graph.links.filter(l => l.target.index === d.index).reduce((a, c) => a + c.value, 0);
        const outgoing = graph.links.filter(l => l.source.index === d.index).reduce((a, c) => a + c.value, 0);
        const val = Math.max(incoming, outgoing) || (d.name === 'Total' ? state.totalHours : (d.name === 'Week' ? state.totalHours : 0));
        return val ? `${Math.round(val)}h` : '';
      });
}


