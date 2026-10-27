"""In-memory rate limiting, no new dependency.

Why in-memory: this site runs as one API instance (Render
free is a single instance), so a per-process counter is
enough and keeps the stack small. If you ever run multiple
instances behind a load balancer, replace this with a Redis
counter — the interface (allow(key, limit, window)) stays
the same, only the storage changes.

Limits (per client IP, env-overridable):
  general: 120 requests / 60s — a normal visitor makes <20.
  write:    10 POSTs / 60s — feedback/enquiries/products.
            This is the spam and DB-filling control.
  admin:    10 attempts / 60s — slows admin-key brute force.
            It counts attempts, not just successes, so a
            wrong key still burns the attacker's budget.

Response on excess: 429 with a Retry-After header.
"""
import os
import threading
import time
from collections import deque

GENERAL_LIMIT = int(os.environ.get("RATE_LIMIT_GENERAL", "120"))
WRITE_LIMIT = int(os.environ.get("RATE_LIMIT_WRITE", "10"))
ADMIN_LIMIT = int(os.environ.get("RATE_LIMIT_ADMIN", "10"))
WINDOW_SECONDS = 60


class RateLimiter:
    def __init__(self):
        self._buckets: dict[str, deque[float]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str, limit: int) -> bool:
        now = time.monotonic()
        with self._lock:
            bucket = self._buckets.setdefault(key, deque())
            while bucket and bucket[0] <= now - WINDOW_SECONDS:
                bucket.popleft()
            if len(bucket) >= limit:
                return False
            bucket.append(now)
            return True


limiter = RateLimiter()


def client_ip(request) -> str:
    # Behind Render/Netlify, the real IP is in X-Forwarded-For.
    # Take the first (client) entry, never trust a later one.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
