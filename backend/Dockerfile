FROM python:3.14.5-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:0.11.17 /uv /usr/local/bin/uv

COPY pyproject.toml uv.lock ./
RUN uv sync --no-dev --frozen

COPY app/ /app/app/

CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--log-level", "info"]
