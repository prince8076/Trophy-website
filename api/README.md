# Shreeji Corporates API (FastAPI)

Backend for the Shreeji Corporates landing page (`motion-studio/`).
Landing-page size only: products, feedback, enquiries. No cart,
no checkout, no accounts — orders still go through WhatsApp/email.

## Run locally

```bash
cd api
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --port 8000
```

Docs: http://localhost:8000/docs — try every endpoint there.

## Frontend wiring

In the frontend, set:

```
VITE_API_URL=http://localhost:8000
```

in `motion-studio/.env` (or your deploy env). If the API is not
running, the frontend falls back to its hardcoded sample
catalogue and mock feedback, so the site never breaks.

## Endpoints

| Method | Path | Who |
|---|---|---|
| GET | /health | anyone |
| GET | /api/products?material=&category= | anyone |
| GET | /api/products/{id} | anyone |
| POST | /api/products | admin key |
| DELETE | /api/products/{id} | admin key |
| GET | /api/feedback | anyone (approved only) |
| GET | /api/feedback?include_unapproved=true | admin key |
| POST | /api/feedback | anyone (starts unapproved) |
| POST | /api/feedback/{id}/approve | admin key |
| DELETE | /api/feedback/{id} | admin key |
| POST | /api/enquiries | anyone |
| GET | /api/enquiries | admin key |

Admin key: header `X-Admin-Key`, value must match the `ADMIN_KEY`
env var. If `ADMIN_KEY` is not set, admin endpoints return 503.
There is no default key in the code — set one before deploying.

## Data

- Default DB is SQLite (`shreeji.db` in this folder). For
  production, set `DATABASE_URL` to Postgres — no code change.
- Seed data (`seed.py`) matches the frontend catalogue on main.
  Feedback seeds are the old frontend mock placeholders, marked
  approved so the site keeps showing feedback — replace them
  with real approved feedback before presenting them as verified.

## Deploy (short version)

Render / Railway / a VPS: Python service, build `pip install -r
requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port
$PORT`, set `ADMIN_KEY`, `FRONTEND_ORIGINS` (your frontend
domain), and `DATABASE_URL` (Postgres if you want data to survive
restarts — SQLite on most free hosts does not).
