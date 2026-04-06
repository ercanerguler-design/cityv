from fastapi import APIRouter
from app.state import simulator
from app.services.waste_optimizer import optimize_routes
from app.services.waste_analyzer import analyze_waste
from app.database import SessionLocal
from app.models.waste import WasteContainer
from app.schemas.waste import WasteContainerOut
from typing import List

router = APIRouter()


@router.get("/live", response_model=List[dict])
async def get_live_waste():
    return list(simulator.latest_waste.values())


@router.get("/optimize-routes")
async def get_optimized_routes():
    containers = list(simulator.latest_waste.values())
    return optimize_routes(containers)


@router.get("/ai-analysis")
async def get_waste_ai():
    containers = list(simulator.latest_waste.values())
    return analyze_waste(containers)


@router.get("/summary")
async def get_waste_summary():
    containers = list(simulator.latest_waste.values())
    if not containers:
        return {}
    needs = sum(1 for c in containers if c.get("needs_collection"))
    overfull = sum(1 for c in containers if c.get("fill_pct", 0) >= 90)
    avg_fill = sum(c.get("fill_pct", 0) for c in containers) / len(containers)
    recycling = sum(1 for c in containers if c.get("container_type") == "recycling")
    recycling_pct = (recycling / len(containers)) * 100
    return {
        "total_containers": len(containers),
        "needs_collection_count": needs,
        "avg_fill_pct": round(avg_fill, 1),
        "overfull_count": overfull,
        "recycling_pct": round(recycling_pct, 1),
    }


@router.get("/history")
async def get_waste_history(limit: int = 100):
    db = SessionLocal()
    try:
        rows = db.query(WasteContainer).order_by(WasteContainer.timestamp.desc()).limit(limit).all()
        return [WasteContainerOut.model_validate(r) for r in rows]
    finally:
        db.close()
