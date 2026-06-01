---
description: Break the next milestone into 1-hour deployable iterations and record them in CLAUDE.md.
---

1. Identify the target milestone: use the one the user names (e.g. "M1"), otherwise the next `pending` in CLAUDE.md's Milestones table.
2. Read its goal from the matching `### Mn — Name` section.
3. Propose a numbered list of iterations. Each one must:
   - Fit within ~1 hour of working time.
   - Produce something deployable to production — a real, visible change.
   - Be the thinnest vertical slice toward the milestone goal.
   - Stay strictly within milestone scope (apply YAGNI; defer anything beyond it).
   - Prefer touching a single layer (backend only or frontend only). When both are needed, put the backend iteration first — the frontend should only call a new endpoint once the backend is confirmed live, so a failed backend deploy never leaves the frontend broken and out of sync.
4. Be challenging: flag iterations that are too broad, speculative, or introduce abstraction without earning it.
5. Wait for the user to confirm or amend.
6. Once approved, append the iterations as a checklist under the milestone's `### Mn` section in CLAUDE.md:
   `- [ ] 1. Iteration title — one-line scope`
7. Suggest starting iteration 1.
