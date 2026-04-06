from app.database import Base
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean
from datetime import datetime


class EnergyReading(Base):
    __tablename__ = "energy_readings"

    id = Column(Integer, primary_key=True, index=True)
    substation_id = Column(String(50), index=True)
    city = Column(String(100), default="İstanbul")
    district = Column(String(100))
    lat = Column(Float)
    lng = Column(Float)
    current_consumption = Column(Float)   # kWh
    predicted_consumption = Column(Float) # kWh
    capacity = Column(Float)              # kWh max
    utilization_pct = Column(Float)       # 0-100
    is_anomaly = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0)
    renewable_pct = Column(Float)         # % of renewable energy
    timestamp = Column(DateTime, default=datetime.utcnow)
