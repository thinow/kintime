# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Kintime** is a web application (mobile-first) that helps people track and balance the time they spend with the people they love. The core problem: a parent with multiple children wants to ensure no child gets less attention than another — without obsessing over it manually.

### Reference Personas

| Persona | Role |
|---------|------|
| Pat     | The user (parent tracking time) |
| Casey   | Attached person (child) |
| Jamie   | Attached person (child) |

Use these names in examples, tests, seed data, and documentation.

## Planned Stack

| Layer            | Technology               | Notes                                      |
|------------------|--------------------------|------------------------------------------  |
| Frontend         | Next.js (App Router)     | Mobile-first, browser-based, no app store  |
| Backend          | Python (FastAPI)         | REST API                                   |
| Frontend hosting | Vercel                   | Native Next.js host, no cold start, free   |
| Backend hosting  | Fly.io                   | Always-on free VM, no enforced sleep       |
| Database         | Neon (PostgreSQL)        | Serverless Postgres, free tier             |
| Email            | Resend                   | Magic link auth; 3,000 emails/month free   |
| CI/CD            | GitHub Actions           | Deploys backend to Fly.io, runs migrations |

> Vercel auto-deploys from GitHub — no Actions config needed for the frontend.

## Milestones

| Milestone                     | Status      |
|-------------------------------|-------------|
| M0 — Planning & Setup         | done        |
| M1 — Walking Skeleton         | pending     |
| M2 — Pat logs in              | pending     |
| M3 — Pat sets up his family   | pending     |
| M4 — Pat logs time            | pending     |
| M5 — Pat sees balance         | pending     |
| M6 — Pat notices imbalance    | pending     |

### M0 — Planning & Setup `done`
Define the project vision, stack, hosting strategy, collaboration workflow, and tooling. This milestone is the human-AI co-development setup phase.

- Project vision and personas documented
- Stack decisions finalized
- Milestones and iteration model defined
- CI/CD and hosting strategy planned
- Branching strategy: push directly to `main` — no feature branches; tests are the safety net
- Repository structure and `.gitignore` in place

### M1 — Walking Skeleton
A deployable skeleton: Pat opens Kintime and sees a working page that talks to the backend. No domain features yet — placeholder content. The one honest exception to "use-case driven": this milestone validates that the deployed stack works end-to-end before any product value is shipped.

- Frontend and backend deployed and reachable in production
- A page loads, makes a backend call, displays the response
- No staging environment — production is the only deployed environment
- Automated tests runnable both locally and in CI/CD (GitHub Actions)

- [x] 1. Backend scaffold — FastAPI app with `GET /health` returning `{"status": "ok", "time": "<server UTC timestamp>"}`. `pyproject.toml` (uv), `uv.lock`, Dockerfile, `fly.toml`, one pytest. Deployed manually to Fly.io.
- [x] 2. Frontend scaffold — Next.js (App Router) page that calls `GET /health` on load and renders the server timestamp. Vercel project linked to GitHub, auto-deploys on push to `main`.
- [x] 3. CI/CD — GitHub Actions workflow: run backend tests, then deploy to Fly.io via `FLY_API_TOKEN` secret. Every push to `main` ships the backend automatically; tests are the gate.

### M2 — Pat logs in
Authentication gates Pat's real data. All domain features built from M3 onward sit behind login from day one.

Auth mechanism: **magic link** (passwordless). Pat enters his email, receives a link via Resend, clicks it, and gets a session. No passwords stored.

- Pat enters his email → backend generates a single-use token (hashed, 1 hour TTL) and emails a login link via Resend
- Pat clicks the link → token validated, session cookie set (HTTP-only, 1 month), token marked used
- On first login, Pat is prompted to enter a display name (email remains the identifier)
- Without a valid session, the app is unreachable
- Sessions persist across reloads

### M3 — Pat sets up his family
Pat creates and edits his attached persons (Casey, Jamie). The first real domain data lands here.

- A form to add an attached person (name)
- Edit and remove existing persons
- Entries persist (PostgreSQL on Neon arrives here)

### M4 — Pat logs time
Pat logs time spent with one of his attached persons.

- A time entry can be logged (attached person + duration + timestamp)
- The attached person is picked from those Pat set up in M3

### M5 — Pat sees balance
Pat sees how his time has been distributed across attached persons.

- A view shows cumulative time per attached person
- Computed from logged entries

### M6 — Pat notices imbalance
Pat is gently surfaced when his time has drifted toward one attached person. This is the core product vision — "spot imbalances before they become patterns."

- A visual cue, summary, or notification surfaces imbalance
- Threshold and tone calibrated to feel honest, not guilt-tripping
- Flows refined based on real usage from M3-M5

## Repository Structure

```
kintime/
├── frontend/                  # Next.js app (Vercel)
│   ├── app/                   # App Router: layouts and pages
│   ├── components/
│   ├── public/
│   ├── next.config.mjs
│   └── package.json
├── backend/                   # FastAPI app (Fly.io)
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   └── routers/           # one file per feature area
│   ├── tests/
│   ├── Dockerfile             # Fly.io deployment
│   ├── fly.toml               # Fly.io config
│   ├── pyproject.toml         # uv project file
│   └── uv.lock                # committed lockfile
├── .github/
│   └── workflows/
│       └── deploy.yml         # test + deploy backend + run migrations
├── .claude/
├── CLAUDE.md
├── README.md
└── LICENSE
```

## Architecture

**The browser never calls FastAPI directly.** All FastAPI calls go through Next.js — Server Components, Server Actions, or Route Handlers. The browser only ever talks to Vercel; Vercel talks to Fly.io server-to-server. This keeps CORS out of the picture entirely and is the natural App Router pattern.

If a feature needs client-side reactivity, use Server Actions — not direct browser fetches to the backend.

## Version Pinning

Pin every external dependency to an exact version. Never use `latest`, floating tags, or open ranges where a lockfile or explicit pin can own it instead.

| Layer           | How to pin                                                        |
|-----------------|-------------------------------------------------------------------|
| Docker images   | Exact tag: `python:3.14.5-slim`, `ghcr.io/astral-sh/uv:0.11.17` |
| GitHub Actions  | Exact tag: `actions/checkout@v4.2.2`                             |
| Python packages | `uv.lock` owns the exact versions; `pyproject.toml` sets a floor |
| Node packages   | `package-lock.json` / `pnpm-lock.yaml` owns the exact versions   |

Update pinned versions deliberately — never as a side effect of running an install command.

## Testing

Structure every test with given / when / then comments. Omit `# given` when there are no preconditions.

```python
def test_something():
    # given
    user = create_user(name="Pat")

    # when
    response = client.post("/entries", json={...})

    # then
    assert response.status_code == 201
```

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

Apply YAGNI rigorously. Before implementing anything, check whether it is actually required for the current milestone. If a proposal exceeds the current scope, say so explicitly and defer it. "We'll need it later" is not a reason to build it now.

When starting a new milestone, break it into iterations that each fit within one hour of working time. Each iteration must produce something deployable — a real, visible change in production. This is the unit of progress: one spare-time session, one shipped increment.

When the same command or request repeats across sessions, suggest creating a Claude Skill to automate it rather than executing it manually again.
