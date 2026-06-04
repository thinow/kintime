---
description: Stage all changes, suggest a commit message for approval, then commit and push to origin.
---

1. Run `git diff` and `git status` to understand what changed.
2. Draft a commit message following the Conventional Commits format from CLAUDE.md: `<type>(<scope>): <description>`. Make it concise and accurate.
3. Without waiting for confirmation, run in order:
   - `git add` the relevant files
   - `git commit` with the drafted message and the trailer `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
   - `git push`
