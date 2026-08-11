export interface CampaignBrief {
  product_name: string;
  product_description: string;
  target_audience: string;
  target_platforms: string[];
}

export interface AdVariant {
  headline: string;
  primary_text: string;
  call_to_action: string;
  asset_url: string;
  aspect_ratio: string;
  models: {
    copy: string;
    vision: string;
  };
}

export interface PredictiveScores {
  overall_score: number;
  projected_roas_uplift: string;
  projected_cpa_reduction: string;
  hook_rate_confidence: string;
  ad_fatigue_horizon_days: number;
}

export interface CompetitorAdInput {
  ad_copy?: string;
  ad_library_url?: string;
  competitor_brand?: string;
  screenshot_url?: string;
  running_since?: string;
  style_notes?: string;
  source?: 'MANUAL_PASTE' | 'AD_LIBRARY_URL' | 'SCREENSHOT';
}

export interface CompetitorAdAnalysis {
  provided: boolean;
  positioning: string;
  hook_angle: string;
  tone: string;
  claims: string[];
  call_to_action: string;
  inferred_audience: string;
  strengths: string[];
  weaknesses: string[];
  differentiation_angles: string[];
  analyzed_modalities: string[];
  visual_analysis?: Record<string, unknown> | null;
  source_url?: string | null;
  model_used: string;
  error?: string | null;
}

export interface CompetitorComparison {
  competitor: CompetitorAdAnalysis | { provided: false };
  ours: {
    headline: string;
    primary_text: string;
    call_to_action: string;
    hook_angle: string;
    predictive_score?: number;
  };
}

export interface DAGEventPayload {
  run_id: string;
  event_type: 'NODE_STARTED' | 'NODE_COMPLETED' | 'NODE_FAILED' | 'PIPELINE_COMPLETED' | 'RUN_FINALIZED';
  node_name: string;
  stage_index: number;
  data: Record<string, unknown>;
  timestamp: string;
}
