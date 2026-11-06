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

## Data — which database?

- Local dev: SQLite, the default (`shreeji.db` in this folder).
  No setup, fine for a handful of products.
- Production: **Neon (free tier, Postgres)** — recommended for
  this site. It is plain Postgres, so the code already works:
  just set `DATABASE_URL` to Neon's connection string, no code
  change (the Postgres driver is already in requirements.txt).
  Why Neon over the other free options: Render's free Postgres
  expires, Supabase free projects pause after inactivity,
  and SQLite on a free host loses its file on restart. Neon
  free (512 MB) is far more than a few products, feedback and
  enquiries will ever use, and upgrading later is the same
  Postgres — no migration to a different database.
  Neon setup: create a project at neon.tech, copy the
  connection string, use the **-pooler** host version, keep
  `?sslmode=require` in it, paste it as `DATABASE_URL`.
  Then run `python seed.py` once (it only inserts when the
  tables are empty).
- Seed data (`seed.py`) matches the frontend catalogue on main.
  Feedback seeds are the old frontend mock placeholders, marked
  approved so the site keeps showing feedback — replace them
  with real approved feedback before presenting them as verified.

## Deploy (short version)

Render / Railway / a VPS: Python service, build `pip install -r
requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port
$PORT`, set `ADMIN_KEY`, `FRONTEND_ORIGINS` (your frontend
domain), and `DATABASE_URL` (Neon, see above).
There is also a `render.yaml` at the repo root for Render: it
creates the API service only, with `DATABASE_URL` left for you
to fill with the Neon string. After first deploy, run
`python seed.py` once from the Render shell.
Frontend: set `VITE_API_URL` to the deployed API URL in the
frontend host, then rebuild/redeploy the frontend — Vite
inlines that URL at build time.

## Keeping Render warm (optional)

Render's free tier spins the API down after ~15 min idle, so the
first request after a pause can take 30–60 s. The frontend already
handles that: it waits at most 3 s for `/api/products` /
`/api/feedback` and then shows its local sample data, with skeleton
loaders while it waits — so the site never sits empty.

If you want the cold start gone as well, ping the health endpoint
from an external cron (no fake-traffic logic lives in the app):

- Service: cron-job.org (free tier is enough)
- URL: `https://shreeji-api-1e53.onrender.com/health`
- Schedule: every 10 minutes
- Method: GET

That keeps one Render instance warm. It is optional — the site
works without it, just with a slower first API hit after idle.
