"""
Shared Vertex AI Client Helper

Vertex AI (aiplatform.googleapis.com) is a standard GCP product, so usage is
billed through -- and can draw down -- a Google Cloud Billing account,
including trial/promotional credit. This is distinct from the Gemini
Developer API / AI Studio (generativelanguage.googleapis.com, authenticated
with a bare API key), which Google excludes from Cloud free-trial credit as
of March 2026.

Auth is via Application Default Credentials (ADC): either
`gcloud auth application-default login` locally, or a service account key
referenced by GOOGLE_APPLICATION_CREDENTIALS in production.
"""

import os
import logging
from typing import Optional

logger = logging.getLogger("pencil.providers.vertex")

VERTEX_TEXT_MODEL = "gemini-2.0-flash"
VERTEX_IMAGE_MODEL = "imagen-3.0-generate-002"

_client = None
_client_init_attempted = False


def is_vertex_configured() -> bool:
    return bool(os.getenv("GOOGLE_CLOUD_PROJECT"))


def get_vertex_client() -> Optional["genai.Client"]:  # noqa: F821 - forward ref for optional import
    """
    Lazily builds and caches a single google-genai Client in Vertex mode.
    Returns None (never raises) if the package isn't installed, no project
    is configured, or ADC auth fails -- callers should fall back to mocks.
    """
    global _client, _client_init_attempted

    if _client is not None:
        return _client
    if _client_init_attempted:
        return None
    _client_init_attempted = True

    project = os.getenv("GOOGLE_CLOUD_PROJECT")
    if not project:
        return None

    location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

    try:
        from google import genai
        _client = genai.Client(vertexai=True, project=project, location=location)
        logger.info(f"Vertex AI client initialized (project={project}, location={location}).")
        return _client
    except Exception as e:
        logger.warning(f"Vertex AI client init failed, will fall back to mocks: {e}")
        return None
