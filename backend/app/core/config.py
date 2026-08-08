"""
Core Application Settings and Environment Variables
"""

import os
from pydantic import BaseModel, Field

class Settings(BaseModel):
    app_name: str = "Pencil AI Marketing Operating System"
    version: str = "2026.4"
    environment: str = os.getenv("ENVIRONMENT", "development")
    port: int = int(os.getenv("PORT", "8000"))
    
    # API Keys
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")

    # Vertex AI (billed as a standard GCP product -- draws on Cloud Billing
    # credit, unlike the bare gemini_api_key above which hits the AI Studio
    # endpoint excluded from Cloud trial credit as of March 2026)
    google_cloud_project: str = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    google_cloud_location: str = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    
    # Meta Business SDK
    meta_system_user_token: str = os.getenv("META_SYSTEM_USER_TOKEN", "EAAG_MOCK_TOKEN")
    meta_ad_account_id: str = os.getenv("META_AD_ACCOUNT_ID", "act_unilever_global_01")
    meta_page_id: str = os.getenv("META_PAGE_ID", "108927162983712")

settings = Settings()
