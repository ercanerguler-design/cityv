"""
Venues / Places router — AVM, kafe, restoran, cadde yoğunluğu
"""
from fastapi import APIRouter
from app.state import simulator
from app.services.venue_analyzer import analyze_venues

router = APIRouter()


@router.get("/live")
async def get_live_venues():
    """Tüm mekanların anlık yoğunluk verisi."""
    return list(simulator.latest_venues.values())


@router.get("/ai-analysis")
async def get_venues_ai():
    """AI tabanlı özet analiz ve öneriler."""
    return analyze_venues(list(simulator.latest_venues.values()))


@router.get("/summary")
async def get_venues_summary():
    """Mekan yoğunluğu genel özeti."""
    return analyze_venues(list(simulator.latest_venues.values()))


@router.get("/by-category/{category}")
async def get_venues_by_category(category: str):
    """Kategoriye göre mekan listesi (mall | cafe | restaurant | street)."""
    return [v for v in simulator.latest_venues.values() if v["category"] == category]


@router.get("/heatmap")
async def get_venues_heatmap():
    """İlçe bazında ortalama yoğunluk haritası."""
    venues = list(simulator.latest_venues.values())
    district_data: dict = {}
    for v in venues:
        district_data.setdefault(v["district"], []).append(v["occupancy_pct"])
    return sorted(
        [
            {
                "district": d,
                "avg_occupancy": round(sum(vals) / len(vals), 1),
                "count": len(vals),
            }
            for d, vals in district_data.items()
        ],
        key=lambda x: x["avg_occupancy"],
        reverse=True,
    )
