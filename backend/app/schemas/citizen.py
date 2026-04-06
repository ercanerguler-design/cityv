from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class CitizenReportCreate(BaseModel):
    category: str
    title: str
    description: str
    district: str
    location_name: str
    lat: Optional[float] = None
    lng: Optional[float] = None


class CitizenReportOut(BaseModel):
    id: int
    report_id: str
    category: str
    priority: str
    priority_score: float
    title: str
    description: str
    district: str
    location_name: str
    lat: Optional[float]
    lng: Optional[float]
    status: str
    ai_response: Optional[str]
    upvotes: int
    timestamp: datetime

    model_config = {"from_attributes": True}


class CitizenSummary(BaseModel):
    total_reports: int
    pending_count: int
    in_progress_count: int
    resolved_count: int
    urgent_count: int
    most_common_category: Optional[str]
