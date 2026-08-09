"""
Backend Test Suite for Pencil AI
"""

import os

# Must run before any test module imports app.db.session (directly or
# transitively via app.agents.orchestrator / app.api.endpoints), which reads
# DATABASE_URL at import time. Without this, tests share the same
# /tmp/pencil_orchestrator.db as a locally running dev server, and fixture
# rows leak into the real campaign history UI.
os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/pencil_orchestrator_test.db")
