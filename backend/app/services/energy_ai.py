"""Energy AI — anomaly detection and load balancing."""
import numpy as np
from typing import List, Dict, Any


def detect_anomalies(readings: List[Dict]) -> Dict[str, Any]:
    if not readings:
        return {"anomalies": [], "summary": "Veri yok.", "load_balance_suggestions": []}

    utilizations = np.array([r.get("utilization_pct", 0) for r in readings])
    mean_u = float(np.mean(utilizations))
    std_u = float(np.std(utilizations)) if len(utilizations) > 1 else 1.0

    anomalies = []
    overloaded = []
    underloaded = []

    for r in readings:
        u = r.get("utilization_pct", 0)
        z = (u - mean_u) / max(std_u, 0.01)
        if abs(z) > 2.0 or r.get("is_anomaly", False):
            anomalies.append({
                "substation_id": r.get("substation_id"),
                "district": r.get("district"),
                "utilization_pct": u,
                "z_score": round(z, 2),
                "reason": "Yüksek tüketim anomalisi" if z > 0 else "Düşük tüketim anomalisi",
            })
        if u > 85:
            overloaded.append(r.get("district", ""))
        elif u < 30:
            underloaded.append(r.get("district", ""))

    suggestions = []
    for o in overloaded:
        if underloaded:
            suggestions.append(f"{o} bölgesinden {underloaded[0]} bölgesine yük aktarımı önerilir.")

    total_consumption = sum(r.get("current_consumption", 0) for r in readings)
    total_capacity = sum(r.get("capacity", 1) for r in readings)
    avg_renewable = float(np.mean([r.get("renewable_pct", 0) for r in readings]))

    return {
        "anomaly_count": len(anomalies),
        "anomalies": anomalies[:5],
        "avg_utilization": round(mean_u, 1),
        "total_consumption_kwh": round(total_consumption, 1),
        "total_capacity_kwh": round(total_capacity, 1),
        "grid_health": "critical" if mean_u > 85 else "warning" if mean_u > 70 else "healthy",
        "avg_renewable_pct": round(avg_renewable, 1),
        "load_balance_suggestions": suggestions[:3],
        "substations_analyzed": len(readings),
    }
