"""
SQLAlchemy Async & Sync Database Session Management
Supports async execution to prevent blocking FastAPI's asyncio event loop.
"""

import os
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:////tmp/pencil_orchestrator.db"
)

# Engine setup with pre-ping validation
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=20, max_overflow=10)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    from app.db.models import CampaignModel, AssetModel, TelemetryModel
    Base.metadata.create_all(bind=engine)

init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def run_in_thread(func, *args, **kwargs):
    """Executes synchronous DB operations in a threadpool to prevent blocking the event loop."""
    return await asyncio.to_thread(func, *args, **kwargs)
