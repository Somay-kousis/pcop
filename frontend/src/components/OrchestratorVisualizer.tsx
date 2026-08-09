import React, { useState } from 'react';
import { Cpu, ShieldCheck, TrendingUp, Layers, CheckCircle2, Play, Code, RefreshCw, ArrowRight } from 'lucide-react';

interface Stage {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'QUEUED';
  description: string;
  jsonOutput: object;
}

const STAGES: Stage[] = [
  {
    id: 1,
    title: '1. Ingestion & Brand DNA Sync',
    subtitle: 'Context & Rules Parsing',
    icon: Layers,
    status: 'COMPLETED',
    description: 'Pencil extracts campaign briefs, product assets, target personas, and enforces Brand DNAi (HEX colors, typography, vector logos, voice rules).',
    jsonOutput: {
      brand_name: "Unilever Dove",
      campaign: "Beauty & Wellbeing Q3",
      brand_dna: { hex_palette: ["#0B1B3D", "#D4AF37", "#FFFFFF"], voice_tone: "Premium & Empowering" },
      target_platforms: ["Meta", "TikTok", "Google"]
    }
  },
  {
    id: 2,
    title: '2. Multi-Model Matrix Dispatch',
    subtitle: '50+ Models Parallel Execution',
    icon: Cpu,
    status: 'COMPLETED',
    description: 'Routes tasks across GPT-4o for ad copy, Firefly 3 for hero imagery, Runway Gen-3 for motion clips, and ElevenLabs for voiceover synthesis.',
    jsonOutput: {
      copy_model: "OpenAI GPT-4o",
      vision_model: "Adobe Firefly Image 3",
      motion_model: "Runway Gen-3 Alpha",
      tts_model: "ElevenLabs Studio Voice",
      variants_generated: 12
    }
  },
  {
    id: 3,
    title: '3. Brand Safety & Guardrails',
    subtitle: 'IP & Legal Validation',
    icon: ShieldCheck,
    status: 'COMPLETED',
    description: 'Automated evaluation agent verifies brand logo positioning, compliance rules, prohibited terms, and provides commercial IP indemnification.',
    jsonOutput: {
      visual_compliance_score: "100%",
      logo_placement_valid: true,
      prohibited_terms_detected: 0,
      ip_indemnified: true,
      status: "APPROVED"
    }
  },
  {
    id: 4,
    title: '4. Predictive Performance Scoring',
    subtitle: '>$1B Spend ML Model',
    icon: TrendingUp,
    status: 'COMPLETED',
    description: 'Scores each generated creative variant against an ML model trained on historical telemetry from over $1 Billion in ad spend.',
    jsonOutput: {
      predictive_score: 94.8,
      projected_roas_uplift: "+78.5%",
      projected_cpa_reduction: "-48.2%",
      hook_rate_confidence: "92%"
    }
  },
  {
    id: 5,
    title: '5. Meta Business SDK Staging',
    subtitle: 'Programmatic AdTrafficking',
    icon: Play,
    status: 'COMPLETED',
    description: 'Pencil streams binary assets to Meta endpoints (AdImage / AdVideo) via facebook-python-business-sdk and constructs AdCreative payloads.',
    jsonOutput: {
      sdk_interface: "facebook-python-business-sdk",
      image_hash: "a4f891b90c12e8f7",
      video_id: "108927162983712",
      creative_id: "23850192847192",
      staging_status: "READY_FOR_PUBLISH"
    }
  }
];

export const OrchestratorVisualizer: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <section id="orchestrator" className="py-24 relative bg-[#090C14] border-y border-gray-800/80">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono mb-4">
            <Cpu className="w-4 h-4" />
            <span>Agentic Orchestration Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight mb-4">
            Inside the <span className="text-gradient-purple">AI Orchestration DAG</span>
          </h2>
          <p className="text-base text-gray-400">
            Pencil breaks down creative generation into a Directed Acyclic Graph (DAG) executed by specialized sub-agents from brief parsing to Meta SDK staging.
          </p>
        </div>

        {/* 5-Step Pipeline Stepper Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-10">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = activeStage === idx;

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(idx)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isSelected 
                    ? 'bg-purple-950/40 border-purple-500/80 shadow-neon-purple scale-102' 
                    : 'bg-gray-950/60 border-gray-800/80 hover:border-gray-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-900 text-gray-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs font-display font-bold text-white mb-0.5">{stage.title}</div>
                <div className="text-[11px] font-mono text-gray-400">{stage.subtitle}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Console */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 glass-panel rounded-3xl p-6 sm:p-8 border border-gray-800">
          
          {/* Left: Description & Features */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Stage Status: {STAGES[activeStage].status}</span>
              </div>

              <h3 className="text-2xl font-display font-black text-white mb-3">
                {STAGES[activeStage].title}
              </h3>
              
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                {STAGES[activeStage].description}
              </p>
            </div>

            <div className="bg-gray-950/80 rounded-2xl p-4 border border-gray-800 text-xs font-mono text-gray-400 space-y-2">
              <div className="flex items-center justify-between text-gray-300">
                <span>Execution SLA:</span>
                <span className="text-yellow-400 font-semibold">&lt; 1.2s latency</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span>Failover Strategy:</span>
                <span className="text-emerald-400 font-semibold">Automatic Dynamic Model Switch</span>
              </div>
            </div>
          </div>

          {/* Right: Real JSON Telemetry Output */}
          <div className="bg-gray-950 rounded-2xl p-5 border border-gray-800 font-mono text-xs overflow-hidden flex flex-col shadow-inner">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800 text-gray-400">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span>telemetry_output.json</span>
              </div>
              <span className="text-[10px] text-emerald-400">HTTP 200 OK</span>
            </div>

            <pre className="text-purple-300 overflow-x-auto leading-relaxed flex-1">
              {JSON.stringify(STAGES[activeStage].jsonOutput, null, 2)}
            </pre>
          </div>

        </div>

      </div>
    </section>
  );
};
