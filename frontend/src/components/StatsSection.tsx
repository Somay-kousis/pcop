import React from 'react';
import { TrendingDown, TrendingUp, Globe, Shield, Sparkles } from 'lucide-react';

const CLIENTS = [
  { name: 'Unilever', role: 'Global Enterprise Partner', metric: '50% Production Cost Reduction' },
  { name: 'Bayer', role: 'Pencil Pro Launch Partner', metric: '79% ROAS Lift' },
  { name: 'L\'Oreal', role: 'Multi-Market Localization', metric: '24 Markets Scaled' },
  { name: 'Sephora', role: 'DTC Performance Campaign', metric: '48% CPA Reduction' }
];

export const StatsSection: React.FC = () => {
  return (
    <section className="py-20 relative bg-[#090C14] border-y border-gray-800/80 overflow-hidden">
      
      {/* Background Accent */}
      <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-yellow-400 mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proven Enterprise Impact</span>
          </h2>
          <h3 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            Proven across global brands
          </h3>
        </div>

        {/* 3 Core Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          
          {/* Stat 1 */}
          <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center mb-6 text-yellow-400">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="text-5xl sm:text-6xl font-display font-black text-white tracking-tight mb-2">
              <span className="text-gradient-yellow">50%</span>
            </div>
            <p className="text-sm font-medium text-gray-400 max-w-[200px] leading-relaxed">
              Reduction in creative production costs
            </p>
            <div className="mt-4 pt-4 border-t border-gray-800/80 text-[11px] font-mono text-gray-400">
              Verified by Unilever U-Studio
            </div>
          </div>

          {/* Stat 2 */}
          <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-5xl sm:text-6xl font-display font-black text-white tracking-tight mb-2">
              <span className="text-emerald-400">79%</span>
            </div>
            <p className="text-sm font-medium text-gray-400 max-w-[200px] leading-relaxed">
              ROAS improvement over baseline
            </p>
            <div className="mt-4 pt-4 border-t border-gray-800/80 text-[11px] font-mono text-gray-400">
              Verified across Bayer campaigns
            </div>
          </div>

          {/* Stat 3 */}
          <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400">
              <Globe className="w-6 h-6" />
            </div>
            <div className="text-5xl sm:text-6xl font-display font-black text-white tracking-tight mb-2">
              <span className="text-gradient-purple">24x</span>
            </div>
            <p className="text-sm font-medium text-gray-400 max-w-[200px] leading-relaxed">
              Markets scaled simultaneously
            </p>
            <div className="mt-4 pt-4 border-t border-gray-800/80 text-[11px] font-mono text-gray-400">
              Multi-language auto-localization
            </div>
          </div>

        </div>

        {/* Enterprise Brand Trust Bar */}
        <div className="glass-panel rounded-2xl p-6 border border-gray-800">
          <div className="text-center text-xs font-mono uppercase tracking-wider text-gray-400 mb-6">
            Trusted by Enterprise Launch Partners & Global Advertisers
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CLIENTS.map((client, idx) => (
              <div key={idx} className="bg-gray-950/60 rounded-xl p-4 border border-gray-800/60 text-center hover:border-gray-700 transition-colors">
                <div className="font-display font-bold text-lg text-white mb-1">{client.name}</div>
                <div className="text-[11px] text-yellow-400 font-mono">{client.metric}</div>
                <div className="text-[10px] text-gray-400 mt-1">{client.role}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
