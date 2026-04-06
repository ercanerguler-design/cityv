"""Waste Optimizer — route optimization using greedy nearest-neighbor."""
import math
from typing import List, Dict, Any


def _distance(a: Dict, b: Dict) -> float:
    lat1, lng1 = a.get("lat", 0), a.get("lng", 0)
    lat2, lng2 = b.get("lat", 0), b.get("lng", 0)
    return math.sqrt((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2)


def optimize_routes(containers: List[Dict]) -> Dict[str, Any]:
    if not containers:
        return {"routes": [], "summary": "Toplanacak konteyner yok."}

    urgent = [c for c in containers if c.get("fill_pct", 0) >= 80]
    moderate = [c for c in containers if 60 <= c.get("fill_pct", 0) < 80]

    def build_route(stops: List[Dict], label: str) -> Dict:
        if not stops:
            return None
        # Greedy nearest-neighbor starting from first stop
        route = [stops[0]]
        remaining = stops[1:]
        while remaining:
            last = route[-1]
            nearest = min(remaining, key=lambda c: _distance(last, c))
            route.append(nearest)
            remaining.remove(nearest)
        total_waste = sum(c.get("fill_pct", 0) * c.get("capacity_liters", 240) / 100 for c in route)
        return {
            "route_id": f"ROUTE-{label}",
            "priority": label,
            "stops": [
                {
                    "container_id": c.get("container_id"),
                    "location": c.get("location_name"),
                    "fill_pct": round(c.get("fill_pct", 0), 1),
                    "lat": c.get("lat"),
                    "lng": c.get("lng"),
                }
                for c in route
            ],
            "total_stops": len(route),
            "estimated_duration_min": len(route) * 8,
            "total_waste_liters": round(total_waste, 1),
            "priority_score": round(
                sum(c.get("fill_pct", 0) for c in route) / max(1, len(route)), 1
            ),
        }

    routes = []
    urgent_route = build_route(urgent, "URGENT")
    if urgent_route:
        routes.append(urgent_route)
    moderate_route = build_route(moderate, "MODERATE")
    if moderate_route:
        routes.append(moderate_route)

    avg_fill = sum(c.get("fill_pct", 0) for c in containers) / max(1, len(containers))

    return {
        "routes": routes,
        "urgent_containers": len(urgent),
        "moderate_containers": len(moderate),
        "total_containers": len(containers),
        "avg_fill_pct": round(avg_fill, 1),
        "summary": f"{len(urgent)} acil, {len(moderate)} orta öncelikli konteyner optimize edildi.",
    }
