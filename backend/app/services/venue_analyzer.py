"""
Venue & Places AI Analyzer
Analyzes occupancy patterns for malls, cafes, restaurants, and streets.
"""
from typing import List, Dict
from datetime import datetime
import math


CATEGORY_LABELS = {
    "mall":       "AVM",
    "cafe":       "Kafe",
    "restaurant": "Restoran",
    "street":     "Cadde",
}

PEAK_HOURS = {
    "mall":       [(11, 15), (17, 21)],
    "cafe":       [(8, 11), (14, 17), (20, 23)],
    "restaurant": [(12, 14), (19, 22)],
    "street":     [(8, 10), (17, 20)],
}


def _in_peak(hour: int, category: str) -> bool:
    for start, end in PEAK_HOURS.get(category, []):
        if start <= hour <= end:
            return True
    return False


def analyze_venues(venues: List[dict]) -> dict:
    if not venues:
        return {}

    hour = datetime.now().hour

    # --- Per-category breakdown ---
    by_category: Dict[str, list] = {}
    for v in venues:
        by_category.setdefault(v["category"], []).append(v)

    category_stats = {}
    for cat, items in by_category.items():
        packed = [i for i in items if i["occupancy_level"] == "PACKED"]
        high   = [i for i in items if i["occupancy_level"] == "HIGH"]
        avg_pct = round(sum(i["occupancy_pct"] for i in items) / len(items), 1)
        busiest = max(items, key=lambda x: x["occupancy_pct"])
        quietest = min(items, key=lambda x: x["occupancy_pct"])
        avg_wait = round(sum(i["wait_minutes"] for i in items) / len(items), 0)
        category_stats[cat] = {
            "label": CATEGORY_LABELS.get(cat, cat),
            "total": len(items),
            "packed_count": len(packed),
            "high_count": len(high),
            "avg_occupancy_pct": avg_pct,
            "avg_wait_minutes": int(avg_wait),
            "busiest_venue": {"name": busiest["name"], "district": busiest["district"], "pct": busiest["occupancy_pct"]},
            "quietest_venue": {"name": quietest["name"], "district": quietest["district"], "pct": quietest["occupancy_pct"]},
            "is_peak_hour": _in_peak(hour, cat),
        }

    # --- District heatmap ---
    district_heat: Dict[str, list] = {}
    for v in venues:
        district_heat.setdefault(v["district"], []).append(v["occupancy_pct"])
    district_scores = [
        {
            "district": d,
            "avg_occupancy": round(sum(vals) / len(vals), 1),
            "venue_count": len(vals),
        }
        for d, vals in district_heat.items()
    ]
    district_scores.sort(key=lambda x: -x["avg_occupancy"])

    # --- Overall metrics ---
    total = len(venues)
    packed_total = sum(1 for v in venues if v["occupancy_level"] == "PACKED")
    high_total   = sum(1 for v in venues if v["occupancy_level"] == "HIGH")
    avg_occupancy_city = round(sum(v["occupancy_pct"] for v in venues) / total, 1)
    avg_wait_city = round(sum(v["wait_minutes"] for v in venues) / total, 0)

    # --- AI Insights ---
    insights = []
    if packed_total > total * 0.25:
        insights.append(f"Şehir geneli yoğunluk kritik — {packed_total} mekan kapasiteye yakın.")
    for cat, stats in category_stats.items():
        if stats["is_peak_hour"] and stats["packed_count"] > 0:
            insights.append(f"{stats['label']} için zirve saati: {stats['packed_count']} mekan tıklım tıklım.")
    if district_scores:
        top = district_scores[0]
        insights.append(f"En yoğun ilçe {top['district']}: ortalama %{top['avg_occupancy']} doluluk.")
    if not insights:
        insights.append("Mekânlar genel olarak sakin, yoğunluk normal seviyelerde.")

    # --- Recommendations ---
    recs = []
    for cat, stats in category_stats.items():
        if stats["packed_count"] >= 2:
            recs.append(f"📍 {stats['label']}: {stats['packed_count']} mekan dolu — alternatif önerilmeli.")
        if stats["avg_wait_minutes"] > 15:
            recs.append(f"⏱ {stats['label']} ortalama bekleme süresi yüksek ({stats['avg_wait_minutes']} dk).")
    if not recs:
        recs.append("Tüm kategorilerde bekleme süresi kabul edilebilir seviyede.")

    # --- Trending ---
    rising_venues = [v["name"] for v in venues if v["trend"] == "rising" and v["occupancy_pct"] > 60][:5]

    return {
        "total_venues": total,
        "avg_occupancy_city": avg_occupancy_city,
        "avg_wait_city": int(avg_wait_city),
        "packed_count": packed_total,
        "high_count": high_total,
        "category_stats": category_stats,
        "district_heatmap": district_scores[:10],
        "busiest_overall": max(venues, key=lambda x: x["occupancy_pct"], default=None),
        "most_crowded_district": district_scores[0]["district"] if district_scores else None,
        "rising_venues": rising_venues,
        "insights": insights,
        "recommendations": recs,
        "hour": hour,
    }
