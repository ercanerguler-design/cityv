from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.tenant_auth import PlatformUser, Tenant

router = APIRouter()
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


class TenantConfig(BaseModel):
    tenant_id: str
    tenant_name: str
    domain: str
    region: str
    locale: str = "tr"
    theme: str = "cyan"
    data_profile: str = "simulator-default"
    sensor_namespace: str = "default"
    enabled_modules: List[str]


class TenantCreate(TenantConfig):
    pass


class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "tenant_user"
    tenant_id: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str
    host: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    tenant_id: Optional[str]


class UserResponse(BaseModel):
    username: str
    role: str
    is_active: bool
    tenant_id: Optional[str]


def normalize_modules(modules: str) -> List[str]:
    return [m.strip() for m in modules.split(",") if m.strip()]


def tenant_to_dict(tenant: Tenant) -> dict:
    return {
        "tenant_id": tenant.tenant_id,
        "tenant_name": tenant.tenant_name,
        "domain": tenant.domain,
        "region": tenant.region,
        "locale": tenant.locale,
        "theme": tenant.theme,
        "data_profile": tenant.data_profile,
        "sensor_namespace": tenant.sensor_namespace,
        "enabled_modules": normalize_modules(tenant.enabled_modules),
    }


def create_access_token(subject: str, role: str, tenant_id: Optional[str]) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": subject,
        "role": role,
        "tenant_id": tenant_id,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def parse_bearer_token(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid bearer token")
    return parts[1]


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> PlatformUser:
    token = parse_bearer_token(authorization)

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        username = str(payload.get("sub", ""))
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user = db.query(PlatformUser).filter(PlatformUser.username == username).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not active")

    return user


def require_admin(current_user: PlatformUser = Depends(get_current_user)) -> PlatformUser:
    if current_user.role not in {"superadmin", "tenant_admin"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    return current_user


def require_superadmin(current_user: PlatformUser = Depends(get_current_user)) -> PlatformUser:
    if current_user.role != "superadmin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Superadmin role required")
    return current_user


@router.post("/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(PlatformUser).filter(PlatformUser.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")

    tenant_key = None
    if user.tenant:
        tenant_key = user.tenant.tenant_id

    host = (payload.host or "").strip().lower()
    if host.startswith("www."):
        host = host[4:]

    if user.role != "superadmin" and user.tenant and host and host not in {"localhost", "127.0.0.1", user.tenant.domain.lower()}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User is not allowed for domain: {host}",
        )

    token = create_access_token(subject=user.username, role=user.role, tenant_id=tenant_key)
    return TokenResponse(access_token=token, role=user.role, tenant_id=tenant_key)


@router.get("/auth/me")
async def auth_me(current_user: PlatformUser = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "tenant_id": current_user.tenant.tenant_id if current_user.tenant else None,
        "tenant": tenant_to_dict(current_user.tenant) if current_user.tenant else None,
    }


@router.get("/tenants")
async def list_tenants(
    db: Session = Depends(get_db),
    current_user: PlatformUser = Depends(require_admin),
):
    if current_user.role == "superadmin":
        tenants = db.query(Tenant).order_by(Tenant.tenant_name.asc()).all()
    else:
        tenants = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).all()
    return [tenant_to_dict(t) for t in tenants]


