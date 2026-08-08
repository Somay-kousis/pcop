"""
FastAPI Server Entry Point for Pencil AI Orchestrator
"""

from dotenv import load_dotenv
# Must run before any app module reads os.getenv() for API keys at import
# time (e.g. app.core.config.Settings), so this import is intentionally
# first, ahead of anything from `app.*`.
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.db.session import engine, Base

# Initialize Database Schema Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pencil AI Operating System API",
    description="Multi-Model Campaign Orchestrator, Predictive Performance Scoring, and Meta SDK Staging API",
    version="2026.4"
)

# CORS Middleware configuration with browser-compliant origin specifications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
async def root():
    return {
        "message": "Pencil AI Marketing OS Backend Operational",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
