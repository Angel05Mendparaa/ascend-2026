# ASCEND: Real-Time UI State Reconciliation Dashboard

A real-time dashboard built for the ASCEND Hackathon that ingests component updates from multiple design systems (Figma, Kamdhenu, SOLACE), detects behavioral/visual conflicts, and resolves them using a deterministic engine.

## Tech Stack
* **Frontend:** React.js, Vite, Tailwind CSS, Framer Motion
* **Backend:** Node.js, Express (Local API)
* **Testing:** Vitest

## Deterministic Reconciliation Logic
The core engine (`server/engine.js`) reconstructs UI state from a stream of events using strict, mathematical rules to guarantee determinism and idempotency:
1. **Idempotency:** Exact duplicate events are filtered out using a unique signature hash based on source, ID, timestamp, and action.
2. **Time-travel / Late Arrivals:** All incoming events are sorted by ISO 8601 timestamps before processing. If an older event arrives late, the state is reconstructed chronologically to ensure historical accuracy.
3. **Animation Priority:** Animations defined by `solace` strictly override `figma` and `kamdhenu`, regardless of arrival order.
4. **Layout Merging:** Layout conflicts are resolved by merging. If any system dictates `flex-start`, it overrides conflicting constraints like `center`. Time is used as a fallback tie-breaker.

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd Ascend2026