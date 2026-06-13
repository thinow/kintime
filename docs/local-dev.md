# Running Kintime Locally

Both services must run at the same time. The frontend talks to the backend on port 8080. A local Postgres container is used as the database — the production Neon database is never touched from a dev machine.

## Prerequisites

- Node.js (for the frontend)
- [uv](https://docs.astral.sh/uv/) (for the backend)
- Docker (for the local database)

## Database

```bash
docker run -d \
  --name kintime-db \
  -p 5432:5432 \
  -e POSTGRES_DB=kintime \
  -e POSTGRES_USER=kintime \
  -e POSTGRES_PASSWORD=kintime \
  postgres:17-alpine
```

## Backend

Create `backend/.env`:

```
DATABASE_URL=postgresql://kintime:kintime@localhost:5432/kintime
SESSION_SECRET=<any-long-random-string>
RESEND_API_KEY=<resend-api-key>
FRONTEND_URL=http://localhost:3000
```

Then:

```bash
cd backend
uv run --env-file .env alembic upgrade head
uv run --env-file .env uvicorn app.main:app \
  --port 8080 \
  --reload
```

> `RESEND_API_KEY` must be a real key for magic links to arrive. Without one the server refuses to start. If you only need to test post-login flows, grab the raw token from backend stdout after `POST /auth/request-token`.

## Frontend

Create `frontend/.env.local`:

```
BACKEND_URL=http://localhost:8080
SESSION_SECRET=<same value as backend>
```

Then:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed in the terminal (`http://localhost:3000` by default, but Next.js will pick another port if 3000 is taken).

> `SESSION_SECRET` must be identical in both files — the backend signs session tokens and the frontend middleware verifies them with the same key. It must also be non-empty (the Web Crypto API rejects zero-length HMAC keys).

## Teardown

- **Backend**: `Ctrl+C` in the terminal
- **Frontend**: `Ctrl+C` doesn't always stop Next.js cleanly — kill it by port if it lingers:

  ```bash
  kill $(lsof -ti :<port>)
  ```
- **Database**:

```bash
docker stop kintime-db
docker rm kintime-db
```

## Tests

```bash
# backend
cd backend && uv run pytest

# frontend
cd frontend && npm test
```
