from app.database import Base
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, Text
from datetime import datetime


class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(50), index=True, unique=True)
    category = Column(String(80))   # pothole / lighting / noise / water / garbage / other
    priority = Column(String(20))   # low / medium / high / urgent
    priority_score = Column(Float)
    title = Column(String(200))
    description = Column(Text)
    district = Column(String(100))
    location_name = Column(String(150))
    lat = Column(Float)
    lng = Column(Float)
    status = Column(String(30), default="pending")  # pending / in_progress / resolved
    ai_response = Column(Text)
    upvotes = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
