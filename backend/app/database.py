import logging

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings

logger = logging.getLogger(__name__)


def _engine_args(database_url: str) -> dict:
    if "sqlite" in database_url:
        return {"connect_args": {"check_same_thread": False}}
    if "postgresql" in database_url:
        return {"connect_args": {"connect_timeout": 3}, "pool_pre_ping": True}
    return {}


def _build_engine(database_url: str):
    return create_engine(database_url, **_engine_args(database_url))


active_database_url = settings.DATABASE_URL
engine = _build_engine(active_database_url)

if settings.DB_FALLBACK_ENABLED and settings.DATABASE_FALLBACK_URL and settings.DATABASE_FALLBACK_URL != settings.DATABASE_URL:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        logger.warning("Primary database unavailable, switching to fallback DB: %s", exc)
        active_database_url = settings.DATABASE_FALLBACK_URL
        engine = _build_engine(active_database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.models import traffic, energy, waste, safety, air_quality, citizen, venue, tenant_auth
    from app.services.auth_seed import ensure_seed_data
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        ensure_seed_data(db)
    finally:
        db.close()
