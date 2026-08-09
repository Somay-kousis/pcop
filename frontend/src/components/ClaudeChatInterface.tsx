import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Sparkles, Cpu, Layers, ShieldCheck, TrendingUp, Zap, Play,
  CheckCircle2, Copy, Download, RefreshCw, Sliders, ChevronDown,
  Bot, User, Image, Video, Music, Code, ExternalLink, ArrowUpRight, Terminal, HelpCircle, Loader2, AlertTriangle
} from 'lucide-react';
import { CustomizerState } from './CustomizerDrawer';
import { CompetitorAdInput, CompetitorAdDraft, EMPTY_COMPETITOR_DRAFT } from './CompetitorAdInput';
import { CompetitorComparison } from './CompetitorComparison';
import { CompetitorComparison as CompetitorComparisonType, DAGEventPayload } from '../types';
import { orchestrateCampaign, getCampaignStatus, openOrchestrationStream, fetchCampaignHistory, clearCampaignHistory } from '../lib/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  runId?: string;
  isLive?: boolean;
  errorText?: string;
  pipelineProgress?: {
    stage: string;
    completed: boolean;
    failed?: boolean;
  }[];
  competitorComparison?: CompetitorComparisonType;
  generatedAd?: {
    headline: string;
    primaryText: string;
    cta: string;
    platform: string;
    predictiveScore: number;
    roasUplift: string;
    cpaReduction: string;
    imageUrl: string;
    aspectRatio: string;
    models: {
      copy: string;
      vision: string;
    };
    status: 'GENERATED' | 'COMPLIANT' | 'PUBLISHED_TO_META';
  };
}

// Human-readable labels for DAG event node_name values, keyed to backend/app/graph/builder.py
const NODE_LABELS: Record<string, string> = {
  parse_brief: 'Ingest Brief & Brand DNA Sync',
  trend_rag: 'Competitor & Trend Intelligence RAG',
  winner_rag: 'Historical Winner Retrieval RAG',
  competitor_analysis: 'Competitor Ad Analysis',
  visual: 'Visual Hero Synthesis',
  copy_matrix: 'Multi-Model Copywriter Matrix',
  scoring: 'Predictive Performance Scoring',
  audio: 'Neural Voiceover Synthesis',
  compliance: 'Brand Safety & IP Guardrail Check',
  clip_alignment: 'CLIP Text-Image Alignment',
  reflection_loop: 'Reflexion Self-Correction Gate',
  meta_staging: 'Meta Business SDK Staging'
};

interface ClaudeChatInterfaceProps {
  customizer: CustomizerState;
  onOpenCustomizer: () => void;
}

