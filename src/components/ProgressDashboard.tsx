import React, { useState } from 'react';
import { 
  BarChart3, 
  Award, 
  Flame, 
  Trophy, 
  Star, 
  Zap, 
  CheckCircle2, 
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Lock,
  Check,
  Crown
} from 'lucide-react';
import { 
  CATEGORIES, 
  MUSCLE_CARDS, 
  BOSSES, 
  INITIAL_ACHIEVEMENTS, 
  MuscleCard,
  BossLoot
} from '../data/muscleCards';
import { PlayerStats, getLevelInfo } from '../utils/storage';
import { sound } from '../utils/sound';

interface ProgressDashboardProps {
  stats: PlayerStats;
  onNavigateToStudy: (catId?: string, onlyWeak?: boolean) => void;
  onNavigateToBoss: (bossId?: string) => void;
  onOpenAchievements: () => void;
  onUpdateStats?: (updater: (prev: PlayerStats) => PlayerStats) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  stats,
  onNavigateToStudy,
  onNavigateToBoss,
  onOpenAchievements,
  onUpdateStats
}) => {
  const [selectedCardPreview, setSelectedCardPreview] = useState<MuscleCard | null>(null);

  const levelInfo = getLevelInfo(stats.xp);

  // Cards summary
  const knownCards = MUSCLE_CARDS.filter(c => stats.cardStatus[c.id] === 'known');
  const learnCards = MUSCLE_CARDS.filter(c => stats.cardStatus[c.id] === 'learn');
  const newCards = MUSCLE_CARDS.filter(c => !stats.cardStatus[c.id] || stats.cardStatus[c.id] === 'new');

  const knownPct = Math.round((knownCards.length / MUSCLE_CARDS.length) * 100);
  const accuracyPct = stats.totalAnswers > 0 
    ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) 
    : 0;

  const totalStars = Object.values(stats.chapterStars).reduce((sum, n) => sum + n, 0);

  const unlockedTitles = stats.unlockedTitles || [];
  const unlockedBadges = stats.unlockedBadges || [];
  const equippedLoot = BOSSES.map(b => b.loot).find(l => l.badgeId === stats.activeBadge || l.title === stats.activeTitle);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Header & Level Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-rose-950/40 border border-white/20">
                {equippedLoot ? equippedLoot.badgeIcon : '🦾'}
              </div>
              {equippedLoot && (
                <div 
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-slate-950 border border-amber-500/70 flex items-center justify-center text-xs shadow-md"
                  title={`Aktiivne märk: ${equippedLoot.badgeName}`}
                >
                  ✨
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                <span className="font-bold text-amber-300">Tase {levelInfo.level}</span>
                <span>·</span>
                <span>{stats.xp} Total XP</span>
                {equippedLoot && (
                  <>
                    <span>·</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      {equippedLoot.badgeIcon} {equippedLoot.badgeRarity} Saak
                    </span>
                  </>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 font-['Bricolage_Grotesque',sans-serif] flex flex-wrap items-center gap-2">
                {stats.activeTitle ? (
                  <>
                    <span className="text-amber-400 underline decoration-amber-500/40 underline-offset-4">
                      „{stats.activeTitle}”
                    </span>
                    <span className="text-xs font-mono font-normal text-slate-400 px-2 py-0.5 rounded-md bg-slate-900 border border-white/[0.08]">
                      Põhitiitel: {levelInfo.title}
                    </span>
                  </>
                ) : (
                  levelInfo.title
                )}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Järgmise tasemeni ({levelInfo.nextTitle}): <b className="text-amber-400 font-mono">+{levelInfo.xpToNext} XP</b>
              </p>
            </div>
          </div>

          {/* Quick CTA to train weak cards */}
          {learnCards.length > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigateToStudy(undefined, true);
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Tee trenni kordamist vajavatega ({learnCards.length})
            </button>
          )}
        </div>

        {/* Level XP Bar */}
        <div className="mt-6 pt-5 border-t border-white/[0.08]">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Taseme edenemine</span>
            <span className="text-amber-400 font-bold">{levelInfo.progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/[0.06]">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Boss Cosmetic Badges & Titles Showcase */}
        <div className="mt-6 pt-5 border-t border-white/[0.08]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
                Bosside Saak & Kosmeetilised Märgid ({unlockedBadges.length}/{BOSSES.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Klõpsa lahtilukustatud märgil, et kanda selle tiitlit profiilil
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {BOSSES.map(boss => {
              const loot = boss.loot;
              const isUnlocked = unlockedBadges.includes(loot.badgeId);
              const isEquipped = stats.activeBadge === loot.badgeId || stats.activeTitle === loot.title;

              return (
                <div
                  key={loot.badgeId}
                  onClick={() => {
                    if (isUnlocked && onUpdateStats) {
                      sound.playCorrect();
                      onUpdateStats(prev => ({
                        ...prev,
                        activeTitle: isEquipped ? undefined : loot.title,
                        activeBadge: isEquipped ? undefined : loot.badgeId
                      }));
                    } else if (!isUnlocked) {
                      sound.playHit();
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all text-left relative flex flex-col justify-between ${
                    isUnlocked
                      ? isEquipped
                        ? 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/60 cursor-pointer scale-[1.02]'
                        : 'bg-slate-900/80 border-white/[0.1] hover:border-amber-400/50 hover:bg-slate-800/80 cursor-pointer'
                      : 'bg-slate-950/60 border-white/[0.04] opacity-50 cursor-not-allowed'
                  }`}
                  title={isUnlocked ? `${loot.badgeName} (${loot.badgeRarity}) · Tiitel: „${loot.title}”\n${loot.lore}` : `Lukustatud. Alista ${boss.name} Areenil, et teenida see märk ja tiitel.`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-2xl filter drop-shadow">
                      {loot.badgeIcon}
                    </span>
                    {isUnlocked ? (
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                        loot.badgeRarity === 'Legendaarne'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : loot.badgeRarity === 'Müütiline'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : loot.badgeRarity === 'Eepiline'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {loot.badgeRarity}
                      </span>
                    ) : (
                      <Lock className="w-3 h-3 text-slate-500" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white truncate">
                      {loot.badgeName}
                    </div>
                    <div className="text-[10px] text-amber-400/90 font-medium truncate mt-0.5">
                      {isUnlocked ? `„${loot.title}”` : `Alista ${boss.name}`}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono">
                    {isUnlocked ? (
                      isEquipped ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Kasutusel
                        </span>
                      ) : (
                        <span className="text-slate-400 hover:text-amber-300 transition-colors">
                          Kanna tiitlit
                        </span>
                      )
                    ) : (
                      <span className="text-slate-500 truncate">
                        Areenil lukus
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Mastery */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Selged Kaardid</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {knownCards.length}<span className="text-sm font-normal text-slate-400">/60</span>
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-1">
            {knownPct}% omandatud
          </div>
        </div>

        {/* Accuracy */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Vastuste Täpsus</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {accuracyPct}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {stats.correctAnswers} / {stats.totalAnswers} õiget
          </div>
        </div>

        {/* Best Streak */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pikim Seeria</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {stats.bestStreak}x
          </div>
          <div className="text-xs text-amber-400 font-medium mt-1">
            Järjestikust tabamust
          </div>
        </div>

        {/* Bosses Beaten */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Bossid Alistatud</span>
            <Trophy className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {stats.bossesDefeated.length}<span className="text-sm font-normal text-slate-400">/{BOSSES.length}</span>
          </div>
          <div className="text-xs text-rose-400 font-medium mt-1">
            Areeni trofeed
          </div>
        </div>
      </div>

      {/* Category Mastery Progress Bars */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-['Bricolage_Grotesque',sans-serif]">
              Teadmised Teemade Lõikes
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Valdkondade omandatuse tase ja missioonide tähed
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Tähed: <b className="text-amber-400">{totalStars}/18 ⭐</b>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(CATEGORIES).map(cat => {
            const catCards = MUSCLE_CARDS.filter(c => c.cat === cat.id);
            const catKnown = catCards.filter(c => stats.cardStatus[c.id] === 'known').length;
            const catLearn = catCards.filter(c => stats.cardStatus[c.id] === 'learn').length;
            const catNew = catCards.length - catKnown - catLearn;
            const catPct = Math.round((catKnown / catCards.length) * 100);
            const stars = stats.chapterStars[cat.id] || 0;

            return (
              <div 
                key={cat.id}
                className="bg-slate-950/70 border border-white/[0.06] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{cat.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({catKnown}/{catCards.length})
                    </span>
                  </div>
                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map(s => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Segmented bar */}
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-500 h-full" 
                    style={{ width: `${(catKnown / catCards.length) * 100}%` }}
                    title={`${catKnown} selge`}
                  />
                  <div 
                    className="bg-amber-500 h-full" 
                    style={{ width: `${(catLearn / catCards.length) * 100}%` }}
                    title={`${catLearn} harjutamisel`}
                  />
                  <div 
                    className="bg-slate-800 h-full" 
                    style={{ width: `${(catNew / catCards.length) * 100}%` }}
                    title={`${catNew} uus`}
                  />
                </div>

                {/* Sub info & CTA */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-mono text-slate-400 text-[11px]">
                    {catPct}% omandatud
                  </span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onNavigateToStudy(cat.id);
                    }}
                    className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    Korda kaarte
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Boss Trophy Hall */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-['Bricolage_Grotesque',sans-serif]">
              Bosside Trofeekapp ({stats.bossesDefeated.length}/{BOSSES.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Klõpsa bossil, et temaga kohe võidelda
            </p>
          </div>
          <button
            onClick={() => onNavigateToBoss()}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
          >
            Areenile
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {BOSSES.map(boss => {
            const isBeaten = stats.bossesDefeated.includes(boss.id);

            return (
              <div
                key={boss.id}
                onClick={() => onNavigateToBoss(boss.id)}
                className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                  isBeaten
                    ? 'bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-400'
                    : 'bg-slate-950/60 border-white/[0.06] hover:border-white/[0.15] opacity-65'
                }`}
              >
                <div className="text-3xl mb-1 filter drop-shadow">
                  {boss.avatar}
                </div>
                <div>
                  <div className="text-xs font-bold text-white truncate max-w-[120px]">
                    {boss.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {boss.maxHp} HP
                  </div>
                </div>

                <div className="mt-2 w-full flex flex-col items-center gap-1.5">
                  {isBeaten ? (
                    <>
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Alistatud
                      </span>
                      <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 truncate max-w-full" title={`${boss.loot.badgeName} (${boss.loot.badgeRarity}) · Tiitel: „${boss.loot.title}”`}>
                        <span>{boss.loot.badgeIcon}</span>
                        <span className="truncate">{boss.loot.title}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-white/[0.05]">
                        Ootel
                      </span>
                      <span className="text-[10px] text-slate-500 truncate max-w-full" title={`Saak: ${boss.loot.badgeName} (${boss.loot.badgeRarity})`}>
                        Saak: {boss.loot.badgeIcon} {boss.loot.badgeName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 60-Card Mastery Matrix */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white font-['Bricolage_Grotesque',sans-serif]">
              60 Kaardi Teadmiste Maatriks
            </h3>
            <p className="text-xs text-slate-400">
              Klõpsa ruudul kaardi küsimuse ja vastuse vaatamiseks
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
              {knownCards.length} selge
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
              {learnCards.length} kordamisel
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-800 inline-block" />
              {newCards.length} uus
            </span>
          </div>
        </div>

        {/* Grid of 60 tiles */}
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-1.5 pt-2">
          {MUSCLE_CARDS.map(card => {
            const status = stats.cardStatus[card.id] || 'new';
            let bg = 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-white/[0.05]';
            if (status === 'known') bg = 'bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold border border-emerald-400/40';
            if (status === 'learn') bg = 'bg-amber-600/90 hover:bg-amber-500 text-white font-bold border border-amber-400/40';

            const isSelected = selectedCardPreview?.id === card.id;

            return (
              <button
                key={card.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCardPreview(card);
                }}
                className={`h-9 rounded-xl text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${bg} ${
                  isSelected ? 'ring-2 ring-rose-400 scale-110 z-10' : ''
                }`}
                title={`#${card.id + 1}: ${card.q}`}
              >
                {card.id + 1}
              </button>
            );
          })}
        </div>

        {/* Selected Card Preview Card */}
        {selectedCardPreview && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-white/[0.1] animate-in fade-in space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-slate-300">
                {CATEGORIES[selectedCardPreview.cat].name} · Kaart #{selectedCardPreview.id + 1}
              </span>
              <span className={`font-bold uppercase text-[11px] ${
                stats.cardStatus[selectedCardPreview.id] === 'known' ? 'text-emerald-400' : stats.cardStatus[selectedCardPreview.id] === 'learn' ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {stats.cardStatus[selectedCardPreview.id] === 'known' ? 'Selge' : stats.cardStatus[selectedCardPreview.id] === 'learn' ? 'Kordamisel' : 'Uus'}
              </span>
            </div>
            <p className="text-sm font-semibold text-white">
              {selectedCardPreview.q}
            </p>
            <p className="text-sm font-bold text-rose-400 pt-1 border-t border-white/[0.06]">
              {selectedCardPreview.a}
            </p>
          </div>
        )}
      </div>

      {/* Speedrun & Achievements summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Speedrun Record */}
        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-400">Kiirrünnaku Tippmark</div>
              <div className="text-2xl font-black font-mono text-white">
                {stats.speedrunHighScore} PTS
              </div>
              <div className="text-xs text-slate-400">
                Parim seeria: {stats.speedrunBestAnswers} õiget
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Record */}
        <div 
          onClick={onOpenAchievements}
          className="glass-panel-interactive rounded-2xl p-5 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-400">Karikad & Saavutused</div>
              <div className="text-2xl font-black font-mono text-white">
                {stats.unlockedAchievements.length} / {INITIAL_ACHIEVEMENTS.length}
              </div>
              <div className="text-xs text-amber-400">
                Klõpsa kõigi vaatamiseks
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </div>
  );
};
