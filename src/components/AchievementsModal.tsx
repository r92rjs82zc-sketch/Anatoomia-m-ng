import React from 'react';
import { Trophy, X, CheckCircle2, Lock } from 'lucide-react';
import { INITIAL_ACHIEVEMENTS } from '../data/muscleCards';
import { PlayerStats } from '../utils/storage';
import { sound } from '../utils/sound';

interface AchievementsModalProps {
  stats: PlayerStats;
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  stats,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-panel rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/[0.1]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Bricolage_Grotesque',sans-serif]">
                Saavutused & Karikad
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Lahti lukustatud: {stats.unlockedAchievements.length} / {INITIAL_ACHIEVEMENTS.length}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 overflow-y-auto divide-y divide-white/[0.06] space-y-3">
          {INITIAL_ACHIEVEMENTS.map(ach => {
            const isUnlocked = stats.unlockedAchievements.includes(ach.id);

            return (
              <div 
                key={ach.id} 
                className={`pt-3 first:pt-0 flex items-start gap-3.5 transition-opacity ${
                  isUnlocked ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${
                  isUnlocked 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-sm' 
                    : 'bg-slate-950 border-white/[0.06] text-slate-600'
                }`}>
                  {isUnlocked ? ach.icon : <Lock className="w-4 h-4 text-slate-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">
                      {ach.name}
                    </h4>
                    {isUnlocked && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Saavutatud
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {ach.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
