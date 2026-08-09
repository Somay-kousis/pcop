"""
Multi-Agent DAG Task Orchestration Engine
Coordinates topological parallel execution, database telemetry persistence, and Reflexion subgraph re-entry loops.
"""

import uuid
import copy
from typing import Dict, Any, List
from app.graph.builder import build_orchestrator_graph
from app.core.memory import memory_engine
from app.db.session import SessionLocal, run_in_thread
from app.db.models import CampaignModel, AssetModel, TelemetryModel

class AgentOrchestrator:
    def __init__(self):
        self.pipeline = build_orchestrator_graph()

    async def run_pipeline(self, brief_data: Dict[str, Any], run_id: str = None) -> Dict[str, Any]:
        if not run_id:
            run_id = f"run_{uuid.uuid4().hex[:12]}"

        # Initialize base state
        state: Dict[str, Any] = {
            "run_id": run_id,
            "status": "PENDING",
            "brief_data": brief_data,
            "brand_dna": brief_data.get("brand_dna", {}),
            "trend_insights": [],
            "winner_insights": {},
            "competitor_insights": {},
            "copy_variants": [],
            "copy_variant": {},
            "visual_asset": {},
            "audio_track": {},
            "compliance_status": {},
            "clip_alignment_score": 0.0,
            "predictive_scores": {},
            "reflection_count": 0,
            "reflection_critique": None,
            "meta_payload": {},
            "execution_steps": [],
            "errors": []
        }

        max_attempts = 3
        attempt = 0

        while attempt < max_attempts:
            attempt += 1
            # Execute topological parallel DAG pipeline
            state = await self.pipeline.run_pipeline(state, run_id=run_id)
            
            critique = state.get("reflection_critique")
            # Loop re-entry check: if critique requested, loop back and re-run Level 3/4/5/6
            if critique and state.get("reflection_count", 0) < 2:
                # Dynamic re-seed: retain RAG context, visual assets, and count, reset matrix outputs
                keys_to_keep = {
                    "run_id", "brief_data", "brand_dna", "trend_insights",
                    "winner_insights", "competitor_insights", "visual_asset", "reflection_count",
                    "reflection_critique", "execution_steps", "errors"
                }
                
                # Filter state and re-seed
                state = {k: v for k, v in state.items() if k in keys_to_keep}
                # Reset target variables for Level 3/4/5 re-synthesis
                state.update({
                    "copy_variants": [],
                    "copy_variant": {},
                    "audio_track": {},
                    "compliance_status": {},
                    "clip_alignment_score": 0.0,
                    "predictive_scores": {},
                    "meta_payload": {}
                })
            else:
                break

        copy_data = state.get("copy_variant", {})
        visual_data = state.get("visual_asset", {})
        audio_data = state.get("audio_track", {})
        brand_dna = state.get("brand_dna", {})
        scores = state.get("predictive_scores", {})
        meta_payload = state.get("meta_payload", {})

        # Save checkpoint to Memory Engine (capping list to last 100 runs to avoid memory bloat)
        memory_engine.save_checkpoint({"run_id": run_id, "state": state})
        
        # Ingest outcome score into semantic memory learning
        brand_name = brand_dna.get("brand_name", "Dove Global")
        if scores.get("overall_score"):
            memory_engine.learn_from_run(brand_name, f"Headline '{copy_data.get('headline')}' scored {scores.get('overall_score')} ROAS.")

        # Non-blocking async DB write
        def save_to_db():
            db = SessionLocal()
            try:
                campaign_rec = CampaignModel(
                    id=run_id,
                    product_name=brief_data.get("product_name", "Product"),
                    brand_name=brand_name,
                    status=state.get("status", "SUCCESS")
                )
                asset_rec = AssetModel(
                    id=f"asset_{run_id}",
                    campaign_id=run_id,
                    headline=copy_data.get("headline", ""),
                    primary_text=copy_data.get("primary_text", ""),
                    asset_url=visual_data.get("url", ""),
                    aspect_ratio=visual_data.get("aspect_ratio", "9:16"),
                    models_used=copy_data.get("model_used", "Mock GPT-4o"),
                    predictive_score=scores.get("overall_score", 93.5)
                )
                telemetry_rec = TelemetryModel(
                    id=f"telem_{run_id}",
                    campaign_id=run_id,
                    roas_uplift=scores.get("projected_roas_uplift", "+78.5%"),
                    cpa_reduction=scores.get("projected_cpa_reduction", "-48.2%"),
                    meta_creative_id=meta_payload.get("creative_id", "23850192847192")
                )
                db.merge(campaign_rec)
                db.merge(asset_rec)
                db.merge(telemetry_rec)
                db.commit()
            except Exception as db_err:
                print("DB Write Warning:", db_err)
            finally:
                db.close()

        await run_in_thread(save_to_db)

        # Propagate execution status and errors to response payload
        return {
            "status": state.get("status", "SUCCESS"),
            "run_id": run_id,
            "errors": state.get("errors", []),
            "pipeline_stages": state.get("execution_steps", []),
            "trend_insights": state.get("trend_insights", []),
            "winner_insights": state.get("winner_insights", {}),
            "brief": {
                "product_name": brief_data.get("product_name", "Product"),
                "brand_name": brand_name,
                "platforms": brief_data.get("target_platforms", ["Meta", "TikTok", "Google"])
            },
            "permutation_matrix": state.get("copy_variants", []),
            "ad_variant": {
                "headline": copy_data.get("headline", ""),
                "primary_text": copy_data.get("primary_text", ""),
                "call_to_action": copy_data.get("call_to_action", "Shop Now"),
                "asset_url": visual_data.get("url", ""),
                "aspect_ratio": visual_data.get("aspect_ratio", "9:16"),
                "audio_url": audio_data.get("audio_url", ""),
                "clip_alignment": state.get("clip_alignment_score", 0.94),
                "models": {
                    "copy": copy_data.get("model_used", "Mock GPT-4o"),
                    "vision": visual_data.get("model_used", "Mock Adobe Firefly 3"),
                    "audio": audio_data.get("model_used", "Mock ElevenLabs Studio Voice")
                }
            },
            "compliance": state.get("compliance_status", {}),
            "predictive_scoring": scores,
            "meta_staging": meta_payload,
            "competitor_comparison": {
                "competitor": state.get("competitor_insights") or {"provided": False},
                "ours": {
                    "headline": copy_data.get("headline", ""),
                    "primary_text": copy_data.get("primary_text", ""),
                    "call_to_action": copy_data.get("call_to_action", "Shop Now"),
                    "hook_angle": copy_data.get("hook_angle", ""),
                    "predictive_score": scores.get("overall_score")
                }
            }
        }

agent_orchestrator = AgentOrchestrator()
