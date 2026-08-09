import React from 'react';
import { 
  MessageSquare, Plus, Cpu, ShieldCheck, Layers, Sparkles, 
  Settings, Folder, ChevronRight, BarChart2, CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCustomizer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenCustomizer }) => {
  return (
    <aside className="w-64 bg-[#141416] border-r border-[#333333] flex flex-col justify-between h-full font-sans text-xs select-none">
      
      {/* Top Header */}
      <div>
        <div className="p-4 border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Clean Anthropic/Claude Style Logo Mark */}
            <div className="w-7 h-7 rounded-lg bg-[#D97757] flex items-center justify-center font-bold text-white text-sm">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm tracking-tight">Pencil Studio</span>
              <span className="text-[10px] text-[#A1A1AA]">AI Marketing OS</span>
            </div>
          </div>
        </div>

        {/* New Campaign Action Button */}
        <div className="p-3">
          <button className="w-full py-2.5 px-3 rounded-xl bg-[#262626] border border-[#333333] hover:border-gray-500 text-white font-medium flex items-center justify-between transition-all group">
            <span className="flex items-center gap-2 text-xs">
              <Plus className="w-4 h-4 text-[#D97757]" />
              <span>New Campaign Brief</span>
            </span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="px-2 py-2 space-y-4">
          
          {/* Section: Recent Sessions */}
          <div>
            <div className="px-3 text-[10px] text-[#A1A1AA] uppercase tracking-wider mb-2 font-mono">
              Active Sessions
            </div>
            <div className="space-y-0.5">
              {[
                'Unilever Dove Q3 Launch',
                'Breyers Gelato Reels 9:16',
                'Luxury Sunglasses TikTok',
                'Bayer Health Performance'
              ].map((chat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(chat)}
                  className={`w-full px-3 py-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                    activeTab === chat 
                      ? 'bg-[#262626] text-white font-semibold border-l-2 border-[#D97757]' 
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#1E1E20]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                  <span className="truncate text-xs">{chat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Brand DNA & Customizer Drawer Trigger */}
          <div>
            <div className="px-3 text-[10px] text-[#A1A1AA] uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
              <span>Studio Customizer</span>
              <button onClick={onOpenCustomizer} className="text-[#D97757] hover:underline">Edit</button>
            </div>

            <div 
              onClick={onOpenCustomizer}
              className="p-3 rounded-xl bg-[#1C1C1E] border border-[#333333] hover:border-[#D97757]/60 cursor-pointer space-y-2 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D97757]" />
                  <span>Dove Brand Spec</span>
                </span>
                <span className="text-[#D97757] text-[10px] bg-[#D97757]/10 px-1.5 py-0.5 rounded font-mono">PASSED</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#0B1B3D] border border-gray-600"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#D4AF37] border border-gray-600"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-white border border-gray-600"></span>
                <span className="text-[10px] text-[#A1A1AA] ml-auto">9:16 Story</span>
              </div>
            </div>
          </div>

          {/* Section: Connected Ad Accounts */}
          <div>
            <div className="px-3 text-[10px] text-[#A1A1AA] uppercase tracking-wider mb-2 font-mono">
              Ad Account Integration
            </div>
            <div className="p-3 rounded-xl bg-[#1C1C1E] border border-[#333333] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#D97757]" />
                <div>
                  <div className="text-white font-medium text-[11px]">Meta Ads Manager</div>
                  <div className="text-[10px] font-mono text-[#A1A1AA]">act_unilever_global_01</div>
                </div>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom User Info */}
      <div className="p-3 border-t border-[#333333] bg-[#141416]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#262626] border border-[#333333]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#D97757] text-white font-bold flex items-center justify-center text-xs">
              U
            </div>
            <div>
              <div className="text-white font-bold text-xs">Unilever Admin</div>
              <div className="text-[10px] font-mono text-[#D97757]">Pencil Pro License</div>
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-[#A1A1AA] hover:text-white cursor-pointer" />
        </div>
      </div>

    </aside>
  );
};
