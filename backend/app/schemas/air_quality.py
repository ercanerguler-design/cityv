from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AirQualityReadingOut(BaseModel):
    id: int
    station_id: str
    district: str
    location_name: str
    lat: float
    lng: float
    aqi: int
    pm25: float
    pm10: float
    no2: float
    co2: float
    o3: float
    aqi_category: str
    predicted_aqi: int
    alert_active: bool
    timestamp: datetime

    model_config = {"from_attributes": True}


class AirQualitySummary(BaseModel):
    total_stations: int
    avg_aqi: float
    max_aqi: int
    alert_count: int
    worst_district: Optional[str]
    avg_pm25: float
    avg_pm10: float
