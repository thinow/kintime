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
   - Include a concrete **production verification step**: a specific curl command, Neon console check, or browser action that confirms the iteration works in production before the next one begins. Never assume the deploy worked — verify it.
4. Be challenging: flag iterations that are too broad, speculative, or introduce abstraction without earning it.
5. For schema changes, apply the expand-contract pattern — never mutate a live column in a single step. Split into three iterations:
   - **Expand**: migration adds the new column/table (old code still works, no deploy needed yet).
   - **Contract (backend)**: backend reads/writes the new column; falls back to old if absent. Deploy this before removing anything.
   - **Contract (schema)**: migration drops the old column once the backend no longer touches it.
   This ensures the running backend is never out of sync with the deployed schema. Example: renaming `name` → `display_name` = three iterations, not one.
6. Wait for the user to confirm or amend.
7. Once approved, append the iterations as a checklist under the milestone's `### Mn` section in CLAUDE.md:
   `- [ ] 1. Iteration title — one-line scope`
8. Suggest starting iteration 1.
