from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(64), unique=True, index=True, nullable=False)
    tenant_name = Column(String(150), nullable=False)
    domain = Column(String(255), unique=True, index=True, nullable=False)
    region = Column(String(100), nullable=False)
    locale = Column(String(16), default="tr", nullable=False)
    theme = Column(String(32), default="cyan", nullable=False)
    data_profile = Column(String(100), default="simulator-default", nullable=False)
    sensor_namespace = Column(String(100), default="default", nullable=False)
    enabled_modules = Column(String(500), default="traffic,energy,waste,safety,air,citizens,venues,admin", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    users = relationship("PlatformUser", back_populates="tenant", cascade="all, delete")


class PlatformUser(Base):
    __tablename__ = "platform_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), default="tenant_user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    tenant = relationship("Tenant", back_populates="users")
