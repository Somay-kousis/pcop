import React, { useState } from 'react';
import { Cpu, ShieldCheck, Zap, Layers, Sparkles, Check } from 'lucide-react';

interface AIModel {
  name: string;
  provider: string;
  category: 'Text' | 'Vision' | 'Video' | 'Audio';
  description: string;
  badge: string;
  badgeColor: string;
  features: string[];
}

const MODELS_DATA: AIModel[] = [
  {
    name: 'OpenAI GPT-4o / O1',
    provider: 'OpenAI',
    category: 'Text',
    description: 'High-reasoning LLM for performance ad copy, hooks, and campaign angle synthesis.',
    badge: 'LLM Leader',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    features: ['Structured brief parsing', 'Multi-variant headline generation', 'Meta Ad Copy optimization']
  },
  {
    name: 'Google Gemini 1.5 Pro',
    provider: 'Google AI',
    category: 'Text',
    description: '1M token context model for parsing full product catalogs and long-form video scripts.',
    badge: 'Long Context',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    features: ['Product feed sync', 'Multi-market translation', 'Script storyboarding']
  },
  {
    name: 'Adobe Firefly Image 3',
    provider: 'Adobe',
    category: 'Vision',
    description: 'Commercially safe high-resolution visual generator enforcing exact brand swatches.',
    badge: 'Commercially Safe',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    features: ['Vector logo integration', 'HEX swatch enforcement', 'High-res hero image generation']
  },
  {
    name: 'Bria AI Engine',
    provider: 'Bria AI',
    category: 'Vision',
    description: '100% IP-safe, commercially indemnified generative visual model for enterprise brands.',
    badge: 'IP Indemnified',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    features: ['Copyright indemnification', 'Background replacement', 'Product asset manipulation']
  },
  {
    name: 'Runway Gen-3 Alpha',
    provider: 'Runway ML',
    category: 'Video',
    description: 'High-fidelity motion video synthesis engine for 9:16 vertical TikTok and Meta Reels.',
    badge: 'Motion Synthesis',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    features: ['Temporal consistency', 'Camera motion control', 'Short-form UGC video clips']
  },
  {
    name: 'ElevenLabs Speech AI',
    provider: 'ElevenLabs',
    category: 'Audio',
    description: 'Studio-grade voice cloning and multi-lingual neural speech narration generator.',
    badge: 'Studio Voice',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    features: ['29+ language voiceover', 'Emotion & tone control', 'Exact audio timeline sync']
  }
];

export const ModelMatrix: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Text' | 'Vision' | 'Video' | 'Audio'>('All');

  const filteredModels = selectedCategory === 'All' 
    ? MODELS_DATA 
    : MODELS_DATA.filter(m => m.category === selectedCategory);

  return (
    <section className="py-24 relative bg-[#0B0F19] overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono mb-4">
            <Cpu className="w-4 h-4" />
            <span>Zero Vendor Lock-In Strategy</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight mb-4">
            The Best Models. One Platform. <br className="hidden sm:inline" />
            <span className="text-gradient-yellow">Zero Lock-In.</span>
          </h2>
          <p className="text-base text-gray-400">
            Pencil aggregates over 50 generative AI models into a single orchestration layer, allowing you to use the exact model for every task and immediately adopt new ones as they launch.
          </p>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {(['All', 'Text', 'Vision', 'Video', 'Audio'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-display font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-yellow-400 text-gray-950 shadow-neon-yellow scale-105'
                  : 'bg-gray-900/80 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white'
              }`}
            >
              {cat === 'All' ? 'All 50+ Models' : `${cat} Engines`}
            </button>
          ))}
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model, idx) => (
            <div key={idx} className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-gray-800 hover:border-yellow-400/40 group">
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-gray-400">{model.provider}</span>
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${model.badgeColor}`}>
                    {model.badge}
                  </span>
                </div>

                <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  {model.name}
                </h3>
                
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  {model.description}
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2 pt-4 border-t border-gray-800/80">
                {model.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                    <Check className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
