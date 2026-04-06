"""Air Quality Analyzer — AQI prediction and health alerts."""
import numpy as np
from typing import List, Dict, Any


AQI_HEALTH_MESSAGES = {
    "Good": "Hava kalitesi iyi. Açık hava aktiviteleri için uygun.",
    "Moderate": "Orta seviyede hava kirliliği. Hassas gruplar dikkatli olmalı.",
    "Unhealthy for Sensitive": "Hassas gruplar için sağlıksız. Dışarıda süre sınırlı tutulmalı.",
    "Unhealthy": "Sağlıksız hava. Uzun süre dışarıda kalmaktan kaçının.",
    "Very Unhealthy": "Çok sağlıksız! Dışarı çıkmayın, pencereleri kapalı tutun.",
    "Hazardous": "Tehlikeli! Acil önlemler alınıyor, iç mekanda kalın.",
}


def analyze_air_quality(readings: List[Dict]) -> Dict[str, Any]:
    if not readings:
        return {"alerts": [], "summary": "Veri yok.", "overall_aqi": 0}

    aqis = np.array([r.get("aqi", 0) for r in readings])
    pm25s = np.array([r.get("pm25", 0) for r in readings])
    pm10s = np.array([r.get("pm10", 0) for r in readings])

    avg_aqi = int(np.mean(aqis))
    max_aqi = int(np.max(aqis))
    avg_pm25 = round(float(np.mean(pm25s)), 1)
    avg_pm10 = round(float(np.mean(pm10s)), 1)

    alerts = [r for r in readings if r.get("alert_active", False)]

    # Worst station
    worst = max(readings, key=lambda r: r.get("aqi", 0))
    category = worst.get("aqi_category", "Good")

    # Trend: simple — if avg > 100 rising
    if avg_aqi > 150:
        trend = "deteriorating"
    elif avg_aqi > 80:
        trend = "moderate"
    else:
        trend = "improving"

    # Recommendations
    recs = []
    if avg_aqi > 150:
        recs.append("Açık hava etkinlikleri iptal edilmeli.")
        recs.append("Okullarda dış mekan faaliyetleri durduruldu.")
    elif avg_aqi > 100:
        recs.append("Hassas gruplar (çocuk, yaşlı) dışarıya çıkmamalı.")
        recs.append("Araç kullanımı azaltılarak hava kalitesi iyileştirilebilir.")
    elif avg_aqi > 50:
        recs.append("Hava kalitesi kabul edilebilir, yoğun egzersizden kaçının.")
    else:
        recs.append("Hava kalitesi mükemmel, tüm aktiviteler serbesttir.")

    return {
        "avg_aqi": avg_aqi,
        "max_aqi": max_aqi,
        "avg_pm25": avg_pm25,
        "avg_pm10": avg_pm10,
        "alert_count": len(alerts),
        "trend": trend,
        "worst_station": worst.get("station_id"),
        "worst_district": worst.get("district"),
        "overall_category": category,
        "health_message": AQI_HEALTH_MESSAGES.get(category, "Durum değerlendiriliyor."),
        "recommendations": recs,
        "stations_analyzed": len(readings),
        "alerts": [
            {"station": a.get("station_id"), "district": a.get("district"), "aqi": a.get("aqi")}
            for a in alerts[:5]
        ],
    }
