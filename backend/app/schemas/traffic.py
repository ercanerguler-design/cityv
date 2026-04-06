from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TrafficReadingOut(BaseModel):
    id: int
    sensor_id: str
    district: str
    location_name: str
    lat: float
    lng: float
    vehicle_count: int
    avg_speed: float
    congestion_level: str
    congestion_score: float
    predicted_congestion: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class TrafficSummary(BaseModel):
    total_sensors: int
    critical_count: int
    high_count: int
    moderate_count: int
    low_count: int
    avg_speed_city: float
    total_vehicles: int
    worst_location: Optional[str]
