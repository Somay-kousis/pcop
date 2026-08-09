import React, { useState } from 'react';
import { 
  Sliders, X, Check, Sparkles, Image, Palette, Type, Cpu, Layers, 
  Upload, HelpCircle, ArrowRight 
} from 'lucide-react';

export interface CustomizerState {
  template: string;
  llmModel: string;
  visionModel: string;
  motionModel: string;
  voiceModel: string;
  colorPalette: string[];
  font: string;
  aspectRatio: string;
  productImageUrl: string;
  customNotes: string;
  prohibitedClaims: string;
  brandGuidelines: string;
}

interface CustomizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customizer: CustomizerState;
  setCustomizer: React.Dispatch<React.SetStateAction<CustomizerState>>;
}

const TEMPLATES = [
  { id: 'ugc_video', name: 'UGC Video & Voiceover', desc: 'Short-form vertical 9:16 script with neural voiceover' },
  { id: 'hero_showcase', name: 'E-commerce Hero Showcase', desc: 'High-res product visual with value-prop headline' },
  { id: 'flash_sale', name: 'Flash Sale Carousel', desc: 'Urgency-driven multi-card ad for Meta & TikTok' },
  { id: 'problem_solution', name: 'Problem-Solution Angle', desc: 'Hook-driven ad addressing target pain points' },
  { id: 'enterprise_launch', name: 'Multi-Market Launch', desc: 'Auto-localized campaign for 24 concurrent markets' }
];

const COLOR_PALETTES = [
  { name: 'Dove Brand DNAi', colors: ['#0B1B3D', '#D4AF37', '#FFFFFF'] },
  { name: 'Claude Terracotta', colors: ['#D97757', '#18181B', '#F4F4F5'] },
  { name: 'Acid Editorial', colors: ['#CCFF00', '#0D0D0E', '#E4E4E7'] },
  { name: 'Solar Amber', colors: ['#F59E0B', '#111827', '#FFFFFF'] },
  { name: 'Minimal Mono', colors: ['#262626', '#52525B', '#FFFFFF'] }
];

const FONTS = ['Plus Jakarta Sans', 'Inter', 'Syne', 'Outfit', 'Playfair Display'];

