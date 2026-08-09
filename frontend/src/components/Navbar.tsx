import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ArrowRight, ShieldCheck, Cpu, Layers, DollarSign, ExternalLink } from 'lucide-react';

interface NavbarProps {
  onOpenDemoModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemoModal }) => {
  const [scrolled, setScrolled] = useState(false);
  const [platformDropdown, setPlatformDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0B0F19]/85 backdrop-blur-md border-b border-gray-800/80 py-3 shadow-2xl' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 p-[1px] shadow-neon-yellow">
              <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center transition-transform group-hover:scale-95">
                <span className="font-display font-extrabold text-2xl text-yellow-400 tracking-tighter">P</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-tight text-white flex items-center gap-1">
                Pencil
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Marketing OS</span>
            </div>
          </a>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 bg-gray-900/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-gray-800/60">
            <a href="#enterprise" className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-full transition-colors hover:bg-gray-800/50">
              For Enterprise
            </a>
            
            {/* Dropdown: Platform */}
            <div className="relative" onMouseEnter={() => setPlatformDropdown(true)} onMouseLeave={() => setPlatformDropdown(false)}>
              <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-full transition-colors hover:bg-gray-800/50">
                Platform <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${platformDropdown ? 'rotate-180 text-yellow-400' : ''}`} />
              </button>
              
              {platformDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 glass-panel rounded-2xl p-2 shadow-2xl border border-gray-700/60 animate-in fade-in slide-in-from-top-2 duration-150">
                  <a href="#orchestrator" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-800/60 transition-colors">
                    <Cpu className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-white">AI Orchestration</div>
                      <div className="text-[11px] text-gray-400">50+ aggregated foundational models</div>
                    </div>
                  </a>
                  <a href="#meta-sdk" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-800/60 transition-colors">
                    <Layers className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-white">Meta Business SDK</div>
                      <div className="text-[11px] text-gray-400">Direct AdCreative & Insights API</div>
                    </div>
                  </a>
                  <a href="#brand-dna" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-800/60 transition-colors">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-white">Brand DNAi</div>
                      <div className="text-[11px] text-gray-400">Enterprise guardrails & IP safety</div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            <a href="#orchestrator" className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-full transition-colors hover:bg-gray-800/50">
              Orchestrator
            </a>
            <a href="#meta-sdk" className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-full transition-colors hover:bg-gray-800/50">
              Meta SDK API
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-full transition-colors hover:bg-gray-800/50">
              Pricing
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="#login"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white px-3.5 py-2 rounded-full border border-gray-800 hover:border-gray-700 transition-all"
            >
              Sign In <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>

            <button 
              onClick={onOpenDemoModal}
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-950 font-display font-bold text-xs tracking-wide uppercase shadow-neon-yellow transition-all hover:scale-[1.03] active:scale-95 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-gray-950 animate-spin-slow" />
              <span>Book a Demo</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};
