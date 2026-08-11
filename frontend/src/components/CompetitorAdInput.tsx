import React, { useState, useRef } from 'react';
import { GitCompare, ChevronDown, ChevronUp, Info, ExternalLink, Image as ImageIcon, X } from 'lucide-react';

export interface CompetitorAdDraft {
  ad_copy: string;
  ad_library_url: string;
  competitor_brand: string;
  screenshot_url: string;
  running_since: string;
  style_notes: string;
}

interface CompetitorAdInputProps {
  value: CompetitorAdDraft;
  onChange: (draft: CompetitorAdDraft) => void;
}

export const EMPTY_COMPETITOR_DRAFT: CompetitorAdDraft = {
  ad_copy: '',
  ad_library_url: '',
  competitor_brand: '',
  screenshot_url: '',
  running_since: '',
  style_notes: ''
};

// Builds a link to Meta's Ad Library search UI, prefilled with the brand name.
// This only constructs a URL for the user to open in their own browser tab --
// nothing is fetched server-side, so it doesn't touch Meta's scraping ban.
function buildAdLibrarySearchUrl(brand: string): string {
  const params = new URLSearchParams({
    active_status: 'active',
    ad_type: 'all',
    country: 'ALL',
    is_targeted_country: 'false',
    media_type: 'all',
    q: brand,
    search_type: 'keyword_unordered'
  });
  return `https://www.facebook.com/ads/library/?${params.toString()}`;
}

export const CompetitorAdInput: React.FC<CompetitorAdInputProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasContent = value.ad_copy.trim().length > 0 || value.screenshot_url.trim().length > 0;

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...value, screenshot_url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

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
              Meta's Ad Library API doesn't expose ordinary commercial ads, so find and read the
              competitor's ad yourself, then paste the copy and/or upload a screenshot below.
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#71717A] block mb-1">Competitor brand (optional):</span>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="e.g. RivalCo"
                value={value.competitor_brand}
                onChange={(e) => onChange({ ...value, competitor_brand: e.target.value })}
                className="w-full bg-[#141416] border border-[#333333] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D97757]"
              />
              <a
                href={buildAdLibrarySearchUrl(value.competitor_brand || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 rounded-lg border border-[#333333] text-[10px] text-[#A1A1AA] hover:border-[#D97757] hover:text-[#D97757] whitespace-nowrap transition-colors"
                title="Opens Meta's Ad Library search in a new tab -- nothing is fetched automatically"
              >
                <ExternalLink className="w-3 h-3" />
                Search
              </a>
            </div>
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
            <span className="text-[10px] text-[#71717A] block mb-1">Screenshot (optional -- analyzed by a vision model when one is configured):</span>
            {value.screenshot_url ? (
              <div className="relative inline-block">
                <img src={value.screenshot_url} alt="Competitor ad screenshot" className="max-h-28 rounded-lg border border-[#333333]" />
                <button
                  type="button"
                  onClick={() => onChange({ ...value, screenshot_url: '' })}
                  className="absolute -top-1.5 -right-1.5 bg-[#1C1C1E] border border-[#333333] rounded-full p-0.5 text-[#A1A1AA] hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-[#333333] text-[10px] text-[#A1A1AA] hover:border-[#D97757] hover:text-[#D97757] transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Upload screenshot
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
          </div>

          <div>
            <span className="text-[10px] text-[#71717A] block mb-1">Running since (optional -- a long-running ad is a signal it's converting):</span>
            <input
              type="text"
              placeholder="e.g. March 2025"
              value={value.running_since}
              onChange={(e) => onChange({ ...value, running_since: e.target.value })}
              className="w-full bg-[#141416] border border-[#333333] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#D97757]"
            />
          </div>

          <div>
            <span className="text-[10px] text-[#71717A] block mb-1">Style notes (optional, e.g. "minimalist font and colors"):</span>
            <textarea
              rows={2}
              placeholder="Describe any visual style you want factored into the differentiation..."
              value={value.style_notes}
              onChange={(e) => onChange({ ...value, style_notes: e.target.value })}
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
