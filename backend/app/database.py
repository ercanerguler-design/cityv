import logging
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings

logger = logging.getLogger(__name__)


def _normalize_database_url(database_url: str) -> str:
    # SQLAlchemy defaults to psycopg2 for postgresql://; project uses psycopg3.
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

    # Neon always requires SSL; enforce it if omitted.
    if "neon.tech" in database_url and "sslmode=" not in database_url:
        parts = urlsplit(database_url)
        query = dict(parse_qsl(parts.query, keep_blank_values=True))
        query["sslmode"] = "require"
        database_url = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))

    return database_url


def _engine_args(database_url: str) -> dict:
    if "sqlite" in database_url:
        return {"connect_args": {"check_same_thread": False}}
    if "postgresql" in database_url:
        connect_args = {"connect_timeout": 5}

        # Neon pooler uses pgBouncer; disable prepared statements for stability.
        if "neon.tech" in database_url:
            connect_args["prepare_threshold"] = None

        return {"connect_args": connect_args, "pool_pre_ping": True}
    return {}


def _build_engine(database_url: str):
    return create_engine(database_url, **_engine_args(database_url))


active_database_url = _normalize_database_url(settings.DATABASE_URL)
engine = _build_engine(active_database_url)

fallback_url = _normalize_database_url(settings.DATABASE_FALLBACK_URL) if settings.DATABASE_FALLBACK_URL else ""

if settings.DB_FALLBACK_ENABLED and fallback_url and fallback_url != active_database_url:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        logger.warning("Primary database unavailable, switching to fallback DB: %s", exc)
        active_database_url = fallback_url
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
