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

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | React (web, mobile-first)|
| Backend  | Java / Spring Boot       |
| Hosting  | Free-tier cloud (TBD)    |
| Database | PostgreSQL (TBD)         |

## About This Project

Kintime is openly and transparently co-created with [Claude Code](https://claude.ai/code) by Anthropic. The code, architecture decisions, and tradeoffs are shaped through an ongoing human-AI collaboration — and that's intentional. The irony is not lost: an app built *with AI* so its author can spend *less time at a screen* and more time with his family.


## Roadmap

| Milestone | Goal |
|-----------|------|
| **M1 — Foundation** | Hello World deployed to production: one page, one button, one backend call. No database. Full CI/CD pipeline in place. |
| **M2 — Core Loop** | Log time with an attached person. View total time per person. Minimum viable product. |
| **M3 — User Management** | Admin persona creates and manages the caring person and their attached persons. |
| **M4 — UX Polish** | Refine flows and experience based on real usage. |

> No staging environment. Tests run locally and in CI/CD.

## Status

Planning phase — stack and milestones defined, implementation not started.
