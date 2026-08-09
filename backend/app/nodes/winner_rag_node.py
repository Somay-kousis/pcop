"""
High-ROAS Historical Winner Retrieval Node (Node 3)
"""

from typing import Dict, Any
from app.services.rag_service import rag_service
from app.core.memory import memory_engine

async def winner_rag_node(state: Dict[str, Any]) -> Dict[str, Any]:
    brief = state.get("brief_data", {})
    brand_name = state.get("brand_dna", {}).get("brand_name", "Dove Global")
    
    winners = rag_service.retrieve_historical_winners(brief)
    learnings = memory_engine.get_brand_learnings(brand_name)
    
    return {
        "winner_insights": {
            "historical_winners": winners,
            "semantic_learnings": learnings
        },
        "execution_steps": [{"stage": "Historical High-ROAS Winner RAG Retrieval", "completed": True}]
    }
