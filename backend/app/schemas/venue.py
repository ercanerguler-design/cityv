from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class VenueReadingOut(BaseModel):
    id: int
    venue_id: str
    name: str
    district: str
    category: str
    subcategory: Optional[str] = None
    lat: float
    lng: float
    capacity: int
    current_occupancy: int
    occupancy_pct: float
    occupancy_level: str
    wait_minutes: int
    trend: str
    is_peak: bool
    timestamp: datetime

    model_config = {"from_attributes": True}
