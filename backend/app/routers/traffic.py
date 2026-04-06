from fastapi import APIRouter
from app.state import simulator
from app.services.traffic_ai import predict_congestion
from app.database import SessionLocal
from app.models.traffic import TrafficReading
from app.schemas.traffic import TrafficReadingOut, TrafficSummary
from typing import List

router = APIRouter()


@router.get("/live", response_model=List[dict])
async def get_live_traffic():
    return list(simulator.latest_traffic.values())


@router.get("/ai-analysis")
async def get_traffic_ai():
    readings = list(simulator.latest_traffic.values())
    return predict_congestion(readings)


@router.get("/summary")
async def get_traffic_summary():
    readings = list(simulator.latest_traffic.values())
    if not readings:
        return {}
    levels = {"CRITICAL": 0, "HIGH": 0, "MODERATE": 0, "LOW": 0}
    for r in readings:
        lvl = r.get("congestion_level", "LOW")
        levels[lvl] = levels.get(lvl, 0) + 1
    worst = max(readings, key=lambda x: x.get("congestion_score", 0), default=None)
    return {
        "total_sensors": len(readings),
        "critical_count": levels["CRITICAL"],
        "high_count": levels["HIGH"],
        "moderate_count": levels["MODERATE"],
        "low_count": levels["LOW"],
        "avg_speed_city": round(sum(r.get("avg_speed", 0) for r in readings) / len(readings), 1),
        "total_vehicles": sum(r.get("vehicle_count", 0) for r in readings),
        "worst_location": worst.get("location_name") if worst else None,
    }


@router.get("/history")
async def get_traffic_history(limit: int = 100):
    db = SessionLocal()
    try:
        rows = db.query(TrafficReading).order_by(TrafficReading.timestamp.desc()).limit(limit).all()
        return [TrafficReadingOut.model_validate(r) for r in rows]
    finally:
        db.close()
