import React from 'react';
import { 
  Swords, 
  Zap, 
  Map, 
  SpellCheck, 
  GraduationCap, 
  BarChart3,
  Volume2, 
  VolumeX, 
  Trophy, 
  RotateCcw,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import { PlayerStats, getLevelInfo } from '../utils/storage';
import { BOSSES } from '../data/muscleCards';
import { sound } from '../utils/sound';

export type GameMode = 'boss' | 'speedrun' | 'quest' | 'words' | 'study' | 'progress';

interface NavbarProps {
  stats: PlayerStats;
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onOpenAchievements: () => void;
  onOpenReset: () => void;
  streak: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  currentMode,
  onSelectMode,
  onOpenAchievements,
  onOpenReset,
  streak
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(sound.enabled);
  const levelInfo = getLevelInfo(stats.xp);
  const knownCardsCount = Object.values(stats.cardStatus).filter(s => s === 'known').length;

  const toggleSound = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  const navItems: { mode: GameMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { mode: 'boss', label: 'Bossid', icon: <Swords className="w-3.5 h-3.5" />, badge: '10' },
    { mode: 'speedrun', label: 'Kiirrünnak', icon: <Zap className="w-3.5 h-3.5" />, badge: '60s' },
    { mode: 'quest', label: 'Missioonid', icon: <Map className="w-3.5 h-3.5" /> },
    { mode: 'words', label: 'Ladina Sõnad', icon: <SpellCheck className="w-3.5 h-3.5" /> },
    { mode: 'study', label: 'Õppelabor', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { mode: 'progress', label: 'Minu Progress', icon: <BarChart3 className="w-3.5 h-3.5" />, badge: `${knownCardsCount}/60` },
  ];

  const equippedLoot = BOSSES.map(b => b.loot).find(l => l.badgeId === stats.activeBadge || l.title === stats.activeTitle);

  return (
    <header className="w-full bg-[#090d16]/90 border-b border-white/[0.08] sticky top-0 z-40 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-900/40 text-lg font-bold ring-1 ring-white/20">
            💪
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white font-['Bricolage_Grotesque',sans-serif] leading-none">
              Musculus <span className="text-rose-400">Arena</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium leading-none mt-1">
              Lihaste Anatoomia Mäng
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean Segmented Bar) */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-950/80 border border-white/[0.06] rounded-xl shadow-inner">
          {navItems.map(item => {
            const active = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => {
                  sound.playClick();
                  onSelectMode(item.mode);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  active
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                    active ? 'bg-rose-700/80 text-rose-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Player Level & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Level & Equipped Title Mini Card */}
          <div 
            onClick={() => {
              sound.playClick();
              onSelectMode('progress');
            }}
            title="Vaata oma taset, tiitlit ja statistikat"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/[0.08] hover:border-amber-400/40 transition-colors cursor-pointer group"
          >
            {equippedLoot ? (
              <span className="text-base shrink-0 animate-pulse" title={equippedLoot.badgeName}>
                {equippedLoot.badgeIcon}
              </span>
            ) : (
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-bold text-white leading-none flex items-center gap-1">
                <span>Lvl {levelInfo.level}</span>
                <span className="text-[10px] font-normal text-amber-300 truncate max-w-[120px]" title={stats.activeTitle ? `Tiitel: „${stats.activeTitle}”` : levelInfo.title}>
                  · {stats.activeTitle ? `„${stats.activeTitle}”` : levelInfo.title}
                </span>
              </div>
              <div className="w-20 bg-slate-950 rounded-full h-1 mt-1 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-rose-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-300 font-bold sm:hidden">
              {equippedLoot ? equippedLoot.badgeIcon : `L${levelInfo.level}`}
            </span>
          </div>

          {/* Current Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1.5 rounded-xl font-bold text-xs">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{streak}x</span>
            </div>
          )}

          {/* Achievements Icon */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAchievements();
            }}
            title="Saavutused"
            className="p-2 rounded-xl bg-slate-900/60 border border-white/[0.08] hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors relative"
          >
            <Trophy className="w-4 h-4" />
            {stats.unlockedAchievements.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center">
                {stats.unlockedAchievements.length}
              </span>
            )}
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Heli sisse lülitatud' : 'Heli välja lülitatud'}
            className="p-2 rounded-xl bg-slate-900/60 border border-white/[0.08] hover:bg-slate-800 text-slate-300 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Reset progress */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenReset();
            }}
            title="Lähtesta edenemine"
            className="p-2 rounded-xl bg-slate-900/60 border border-white/[0.08] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Subnav bar */}
      <div className="lg:hidden px-4 pb-2.5 pt-1 overflow-x-auto scrollbar-none border-t border-white/[0.04]">
        <div className="flex items-center gap-1 min-w-max">
          {navItems.map(item => {
            const active = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => {
                  sound.playClick();
                  onSelectMode(item.mode);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1 rounded ${
                    active ? 'bg-rose-800 text-rose-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
