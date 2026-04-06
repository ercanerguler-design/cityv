from fastapi import APIRouter
from app.state import simulator
from app.services.air_quality_analyzer import analyze_air_quality
from app.database import SessionLocal
from app.models.air_quality import AirQualityReading
from app.schemas.air_quality import AirQualityReadingOut
from typing import List

router = APIRouter()


@router.get("/live", response_model=List[dict])
async def get_live_air():
    return list(simulator.latest_air.values())


@router.get("/ai-analysis")
async def get_air_ai():
    readings = list(simulator.latest_air.values())
    return analyze_air_quality(readings)


@router.get("/summary")
async def get_air_summary():
    readings = list(simulator.latest_air.values())
    if not readings:
        return {}
    avg_aqi = int(sum(r.get("aqi", 0) for r in readings) / len(readings))
    max_aqi = max(r.get("aqi", 0) for r in readings)
    alerts = sum(1 for r in readings if r.get("alert_active"))
    avg_pm25 = sum(r.get("pm25", 0) for r in readings) / len(readings)
    avg_pm10 = sum(r.get("pm10", 0) for r in readings) / len(readings)
    worst = max(readings, key=lambda x: x.get("aqi", 0), default=None)
    return {
        "total_stations": len(readings),
        "avg_aqi": avg_aqi,
        "max_aqi": max_aqi,
        "alert_count": alerts,
        "worst_district": worst.get("district") if worst else None,
        "avg_pm25": round(avg_pm25, 1),
        "avg_pm10": round(avg_pm10, 1),
    }


@router.get("/history")
async def get_air_history(limit: int = 100):
    db = SessionLocal()
    try:
        rows = db.query(AirQualityReading).order_by(AirQualityReading.timestamp.desc()).limit(limit).all()
        return [AirQualityReadingOut.model_validate(r) for r in rows]
    finally:
        db.close()
