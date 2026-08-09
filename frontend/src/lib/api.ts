export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:8000/api/v1';

export interface OrchestrateAcceptedResponse {
  status: string;
  run_id: string;
}

export async function orchestrateCampaign(body: Record<string, unknown>): Promise<OrchestrateAcceptedResponse> {
  const response = await fetch(`${API_BASE}/campaigns/orchestrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`Orchestration request failed: ${response.status}`);
  }
  return response.json();
}

export async function getCampaignStatus(runId: string): Promise<{ status: string; result: any; error?: string }> {
  const response = await fetch(`${API_BASE}/campaigns/status/${runId}`);
  if (!response.ok) {
    throw new Error(`Status fetch failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchCampaignHistory(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/campaigns`);
  if (!response.ok) {
    throw new Error(`History fetch failed: ${response.status}`);
  }
  return response.json();
}

export async function clearCampaignHistory(): Promise<void> {
  const response = await fetch(`${API_BASE}/campaigns/clear`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Clear history failed: ${response.status}`);
  }
}

export function openOrchestrationStream(runId: string): EventSource {
  return new EventSource(`${API_BASE}/campaigns/stream/${runId}`);
}
