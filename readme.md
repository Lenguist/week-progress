Overview

Time Tax Simulation is an interactive web visualization that demonstrates how much productive time a college student can realistically dedicate to personal or creative projects each week.

The concept is inspired by the idea of “time tax” — how every necessary activity (sleep, classwork, maintenance, hobbies, etc.) progressively eats away at your total available hours, leaving only a small portion for deep, independent work.

The simulation visually breaks down how time flows from 168 hours per week into smaller categories, while tracking how long it takes to complete a "substantial project" — a hypothetical 1000-hour milestone project that also decays over time if not maintained.

Core Features
1. Funnel Visualization

A hierarchical funnel progressively narrows from total hours per week → productive project hours.

Hierarchy
168 hours (Total)
├── Asleep (8h × 7d = 56h)
└── Awake (112h)
    ├── Maintenance
    │   ├── Eating (~10h)
    │   ├── Commute (~7h)
    │   └── Hygiene (~7h)
    ├── Active Rest
    │   ├── Exercise (~5h)
    │   └── Hobbies (~10h)
    └── Work
        ├── Classes
        │   ├── Class #1 (Lecture + HW)
        │   ├── Class #2 (Lecture + HW)
        │   ├── Class #3 (Lecture + HW)
        │   └── Class #4 (Lecture + HW)
        └── Non-Class Work
            ├── Productive Work (projects, research)
            └── Unproductive Work (distractions, meetings)


Each layer dynamically subtracts from the one above it. The funnel width at each level is proportional to hours remaining.

2. Project Progress Bar

A progress bar labeled “Substantial Project” fills as you accumulate productive hours.

Goal: 1000 hours total

Decay: −2 hours per week (simulating forgetting, regressions, etc.)

Completion: When the bar reaches 100%, you “roll 2 dice”:

Sum < 7: Flopped project

Sum 7–9: Decent project → +10 score

Sum ≥ 10: Excellent project → +50 score

Your score appears beside the progress bar and persists across weeks.

3. Weekly Simulation

You can press Enter (or a button) to advance by one week:

Time allocations remain fixed.

Progress bar updates (productive hours added, decay subtracted).

Optional animation for dice roll if project completion is reached.

Planned UI Elements
Element	Description
Funnel Chart	Hierarchical funnel (e.g., D3.js or Plotly funnel) visualizing time allocation.
Sidebar Panel	Displays total hours, remaining productive hours, and breakdown by category.
Progress Bar	Horizontal bar showing progress toward the 1000-hour substantial project.
Dice Animation	Rolls two dice visually when a project completes.
Score Counter	Displays accumulated points from completed projects.
Next Week Button / Keyboard Shortcut	Advances simulation by 1 week.
Technical Design
Tech Stack

Frontend: HTML + CSS + JavaScript (or TypeScript)

Visualization: D3.js or Plotly.js

State Management: Simple in-memory JS object

Optional Backend: None (static client-side app)

Data Model Example
const timeTax = {
  totalHours: 168,
  sleep: 56,
  maintenance: { eating: 10, commute: 7, hygiene: 7 },
  activeRest: { exercise: 5, hobby: 10 },
  work: {
    classes: {
      class1: { lecture: 3, hw: 5 },
      class2: { lecture: 3, hw: 5 },
      class3: { lecture: 3, hw: 5 },
      class4: { lecture: 3, hw: 5 },
    },
    nonClass: { productive: 8, unproductive: 4 },
  },
};

Simulation Logic

Compute total productive project hours per week from funnel.

Add those hours to the progress variable.

Subtract 2 hours decay per week.

If progress >= 1000, roll dice:

let roll = Math.floor(Math.random()*6+1) + Math.floor(Math.random()*6+1);


Update score accordingly and reset progress to 0.

Example Flow

Week 0: Project progress = 0 / 1000

Each week: +8 productive hours − 2 decay → net +6 per week

At ~167 weeks (~3.2 years), project completes → dice roll → update score.

Possible Extensions

Editable time allocations (sliders per category)

Visualization of cumulative decay vs productivity

“Life stage” presets (student, working adult, etc.)

Leaderboard of scores across multiple simulated runs

Directory Structure
time-tax-sim/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    └── dice.png
