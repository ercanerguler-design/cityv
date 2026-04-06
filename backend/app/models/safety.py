from app.database import Base
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean
from datetime import datetime


class SafetyIncident(Base):
    __tablename__ = "safety_incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(50), index=True)
    district = Column(String(100))
    location_name = Column(String(150))
    lat = Column(Float)
    lng = Column(Float)
    incident_type = Column(String(80))  # traffic_accident / fire / theft / medical / vandalism
    severity = Column(String(20))       # LOW / MEDIUM / HIGH / CRITICAL
    severity_score = Column(Float)      # 0-1
    status = Column(String(30))         # active / resolved / investigating
    units_dispatched = Column(Integer, default=0)
    description = Column(String(500))
    timestamp = Column(DateTime, default=datetime.utcnow)


class SafetyZoneRisk(Base):
    __tablename__ = "safety_zone_risks"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String(50), index=True)
    district = Column(String(100))
    lat = Column(Float)
    lng = Column(Float)
    risk_score = Column(Float)    # 0-1
    risk_level = Column(String(20))
    incident_count_24h = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)
