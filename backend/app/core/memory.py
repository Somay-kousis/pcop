"""
Multi-Tier Memory Engine for Brand Persona Learning
Maintains Working Memory, Episodic Checkpoints, and Semantic Learning across runs.
"""

from typing import Dict, Any, List

class MultiTierMemoryEngine:
    def __init__(self):
        # Short-term episodic checkpoints (capped to last 100 runs)
        self.episodic_checkpoints: List[Dict[str, Any]] = []
        
        # Long-term semantic persona memory
        self.semantic_memory: Dict[str, List[str]] = {
            "Dove Global": [
                "Vertical 9:16 video ads with UGC hooks deliver +42% CTR.",
                "Hex swatches #0B1B3D and #D4AF37 achieve highest brand recall."
            ]
        }

    def save_checkpoint(self, state_snapshot: Dict[str, Any]):
        self.episodic_checkpoints.append(state_snapshot)
        # Cap process memory growth
        if len(self.episodic_checkpoints) > 100:
            self.episodic_checkpoints.pop(0)

    def get_brand_learnings(self, brand_name: str) -> List[str]:
        return self.semantic_memory.get(brand_name, [
            "Use natural, off-white aesthetics for standard lifestyle niches.",
            "Short, punchy primary copy achieves highest hook conversions."
        ])

    def learn_from_run(self, brand_name: str, learning_item: str):
        """Allows semantic memory to dynamically persist learnings across campaign runs."""
        if brand_name not in self.semantic_memory:
            self.semantic_memory[brand_name] = []
        # Append learning dynamically
        if learning_item not in self.semantic_memory[brand_name]:
            self.semantic_memory[brand_name].append(learning_item)

memory_engine = MultiTierMemoryEngine()
