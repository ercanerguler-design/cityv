"""Traffic AI — congestion prediction and recommendations."""
import numpy as np
from datetime import datetime
from typing import List, Dict, Any


def predict_congestion(readings: List[Dict]) -> Dict[str, Any]:
    if not readings:
        return {"predictions": [], "hotspots": [], "recommendation": "Veri yok."}

    scores = [r.get("congestion_score", 0) for r in readings]
    arr = np.array(scores)

    hotspots = [
        r for r in readings if r.get("congestion_score", 0) >= 0.55
    ]
    hotspots = sorted(hotspots, key=lambda x: x.get("congestion_score", 0), reverse=True)[:5]

    avg_score = float(np.mean(arr))
    max_score = float(np.max(arr))

    hour = datetime.now().hour
    if 7 <= hour <= 10:
        trend = "rising"
        message = "Sabah yoğun saatleri — trafik yükselme trendinde."
    elif 17 <= hour <= 20:
        trend = "rising"
        message = "Akşam yoğun saatleri — trafik kritik seyir ediyor."
    elif 22 <= hour or hour <= 5:
        trend = "falling"
        message = "Gece saatleri — trafik düşük, ideal seyir."
    else:
        trend = "stable"
        message = "Trafik sakin seyiriyor."

    signal_recommendation = []
    if avg_score > 0.7:
        signal_recommendation.append("Tüm koridorlarda yeşil dalga optimizasyonu aktifleştirin.")
        signal_recommendation.append("Alternatif güzergahlar haritaya işaretlendi.")
    elif avg_score > 0.5:
        signal_recommendation.append("Kritik kavşaklarda sinyal sürelerini %20 uzatın.")
    else:
        signal_recommendation.append("Normal sinyal programı aktif, müdahale gerekmiyor.")

    return {
        "avg_congestion_score": round(avg_score, 3),
        "max_congestion_score": round(max_score, 3),
        "trend": trend,
        "message": message,
        "hotspots": [{"location": h.get("location_name"), "score": h.get("congestion_score")} for h in hotspots],
        "signal_recommendations": signal_recommendation,
        "sensors_analyzed": len(readings),
    }
