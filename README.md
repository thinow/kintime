# Kintime

> *Because you want to spend time with your family — not manage a spreadsheet about it.*

A web app (mobile-first) to help you track and balance the time you spend with the people you love.

**Try it out:** [kintime.vercel.app](https://kintime.vercel.app)

## The Problem

You have kids. You love them equally but life gets busy — and without noticing, you might spend three weekends in a row with one while the others barely see you. Kintime keeps that honest without making it a chore.

## What It Does

- Log time sessions with specific people ("2h with Lisa, Sunday afternoon")
- See at a glance who you've been spending time with lately
- Spot imbalances before they become patterns
- No guilt-tripping — just gentle awareness

## Stack

| Layer    | Technology | Hosting |
|----------|------------|---------|
| Frontend | [![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white&style=flat-square)](https://nextjs.org) | [![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white&style=flat-square)](https://vercel.com) |
| Backend  | [![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white&style=flat-square)](https://fastapi.tiangolo.com) | [![Fly.io](https://img.shields.io/badge/Fly.io-8B5CF6?logo=flydotio&logoColor=white&style=flat-square)](https://fly.io) |
| Database | [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white&style=flat-square)](https://www.postgresql.org) | [![Neon](https://img.shields.io/badge/Neon-00E599?logo=neon&logoColor=000&style=flat-square)](https://neon.tech) |
| CI/CD    | [![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white&style=flat-square)](https://github.com/features/actions) | — |

> Next.js gives us server-side rendering: pages arrive as pre-rendered HTML, so the first paint is fast on mobile data — no waiting for a JS bundle to hydrate before content shows.

## About This Project

Kintime is openly and transparently co-created with [Claude Code](https://claude.ai/code) by Anthropic. The code, architecture decisions, and tradeoffs are shaped through an ongoing human-AI collaboration — and that's intentional. The irony is not lost: an app built *with AI* so its author can spend *less time at a screen* and more time with his family.


## Roadmap

| Milestone                    | Goal                                                                | Status         |
|------------------------------|---------------------------------------------------------------------|----------------|
| **M0 — Planning**            | Project vision, stack, hosting, and collaboration workflow defined. | ✅ done        |
| **M1 — Walking Skeleton**    | A working page talks to the backend in production. No domain yet.  | ✅ done        |
| **M2 — Logs in**             | Magic link auth. The app is fully gated from this point on.        | 🔄 in progress |
| **M3 — UI foundation**       | Font, colors, spacing set. Auth screens polished for mobile.       | ⬜ pending     |
| **M4 — Sets up family**      | Create and edit attached persons. First real domain data.          | ⬜ pending     |
| **M5 — Logs time**           | Log a time entry against one of the attached persons.              | ⬜ pending     |
| **M6 — Sees balance**        | View cumulative time per attached person.                          | ⬜ pending     |
| **M7 — UI polish**           | Polish all feature screens once the full loop is built.            | ⬜ pending     |
| **M8 — Notices imbalance**   | Gentle awareness when time has drifted toward one person.          | ⬜ pending     |

> No staging environment. Tests run locally and in CI/CD.

## Contributing

**Commands** — invoke with `/command-name` in [Claude Code](https://claude.ai/code):

| Command             | What it does                                                          |
|---------------------|-----------------------------------------------------------------------|
| `/ship`             | Review diff, propose a commit message, commit and push                |
| `/start-milestone`  | Break a milestone into 1-hour deployable iterations                   |

**Branching** — push directly to `main`. No feature branches. Tests are the safety net.

## License

[MIT](LICENSE) — © 2026 Thierry Nowak

## Status

M1 complete — starting M2.
