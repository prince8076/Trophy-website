"""Database setup. SQLite by default, Postgres later by changing
one env var — no code change, because the models use SQLAlchemy
and the URL comes from the environment.

DATABASE_URL examples:
  sqlite:///./shreeji.db          (default, local dev)
  postgresql://user:pass@host/db  (production)
"""
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load api/.env if it exists, so ADMIN_KEY / DATABASE_URL set
# there actually work. Real environment variables (Render, etc.)
# always win over .env values — load_dotenv does not override
# existing env vars. Without this, a key written only in .env
# would be silently ignored and admin login would fail with 503.
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./shreeji.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
