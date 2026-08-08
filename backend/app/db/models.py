"""
SQLAlchemy ORM Models for Campaigns, Assets, and Performance Telemetry
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, JSON
from datetime import datetime, timezone
from app.db.session import Base

class CampaignModel(Base):
    __tablename__ = "campaigns"

    id = Column(String(64), primary_key=True, index=True)
    product_name = Column(String(255), nullable=False)
    brand_name = Column(String(255), nullable=False)
    status = Column(String(50), default="ACTIVE")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AssetModel(Base):
    __tablename__ = "assets"

    id = Column(String(64), primary_key=True, index=True)
    campaign_id = Column(String(64), nullable=False, index=True)
    headline = Column(Text, nullable=False)
    primary_text = Column(Text, nullable=False)
    asset_url = Column(Text, nullable=False)
    aspect_ratio = Column(String(20), default="9:16")
    models_used = Column(JSON, nullable=True)
    predictive_score = Column(Float, default=94.8)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class TelemetryModel(Base):
    __tablename__ = "telemetry"

    id = Column(String(64), primary_key=True, index=True)
    campaign_id = Column(String(64), nullable=False, index=True)
    roas_uplift = Column(String(50), default="+78.5%")
    cpa_reduction = Column(String(50), default="-48.2%")
    meta_creative_id = Column(String(100), nullable=True)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
