from app.database import Base
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean
from datetime import datetime


class VenueReading(Base):
    __tablename__ = "venue_readings"

    id = Column(Integer, primary_key=True, index=True)
    venue_id = Column(String(60), index=True)
    name = Column(String(150))
    city = Column(String(100), default="İstanbul")
    district = Column(String(100))
    category = Column(String(50))   # mall / cafe / restaurant / street
    subcategory = Column(String(80), nullable=True)
    lat = Column(Float)
    lng = Column(Float)
    capacity = Column(Integer)
    current_occupancy = Column(Integer)
    occupancy_pct = Column(Float)
    occupancy_level = Column(String(20))  # LOW / MODERATE / HIGH / PACKED
    wait_minutes = Column(Integer, default=0)
    trend = Column(String(20), default="stable")  # rising / falling / stable
    is_peak = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
