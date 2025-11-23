from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import settings

# Create database engine
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
    echo=False  # Set to True to see SQL queries
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get database session
def get_db():
    """Dependency to get database session for API endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
