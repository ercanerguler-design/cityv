from app.database import Base
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean
from datetime import datetime


class AirQualityReading(Base):
    __tablename__ = "air_quality_readings"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String(50), index=True)
    city = Column(String(100), default="İstanbul")
    district = Column(String(100))
    location_name = Column(String(150))
    lat = Column(Float)
    lng = Column(Float)
    aqi = Column(Integer)              # Air Quality Index 0-500
    pm25 = Column(Float)               # µg/m³
    pm10 = Column(Float)               # µg/m³
    no2 = Column(Float)                # µg/m³
    co2 = Column(Float)                # ppm
    o3 = Column(Float)                 # µg/m³
    aqi_category = Column(String(30))  # Good / Moderate / Unhealthy / Hazardous
    predicted_aqi = Column(Integer)
    alert_active = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
