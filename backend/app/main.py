import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.websocket_manager import ws_manager
from app.state import simulator
from app.routers import traffic, energy, waste, safety, air_quality, citizen, dashboard, venues, admin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("City-V Platform starting up...")
    init_db()
    await simulator.start(ws_manager)
    yield
    await simulator.stop()
    logger.info("City-V Platform shut down.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Smart City Management Platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(traffic.router, prefix="/api/traffic", tags=["Traffic"])
app.include_router(energy.router, prefix="/api/energy", tags=["Energy"])
app.include_router(waste.router, prefix="/api/waste", tags=["Waste"])
app.include_router(safety.router, prefix="/api/safety", tags=["Safety"])
app.include_router(air_quality.router, prefix="/api/air-quality", tags=["Air Quality"])
app.include_router(citizen.router, prefix="/api/citizens", tags=["Citizens"])
app.include_router(venues.router, prefix="/api/venues", tags=["Venues"])
app.include_router(admin.router, prefix="/api/admin", tags=["Tenant Admin"])


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@app.get("/")
async def root():
    return {
        "name": "City-V Smart City Platform",
        "version": settings.APP_VERSION,
        "status": "operational",
        "modules": ["traffic", "energy", "waste", "safety", "air_quality", "citizens", "venues"],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}
