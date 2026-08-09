import React, { useState } from 'react';
import { GitCompare, ChevronDown, ChevronUp, Info } from 'lucide-react';

export interface CompetitorAdDraft {
  ad_copy: string;
  ad_library_url: string;
  competitor_brand: string;
}

interface CompetitorAdInputProps {
  value: CompetitorAdDraft;
  onChange: (draft: CompetitorAdDraft) => void;
}

export const EMPTY_COMPETITOR_DRAFT: CompetitorAdDraft = {
  ad_copy: '',
  ad_library_url: '',
  competitor_brand: ''
};

export const CompetitorAdInput: React.FC<CompetitorAdInputProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasContent = value.ad_copy.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] rounded-full border transition-colors ${
          hasContent
            ? 'bg-[#D97757]/10 border-[#D97757]/50 text-[#D97757]'
            : 'bg-[#262626] border-[#333333] text-[#A1A1AA] hover:border-gray-500'
        }`}
      >
        <GitCompare className="w-3.5 h-3.5" />
        <span>{hasContent ? 'Competitor ad added' : 'Compare vs a competitor ad'}</span>
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div className="mt-2 p-3.5 rounded-xl bg-[#1C1C1E] border border-[#333333] space-y-2.5">
          <div className="flex items-start gap-1.5 text-[10px] text-[#A1A1AA] leading-relaxed">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#D97757]" />
            <span>
              Meta's Ad Library API doesn't expose ordinary commercial ads, so paste the competitor's
              copy manually (a link is optional, kept only as a reference).
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#71717A] block mb-1">Competitor brand (optional):</span>
            <input
              type="text"
              placeholder="e.g. RivalCo"
              value={value.competitor_brand}
              onChange={(e) => onChange({ ...value, competitor_brand: e.target.value })}
              className="w-full bg-[#141416] border border-[#333333] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D97757]"
            />
          </div>

          <div>
            <span className="text-[10px] text-[#71717A] block mb-1">Competitor ad copy:</span>
            <textarea
              rows={3}
              placeholder="Paste the competitor's headline and body text..."
              value={value.ad_copy}
              onChange={(e) => onChange({ ...value, ad_copy: e.target.value })}
              className="w-full bg-[#141416] border border-[#333333] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D97757] resize-none"
            />
          </div>

          <div>
            <span className="text-[10px] text-[#71717A] block mb-1">Ad Library link (optional, for reference only):</span>
            <input
              type="text"
              placeholder="https://www.facebook.com/ads/library/?id=..."
              value={value.ad_library_url}
              onChange={(e) => onChange({ ...value, ad_library_url: e.target.value })}
              className="w-full bg-[#141416] border border-[#333333] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D97757]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
