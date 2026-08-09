import React, { useState } from 'react';
import { 
  Code, ShieldCheck, TrendingUp, Layers, Terminal, Check, Copy, 
  Play, ExternalLink, Cpu, BarChart2 
} from 'lucide-react';

const PYTHON_SNIPPET = `from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.adimage import AdImage
from facebook_business.adobjects.advideo import AdVideo
from facebook_business.adobjects.adcreative import AdCreative

# Authenticate Meta System User Token
FacebookAdsApi.init(access_token="<META_SYSTEM_USER_TOKEN>")
account = AdAccount("act_unilever_global_01")

# Upload generated video asset to Meta
video = AdVideo(parent_id=account.get_id_channeling())
video[AdVideo.Field.filepath] = "/tmp/pencil_variant_402.mp4"
video.remote_create()
video_id = video[AdVideo.Field.id]

# Assemble AdCreative payload
creative = AdCreative(parent_id=account.get_id_channeling())
creative[AdCreative.Field.name] = "Pencil AI Variant - High ROAS"
creative[AdCreative.Field.object_story_spec] = {
    'page_id': '<FACEBOOK_PAGE_ID>',
    'video_data': {
        'video_id': video_id,
        'image_url': f"https://graph.facebook.com/{video_id}/picture",
        'title': 'Experience Next-Gen Performance',
        'message': 'Synthesized by Pencil multi-model LLM engine.',
        'call_to_action': {'type': 'SHOP_NOW', 'value': {'link': 'https://brand.com'}},
    }
}
creative.remote_create()`;

export const RightInspectorPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'meta' | 'predictive' | 'brand'>('meta');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-80 bg-[#141416] border-l border-[#333333] flex flex-col h-full font-sans text-xs select-none">
      
      {/* Top Inspector Tabs */}
      <div className="p-3 border-b border-[#333333] flex items-center justify-between bg-[#18181B]">
        <div className="flex gap-1 bg-[#141416] p-1 rounded-lg border border-[#333333] w-full font-mono">
          <button
            onClick={() => setActiveTab('meta')}
            className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'meta' ? 'bg-[#D97757] text-white' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Meta SDK</span>
          </button>

          <button
            onClick={() => setActiveTab('predictive')}
            className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'predictive' ? 'bg-[#D97757] text-white' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>ROAS ML</span>
          </button>

          <button
            onClick={() => setActiveTab('brand')}
            className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'brand' ? 'bg-[#D97757] text-white' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Brand DNA</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* TAB 1: META SDK */}
        {activeTab === 'meta' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="flex items-center gap-1.5 text-[#D97757] font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>Meta Business SDK</span>
              </span>
              <button 
                onClick={handleCopy}
                className="p-1 rounded bg-[#262626] border border-[#333333] text-gray-300 hover:text-white flex items-center gap-1 text-[9px]"
              >
                {copied ? <Check className="w-3 h-3 text-[#D97757]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="bg-[#1C1C1E] p-3 rounded-lg border border-[#333333] font-mono text-[9.5px] text-[#A1A1AA] overflow-x-auto leading-relaxed max-h-[320px]">
              {PYTHON_SNIPPET}
            </pre>

            <div className="p-3 rounded-lg bg-[#1C1C1E] border border-[#333333] space-y-1.5 font-mono text-[10px]">
              <div className="text-[#A1A1AA] uppercase text-[9px]">Token Status</div>
              <div className="flex items-center justify-between text-[#D97757]">
                <span>Scope: ads_management</span>
                <span className="bg-[#D97757]/10 px-1.5 py-0.5 rounded border border-[#D97757]/30 font-bold text-[9px]">Active</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PREDICTIVE ML */}
        {activeTab === 'predictive' && (
          <div className="space-y-4 font-mono">
            <div className="p-4 rounded-xl bg-[#1C1C1E] border border-[#333333] space-y-2">
              <div className="text-[9px] text-[#A1A1AA] uppercase">Predictive ML Score</div>
              <div className="text-3xl font-display font-extrabold text-[#D97757]">94.8 / 100</div>
              <p className="text-[11px] text-[#A1A1AA] font-sans leading-relaxed">
                Trained on &gt;$1B media spend corpus. Projected lift: <strong>+78.5% ROAS</strong>.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-[#1C1C1E] border border-[#333333] flex items-center justify-between">
                <span className="text-[#A1A1AA]">CPA Drop</span>
                <span className="text-[#D97757] font-bold">-48.2%</span>
              </div>

              <div className="p-3 rounded-lg bg-[#1C1C1E] border border-[#333333] flex items-center justify-between">
                <span className="text-[#A1A1AA]">Hook Rate Confidence</span>
                <span className="text-[#D97757] font-bold">92%</span>
              </div>

              <div className="p-3 rounded-lg bg-[#1C1C1E] border border-[#333333] flex items-center justify-between">
                <span className="text-[#A1A1AA]">Ad Fatigue Horizon</span>
                <span className="text-[#F4F4F5] font-bold">18 Days</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BRAND DNA */}
        {activeTab === 'brand' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#1C1C1E] border border-[#333333] space-y-3 font-mono">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#A1A1AA] uppercase">Brand DNAi Rules</span>
                <span className="text-[#D97757] font-bold bg-[#D97757]/10 px-1.5 py-0.5 rounded border border-[#D97757]/30 text-[9px]">100% Passed</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#A1A1AA]">HEX Palette</span>
                  <div className="flex gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#0B1B3D]"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#D4AF37]"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-white"></span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#A1A1AA]">Typography</span>
                  <span className="text-[#D97757] font-bold">Jakarta & Inter</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#A1A1AA]">Voice Tone</span>
                  <span className="text-[#D97757] font-bold">Empowering</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#A1A1AA]">IP Indemnification</span>
                  <span className="text-[#D97757] font-bold">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </aside>
  );
};
