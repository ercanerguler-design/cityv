from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.config import settings
from app.models.tenant_auth import Tenant, PlatformUser

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def ensure_seed_data(db: Session) -> None:
    adana = db.query(Tenant).filter(Tenant.tenant_id == "adana-municipality").first()
    if not adana:
        adana = Tenant(
            tenant_id="adana-municipality",
            tenant_name="Adana Metropolitan Municipality",
            domain="adana.city-v.com",
            region="TR-01 / Turkiye",
            locale="tr",
            theme="cyan",
            data_profile="tr-adana-v1",
            sensor_namespace="tr.adana",
            enabled_modules="traffic,energy,waste,safety,air,citizens,venues,admin",
        )
        db.add(adana)

    barcelona = db.query(Tenant).filter(Tenant.tenant_id == "barcelona-city").first()
    if not barcelona:
        barcelona = Tenant(
            tenant_id="barcelona-city",
            tenant_name="Barcelona Smart City",
            domain="barcelona.city-v.com",
            region="ES-CT / Spain",
            locale="en",
            theme="emerald",
            data_profile="es-barcelona-v1",
            sensor_namespace="es.barcelona",
            enabled_modules="traffic,energy,waste,safety,air,citizens,venues,admin",
        )
        db.add(barcelona)

    db.flush()

    admin_user = db.query(PlatformUser).filter(PlatformUser.username == settings.ADMIN_BOOTSTRAP_USERNAME).first()
    if not admin_user:
        db.add(
            PlatformUser(
                username=settings.ADMIN_BOOTSTRAP_USERNAME,
                password_hash=hash_password(settings.ADMIN_BOOTSTRAP_PASSWORD),
                role="superadmin",
                is_active=True,
                tenant_id=None,
            )
        )

    db.commit()
