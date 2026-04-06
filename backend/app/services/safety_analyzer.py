"""Safety Analyzer — risk map and incident pattern analysis."""
from typing import List, Dict, Any
from datetime import datetime, timedelta


SEVERITY_WEIGHTS = {"CRITICAL": 1.0, "HIGH": 0.75, "MEDIUM": 0.5, "LOW": 0.25}
INCIDENT_POLICE_TYPES = {"theft", "vandalism", "traffic_accident"}
INCIDENT_FIRE_TYPES = {"fire"}
INCIDENT_MEDICAL_TYPES = {"medical"}


def analyze_risk(incidents: List[Dict], zone_risks: List[Dict]) -> Dict[str, Any]:
    if not incidents and not zone_risks:
        return {"risk_map": [], "summary": "Aktif olay yok."}

    active = [i for i in incidents if i.get("status") in ("active", "investigating")]
    critical = [i for i in active if i.get("severity") == "CRITICAL"]
    high = [i for i in active if i.get("severity") == "HIGH"]

    # Top risky zones
    sorted_zones = sorted(zone_risks, key=lambda z: z.get("risk_score", 0), reverse=True)

    # Dispatch recommendations
    dispatch_recs = []
    police_needed = sum(1 for i in active if i.get("incident_type") in INCIDENT_POLICE_TYPES)
    fire_needed = sum(1 for i in active if i.get("incident_type") in INCIDENT_FIRE_TYPES)
    medical_needed = sum(1 for i in active if i.get("incident_type") in INCIDENT_MEDICAL_TYPES)

    if police_needed:
        dispatch_recs.append(f"Emniyet: {police_needed} olay için {police_needed * 2} devriye önerilir.")
    if fire_needed:
        dispatch_recs.append(f"İtfaiye: {fire_needed} yangın için ekipler aktif.")
    if medical_needed:
        dispatch_recs.append(f"Sağlık: {medical_needed} tıbbi müdahale için ambulans gönderildi.")

    # Incident type distribution
    type_dist: Dict[str, int] = {}
    for i in incidents:
        t = i.get("incident_type", "other")
        type_dist[t] = type_dist.get(t, 0) + 1

    return {
        "active_incidents": len(active),
        "critical_incidents": len(critical),
        "high_incidents": len(high),
        "total_incidents_analyzed": len(incidents),
        "top_risk_zones": sorted_zones[:5],
        "dispatch_recommendations": dispatch_recs,
        "incident_type_distribution": type_dist,
        "overall_city_risk": "critical" if len(critical) > 3 else "high" if len(critical) > 1 else "moderate" if len(high) > 3 else "low",
        "summary": f"{len(active)} aktif olay, {len(critical)} kritik durum var.",
    }
