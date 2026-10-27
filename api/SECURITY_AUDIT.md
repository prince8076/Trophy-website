# Security Audit (VAPT) — Shreeji Corporates site + API

Date: 2026-10-27. Tester: Muse (agent), at the owner's request.
Scope: `motion-studio/` frontend and `api/` FastAPI backend, as
deployed on main. Tested on local test instances (fresh test
database, test admin key) running the same code — not on live
user data, and no other site was touched.

## Method

Code review first (injection points, XSS sinks, auth, CORS,
secrets, headers), then live attacks against the test API:
SQL injection, stored XSS, auth bypass, enumeration, input
validation, CORS, security headers, oversized payloads,
rate flooding, spam flooding, admin-key brute force.
Then fixes were applied and the same attacks re-run.

## What was NOT vulnerable (tested, passed)

- **SQL injection — NOT PRESENT.** All queries use SQLAlchemy
  ORM parameters; there is no string-built SQL in the code.
  Payloads like `material=' OR '1'='1` returned 0 rows, and
  `id=1 OR 1=1` returned 422. Tables stayed intact.
- **Admin auth bypass — NOT PRESENT.** Enquiries list, product
  delete and feedback approve without a key, or with a wrong
  key, all returned 401. Keys are compared with
  `secrets.compare_digest`, never stored in code, and admin
  endpoints return 503 when `ADMIN_KEY` is unset.
- **Stored XSS — NOT EXPLOITABLE via this frontend.** A
  `<script>` / `onerror` payload can be *stored* in a feedback
  row (it is just text to the API), but it is unapproved by
  default so it never reaches the public page, and the
  frontend renders it with React `{quote}`, which escapes
  HTML. Code grep found no `dangerouslySetInnerHTML`,
  `innerHTML`, `eval` or `document.write`.
- **CORS abuse — NOT PRESENT.** An evil `Origin:` got no CORS
  headers. Origins are restricted to `FRONTEND_ORIGINS`
  (localhost by default), credentials are off.
- **WhatsApp/email links — SAFE.** Product and message text
  go through `encodeURIComponent`, and the WhatsApp number
  and email address are hardcoded, not user-controlled.
- **Validation — WORKING.** Rating 99 / 0 and a missing
  contact field returned 422, as designed.
- **Secrets in repo — NONE FOUND.** No password, key or token
  in code; `.env` files are gitignored in both `api/` and
  the frontend (the frontend `.gitignore` was fixed as part
  of this audit — it did not ignore `.env` before).

## Confirmed gaps, and what was fixed

| # | Gap (before) | Severity | Fix (now in code) | Re-test |
|---|---|---|---|---|
| 1 | No rate limiting: 120/120 GETs and 30/30 spam posts accepted | High | `api/limits.py` — in-memory per-IP limits: 120 req/min general, 10 POSTs/min, 10 admin attempts/min, 429 + Retry-After | 120×200 then 10×429; spam 10×201 then 5×429; brute force 10×401 then 5×429 |
| 2 | No body size limit: a 2 MB enquiry was accepted | Medium | 1 MB `Content-Length` limit in middleware → 413 | 2 MB → 413, normal post → 201 |
| 3 | No field length limits: a 100,000-char quote was accepted | Medium | `max_length` on all input fields in `schemas.py` (e.g. quote 2000, message 5000) | 100k quote → 422 |
| 4 | No security headers at all | Low | Middleware adds `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, and CSP `default-src 'none'` on `/api/*` | All headers present |
| 5 | API docs always on (`/docs` in production) | Low | `DOCS_ENABLED=false` turns `/docs`, `/redoc`, `/openapi.json` off; `render.yaml` sets it false for production | `/docs` → 404 with it off, API still 200 |

## Residual risks (known, accepted for this site's size)

- **Rate limiting is in-memory, single instance.** Correct
  for Render free (one instance). If you ever run multiple
  API instances, replace `limits.py` storage with Redis —
  the interface stays the same.
- **No CAPTCHA.** Rate limiting + approval gate (feedback
  is hidden until approved) is enough at this traffic level;
  a CAPTCHA would hurt ordering UX on a landing page. Add
  one only if spam still gets through after rate limiting.
- **Feedback seeds are placeholders.** The 6 seeded reviews
  are the old frontend mock entries, not verified reviews.
  Replace them with real approved feedback before presenting
  them as real — same warning as in the seed file.
- **Ordering is WhatsApp/email, not the API.** The API
  records enquiries; it cannot verify that a WhatsApp
  message was really sent. That is by design for this
  landing page.

## How to re-run the checks

```bash
cd api
rm -f shreeji.db && python seed.py
ADMIN_KEY=test-admin-123 uvicorn main:app --port 8000
# SQLi:  curl "http://localhost:8000/api/products?material=' OR '1'='1"
# Spam:  loop POST /api/feedback 15 times — first 10 pass, rest 429
# Flood: loop GET /api/products 130 times — first 120 pass, rest 429
# Headers: curl -i http://localhost:8000/api/products
```