@router.post("/tenants")
async def create_tenant(
    payload: TenantCreate,
    db: Session = Depends(get_db),
    current_user: PlatformUser = Depends(require_superadmin),
):
    existing_id = db.query(Tenant).filter(Tenant.tenant_id == payload.tenant_id).first()
    if existing_id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="tenant_id already exists")

    existing_domain = db.query(Tenant).filter(Tenant.domain == payload.domain).first()
    if existing_domain:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="domain already exists")

    tenant = Tenant(
        tenant_id=payload.tenant_id,
        tenant_name=payload.tenant_name,
        domain=payload.domain,
        region=payload.region,
        locale=payload.locale,
        theme=payload.theme,
        data_profile=payload.data_profile,
        sensor_namespace=payload.sensor_namespace,
        enabled_modules=",".join(payload.enabled_modules),
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant_to_dict(tenant)


@router.get("/tenants/{tenant_id}")
async def get_tenant(
    tenant_id: str,
    db: Session = Depends(get_db),
    current_user: PlatformUser = Depends(require_admin),
):
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    if current_user.role != "superadmin" and current_user.tenant_id != tenant.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed for this tenant")

    return tenant_to_dict(tenant)


@router.put("/tenants/{tenant_id}")
async def update_tenant(
    tenant_id: str,
    payload: TenantConfig,
    db: Session = Depends(get_db),
    current_user: PlatformUser = Depends(require_admin),
):
    tenant = db.query(Tenant).filter(Tenant.tenant_id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    if current_user.role != "superadmin" and current_user.tenant_id != tenant.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed for this tenant")

    if payload.domain != tenant.domain:
        existing_domain = db.query(Tenant).filter(Tenant.domain == payload.domain, Tenant.id != tenant.id).first()
        if existing_domain:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="domain already exists")

    tenant.tenant_name = payload.tenant_name
    tenant.domain = payload.domain
    tenant.region = payload.region
    tenant.locale = payload.locale
    tenant.theme = payload.theme
    tenant.data_profile = payload.data_profile
    tenant.sensor_namespace = payload.sensor_namespace
    tenant.enabled_modules = ",".join(payload.enabled_modules)

    db.commit()
    db.refresh(tenant)
    return tenant_to_dict(tenant)


@router.get("/users")
async def list_users(
    db: Session = Depends(get_db),
    current_user: PlatformUser = Depends(require_admin),
):
    if current_user.role == "superadmin":
        users = db.query(PlatformUser).order_by(PlatformUser.username.asc()).all()
    else:
        users = db.query(PlatformUser).filter(PlatformUser.tenant_id == current_user.tenant_id).all()

    result = []
    for user in users:
        result.append({
            "username": user.username,
            "role": user.role,
            "is_active": user.is_active,
            "tenant_id": user.tenant.tenant_id if user.tenant else None,
        })
    return result


@router.post("/users", response_model=UserResponse)
async def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: PlatformUser = Depends(require_admin),
):
    exists = db.query(PlatformUser).filter(PlatformUser.username == payload.username).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="username already exists")

    role = payload.role.strip().lower()
    if role not in {"superadmin", "tenant_admin", "tenant_user"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid role")

    if role == "superadmin" and current_user.role != "superadmin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only superadmin can create superadmin")

    tenant_ref = None
    if role != "superadmin":
        if not payload.tenant_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="tenant_id required")
        tenant_ref = db.query(Tenant).filter(Tenant.tenant_id == payload.tenant_id).first()
        if not tenant_ref:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
        if current_user.role != "superadmin" and current_user.tenant_id != tenant_ref.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed for this tenant")

    user = PlatformUser(
        username=payload.username,
        password_hash=hash_password(payload.password),
        role=role,
        is_active=True,
        tenant_id=tenant_ref.id if tenant_ref else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserResponse(
        username=user.username,
        role=user.role,
        is_active=user.is_active,
        tenant_id=user.tenant.tenant_id if user.tenant else None,
    )


@router.get("/resolve")
async def resolve_tenant(host: str, db: Session = Depends(get_db)):
    normalized = host.strip().lower()
    if normalized.startswith("www."):
        normalized = normalized[4:]

    if normalized in {"", "localhost", "127.0.0.1"}:
        return {
            "tenant_id": "default-global",
            "tenant_name": "City-V Global",
            "domain": normalized or "global.city-v.com",
            "region": "GLOBAL",
            "locale": "en",
            "theme": "cyan",
            "data_profile": "simulator-default",
            "sensor_namespace": "global.default",
            "enabled_modules": ["traffic", "energy", "waste", "safety", "air", "citizens", "venues", "admin"],
        }

    tenant = db.query(Tenant).filter(Tenant.domain == normalized).first()
    if tenant:
        return tenant_to_dict(tenant)

    return {
        "tenant_id": "default-global",
        "tenant_name": "City-V Global",
        "domain": normalized or "global.city-v.com",
        "region": "GLOBAL",
        "locale": "en",
        "theme": "cyan",
        "data_profile": "simulator-default",
        "sensor_namespace": "global.default",
        "enabled_modules": ["traffic", "energy", "waste", "safety", "air", "citizens", "venues", "admin"],
    }
