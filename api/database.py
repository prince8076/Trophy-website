"""Database setup. SQLite by default, Postgres later by changing
one env var — no code change, because the models use SQLAlchemy
and the URL comes from the environment.

DATABASE_URL examples:
  sqlite:///./shreeji.db          (default, local dev)
  postgresql://user:pass@host/db  (production)
"""
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

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
