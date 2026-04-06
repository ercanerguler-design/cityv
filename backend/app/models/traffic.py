from app.database import Base
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, Text
from datetime import datetime


class TrafficReading(Base):
    __tablename__ = "traffic_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), index=True)
    city = Column(String(100), default="İstanbul")
    district = Column(String(100))
    location_name = Column(String(150))
    lat = Column(Float)
    lng = Column(Float)
    vehicle_count = Column(Integer)
    avg_speed = Column(Float)
    congestion_level = Column(String(20))  # LOW / MODERATE / HIGH / CRITICAL
    congestion_score = Column(Float)        # 0.0 - 1.0
    predicted_congestion = Column(String(20))
    timestamp = Column(DateTime, default=datetime.utcnow)
