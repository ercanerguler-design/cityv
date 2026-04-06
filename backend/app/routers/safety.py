from fastapi import APIRouter
from app.state import simulator
from app.services.safety_analyzer import analyze_risk
from app.database import SessionLocal
from app.models.safety import SafetyIncident
from app.schemas.safety import SafetyIncidentOut
from typing import List

router = APIRouter()


def _serialize_incident(i: SafetyIncident) -> dict:
    return {
        "incident_id": i.incident_id, "district": i.district,
        "location_name": i.location_name, "lat": i.lat, "lng": i.lng,
        "incident_type": i.incident_type, "severity": i.severity,
        "severity_score": i.severity_score, "status": i.status,
        "units_dispatched": i.units_dispatched, "description": i.description,
        "timestamp": i.timestamp.isoformat(),
    }


@router.get("/incidents")
async def get_incidents(limit: int = 50, status: str = None):
    db = SessionLocal()
    try:
        q = db.query(SafetyIncident).order_by(SafetyIncident.timestamp.desc())
        if status:
            q = q.filter(SafetyIncident.status == status)
        rows = q.limit(limit).all()
        return [_serialize_incident(i) for i in rows]
    finally:
        db.close()


@router.get("/risk-map")
async def get_risk_map():
    return list(simulator.zone_risks.values())


@router.get("/ai-analysis")
async def get_safety_ai():
    db = SessionLocal()
    try:
        incidents = [
            _serialize_incident(i)
            for i in db.query(SafetyIncident).order_by(SafetyIncident.timestamp.desc()).limit(100).all()
        ]
    finally:
        db.close()
    return analyze_risk(incidents, list(simulator.zone_risks.values()))


@router.get("/summary")
async def get_safety_summary():
    db = SessionLocal()
    try:
        active = db.query(SafetyIncident).filter(
            SafetyIncident.status.in_(["active", "investigating"])
        ).all()
        critical = sum(1 for i in active if i.severity == "CRITICAL")
        units = sum(i.units_dispatched for i in active)
        zones = sorted(simulator.zone_risks.values(), key=lambda z: z.get("risk_score", 0), reverse=True)
        return {
            "active_incidents": len(active),
            "critical_incidents": critical,
            "total_units_dispatched": units,
            "highest_risk_district": zones[0].get("district") if zones else None,
            "incidents_last_24h": db.query(SafetyIncident).count(),
        }
    finally:
        db.close()
