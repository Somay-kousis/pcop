"""
Competitor Ad & Trend Intelligence RAG Node (Node 2)
"""

from typing import Dict, Any
from app.services.rag_service import rag_service

async def trend_rag_node(state: Dict[str, Any]) -> Dict[str, Any]:
    brief = state.get("brief_data", {})
    target_audience = brief.get("target_audience", "General")
    
    trends = rag_service.retrieve_trending_insights(target_audience)
    
    return {
        "trend_insights": trends,
        "execution_steps": [{"stage": "Competitor Ad & Trend Intelligence RAG", "completed": True}]
    }
