from app.database import Base
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean
from datetime import datetime


class WasteContainer(Base):
    __tablename__ = "waste_containers"

    id = Column(Integer, primary_key=True, index=True)
    container_id = Column(String(50), index=True)
    city = Column(String(100), default="İstanbul")
    district = Column(String(100))
    location_name = Column(String(150))
    lat = Column(Float)
    lng = Column(Float)
    fill_pct = Column(Float)          # 0-100
    capacity_liters = Column(Integer) # total capacity
    container_type = Column(String(50))  # general / recycling / organic
    needs_collection = Column(Boolean, default=False)
    last_collected = Column(DateTime)
    timestamp = Column(DateTime, default=datetime.utcnow)
