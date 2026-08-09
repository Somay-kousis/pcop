import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, Building, Mail, User } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    spend: '$50k - $250k / mo'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-gray-700 relative shadow-neon-yellow">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Book Enterprise Demo</span>
            </div>

            <h3 className="text-2xl font-display font-bold text-white mb-2">
              Experience the AI Operating System
            </h3>

            <p className="text-xs text-gray-400 mb-6">
              See how Pencil aggregates 50+ models, enforces Brand DNAi, and accelerates ROAS across Meta, TikTok & Google.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Sarah Jenkins"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="sarah@unilever.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Company / Brand Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Unilever / DTC Brand"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Monthly Media Spend</label>
                <select
                  value={formData.spend}
                  onChange={(e) => setFormData({ ...formData, spend: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  <option>$10k - $50k / mo</option>
                  <option>$50k - $250k / mo</option>
                  <option>$250k - $1M+ / mo</option>
                  <option>Enterprise ($1M+ / mo)</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-6 w-full py-3.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-950 font-display font-extrabold text-xs uppercase tracking-wider shadow-neon-yellow transition-all hover:scale-102 flex items-center justify-center gap-2"
              >
                <span>Request Custom Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="py-12 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-xl font-display font-bold text-white">Demo Scheduled!</h4>
            <p className="text-xs text-gray-400">
              An enterprise AI specialist will reach out to <strong>{formData.email}</strong> shortly with your custom model evaluation kit.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
