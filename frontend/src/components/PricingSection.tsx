import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';

interface PricingProps {
  onOpenDemoModal: () => void;
}

export const PricingSection: React.FC<PricingProps> = ({ onOpenDemoModal }) => {
  const [annualBilling, setAnnualBilling] = useState(true);

  return (
    <section id="pricing" className="py-24 relative bg-[#090C14] border-t border-gray-800/80">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono mb-4">
            <Zap className="w-4 h-4" />
            <span>Transparent Pricing & Enterprise Consumption</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight mb-4">
            Flexible Plans for <span className="text-gradient-yellow">Brands & Enterprises</span>
          </h2>
          <p className="text-base text-gray-400">
            Scale your creative output with predictable pricing, zero AI model lock-in, and enterprise brand safety guarantees.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <span className={`text-xs font-medium ${!annualBilling ? 'text-white' : 'text-gray-400'}`}>Monthly Billing</span>
          
          <button
            onClick={() => setAnnualBilling(!annualBilling)}
            className="w-14 h-8 rounded-full bg-gray-800 border border-gray-700 p-1 transition-colors relative"
          >
            <div className={`w-6 h-6 rounded-full bg-yellow-400 shadow-md transition-transform ${annualBilling ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>

          <span className={`text-xs font-medium flex items-center gap-1.5 ${annualBilling ? 'text-white' : 'text-gray-400'}`}>
            <span>Annual Billing</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Save 88%</span>
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Core */}
          <div className="glass-card rounded-3xl p-8 border border-gray-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-gray-400 mb-2">FOR SOLOPRENEURS</div>
              <h3 className="text-2xl font-display font-bold text-white mb-4">Core Plan</h3>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl sm:text-5xl font-display font-black text-white">
                  ${annualBilling ? '14' : '119'}
                </span>
                <span className="text-xs text-gray-400">/ month</span>
              </div>
              
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Essential generative AI ad creation for small teams testing performance ad variations.
              </p>

              <div className="space-y-3 pt-6 border-t border-gray-800/80 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-400" />
                  <span>50 AI ad generations / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-400" />
                  <span>Access to GPT-4o & Firefly 3</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-400" />
                  <span>Meta & TikTok export formats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-400" />
                  <span>Basic Brand Library (1 Brand)</span>
                </div>
              </div>
            </div>

            <button 
              onClick={onOpenDemoModal}
              className="mt-8 w-full py-3 rounded-full glass-panel text-white font-display font-semibold text-xs uppercase tracking-wider border border-gray-700 hover:border-gray-500 transition-all hover:bg-gray-800/60"
            >
              Get Started
            </button>
          </div>

          {/* Card 2: Growth (Featured) */}
          <div className="glass-card rounded-3xl p-8 border-2 border-yellow-400/80 flex flex-col justify-between relative shadow-neon-yellow scale-102">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-950 text-[10px] font-display font-extrabold tracking-widest uppercase">
              Most Popular
            </div>

            <div>
              <div className="text-xs font-mono text-yellow-400 mb-2">FOR SCALING BRANDS</div>
              <h3 className="text-2xl font-display font-bold text-white mb-4">Growth Plan</h3>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl sm:text-5xl font-display font-black text-white">$299</span>
                <span className="text-xs text-gray-400">/ month</span>
              </div>
              
              <p className="text-xs text-gray-300 leading-relaxed mb-6">
                For fast-growing performance marketing teams scaling high-volume creative campaigns.
              </p>

              <div className="space-y-3 pt-6 border-t border-gray-800/80 text-xs text-gray-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-400" />
                  <span>300 AI ad generations / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-400" />
                  <span>Full 50+ Model Matrix Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-400" />
                  <span>Predictive Scoring Engine (&gt;$1B Spend Data)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-400" />
                  <span>Direct Meta Business SDK Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-400" />
                  <span>Multi-Workspaces (3 Team Seats)</span>
                </div>
              </div>
            </div>

            <button 
              onClick={onOpenDemoModal}
              className="mt-8 w-full py-3.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-950 font-display font-extrabold text-xs uppercase tracking-wider shadow-neon-yellow transition-all hover:scale-105"
            >
              Start Growth Trial
            </button>
          </div>

          {/* Card 3: Pencil Pro Enterprise */}
          <div className="glass-card rounded-3xl p-8 border border-gray-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-purple-400 mb-2">FOR FORTUNE 500</div>
              <h3 className="text-2xl font-display font-bold text-white mb-4">Pencil Pro</h3>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl sm:text-4xl font-display font-black text-white">Custom</span>
                <span className="text-xs text-gray-400">/ enterprise contract</span>
              </div>
              
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Complete enterprise AI operating system with SOC2 compliance, data ringfencing, and legal IP indemnification.
              </p>

              <div className="space-y-3 pt-6 border-t border-gray-800/80 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Unlimited AI Generations & Bulk Feeds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Brand DNAi Guardrails & IP Indemnification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Strict "No-Train" Data Ringfencing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Dedicated CSM & Custom Model Fine-Tuning</span>
                </div>
              </div>
            </div>

            <button 
              onClick={onOpenDemoModal}
              className="mt-8 w-full py-3 rounded-full bg-purple-600/30 text-purple-200 font-display font-semibold text-xs uppercase tracking-wider border border-purple-500/50 hover:bg-purple-600/50 transition-all"
            >
              Talk to Enterprise Sales
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
