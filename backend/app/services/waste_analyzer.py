from typing import Any, Dict, List


def _priority(fill_pct: float) -> str:
    if fill_pct >= 90:
        return "critical"
    if fill_pct >= 75:
        return "high"
    if fill_pct >= 55:
        return "moderate"
    return "low"


def analyze_waste(containers: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not containers:
        return {
            "summary": "Atik verisi yok.",
            "total_containers": 0,
            "avg_fill_pct": 0,
            "critical_count": 0,
            "high_count": 0,
            "insights": [],
            "route_recommendations": [],
            "district_hotspots": [],
        }

    total = len(containers)
    avg_fill = round(sum(float(c.get("fill_pct", 0)) for c in containers) / total, 1)

    critical = [c for c in containers if float(c.get("fill_pct", 0)) >= 90]
    high = [c for c in containers if 75 <= float(c.get("fill_pct", 0)) < 90]

    district_map: Dict[str, List[float]] = {}
    for c in containers:
        district = str(c.get("district", "Bilinmiyor"))
        district_map.setdefault(district, []).append(float(c.get("fill_pct", 0)))

    district_hotspots = []
    for district, values in district_map.items():
        district_hotspots.append(
            {
                "district": district,
                "avg_fill_pct": round(sum(values) / len(values), 1),
                "container_count": len(values),
            }
        )
    district_hotspots.sort(key=lambda x: x["avg_fill_pct"], reverse=True)

    top_for_route = sorted(
        containers,
        key=lambda x: float(x.get("fill_pct", 0)),
        reverse=True,
    )[:8]

    route_recommendations = [
        {
            "container_id": c.get("container_id"),
            "district": c.get("district"),
            "city": c.get("city"),
            "fill_pct": round(float(c.get("fill_pct", 0)), 1),
            "priority": _priority(float(c.get("fill_pct", 0))),
        }
        for c in top_for_route
    ]

    insights: List[str] = []
    if len(critical) > 0:
        insights.append(f"{len(critical)} konteyner kritik seviyede (%90+).")
    if len(high) > 0:
        insights.append(f"{len(high)} konteyner yuksek dolulukta (%75+).")
    if district_hotspots:
        top = district_hotspots[0]
        insights.append(f"En yogun bolge: {top['district']} (%{top['avg_fill_pct']}).")
    if avg_fill < 55:
        insights.append("Genel doluluk dusuk; mevcut toplama frekansi yeterli.")

    if not insights:
        insights.append("Atik toplama sistemi stabil calisiyor.")

    summary = "Kritik toplama gerekli" if len(critical) > 0 else "Durum kontrol altinda"

    return {
        "summary": summary,
        "total_containers": total,
        "avg_fill_pct": avg_fill,
        "critical_count": len(critical),
        "high_count": len(high),
        "insights": insights,
        "route_recommendations": route_recommendations,
        "district_hotspots": district_hotspots[:10],
    }
