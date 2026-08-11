import React from 'react';
import { Swords, ArrowRight } from 'lucide-react';
import { CompetitorComparison as CompetitorComparisonType } from '../types';

interface CompetitorComparisonProps {
  comparison: CompetitorComparisonType;
}

export const CompetitorComparison: React.FC<CompetitorComparisonProps> = ({ comparison }) => {
  const competitor = comparison.competitor;
  if (!competitor.provided) return null;

  const ours = comparison.ours;

  return (
    <div className="mt-4 rounded-xl bg-[#141416] border border-[#333333] overflow-hidden">
      <div className="px-4 py-2.5 bg-[#262626] border-b border-[#333333] flex items-center gap-2 font-mono text-xs">
        <Swords className="w-3.5 h-3.5 text-[#D97757]" />
        <span className="font-bold text-white">Competitor Comparison</span>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Competitor column */}
        <div className="rounded-lg border border-[#333333] bg-[#18181B] p-3 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">Competitor</div>
          <Row label="Hook Angle" value={competitor.hook_angle} />
          <Row label="Tone" value={competitor.tone} />
          <Row label="CTA" value={competitor.call_to_action} />
          {competitor.claims.length > 0 && (
            <div>
              <div className="text-[9px] text-[#71717A] uppercase mb-1">Claims</div>
              <div className="flex flex-wrap gap-1">
                {competitor.claims.map((c, idx) => (
                  <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-[#262626] border border-[#333333] text-[#D4D4D8]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {competitor.visual_analysis && (
            <div>
              <div className="text-[9px] text-[#71717A] uppercase mb-1">Visual Style</div>
              {typeof competitor.visual_analysis.note === 'string' ? (
                <div className="text-[10px] text-[#71717A] italic leading-relaxed">{competitor.visual_analysis.note}</div>
              ) : (
                <div className="text-[10px] text-[#D4D4D8] leading-relaxed space-y-0.5">
                  {typeof competitor.visual_analysis.mood === 'string' && <div>Mood: {competitor.visual_analysis.mood}</div>}
                  {typeof competitor.visual_analysis.font_style === 'string' && <div>Font: {competitor.visual_analysis.font_style}</div>}
                  {Array.isArray(competitor.visual_analysis.dominant_colors) && (
                    <div>Colors: {(competitor.visual_analysis.dominant_colors as string[]).join(', ')}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ours column */}
        <div className="rounded-lg border border-[#D97757]/40 bg-[#18181B] p-3 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#D97757]">Pencil AI Variant</div>
          <Row label="Hook Angle" value={ours.hook_angle} accent />
          <Row label="Headline" value={ours.headline} accent />
          <Row label="CTA" value={ours.call_to_action} accent />
          {typeof ours.predictive_score === 'number' && (
            <Row label="Predictive Score" value={`${ours.predictive_score} / 100`} accent />
          )}
        </div>
      </div>

      {competitor.differentiation_angles.length > 0 && (
        <div className="mx-4 mb-4 p-3 rounded-lg bg-[#D97757]/10 border border-[#D97757]/30">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#D97757] mb-1.5 flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3" />
            <span>Differentiation Strategy</span>
          </div>
          <ul className="space-y-1">
            {competitor.differentiation_angles.map((angle, idx) => (
              <li key={idx} className="text-[11px] text-[#D4D4D8] leading-relaxed">
                • {angle}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-4 pb-3 text-[9px] font-mono text-[#71717A]">
        Analyzed via {competitor.model_used} · {competitor.analyzed_modalities.join(' + ')}
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => {
  if (!value) return null;
  return (
    <div>
      <div className="text-[9px] text-[#71717A] uppercase">{label}</div>
      <div className={`text-[11px] ${accent ? 'text-[#D97757]' : 'text-[#D4D4D8]'} font-medium`}>{value}</div>
    </div>
  );
};
