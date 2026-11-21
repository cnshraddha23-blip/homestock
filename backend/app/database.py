import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("homestock.database")
logging.basicConfig(level=logging.INFO)

Base = declarative_base()

# Attempt connection to MySQL first; fallback gracefully to SQLite if MySQL is offline
db_url = settings.mysql_database_url
is_sqlite = False

try:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False
    )
    with engine.connect() as conn:
        logger.info("Successfully connected to MySQL Database at %s:%s/%s", 
                    settings.MYSQL_HOST, settings.MYSQL_PORT, settings.MYSQL_DB)
except Exception as e:
    logger.warning("Could not connect to MySQL server (%s). Falling back to local SQLite engine (homestock.db) for development/demonstration.", e)
    db_url = settings.sqlite_database_url
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    is_sqlite = True

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
