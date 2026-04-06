from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class EnergyReadingOut(BaseModel):
    id: int
    substation_id: str
    district: str
    lat: float
    lng: float
    current_consumption: float
    predicted_consumption: float
    capacity: float
    utilization_pct: float
    is_anomaly: bool
    anomaly_score: float
    renewable_pct: float
    timestamp: datetime

    model_config = {"from_attributes": True}


class EnergySummary(BaseModel):
    total_substations: int
    total_consumption_kwh: float
    total_capacity_kwh: float
    avg_utilization_pct: float
    anomaly_count: int
    avg_renewable_pct: float
    peak_district: Optional[str]
