import React, { useState } from 'react';
import { Layers, Code, Check, Copy, Terminal, ShieldCheck, Play, ArrowUpRight } from 'lucide-react';

const PYTHON_CODE_SNIPPET = `from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.adimage import AdImage
from facebook_business.adobjects.advideo import AdVideo
from facebook_business.adobjects.adcreative import AdCreative

# 1. Authenticate with Meta System User Token
FacebookAdsApi.init(access_token="<META_SYSTEM_USER_TOKEN>")
account = AdAccount("act_<ENTERPRISE_AD_ACCOUNT_ID>")

# 2. Upload generated video asset to Meta Asset Library
video = AdVideo(parent_id=account.get_id_channeling())
video[AdVideo.Field.filepath] = "/tmp/pencil_variant_402.mp4"
video.remote_create()
video_id = video[AdVideo.Field.id]

# 3. Construct AdCreative payload with object_story_spec
creative = AdCreative(parent_id=account.get_id_channeling())
creative[AdCreative.Field.name] = "Pencil AI Variant - High ROAS Candidate"
creative[AdCreative.Field.object_story_spec] = {
    'page_id': '<FACEBOOK_PAGE_ID>',
    'video_data': {
        'video_id': video_id,
        'image_url': f"https://graph.facebook.com/{video_id}/picture",
        'title': 'Experience Next-Gen Automation',
        'message': 'Synthesized by Pencil multi-model LLM engine.',
        'call_to_action': {'type': 'SHOP_NOW', 'value': {'link': 'https://brand.com/launch'}},
    }
}
creative.remote_create()`;

export const MetaIntegrationSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [simulatedRun, setSimulatedRun] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateRun = () => {
    setSimulatedRun(true);
    setTimeout(() => setSimulatedRun(false), 3000);
  };

  return (
    <section id="meta-sdk" className="py-24 relative bg-[#0B0F19] overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-4">
            <Layers className="w-4 h-4" />
            <span>Official Meta Integration</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight mb-4">
            Native <span className="text-gradient-purple">Meta Business SDK</span> API
          </h2>
          <p className="text-base text-gray-400">
            Pencil bypasses manual file uploads by interfacing directly with Meta’s open-source Marketing SDK (`facebook-python-business-sdk`) to stage ad creatives and pull telemetry.
          </p>
        </div>

        {/* Code Console & Telemetry Dual Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Code Snippet (7 cols) */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-gray-800 flex flex-col justify-between shadow-2xl">
            <div>
              {/* Code Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800 font-mono text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span>pencil_meta_sdk_publisher.py</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>

                  <button
                    onClick={handleSimulateRun}
                    disabled={simulatedRun}
                    className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <Play className={`w-3.5 h-3.5 ${simulatedRun ? 'animate-spin' : ''}`} />
                    <span>{simulatedRun ? 'Executing API...' : 'Run SDK Test'}</span>
                  </button>
                </div>
              </div>

              {/* Code Text */}
              <pre className="bg-gray-950/90 rounded-2xl p-4 border border-gray-800/80 font-mono text-[11px] sm:text-xs text-gray-300 overflow-x-auto leading-relaxed shadow-inner max-h-[380px]">
                {PYTHON_CODE_SNIPPET}
              </pre>
            </div>

            {/* Run Execution Console Log */}
            {simulatedRun && (
              <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl font-mono text-xs text-emerald-300 animate-in fade-in duration-200">
                ✓ HTTP 200 OK — AdVideo uploaded (video_id: 108927162983712). AdCreative created (creative_id: 23850192847192).
              </div>
            )}
          </div>

          {/* Right: Meta Insights Telemetry (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Telemetry Card 1 */}
            <div className="glass-card rounded-3xl p-6 border border-gray-800 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-gray-400">Bi-Directional Telemetry Loop</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Live Sync</span>
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Meta Insights API Feed</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Pencil continuously streams CTR, CPA, ROAS, and creative fatigue decay curves to fine-tune predictive scoring weights.
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800/80 font-mono text-xs">
                <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800">
                  <div className="text-gray-400 text-[10px]">Avg Click-Through Rate</div>
                  <div className="text-lg font-bold text-yellow-400 mt-1">4.82% (+142%)</div>
                </div>
                <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800">
                  <div className="text-gray-400 text-[10px]">Cost Per Action</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">$14.20 (-48%)</div>
                </div>
              </div>
            </div>

            {/* Security Scope Card */}
            <div className="glass-card rounded-3xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-display font-bold text-white">System User Authentication</h4>
                  <p className="text-xs text-gray-400">Token Scopes: <code className="text-yellow-400 font-mono">ads_management</code>, <code className="text-yellow-400 font-mono">ads_read</code></p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Production integration uses long-lived Meta System User tokens for stable enterprise background synchronization.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
