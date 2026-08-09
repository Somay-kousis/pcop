"""
End-to-End E2E Flow Integration Test
Validates full request lifecycle from API request to 10-node DAG execution and Meta SDK payload generation.
"""

import unittest
import inspect
import asyncio
from app.api.endpoints import orchestrate_campaign, publish_to_meta, get_campaign_status
from app.schemas.brief_schema import CampaignBriefRequest
from app.core.event_bus import event_bus
from fastapi import BackgroundTasks

class TestE2EFlow(unittest.TestCase):
    def test_full_e2e_orchestration_flow(self):
        async def run():
            req = CampaignBriefRequest(
                product_name="E2E Skincare Serum",
                product_description="Hydrating face serum with hyaluronic acid",
                target_audience="Beauty",
                target_platforms=["Meta", "TikTok"]
            )
            
            # Create mock background tasks
            bg_tasks = BackgroundTasks()
            
            # Step 1: Trigger campaign orchestration (instantly returns 202)
            orch_response = await orchestrate_campaign(req, bg_tasks)
            self.assertEqual(orch_response["status"], "ACCEPTED")
            run_id = orch_response["run_id"]
            
            # Run background tasks manually
            for task in bg_tasks.tasks:
                if inspect.iscoroutinefunction(task.func):
                    await task.func(*task.args, **task.kwargs)
                else:
                    task.func(*task.args, **task.kwargs)
            
            # Step 2: Poll status endpoint to retrieve completed result
            status_response = await get_campaign_status(run_id)
            self.assertEqual(status_response["status"], "SUCCESS")
            result = status_response["result"]
            
            self.assertIn("ad_variant", result)
            self.assertIn("headline", result["ad_variant"])

            # Step 3: Publish staged variant to Meta API
            pub_response = await publish_to_meta({
                "copy_data": {
                    "headline": result["ad_variant"]["headline"],
                    "primary_text": result["ad_variant"]["primary_text"]
                },
                "visual_data": {"url": result["ad_variant"]["asset_url"]}
            })
            self.assertEqual(pub_response["status"], "PUBLISHED")
            self.assertEqual(pub_response["meta_staging"]["status"], "READY_FOR_PUBLISH")
            self.assertIn("competitor_comparison", result)

        asyncio.run(run())

    def test_run_finalized_after_store_write(self):
        async def run():
            req = CampaignBriefRequest(
                product_name="RUN_FINALIZED Guard Product",
                product_description="Guards the SSE terminal event contract"
            )
            bg_tasks = BackgroundTasks()
            orch_response = await orchestrate_campaign(req, bg_tasks)
            run_id = orch_response["run_id"]

            queue = event_bus.subscribe(run_id)

            for task in bg_tasks.tasks:
                if inspect.iscoroutinefunction(task.func):
                    await task.func(*task.args, **task.kwargs)
                else:
                    task.func(*task.args, **task.kwargs)

            events_received = []
            while not queue.empty():
                evt = await queue.get()
                events_received.append(evt)
            event_bus.unsubscribe(run_id, queue)

            # The last event must be the terminal RUN_FINALIZED, and by the time
            # it fires, tasks_store must already hold a non-null result -- this
            # guards against the race the Phase 0 fix eliminates.
            self.assertEqual(events_received[-1].event_type, "RUN_FINALIZED")
            status_response = await get_campaign_status(run_id)
            self.assertIsNotNone(status_response["result"])

        asyncio.run(run())

if __name__ == "__main__":
    unittest.main()
