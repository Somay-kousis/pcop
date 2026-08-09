"""
Unit Tests for Campaign History and Management REST Endpoints
"""

import unittest
import inspect
import asyncio
from fastapi import BackgroundTasks
from app.api.endpoints import list_campaigns, clear_campaigns, orchestrate_campaign, get_campaign_status
from app.schemas.brief_schema import CampaignBriefRequest

class TestCampaignsAPI(unittest.TestCase):
    def test_campaign_lifecycle_api(self):
        async def run():
            # 1. Clear database initially
            clear_res = await clear_campaigns()
            self.assertEqual(clear_res["status"], "CLEARED")
            
            # 2. Assert empty campaign list
            list_res = await list_campaigns()
            self.assertEqual(len(list_res), 0)
            
            # 3. Create a mock campaign brief
            req = CampaignBriefRequest(
                product_name="Database Test Serum",
                product_description="Test description for database persistence"
            )
            bg_tasks = BackgroundTasks()
            orch_res = await orchestrate_campaign(req, bg_tasks)
            self.assertEqual(orch_res["status"], "ACCEPTED")
            run_id = orch_res["run_id"]
            
            # Execute tasks to trigger database writes
            for task in bg_tasks.tasks:
                if inspect.iscoroutinefunction(task.func):
                    await task.func(*task.args, **task.kwargs)
                else:
                    task.func(*task.args, **task.kwargs)
            
            # 4. Assert listing now contains 1 campaign run
            list_res2 = await list_campaigns()
            self.assertEqual(len(list_res2), 1)
            self.assertEqual(list_res2[0]["product_name"], "Database Test Serum")
            self.assertEqual(list_res2[0]["id"], run_id)
            
        asyncio.run(run())

if __name__ == "__main__":
    unittest.main()
