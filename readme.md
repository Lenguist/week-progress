# Week Progress / Time Tax Simulation

This project visualizes weekly time allocation and project progress, now with a modular codebase and a custom collapsible “sankey-like” diagram.

## High-level Architecture

- `index.html` — Shell markup: header (Score/HUD), main canvas area (Sankey + vertical progress), Settings overlay.
- `styles.css` — Global styling, responsive layout, vertical progress bar, settings overlay.
- `main.js` — App bootstrap: binds inputs, sets up buttons, initializes render flow.
- `simulation.js` — Weekly tick: computes gains/decay, updates progress/score, triggers re-render.
- `progress.js` — Updates horizontal/vertical progress UIs, dice/outcome banner hooks.
- `funnel.js` — Orchestrates which visualization to render into `#funnel`.

### Visualization modules

- `sankey.js` — D3-based Sankey (kept for reference/experiments).
- `collapsible_model.js` — Model helpers to build the collapsible flow tree and resolve colors.
- `collapsible_render.js` — Pure-SVG renderer for a vertical, collapsible “sankey-like” bar chart where:
  - Bar height is constant
  - Bar width is proportional to hours
  - Levels are aligned in rows; total width is preserved per level
  - Branching spread is controlled by `BRANCH_DEGREE` (children row = parent width + spread)
  - Connectors are smooth ribbons that expand from parent to children; ribbons can be inset with `FLOW_SHRINK_PX`.

### Core state

- `src/core/state.js` — Centralized state (`state`) and `computeBreakdown()` utilities.

## Folder Layout

```
week-progress/
  index.html
  styles.css
  main.js
  simulation.js
  progress.js
  funnel.js
  readme.md
  sankey.js
  collapsible_model.js
  collapsible_render.js
  sankey_types.js
  src/
    core/
      state.js
```

## Code Responsibilities

- HUD/Controls
  - `main.js` wires Score, Settings, Next Week.
  - `progress.js` updates vertical progress and text counters.
- Simulation
  - `simulation.js` advances weeks, applies decay, logs results, triggers redraw.
- Visualization
  - `funnel.js` chooses visualization (currently collapsible renderer).
  - `collapsible_model.js` provides the initial tree structure.
  - `collapsible_render.js` renders rows, bars, and ribbons; controls expand/collapse.

## Configurable Parameters (collapsible renderer)

- `BAR_HEIGHT` — constant node bar height (px)
- `LEVEL_GAP` — vertical gap between levels (px)
- `BASE_WIDTH` — width allocated to root bar (px)
- `BRANCH_DEGREE` — fractional widening of the child level relative to parent (e.g., 0.10)
- `FLOW_SHRINK_PX` — connector inset on each side (px) to keep ribbons slightly thinner than bars

## How rendering works (collapsible)

1. Layout calculates rows by depth. Children widths are proportional to parent width; gaps = `parentWidth * BRANCH_DEGREE / (childCount - 1)`.
2. For each child, a ribbon connects the parent slice to the child span, widening smoothly; ribbons are inset by `FLOW_SHRINK_PX`.
3. Bars draw above ribbons; each bar has a triangle for expand/collapse.

## Dev notes

- All changes preserve current functionality; only structure and modularization were added.
- D3 Sankey module is retained for reference but not currently used in main flow.
- Renderer parameters are easy to tune from one place in `collapsible_render.js`.
