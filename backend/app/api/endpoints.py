"""
FastAPI Endpoints with Real-Time Event-Based Progress Streaming and Task Staging
"""

import uuid
import json
import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks, status
from fastapi.responses import StreamingResponse
from typing import Dict, Any
from app.schemas.brief_schema import CampaignBriefRequest
from app.agents.orchestrator import agent_orchestrator
from app.schemas.asset_schema import AdCopyVariant, GeneratedVisualAsset
from app.schemas.competitor_schema import CompetitorAdInput
from app.core.event_bus import event_bus, DAGEvent

router = APIRouter(prefix="/api/v1", tags=["Pencil AI Orchestrator"])

# In-memory store for background task results (capped to prevent process growth)
tasks_store: Dict[str, Dict[str, Any]] = {}
MAX_STORED_TASKS = 100

@router.get("/health")
async def health_check():
    # Dynamic models online count check
    return {
        "status": "OPERATIONAL",
        "service": "Pencil AI Marketing OS Engine",
        "models_online": 5, # Mock, Vision, Audio, Compliance, Scoring
        "meta_sdk_status": "CONNECTED"
    }

async def run_pipeline_task(brief_dict: Dict[str, Any], run_id: str):
    tasks_store[run_id] = {"status": "PENDING", "result": None}
    # Enforce tasks_store cap
    if len(tasks_store) > MAX_STORED_TASKS:
        stale_key = next(iter(tasks_store))
        del tasks_store[stale_key]

    try:
        result = await agent_orchestrator.run_pipeline(brief_dict, run_id=run_id)
        tasks_store[run_id] = {"status": result.get("status", "SUCCESS"), "result": result}
    except Exception as e:
        tasks_store[run_id] = {"status": "FAILED", "error": str(e)}
    finally:
        # Terminal event fired AFTER tasks_store is written, so SSE subscribers that
        # break on this are guaranteed a non-null /campaigns/status/{run_id} result.
        # Distinct from PIPELINE_COMPLETED, which fires once per reflexion pass.
        await event_bus.publish(DAGEvent(
            run_id=run_id,
            event_type="RUN_FINALIZED",
            node_name="pipeline",
            stage_index=999,
            data={"status": tasks_store[run_id]["status"]}
        ))

@router.post("/campaigns/orchestrate", status_code=status.HTTP_202_ACCEPTED)
async def orchestrate_campaign(brief: CampaignBriefRequest, background_tasks: BackgroundTasks):
    run_id = f"run_{uuid.uuid4().hex[:12]}"
    background_tasks.add_task(run_pipeline_task, brief.model_dump(), run_id)
    return {"status": "ACCEPTED", "run_id": run_id}

@router.post("/competitor/analyze")
async def analyze_competitor(payload: CompetitorAdInput) -> Dict[str, Any]:
    """Preview a competitor ad analysis without running the full orchestration pipeline."""
    from app.providers import get_provider
    competitor_provider = get_provider("competitor")
    analysis = await competitor_provider.analyze_competitor_ad(payload.model_dump(), {})
    return {"analysis": analysis.model_dump()}

@router.get("/campaigns/status/{run_id}")
async def get_campaign_status(run_id: str):
    if run_id not in tasks_store:
        raise HTTPException(status_code=404, detail="Task execution not found")
    return tasks_store[run_id]

@router.get("/campaigns/stream/{run_id}")
async def stream_orchestrator_progress(run_id: str):
    """Subscribes to EventBus and streams actual real-time DAG execution events over Server-Sent Events."""
    queue = event_bus.subscribe(run_id)

    async def event_generator():
        try:
            while True:
                try:
                    event: DAGEvent = await asyncio.wait_for(queue.get(), timeout=10.0)
                    yield f"data: {event.model_dump_json()}\n\n"
                    if event.event_type == "RUN_FINALIZED":
                        break
                except asyncio.TimeoutError:
                    yield f": heartbeat\n\n"
        finally:
            event_bus.unsubscribe(run_id, queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/meta/publish")
async def publish_to_meta(payload: Dict[str, Any]):
    copy_data = payload.get("copy_data", {})
    visual_data = payload.get("visual_data", {})
    
    headline = copy_data.get("headline", "")
    # Check simple compliance (Dove prohibited claim simulation)
    if "dove" in headline.lower() and payload.get("override_compliance") is not True:
        raise HTTPException(
            status_code=400,
            detail="Staging blocked: Prohibited brand claims detected in ad copy."
        )
        
    try:
        from app.providers import get_provider
        meta_provider = get_provider("meta_sdk")
        copy_obj = AdCopyVariant(
            headline=headline,
            primary_text=copy_data.get("primary_text", ""),
            call_to_action=copy_data.get("call_to_action", "Shop Now"),
            hook_angle="Manual Campaign"
        )
        visual_obj = GeneratedVisualAsset(
            asset_id="manual_hero",
            url=visual_data.get("url") or "http://img.jpg",
            asset_type="IMAGE",
            aspect_ratio="9:16"
        )
        
        staging_result = await meta_provider.stage_creative(copy_obj, visual_obj)
        return {"status": "PUBLISHED", "meta_staging": staging_result.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns")
async def list_campaigns():
    """Retrieves all past staged campaign runs, assets, and performance telemetry from DB."""
    from app.db.session import SessionLocal
    from app.db.models import CampaignModel, AssetModel, TelemetryModel
    
    db = SessionLocal()
    try:
        campaigns = db.query(CampaignModel).all()
        result = []
        for camp in campaigns:
            asset = db.query(AssetModel).filter(AssetModel.campaign_id == camp.id).first()
            telemetry = db.query(TelemetryModel).filter(TelemetryModel.campaign_id == camp.id).first()
            result.append({
                "id": camp.id,
                "product_name": camp.product_name,
                "brand_name": camp.brand_name,
                "status": camp.status,
                "created_at": camp.created_at.isoformat() if camp.created_at else None,
                "asset": {
                    "headline": asset.headline,
                    "primary_text": asset.primary_text,
                    "asset_url": asset.asset_url,
                    "aspect_ratio": asset.aspect_ratio,
                    "models_used": asset.models_used,
                    "predictive_score": asset.predictive_score
                } if asset else None,
                "telemetry": {
                    "roas_uplift": telemetry.roas_uplift,
                    "cpa_reduction": telemetry.cpa_reduction,
                    "meta_creative_id": telemetry.meta_creative_id
                } if telemetry else None
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database fetch failed: {str(e)}")
    finally:
        db.close()

@router.post("/campaigns/clear")
async def clear_campaigns():
    """Clears all campaign runs from the database (for clean local staging)."""
    from app.db.session import SessionLocal
    from app.db.models import CampaignModel, AssetModel, TelemetryModel
    
    db = SessionLocal()
    try:
        db.query(CampaignModel).delete()
        db.query(AssetModel).delete()
        db.query(TelemetryModel).delete()
        db.commit()
        return {"status": "CLEARED"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database clear failed: {str(e)}")
    finally:
        db.close()

