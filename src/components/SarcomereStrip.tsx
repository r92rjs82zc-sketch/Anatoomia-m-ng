import React, { useState } from 'react';
import { Shuffle, Check } from 'lucide-react';
import { MUSCLE_CARDS, MuscleCard } from '../data/muscleCards';
import { CardMastery } from '../utils/storage';
import { sound } from '../utils/sound';

interface SarcomereStripProps {
  cardStatus: Record<number, CardMastery>;
  currentCardId?: number;
  onCardClick?: (card: MuscleCard) => void;
  onShuffleAll?: () => void;
}

export const SarcomereStrip: React.FC<SarcomereStripProps> = ({
  cardStatus,
  currentCardId,
  onCardClick,
  onShuffleAll
}) => {
  const [justShuffled, setJustShuffled] = useState(false);

  const knownCount = MUSCLE_CARDS.filter(c => cardStatus[c.id] === 'known').length;
  const learnCount = MUSCLE_CARDS.filter(c => cardStatus[c.id] === 'learn').length;
  const newCount = MUSCLE_CARDS.length - knownCount - learnCount;
  const percentComplete = Math.round((knownCount / MUSCLE_CARDS.length) * 100);

  const handleShuffle = () => {
    sound.playShuffle();
    setJustShuffled(true);
    if (onShuffleAll) {
      onShuffleAll();
    }
    setTimeout(() => setJustShuffled(false), 2000);
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-3 sm:p-4 shadow-lg shadow-black/20">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white font-['Bricolage_Grotesque',sans-serif] tracking-wide text-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            Sarkomeeri Kiud
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300 font-mono text-[11px]">
            {percentComplete}% selge ({knownCount}/60)
          </span>
        </div>

        {/* Action Controls & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Shuffle Button */}
          <button
            onClick={handleShuffle}
            title="Sega küsimuste järjekord kõigis režiimides"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
              justShuffled 
                ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                : 'bg-slate-900/90 border-white/[0.08] hover:border-amber-500/40 text-slate-300 hover:text-amber-300'
            }`}
          >
            {justShuffled ? (
              <>
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Küsimused segatud!</span>
              </>
            ) : (
              <>
                <Shuffle className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
                <span>Sega küsimused</span>
              </>
            )}
          </button>

          {/* Clean unboxed legend */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" />
              <b className="text-emerald-400 font-bold">{knownCount}</b> selge
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-xs bg-amber-500 inline-block" />
              <b className="text-amber-400 font-bold">{learnCount}</b> kordamisel
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-xs bg-slate-700 inline-block" />
              <b className="text-slate-400 font-bold">{newCount}</b> uus
            </span>
          </div>
        </div>
      </div>

      {/* Visual striation strip representing actin & myosin band */}
      <div 
        className="flex gap-[2px] sm:gap-1 h-5 p-1 bg-slate-950/90 rounded-xl border border-white/[0.05] overflow-x-auto items-center"
        title="Klõpsa triibul, et avada selle kaardi anatoomia"
      >
        {MUSCLE_CARDS.map(card => {
          const status = cardStatus[card.id] || 'new';
          const isCurrent = currentCardId === card.id;

          let bgClass = 'bg-slate-800/80 hover:bg-slate-700';
          if (status === 'known') bgClass = 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.3)]';
          if (status === 'learn') bgClass = 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.3)]';

          return (
            <button
              key={card.id}
              onClick={() => onCardClick && onCardClick(card)}
              title={`Kaart #${card.id + 1}: ${card.q} -> ${card.a}`}
              className={`flex-1 h-full min-w-[3px] sm:min-w-[4px] rounded-[1px] transition-all duration-150 cursor-pointer ${bgClass} ${
                isCurrent ? 'ring-2 ring-rose-500 scale-y-125 z-10' : ''
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
