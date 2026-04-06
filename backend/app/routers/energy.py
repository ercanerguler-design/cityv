from fastapi import APIRouter
from app.state import simulator
from app.services.energy_ai import detect_anomalies
from app.database import SessionLocal
from app.models.energy import EnergyReading
from app.schemas.energy import EnergyReadingOut
from typing import List

router = APIRouter()


@router.get("/live", response_model=List[dict])
async def get_live_energy():
    return list(simulator.latest_energy.values())


@router.get("/ai-analysis")
async def get_energy_ai():
    readings = list(simulator.latest_energy.values())
    return detect_anomalies(readings)


@router.get("/summary")
async def get_energy_summary():
    readings = list(simulator.latest_energy.values())
    if not readings:
        return {}
    total_c = sum(r.get("current_consumption", 0) for r in readings)
    total_cap = sum(r.get("capacity", 1) for r in readings)
    anomalies = sum(1 for r in readings if r.get("is_anomaly"))
    avg_util = sum(r.get("utilization_pct", 0) for r in readings) / len(readings)
    avg_ren = sum(r.get("renewable_pct", 0) for r in readings) / len(readings)
    peak = max(readings, key=lambda x: x.get("current_consumption", 0), default=None)
    return {
        "total_substations": len(readings),
        "total_consumption_kwh": round(total_c, 1),
        "total_capacity_kwh": round(total_cap, 1),
        "avg_utilization_pct": round(avg_util, 1),
        "anomaly_count": anomalies,
        "avg_renewable_pct": round(avg_ren, 1),
        "peak_district": peak.get("district") if peak else None,
    }


@router.get("/history")
async def get_energy_history(limit: int = 100):
    db = SessionLocal()
    try:
        rows = db.query(EnergyReading).order_by(EnergyReading.timestamp.desc()).limit(limit).all()
        return [EnergyReadingOut.model_validate(r) for r in rows]
    finally:
        db.close()
