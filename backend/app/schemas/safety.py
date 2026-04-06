from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SafetyIncidentOut(BaseModel):
    id: int
    incident_id: str
    district: str
    location_name: str
    lat: float
    lng: float
    incident_type: str
    severity: str
    severity_score: float
    status: str
    units_dispatched: int
    description: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class SafetyZoneOut(BaseModel):
    id: int
    zone_id: str
    district: str
    lat: float
    lng: float
    risk_score: float
    risk_level: str
    incident_count_24h: int
    timestamp: datetime

    model_config = {"from_attributes": True}


class SafetySummary(BaseModel):
    active_incidents: int
    critical_incidents: int
    total_units_dispatched: int
    highest_risk_district: Optional[str]
    incidents_last_24h: int
