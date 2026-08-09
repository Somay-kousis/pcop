import React, { useState, useEffect } from 'react';
import { Sparkles, Play, TrendingUp, Cpu, ShieldCheck, Zap, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

interface HeroProps {
  onOpenDemoModal: () => void;
}

const DEMO_PROMPTS = [
  "Generate 10 video ad variations for luxury sunglasses targeting Meta (9:16) with high-converting Hook Rate...",
  "Synthesize localized performance static ads for Unilever Dove across 24 European markets with Brand DNAi rules...",
  "Create TikTok dynamic carousel copy + AI voiceover for summer skincare launch using GPT-4o + ElevenLabs..."
];

const MODELS = [
  { name: 'OpenAI GPT-4o', category: 'Copywriting', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { name: 'Google Gemini 1.5', category: 'Scripting', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { name: 'Adobe Firefly 3', category: 'Vision', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { name: 'Runway Gen-3', category: 'Motion Video', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { name: 'Bria AI (IP-Safe)', category: 'Commercial', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { name: 'ElevenLabs', category: 'Audio TTS', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
];

export const Hero: React.FC<HeroProps> = ({ onOpenDemoModal }) => {
  const [promptIndex, setPromptIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [activeModel, setActiveModel] = useState(0);

  useEffect(() => {
    let timeout: any;
    const currentPrompt = DEMO_PROMPTS[promptIndex];

    if (isTyping) {
      if (typedText.length < currentPrompt.length) {
        timeout = setTimeout(() => {
          setTypedText(currentPrompt.slice(0, typedText.length + 1));
        }, 35);
      } else {
        timeout = setTimeout(() => setIsTyping(false), 3000);
      }
    } else {
      if (typedText.length > 0) {
        timeout = setTimeout(() => {
          setTypedText(typedText.slice(0, typedText.length - 2));
        }, 15);
      } else {
        setPromptIndex((prev) => (prev + 1) % DEMO_PROMPTS.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [typedText, isTyping, promptIndex]);

  // Model ticker interval
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveModel((prev) => (prev + 1) % MODELS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-grid-pattern">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-radial-glow pointer-events-none blur-3xl opacity-70"></div>
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Tagline Pill */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-yellow-500/30 text-xs font-medium text-gray-300 shadow-glass">
            <span className="flex h-2 w-2 rounded-full bg-yellow-400 animate-ping"></span>
            <span className="font-display font-semibold text-yellow-400 uppercase tracking-wider text-[11px]">Pencil 2026 Release</span>
            <span className="text-gray-600">|</span>
            <span>Aggregating 50+ Models for Meta, TikTok & Google</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-white leading-[1.08] mb-6">
            Marketing has an <br className="hidden sm:inline" />
            <span className="text-gradient-yellow">AI Operating System</span> now
          </h1>
          
          <p className="text-base sm:text-xl text-gray-300 font-normal max-w-2xl mx-auto leading-relaxed">
            The only platform that aggregates every AI model, enforces enterprise governance, and turns production savings into media growth.
          </p>
        </div>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button 
            onClick={onOpenDemoModal}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-gray-950 font-display font-extrabold text-sm tracking-wider uppercase shadow-neon-yellow transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
          >
            <span>Book an Enterprise Demo</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <a 
            href="#orchestrator"
            className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel text-white font-display font-semibold text-sm tracking-wider uppercase border border-gray-700/80 hover:border-gray-500 transition-all flex items-center justify-center gap-2 hover:bg-gray-800/40"
          >
            <Play className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>Explore Architecture</span>
          </a>
        </div>

        {/* Interactive Prompt & Model Orchestration Console */}
        <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-800 relative group">
          <div className="absolute -top-3 left-6 px-3 py-1 bg-[#0B0F19] border border-gray-700 rounded-full flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[11px] font-mono text-gray-300">Live AI Orchestrator Terminal</span>
          </div>

          {/* Model Switcher Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-4 pt-2">
            <span className="text-xs font-mono text-gray-400 mr-2">Active Models:</span>
            {MODELS.map((model, idx) => (
              <span
                key={idx}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-300 flex items-center gap-1.5 ${
                  idx === activeModel ? `${model.color} scale-105 shadow-md font-semibold` : 'bg-gray-900/60 text-gray-400 border-gray-800 opacity-60'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${idx === activeModel ? 'bg-current animate-pulse' : 'bg-gray-600'}`}></span>
                {model.name}
              </span>
            ))}
          </div>

          {/* Prompt Box */}
          <div className="bg-gray-950/80 rounded-2xl p-4 border border-gray-800/80 font-mono text-xs sm:text-sm text-gray-200 flex items-start gap-3 min-h-[90px] shadow-inner">
            <div className="text-yellow-400 font-bold select-none pt-0.5">&gt;</div>
            <div className="flex-1 leading-relaxed text-gray-200">
              {typedText}
              <span className="inline-block w-2 h-4 bg-yellow-400 ml-1 animate-pulse align-middle"></span>
            </div>
          </div>

          {/* Simulated Real-Time Performance Score Badge */}
          <div className="mt-4 pt-4 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-800/40">
                <TrendingUp className="w-4 h-4" />
                <span>Predictive Score: 94 / 100</span>
              </div>
              <div className="flex items-center gap-1.5 text-yellow-400 font-semibold bg-yellow-950/40 px-3 py-1.5 rounded-xl border border-yellow-800/40">
                <Zap className="w-4 h-4" />
                <span>+78.5% Projected ROAS</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Brand DNAi Guardrails Passed</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
