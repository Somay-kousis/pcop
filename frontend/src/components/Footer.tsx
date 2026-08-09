import React from 'react';
import { Cpu, ShieldCheck, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070910] border-t border-gray-800/80 pt-16 pb-12 text-xs text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-16">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 p-[1px]">
                <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
                  <span className="font-display font-extrabold text-lg text-yellow-400">P</span>
                </div>
              </div>
              <span className="font-display font-black text-xl text-white">Pencil</span>
            </div>

            <p className="text-gray-400 max-w-sm leading-relaxed">
              The AI Operating System for Marketing. Aggregating 50+ foundational models, enforcing Brand DNAi, and accelerating media growth for global brands.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <div className="font-display font-bold text-white uppercase tracking-wider text-[11px]">Platform</div>
            <ul className="space-y-2">
              <li><a href="#orchestrator" className="hover:text-white transition-colors">AI Orchestrator DAG</a></li>
              <li><a href="#meta-sdk" className="hover:text-white transition-colors">Meta Business SDK</a></li>
              <li><a href="#brand-dna" className="hover:text-white transition-colors">Brand DNAi Guardrails</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Predictive Scoring Model</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Workflows Builder</a></li>
            </ul>
          </div>

          {/* Col 3: Enterprise */}
          <div className="space-y-3">
            <div className="font-display font-bold text-white uppercase tracking-wider text-[11px]">Enterprise</div>
            <ul className="space-y-2">
              <li><a href="#pricing" className="hover:text-white transition-colors">Pencil Pro</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Unilever Case Study</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bayer Health Case Study</a></li>
              <li><a href="#" className="hover:text-white transition-colors">SOC2 Type II Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">IP Indemnification</a></li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div className="space-y-3">
            <div className="font-display font-bold text-white uppercase tracking-wider text-[11px]">Company</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">About Pencil</a></li>
              <li><a href="#" className="hover:text-white transition-colors">The Brandtech Group</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press & Media</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Status Bar */}
        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-gray-300">All Systems Operational — 50+ Models Active</span>
          </div>

          <div className="text-gray-400">
            © {new Date().getFullYear()} Pencil (The Brandtech Group). All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
};
