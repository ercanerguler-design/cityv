from fastapi import APIRouter, HTTPException
from app.services.citizen_chatbot import process_citizen_report
from app.database import SessionLocal
from app.models.citizen import CitizenReport
from app.schemas.citizen import CitizenReportCreate, CitizenReportOut
from typing import List
from datetime import datetime

router = APIRouter()


@router.post("/report", response_model=CitizenReportOut, status_code=201)
async def submit_report(data: CitizenReportCreate):
    processed = process_citizen_report(data.title, data.description, data.district)
    db = SessionLocal()
    try:
        report = CitizenReport(
            report_id=processed["report_id"],
            category=processed["category"],
            priority=processed["priority"],
            priority_score=processed["priority_score"],
            title=data.title,
            description=data.description,
            district=data.district,
            location_name=data.location_name,
            lat=data.lat,
            lng=data.lng,
            status="pending",
            ai_response=processed["ai_response"],
            timestamp=datetime.utcnow(),
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return CitizenReportOut.model_validate(report)
    finally:
        db.close()


@router.get("/reports", response_model=List[CitizenReportOut])
async def get_reports(limit: int = 50, status: str = None, category: str = None):
    db = SessionLocal()
    try:
        q = db.query(CitizenReport).order_by(CitizenReport.timestamp.desc())
        if status:
            q = q.filter(CitizenReport.status == status)
        if category:
            q = q.filter(CitizenReport.category == category)
        rows = q.limit(limit).all()
        return [CitizenReportOut.model_validate(r) for r in rows]
    finally:
        db.close()


@router.get("/reports/{report_id}", response_model=CitizenReportOut)
async def get_report(report_id: str):
    db = SessionLocal()
    try:
        row = db.query(CitizenReport).filter_by(report_id=report_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="Rapor bulunamadı")
        return CitizenReportOut.model_validate(row)
    finally:
        db.close()


@router.patch("/reports/{report_id}/status")
async def update_status(report_id: str, status: str):
    db = SessionLocal()
    try:
        row = db.query(CitizenReport).filter_by(report_id=report_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="Rapor bulunamadı")
        row.status = status
        if status == "resolved":
            row.resolved_at = datetime.utcnow()
        db.commit()
        return {"report_id": report_id, "status": status}
    finally:
        db.close()


@router.post("/reports/{report_id}/upvote")
async def upvote_report(report_id: str):
    db = SessionLocal()
    try:
        row = db.query(CitizenReport).filter_by(report_id=report_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="Rapor bulunamadı")
        row.upvotes = (row.upvotes or 0) + 1
        db.commit()
        return {"report_id": report_id, "upvotes": row.upvotes}
    finally:
        db.close()


@router.get("/summary")
async def get_citizen_summary():
    db = SessionLocal()
    try:
        from sqlalchemy import func
        total = db.query(CitizenReport).count()
        pending = db.query(CitizenReport).filter_by(status="pending").count()
        in_progress = db.query(CitizenReport).filter_by(status="in_progress").count()
        resolved = db.query(CitizenReport).filter_by(status="resolved").count()
        urgent = db.query(CitizenReport).filter_by(priority="urgent").count()
        top = db.query(CitizenReport.category, func.count(CitizenReport.category)).group_by(
            CitizenReport.category
        ).order_by(func.count(CitizenReport.category).desc()).first()
        return {
            "total_reports": total,
            "pending_count": pending,
            "in_progress_count": in_progress,
            "resolved_count": resolved,
            "urgent_count": urgent,
            "most_common_category": top[0] if top else None,
        }
    finally:
        db.close()