const SAMPLE_PRODUCTS = [
  { name: 'Luxury Sunglasses', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop' },
  { name: 'Premium Skincare', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop' },
  { name: 'Wireless Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop' }
];

export const CustomizerDrawer: React.FC<CustomizerDrawerProps> = ({
  isOpen,
  onClose,
  customizer,
  setCustomizer
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#1C1C1E] border-l border-[#333333] h-full flex flex-col justify-between shadow-2xl text-xs text-[#F4F4F5]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#333333] flex items-center justify-between bg-[#141416]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#D97757]" />
            <span className="font-bold text-sm text-white">Campaign Customizer Studio</span>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#262626] border border-[#333333] hover:text-white transition-colors"
          >
            <X className="w-4 h-4 text-[#A1A1AA]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          <div className="p-3 rounded-xl bg-[#D97757]/10 border border-[#D97757]/30 text-[11px] text-[#D97757] flex items-start gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>All fields are optional! Select any parameters you want to customize or skip whatever you want to let Pencil AI auto-route.</span>
          </div>

          {/* 1. Template Selector */}
          <div>
            <label className="block font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider mb-2">
              1. Campaign Template
            </label>
            <div className="space-y-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setCustomizer({ ...customizer, template: tmpl.name })}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    customizer.template === tmpl.name 
                      ? 'bg-[#262626] border-[#D97757] text-white shadow-sm' 
                      : 'bg-[#141416] border-[#333333] text-[#A1A1AA] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{tmpl.name}</span>
                    {customizer.template === tmpl.name && <Check className="w-3.5 h-3.5 text-[#D97757]" />}
                  </div>
                  <div className="text-[10px] text-[#A1A1AA]">{tmpl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Model Matrix Selection */}
          <div className="space-y-3">
            <label className="block font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider">
              2. Select AI Models (Or Auto-Route)
            </label>

            <div>
              <span className="text-[10px] text-[#71717A] block mb-1">LLM Copy Engine:</span>
              <select
                value={customizer.llmModel}
                onChange={(e) => setCustomizer({ ...customizer, llmModel: e.target.value })}
                className="w-full bg-[#141416] border border-[#333333] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D97757]"
              >
                <option>Auto-Route (50+ Models)</option>
                <option>OpenAI GPT-4o / O1</option>
                <option>Google Gemini 1.5 Pro</option>
                <option>Anthropic Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] text-[#71717A] block mb-1">Vision Generator:</span>
              <select
                value={customizer.visionModel}
                onChange={(e) => setCustomizer({ ...customizer, visionModel: e.target.value })}
                className="w-full bg-[#141416] border border-[#333333] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D97757]"
              >
                <option>Adobe Firefly Image 3</option>
                <option>Bria AI (100% Commercial IP-Safe)</option>
                <option>Stability AI SD3</option>
              </select>
            </div>
          </div>

          {/* 3. Product Screenshot / Image Assets */}
          <div>
            <label className="block font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider mb-2">
              3. Product Image / Screenshot
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {SAMPLE_PRODUCTS.map((prod, idx) => (
                <button
                  key={idx}
                  onClick={() => setCustomizer({ ...customizer, productImageUrl: prod.url })}
                  className={`rounded-lg overflow-hidden border aspect-square relative ${
                    customizer.productImageUrl === prod.url ? 'border-[#D97757] ring-2 ring-[#D97757]/40' : 'border-[#333333]'
                  }`}
                >
                  <img src={prod.url} alt={prod.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or paste custom image URL..."
              value={customizer.productImageUrl}
              onChange={(e) => setCustomizer({ ...customizer, productImageUrl: e.target.value })}
              className="w-full bg-[#141416] border border-[#333333] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D97757]"
            />
          </div>

          {/* 4. Color Palette */}
          <div>
            <label className="block font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider mb-2">
              4. Brand Color Palette
            </label>
            <div className="grid grid-cols-1 gap-2">
              {COLOR_PALETTES.map((pal, idx) => (
                <button
                  key={idx}
                  onClick={() => setCustomizer({ ...customizer, colorPalette: pal.colors })}
                  className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                    JSON.stringify(customizer.colorPalette) === JSON.stringify(pal.colors)
                      ? 'bg-[#262626] border-[#D97757]'
                      : 'bg-[#141416] border-[#333333] hover:border-gray-600'
                  }`}
                >
                  <span className="text-xs text-gray-300 font-medium">{pal.name}</span>
                  <div className="flex gap-1">
                    {pal.colors.map((c, i) => (
                      <span key={i} className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: c }}></span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Typography Font & Aspect Ratio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider mb-1">
                Font
              </label>
              <select
                value={customizer.font}
                onChange={(e) => setCustomizer({ ...customizer, font: e.target.value })}
                className="w-full bg-[#141416] border border-[#333333] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D97757]"
              >
                {FONTS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider mb-1">
                Aspect Ratio
              </label>
              <select
                value={customizer.aspectRatio}
                onChange={(e) => setCustomizer({ ...customizer, aspectRatio: e.target.value })}
                className="w-full bg-[#141416] border border-[#333333] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D97757]"
              >
                <option>9:16 (Vertical Story)</option>
                <option>1:1 (Square Feed)</option>
                <option>16:9 (Horizontal Landscape)</option>
              </select>
            </div>
          </div>

          {/* 6. Dynamic Brand DNA Guidelines Editor */}
          <div className="space-y-3 pt-2 border-t border-[#333333]">
            <label className="block font-mono text-[11px] text-[#A1A1AA] uppercase tracking-wider">
              6. Dynamic Brand safety rules
            </label>
            
            <div>
              <span className="text-[10px] text-[#71717A] block mb-1">Prohibited Claims (Comma-separated):</span>
              <input
                type="text"
                placeholder="e.g. Dove, guaranteed wealth, risk-free"
                value={customizer.prohibitedClaims}
                onChange={(e) => setCustomizer({ ...customizer, prohibitedClaims: e.target.value })}
                className="w-full bg-[#141416] border border-[#333333] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D97757]"
              />
            </div>

            <div>
              <span className="text-[10px] text-[#71717A] block mb-1">Must-Include Guidelines:</span>
              <textarea
                rows={2}
                placeholder="e.g. Must mention natural ingredients, Empowering tone"
                value={customizer.brandGuidelines}
                onChange={(e) => setCustomizer({ ...customizer, brandGuidelines: e.target.value })}
                className="w-full bg-[#141416] border border-[#333333] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D97757] resize-none"
              />
            </div>
          </div>

        </div>

        {/* Footer Apply Button */}
        <div className="p-4 border-t border-[#333333] bg-[#141416]">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#D97757] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#C15C3D] transition-colors flex items-center justify-center gap-2"
          >
            <span>Apply Customization & Return to Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
