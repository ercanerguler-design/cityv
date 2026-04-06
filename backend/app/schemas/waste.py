from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class WasteContainerOut(BaseModel):
    id: int
    container_id: str
    district: str
    location_name: str
    lat: float
    lng: float
    fill_pct: float
    capacity_liters: int
    container_type: str
    needs_collection: bool
    timestamp: datetime

    model_config = {"from_attributes": True}


class WasteRoute(BaseModel):
    route_id: str
    containers: List[str]
    total_stops: int
    estimated_duration_min: int
    total_waste_liters: float
    priority_score: float


class WasteSummary(BaseModel):
    total_containers: int
    needs_collection_count: int
    avg_fill_pct: float
    overfull_count: int
    recycling_pct: float