export const ClaudeChatInterface: React.FC<ClaudeChatInterfaceProps> = ({
  customizer,
  onOpenCustomizer
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      timestamp: '10:40 AM',
      text: "Welcome to Pencil AI Operating System. I am your multi-model campaign orchestrator. Select an ad template card below, customize your brand DNA, or type a brief to begin generating pre-scored ad variants.",
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [historyCampaigns, setHistoryCampaigns] = useState<any[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [competitorDraft, setCompetitorDraft] = useState<CompetitorAdDraft>(EMPTY_COMPETITOR_DRAFT);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      esRef.current?.close();
      stopPolling();
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await fetchCampaignHistory();
      setHistoryCampaigns(data);
    } catch (e) {
      console.error("Failed to fetch campaign history:", e);
    }
  };

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await clearCampaignHistory();
      setHistoryCampaigns([]);
    } catch (e) {
      console.error("Failed to clear campaigns:", e);
    } finally {
      setIsClearing(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!showDashboard) {
      scrollToBottom();
    }
  }, [messages, isGenerating, showDashboard]);

  // Initial prompt templates (Gemini-style quick start cards)
  const templateCards = [
    {
      title: "UGC Video Hook",
      desc: "Wellness-oriented Problem-Solution reel",
      prompt: "Create a high-impact UGC video hook for Dove Hydrating Cream targeting wellness-oriented audiences."
    },
    {
      title: "E-commerce Hero Product",
      desc: "Premium skincare serum high-contrast ad",
      prompt: "Generate an elegant e-commerce product hero ad for Dove Premium Serum with high-contrast visuals."
    },
    {
      title: "Urgent Flash Sale Carousel",
      desc: "Limited-time promo with bold CTA hooks",
      prompt: "Draft a limited-time flash sale promo carousel with bold CTAs for our summer cream collection."
    },
    {
      title: "Dermatologist Social Proof",
      desc: "Science-backed social credibility variant",
      prompt: "Design a problem-solution social proof ad variant highlighting dermatologist recommendations."
    }
  ];

  // AI assistant follow-up helpers to prevent user from forgetting parameters
  const followUpSuggestions = [
    { label: "Target 9:16 aspect ratio", action: () => setInputPrompt((prev) => prev + " Target aspect ratio is 9:16.") },
    { label: "Add Meta & TikTok target platforms", action: () => setInputPrompt((prev) => prev + " Optimize for Meta and TikTok.") },
    { label: "Inject urgency hooks", action: () => setInputPrompt((prev) => prev + " Inject limited-time urgency hooks.") }
  ];

  const updateMessage = (id: string, patch: Partial<Message> | ((m: Message) => Partial<Message>)) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...(typeof patch === 'function' ? patch(m) : patch) } : m))
    );
  };

  const upsertStage = (id: string, stageKey: string, update: { completed: boolean; failed?: boolean }) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const stages = m.pipelineProgress ? [...m.pipelineProgress] : [];
        const label = NODE_LABELS[stageKey] || stageKey;
        const idx = stages.findIndex((s) => s.stage === label);
        if (idx >= 0) {
          stages[idx] = { ...stages[idx], ...update };
        } else {
          stages.push({ stage: label, completed: update.completed, failed: update.failed });
        }
        return { ...m, pipelineProgress: stages };
      })
    );
  };

  const fetchFinalResult = async (assistantId: string, runId: string, attempt = 0) => {
    stopPolling();
    try {
      const status = await getCampaignStatus(runId);
      if (!status.result) {
        if (attempt < 5) {
          setTimeout(() => fetchFinalResult(assistantId, runId, attempt + 1), 400);
          return;
        }
        updateMessage(assistantId, { isLive: false, errorText: 'Pipeline finished but no result was persisted.' });
        setIsGenerating(false);
        return;
      }

      const data = status.result;
      updateMessage(assistantId, {
        isLive: false,
        text: `Orchestrated multi-agent pipeline. Below is the generated pre-scored creative variant:`,
        pipelineProgress: data.pipeline_stages || [],
        competitorComparison: data.competitor_comparison,
        generatedAd: {
          headline: data.ad_variant.headline,
          primaryText: data.ad_variant.primary_text,
          cta: data.ad_variant.call_to_action,
          platform: 'Meta & TikTok',
          predictiveScore: data.predictive_scoring?.overall_score ?? 0,
          roasUplift: data.predictive_scoring?.projected_roas_uplift ?? '',
          cpaReduction: data.predictive_scoring?.projected_cpa_reduction ?? '',
          imageUrl: data.ad_variant.asset_url,
          aspectRatio: data.ad_variant.aspect_ratio || customizer.aspectRatio,
          models: data.ad_variant.models,
          status: 'GENERATED'
        }
      });
    } catch (err) {
      updateMessage(assistantId, { isLive: false, errorText: 'Failed to fetch the final campaign result.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isGenerating) return;

    // Only one live stream at a time -- close any previous one before starting a new run.
    esRef.current?.close();
    esRef.current = null;
    retryRef.current = 0;
    stopPolling();

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputPrompt
    };

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: assistantId,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Running the multi-agent DAG pipeline...',
        isLive: true,
        pipelineProgress: []
      }
    ]);

    const currentInput = inputPrompt;
    setInputPrompt('');
    setIsGenerating(true);

    const requestBody: Record<string, unknown> = {
      product_name: currentInput,
      product_description: currentInput,
      target_audience: "General Performance Audience",
      target_platforms: ["Meta", "TikTok", "Google"],
      brand_dna: {
        brand_name: "Dove Global",
        hex_palette: customizer.colorPalette,
        primary_font: customizer.font,
        prohibited_claims: customizer.prohibitedClaims
          ? customizer.prohibitedClaims.split(',').map(s => s.trim()).filter(Boolean)
          : ["100% cure", "guaranteed wealth"]
      },
      customizer: {
        llm_model: customizer.llmModel,
        vision_model: customizer.visionModel,
        motion_model: customizer.motionModel,
        audio_model: customizer.voiceModel,
        target_aspect_ratios: [customizer.aspectRatio],
        product_image_url: customizer.productImageUrl
      }
    };

    // The backend's one-of validator 422s on an empty competitor object, so only
    // include it when the user actually typed something.
    if (competitorDraft.ad_copy.trim()) {
      requestBody.competitor_ad = {
        ad_copy: competitorDraft.ad_copy,
        ad_library_url: competitorDraft.ad_library_url || undefined,
        competitor_brand: competitorDraft.competitor_brand || undefined,
        source: 'MANUAL_PASTE'
      };
    }

    try {
      const { run_id } = await orchestrateCampaign(requestBody);
      updateMessage(assistantId, { runId: run_id });

      const es = openOrchestrationStream(run_id);
      esRef.current = es;

      // Safety net: EventSource silently auto-reconnects on any network
      // blip, and the backend's replay buffer only survives a reconnect if
      // the terminal RUN_FINALIZED event hadn't already been published --
      // otherwise it's gone and the stream just sits on heartbeats forever
      // with no error to catch. Poll the authoritative status endpoint
      // directly so the UI can never hang indefinitely even if that event
      // is missed.
      pollRef.current = setInterval(async () => {
        try {
          const status = await getCampaignStatus(run_id);
          if (status.status !== 'PENDING') {
            if (esRef.current === es) {
              es.close();
              esRef.current = null;
            }
            fetchFinalResult(assistantId, run_id);
          }
        } catch {
          // Transient network hiccup on the poll itself -- let it retry next tick.
        }
      }, 5000);

      es.onmessage = (evt) => {
        let event: DAGEventPayload;
        try {
          event = JSON.parse(evt.data);
        } catch {
          return; // heartbeat/comment lines never reach onmessage, but guard anyway
        }

        if (event.event_type === 'NODE_STARTED') {
          upsertStage(assistantId, event.node_name, { completed: false });
        } else if (event.event_type === 'NODE_COMPLETED') {
          upsertStage(assistantId, event.node_name, { completed: true });
        } else if (event.event_type === 'NODE_FAILED') {
          upsertStage(assistantId, event.node_name, { completed: true, failed: true });
        } else if (event.event_type === 'RUN_FINALIZED') {
          // Explicit close is required: EventSource auto-reconnects on any
          // stream close, and the event bus drops its replay buffer once the
          // last subscriber unsubscribes -- a reconnect here would hang on
          // heartbeats forever with no events left to replay.
          es.close();
          esRef.current = null;
          fetchFinalResult(assistantId, run_id);
        }
      };

      es.onerror = () => {
        // The polling safety net above is still running independently, so a
        // dropped SSE connection alone is not fatal -- only give up on the
        // stream itself. If polling later finds the run actually finished
        // server-side, fetchFinalResult() will still replace this error
        // with the real result.
        if (es.readyState === EventSource.CLOSED) {
          updateMessage(assistantId, { errorText: 'Lost connection to the live progress stream -- still waiting for the result.' });
          return;
        }
        retryRef.current += 1;
        if (retryRef.current > 2) {
          es.close();
          esRef.current = null;
          updateMessage(assistantId, { errorText: 'Orchestrator stream kept dropping -- still waiting for the result via polling.' });
        }
      };
    } catch (err) {
      updateMessage(assistantId, {
        isLive: false,
        text: '',
        errorText: 'Could not reach the Pencil AI backend. Is it running on localhost:8000?'
      });
      setIsGenerating(false);
    }
  };

  const handlePublishToMeta = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.generatedAd
          ? {
              ...m,
              generatedAd: { ...m.generatedAd, status: 'PUBLISHED_TO_META' }
            }
          : m
      )
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18181B] text-[#F4F4F5] overflow-hidden">
      
      {/* Top Claude-Style Header Bar */}
      <div className="h-14 border-b border-[#333333] bg-[#141416] px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-white">Pencil Campaign Studio</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D97757]/10 text-[#D97757] border border-[#D97757]/30">
            {customizer.template}
          </span>
        </div>

        {/* Top Controls & Customizer Toggle */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <button
            onClick={() => {
              if (!showDashboard) fetchHistory();
              setShowDashboard(!showDashboard);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262626] border border-[#333333] hover:border-gray-500 text-white font-sans transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#D97757]" />
            <span>{showDashboard ? "Show Chat Studio" : "Campaign History"}</span>
          </button>

          <button
            onClick={onOpenCustomizer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262626] border border-[#333333] hover:border-gray-500 text-white font-sans transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[#D97757]" />
            <span>Customize Template & Models</span>
          </button>
        </div>
      </div>

      {/* Dynamic Content: Chat Studio or Campaign History Dashboard */}
      {showDashboard ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between border-b border-[#333333] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Staged Campaigns Audit</h2>
              <p className="text-xs text-[#A1A1AA]">Staging logs persisted in backend SQLite database</p>
            </div>
            <button
              onClick={handleClearHistory}
              disabled={isClearing || historyCampaigns.length === 0}
              className="px-4 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 font-bold transition-all disabled:opacity-30 disabled:cursor-default"
            >
              {isClearing ? "Clearing..." : "Clear Staging History"}
            </button>
          </div>

          {historyCampaigns.length === 0 ? (
            <div className="p-8 text-center bg-[#1C1C1E] border border-[#333333] rounded-2xl space-y-3">
              <Layers className="w-12 h-12 text-[#71717A] mx-auto animate-pulse" />
              <div className="text-sm font-bold text-white">No staged campaigns found</div>
              <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto leading-relaxed">
                Run campaign orchestration from the Chat Studio to persist telemetry data and stage visual assets to Meta.
              </p>
              <button
                onClick={() => setShowDashboard(false)}
                className="mt-2 px-4 py-2 rounded-lg bg-[#D97757] text-white hover:bg-[#C15C3D] font-bold transition-colors"
              >
                Go to Chat Studio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {historyCampaigns.map((camp) => (
                <div key={camp.id} className="bg-[#1C1C1E] border border-[#333333] rounded-2xl overflow-hidden shadow-md">
                  {/* Row Header */}
                  <div className="px-4 py-3 bg-[#262626] border-b border-[#333333] flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{camp.product_name}</span>
                      <span className="text-[10px] text-[#A1A1AA]">({camp.brand_name})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        camp.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                        camp.status === "PARTIAL" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" :
                        "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}>
                        {camp.status}
                      </span>
                      <span className="text-[10px] text-[#A1A1AA]">{camp.id}</span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Staged Assets Info */}
                    <div className="md:col-span-7 space-y-3">
                      {camp.asset ? (
                        <>
                          <div>
                            <div className="text-[9px] font-mono text-[#A1A1AA] uppercase">Headline</div>
                            <div className="text-xs font-bold text-white mt-0.5">{camp.asset.headline}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-mono text-[#A1A1AA] uppercase">Primary Text</div>
                            <p className="text-[11px] text-[#D4D4D8] leading-relaxed bg-[#141416] p-2.5 rounded-lg border border-[#333333] mt-1">
                              {camp.asset.primary_text}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-mono">
                            <div>
                              <span className="text-[#A1A1AA]">Ratio:</span> <span className="text-white">{camp.asset.aspect_ratio}</span>
                            </div>
                            <div>
                              <span className="text-[#A1A1AA]">Predictive Score:</span> <span className="text-[#D97757] font-bold">{camp.asset.predictive_score}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-[#A1A1AA]">No copy asset generated.</div>
                      )}
                    </div>

                    {/* Staged Visual & Staging Specs */}
                    <div className="md:col-span-5 flex flex-col justify-between space-y-3 bg-[#141416] p-3 rounded-xl border border-[#333333]">
                      {camp.asset && camp.asset.asset_url && (
                        <div className="aspect-video relative rounded-lg overflow-hidden border border-[#333333] bg-[#18181B]">
                          <img src={camp.asset.asset_url} alt="Staged Ad Visual" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {camp.telemetry ? (
                        <div className="space-y-1.5 font-mono text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-[#A1A1AA]">Projected ROAS Lift:</span>
                            <span className="text-emerald-400 font-bold">{camp.telemetry.roas_uplift}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A1A1AA]">CPA Reduction:</span>
                            <span className="text-emerald-400 font-bold">{camp.telemetry.cpa_reduction}</span>
                          </div>
                          <div className="flex justify-between border-t border-[#333333] pt-1 mt-1 text-[9px]">
                            <span className="text-[#A1A1AA]">Meta Creative ID:</span>
                            <span className="text-[#D97757] font-bold">{camp.telemetry.meta_creative_id}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-amber-500 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                          Staging blocked due to brand safety violations.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Main Chat Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-[#D97757] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    P
                  </div>
                )}

                <div className={`max-w-2xl rounded-2xl p-4 sm:p-5 ${
                  msg.sender === 'user' 
                    ? 'bg-[#262626] border border-[#333333] text-white rounded-tr-none'
                    : 'bg-[#1C1C1E] border border-[#333333] rounded-tl-none shadow-sm'
                }`}>
                  
                  {/* Header Info */}
                  <div className="flex items-center justify-between mb-2 text-[10px] font-mono text-[#A1A1AA]">
                    <span className="font-bold text-[#E4E4E7]">
                      {msg.sender === 'user' ? 'You' : 'Pencil AI Orchestrator'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Content */}
                  <p className="text-xs sm:text-sm text-[#F4F4F5] leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {/* Template Suggestion Cards (Visible only on initial assistant welcome message) */}
                  {msg.id === '1' && messages.length === 1 && (
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {templateCards.map((card, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setInputPrompt(card.prompt)}
                          className="p-3.5 rounded-xl bg-[#262626] border border-[#333333] hover:border-[#D97757]/80 cursor-pointer transition-all hover:translate-y-[-2px] flex flex-col justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#D97757]" />
                              <span>{card.title}</span>
                            </div>
                            <p className="text-[10px] text-[#A1A1AA] mt-1 font-sans">{card.desc}</p>
                          </div>
                          <div className="text-[9px] font-mono text-[#D97757] mt-3 text-right">Use template →</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* DAG Pipeline Execution Log */}
                  {msg.pipelineProgress && msg.pipelineProgress.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#333333] space-y-1.5 font-mono text-[11px]">
                      <div className="text-[#A1A1AA] uppercase text-[9px] tracking-wider mb-2 flex items-center gap-1.5">
                        <span>DAG Execution Steps</span>
                        {msg.isLive && <Loader2 className="w-3 h-3 animate-spin text-[#D97757]" />}
                      </div>
                      {msg.pipelineProgress.map((p, idx) => (
                        <div key={idx} className={`flex items-center gap-2 ${p.failed ? 'text-red-400' : 'text-[#D97757]'}`}>
                          {p.failed ? (
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          ) : p.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          ) : (
                            <Loader2 className="w-3.5 h-3.5 flex-shrink-0 animate-spin" />
                          )}
                          <span>{p.stage}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stream / Fetch Error */}
                  {msg.errorText && (
                    <div className="mt-4 p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-red-400 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{msg.errorText}</span>
                    </div>
                  )}

                  {/* Generated Ad Variant Artifact Card */}
                  {msg.generatedAd && (
                    <div className="mt-5 rounded-xl bg-[#141416] border border-[#333333] overflow-hidden">
                      
                      {/* Card Header */}
                      <div className="px-4 py-2.5 bg-[#262626] border-b border-[#333333] flex items-center justify-between font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-[#D97757]" />
                          <span className="font-bold text-white">Pre-Scored Creative Variant</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#18181B] text-[#D97757] border border-[#333333]">
                            {msg.generatedAd.aspectRatio}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#D97757] font-bold">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Score: {msg.generatedAd.predictiveScore} / 100</span>
                        </div>
                      </div>

                      {/* Body Content */}
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-4">
                        
                        {/* Media Preview */}
                        <div className="sm:col-span-5 relative rounded-lg overflow-hidden group border border-[#333333] bg-[#18181B] aspect-[4/5]">
                          <img 
                            src={msg.generatedAd.imageUrl} 
                            alt="AI Ad Preview" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute bottom-2 left-2 right-2 text-[10px] font-mono text-white bg-black/80 backdrop-blur-md p-1.5 rounded border border-gray-700 flex items-center justify-between">
                            <span>Projected ROAS:</span>
                            <span className="font-bold text-[#D97757]">{msg.generatedAd.roasUplift}</span>
                          </div>
                        </div>

                        {/* Ad Copy & Details */}
                        <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-1">Headline</div>
                            <h4 className="font-bold text-sm text-white mb-2 leading-snug">
                              {msg.generatedAd.headline}
                            </h4>

                            <div className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-1">Primary Text</div>
                            <p className="text-xs text-[#D4D4D8] leading-relaxed bg-[#18181B] p-2.5 rounded-lg border border-[#333333]">
                              {msg.generatedAd.primaryText}
                            </p>
                          </div>

                          {/* Performance Metrics */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#333333] text-[10px] font-mono">
                            <div className="bg-[#18181B] p-2 rounded border border-[#333333]">
                              <span className="text-[#A1A1AA] block text-[9px]">Est. CPA Drop</span>
                              <span className="text-[#D97757] font-bold">{msg.generatedAd.cpaReduction}</span>
                            </div>
                            <div className="bg-[#18181B] p-2 rounded border border-[#333333]">
                              <span className="text-[#A1A1AA] block text-[9px]">Brand DNAi</span>
                              <span className="text-[#D97757] font-bold">100% Passed</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => handlePublishToMeta(msg.id)}
                            disabled={msg.generatedAd.status === 'PUBLISHED_TO_META'}
                            className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                              msg.generatedAd.status === 'PUBLISHED_TO_META'
                                ? 'bg-[#18181B] border border-[#D97757]/60 text-[#D97757] cursor-default'
                                : 'bg-[#D97757] text-white hover:bg-[#C15C3D]'
                            }`}
                          >
                            {msg.generatedAd.status === 'PUBLISHED_TO_META' ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-[#D97757]" />
                                <span>Staged to Meta Ads Manager (`facebook-python-business-sdk`)</span>
                              </>
                            ) : (
                              <>
                                <Layers className="w-4 h-4 text-white" />
                                <span>Publish via Meta Business SDK</span>
                              </>
                            )}
                          </button>

                        </div>

                      </div>

                    </div>
                  )}

                  {msg.competitorComparison && <CompetitorComparison comparison={msg.competitorComparison} />}

                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-[#262626] border border-[#333333] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    U
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Composer */}
          <div className="p-4 sm:p-6 border-t border-[#333333] bg-[#141416] space-y-4">

            <CompetitorAdInput value={competitorDraft} onChange={setCompetitorDraft} />

            {/* Quick Assistant Follow-Ups (Suggesting parameters to help user) */}
            {messages.length > 1 && (
              <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 select-none">
                <span className="text-[10px] font-mono text-[#A1A1AA] flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-[#D97757]" />
                  <span>Refine brief:</span>
                </span>
                {followUpSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={item.action}
                    className="px-2.5 py-1 text-[10px] bg-[#262626] hover:bg-[#333333] border border-[#333333] text-[#D97757] rounded-full transition-colors whitespace-nowrap"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto space-y-3">
              
              {/* Active Customizer Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="text-[#A1A1AA] text-[11px]">Active Customizations:</span>
                <button
                  type="button"
                  onClick={onOpenCustomizer}
                  className="px-2.5 py-1 rounded bg-[#262626] border border-[#333333] hover:border-[#D97757] text-[#D97757] text-[10px] font-bold flex items-center gap-1"
                >
                  <span>{customizer.template}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenCustomizer}
                  className="px-2.5 py-1 rounded bg-[#262626] border border-[#333333] hover:border-gray-500 text-[#F4F4F5] text-[10px]"
                >
                  <span>{customizer.llmModel}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenCustomizer}
                  className="px-2.5 py-1 rounded bg-[#262626] border border-[#333333] hover:border-gray-500 text-[#F4F4F5] text-[10px]"
                >
                  <span>{customizer.aspectRatio}</span>
                </button>
              </div>

              {/* Text Area */}
              <div className="relative bg-[#1C1C1E] rounded-xl border border-[#333333] focus-within:border-[#D97757] transition-colors p-2 flex items-center">
                <textarea
                  rows={2}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type a campaign brief or product details. You can skip any field or customize models in the studio..."
                  className="w-full bg-transparent border-0 resize-none text-xs sm:text-sm text-white placeholder-[#71717A] focus:ring-0 focus:outline-none px-3 py-1 font-sans"
                />

                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isGenerating}
                  className="p-3 rounded-lg bg-[#D97757] text-white disabled:opacity-40 hover:bg-[#C15C3D] transition-all flex-shrink-0 font-bold"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </form>
          </div>
        </>
      )}

    </div>
  );
};
