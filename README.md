# Kintime

> *Because you want to spend time with your family — not manage a spreadsheet about it.*

A web app (mobile-first) to help you track and balance the time you spend with the people you love.

## The Problem

Homer has three kids: Bart, Lisa, and Maggie. He loves them equally but life gets busy — and without noticing, he might end up spending three weekends in a row with Bart while Lisa and Maggie barely see him. Kintime keeps that honest without making it a chore.

## What It Does

- Log time sessions with specific people ("2h with Lisa, Sunday afternoon")
- See at a glance who you've been spending time with lately
- Spot imbalances before they become patterns
- No guilt-tripping — just gentle awareness

## Stack

| Layer            | Technology                |
|------------------|---------------------------|
| Frontend         | Next.js (App Router)      |
| Backend          | Python / FastAPI          |
| Frontend hosting | Vercel                    |
| Backend hosting  | Fly.io                    |
| Database         | Neon (PostgreSQL)         |
| CI/CD            | GitHub Actions            |

> Next.js gives us server-side rendering: pages arrive as pre-rendered HTML, so the first paint is fast on mobile data — no waiting for a JS bundle to hydrate before content shows.

## About This Project

Kintime is openly and transparently co-created with [Claude Code](https://claude.ai/code) by Anthropic. The code, architecture decisions, and tradeoffs are shaped through an ongoing human-AI collaboration — and that's intentional. The irony is not lost: an app built *with AI* so its author can spend *less time at a screen* and more time with his family.


## Roadmap

| Milestone                         | Goal                                                                | Status      |
|-----------------------------------|---------------------------------------------------------------------|-------------|
| **M0 — Planning**                 | Project vision, stack, hosting, and collaboration workflow defined. | done        |
| **M1 — Walking Skeleton**         | A working page talks to the backend in production. No domain yet.   | pending     |
| **M2 — Homer sets up his family** | Create and edit attached persons (Bart, Lisa, Maggie). No auth yet. | pending     |
| **M3 — Homer logs time**          | Log a time entry with one of the attached persons from M2.          | pending     |
| **M4 — Homer sees balance**       | View cumulative time per attached person.                           | pending     |
| **M5 — Homer notices imbalance**  | Gentle awareness when time has drifted toward one person.           | pending     |
| **M6 — Homer logs in**            | Authentication gates the app so personal data stays private.        | pending     |

> No staging environment. Tests run locally and in CI/CD.

## License

[MIT](LICENSE) — © 2026 Thierry Nowak

## Status

M0 complete — starting M1 (Walking Skeleton).
