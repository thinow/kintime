---
description: Run all tests, then stage changes, commit, and push to origin.
---

1. Run `git diff` and `git status` to understand what changed.
2. Run the test suites. If any test fails, stop and report the failure — do not commit.
   - Frontend: `cd frontend && npx vitest run`
   - Backend: `cd backend && uv run pytest`
3. Draft a commit message following the Conventional Commits format from CLAUDE.md: `<type>(<scope>): <description>`. Make it concise and accurate.
4. Without waiting for confirmation, run in order:
   - `git add` the relevant files
   - `git commit` with the drafted message and the trailer `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
   - `git push`
