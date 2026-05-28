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

| Layer     | Technology          | Notes                                      |
|-----------|---------------------|--------------------------------------------|
| Frontend  | React (web, mobile-first) | Browser-based, no app store required  |
| Backend   | Java (Spring Boot)  | REST API                                   |
| Hosting   | TBD — free tier     | Single user initially; Railway/Render/Fly.io candidates |
| Database  | TBD — free tier     | Likely PostgreSQL (Neon/Supabase/Render)   |

> Stack decisions are not final. Challenge proposals if a simpler or better-fit option exists.

## Commit Messages

Follow Conventional Commits as a one-liner, always with the co-authorship trailer:

```
<type>(<scope>): <description>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Types: `feat` | `fix` | `docs` | `refactor` | `test` | `chore` | `style` | `infra`
Scopes: `frontend` | `backend` | `api` | `db` | `infra` | `config` | `docs`

## Collaboration Style

During implementation, be challenging: push back on proposals that are over-engineered, poorly named, or where a simpler design would serve the use case better. Kintime is a personal-scale app — avoid enterprise patterns that don't earn their complexity here.
