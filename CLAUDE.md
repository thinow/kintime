# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Kintime** is a web application (mobile-first) that helps people track and balance the time they spend with the people they love. The core problem: a parent with multiple children wants to ensure no child gets less attention than another — without obsessing over it manually.

### Reference Personas

| Persona | Role |
|---------|------|
| Homer   | The user (parent tracking time) |
| Bart    | Attached person (child) |
| Lisa    | Attached person (child) |
| Maggie  | Attached person (child) |

Use these names in examples, tests, seed data, and documentation.

## Planned Stack

| Layer            | Technology               | Notes                                     |
|------------------|--------------------------|-------------------------------------------|
| Frontend         | React (web, mobile-first)| Browser-based, no app store required      |
| Backend          | Python (FastAPI)         | REST API                                  |
| Frontend hosting | Cloudflare Pages         | CDN-served, no cold start, free           |
| Backend hosting  | Fly.io                   | Always-on free VM, no enforced sleep      |
| Database         | Neon (PostgreSQL)        | Serverless Postgres, free tier            |
| CI/CD            | GitHub Actions           | Deploys backend to Fly.io, runs migrations|

> Cloudflare Pages auto-deploys from GitHub — no Actions config needed for the frontend.

## Milestones

### M1 — Hello World (Foundation)
A deployable skeleton: one frontend page with a button that calls the backend, backend returns a response. No database. Goal is to validate the full stack is wired end-to-end and deployed to production.

- Frontend and backend deployed and reachable in production
- No staging environment — production is the only deployed environment
- Automated tests runnable both locally and in CI/CD (GitHub Actions)

### M2 — Core Loop (Bare Minimum Use Case)
The app does the one thing it exists to do: log time spent with an attached person, and display the total time per person.

- Log a time entry (person + duration)
- View cumulative time per person
- Backed by a database

### M3 — User Management (Admin Setup)
An Admin persona can configure the system: create the caring person (e.g. Homer) and their attached persons (e.g. Bart, Lisa, Maggie).

- Admin creates and manages personas
- Authentication distinguishing Admin from regular user

### M4 — UX Polish
Refine flows and experience based on real usage of M2/M3.

## Formatting

Keep Markdown table columns pipe-aligned: pad cells with spaces so the `|` characters form straight vertical lines across all rows, including the separator row.

## Commit Messages

Follow Conventional Commits as a one-liner, always with the co-authorship trailer:

```
<type>(<scope>): <description>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Types: `feat` | `fix` | `docs` | `refactor` | `test` | `chore` | `style` | `infra`
Scopes: `frontend` | `backend` | `api` | `db` | `infra` | `config` | `docs`

## Collaboration Style

Work in small, deliberate iterations. Each milestone must produce something real and usable — not a scaffold, not a placeholder. The goal is to feel the product evolve with every step.

Always prefer a thin vertical slice that works end-to-end over a broad horizontal layer that delivers nothing runnable. A button that actually calls a real backend beats a perfectly structured codebase that does nothing yet.

During implementation, be challenging: push back on proposals that are over-engineered, poorly named, or where a simpler design would serve the use case better. Kintime is a personal-scale app — avoid enterprise patterns that don't earn their complexity here.
