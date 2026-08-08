"""
Pydantic Schemas for Meta Business SDK AdCreative and Marketing API Payloads
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class MetaStagingPayload(BaseModel):
    sdk_interface: str = Field(default="facebook-python-business-sdk", description="Official Meta SDK package")
    image_hash: Optional[str] = Field(default="a4f891b90c12e8f7", description="Meta AdImage hash")
    video_id: Optional[str] = Field(default="108927162983712", description="Meta AdVideo ID")
    creative_id: Optional[str] = Field(default="23850192847192", description="Meta AdCreative ID")
    object_story_spec: Dict[str, Any] = Field(
        default={
            "page_id": "<FACEBOOK_PAGE_ID>",
            "video_data": {
                "title": "Experience Next-Gen Performance",
                "message": "Synthesized by Pencil multi-model engine.",
                "call_to_action": {"type": "SHOP_NOW"}
            }
        },
        description="Object story spec structure"
    )
    status: str = Field(default="READY_FOR_PUBLISH", description="Staging status in Meta Ads Manager")
