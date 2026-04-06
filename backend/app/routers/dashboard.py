from fastapi import APIRouter
from app.state import simulator
from app.services.traffic_ai import predict_congestion
from app.services.energy_ai import detect_anomalies
from app.services.air_quality_analyzer import analyze_air_quality
from app.services.waste_optimizer import optimize_routes
from app.services.safety_analyzer import analyze_risk
from app.database import SessionLocal
from app.models.safety import SafetyIncident, SafetyZoneRisk

router = APIRouter()


@router.get("/summary")
async def get_dashboard_summary():
    sim = simulator
    traffic_data = list(sim.latest_traffic.values())
    energy_data = list(sim.latest_energy.values())
    air_data = list(sim.latest_air.values())
    waste_data = list(sim.latest_waste.values())

    db = SessionLocal()
    try:
        incidents = [
            {
                "incident_id": i.incident_id, "district": i.district,
                "location_name": i.location_name, "lat": i.lat, "lng": i.lng,
                "incident_type": i.incident_type, "severity": i.severity,
                "severity_score": i.severity_score, "status": i.status,
                "units_dispatched": i.units_dispatched, "description": i.description,
                "timestamp": i.timestamp.isoformat(),
            }
            for i in db.query(SafetyIncident).order_by(SafetyIncident.timestamp.desc()).limit(50).all()
        ]
    finally:
        db.close()

    traffic_ai = predict_congestion(traffic_data)
    energy_ai = detect_anomalies(energy_data)
    air_ai = analyze_air_quality(air_data)
    safety_ai = analyze_risk(incidents, list(sim.zone_risks.values()))

    critical_traffic = sum(1 for t in traffic_data if t.get("congestion_level") == "CRITICAL")
    energy_anomalies = sum(1 for e in energy_data if e.get("is_anomaly"))
    waste_alerts = sum(1 for w in waste_data if w.get("needs_collection"))
    air_alerts = sum(1 for a in air_data if a.get("alert_active"))

    return {
        "city": "İstanbul",
        "platform": "City-V",
        "overall_health": _compute_health(critical_traffic, energy_anomalies, waste_alerts, air_alerts),
        "kpis": {
            "traffic_critical_sensors": critical_traffic,
            "energy_anomalies": energy_anomalies,
            "waste_collection_alerts": waste_alerts,
            "air_quality_alerts": air_alerts,
            "active_incidents": safety_ai.get("active_incidents", 0),
        },
        "ai_insights": {
            "traffic": traffic_ai.get("message"),
            "energy": f"{energy_ai.get('anomaly_count', 0)} anomali tespit edildi, ızgara durumu: {energy_ai.get('grid_health')}.",
            "air": air_ai.get("health_message"),
            "safety": safety_ai.get("summary"),
        },
        "traffic_ai": traffic_ai,
        "energy_ai": energy_ai,
        "air_ai": air_ai,
        "safety_ai": safety_ai,
    }


def _compute_health(critical_traffic, energy_anomalies, waste_alerts, air_alerts):
    score = 100
    score -= critical_traffic * 5
    score -= energy_anomalies * 8
    score -= waste_alerts * 2
    score -= air_alerts * 10
    score = max(0, min(100, score))
    if score >= 80:
        return {"score": score, "label": "Sağlıklı", "color": "green"}
    elif score >= 60:
        return {"score": score, "label": "İyi", "color": "yellow"}
    elif score >= 40:
        return {"score": score, "label": "Dikkat", "color": "orange"}
    else:
        return {"score": score, "label": "Kritik", "color": "red"}
