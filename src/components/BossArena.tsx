import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Swords, 
  Heart, 
  ShieldAlert, 
  Zap, 
  Sparkles, 
  RotateCcw, 
  Award,
  ChevronRight,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FlaskConical,
  Target,
  ArrowLeft,
  Shuffle
} from 'lucide-react';
import { BOSSES, Boss, MUSCLE_CARDS, MuscleCard, CATEGORIES } from '../data/muscleCards';
import { PlayerStats } from '../utils/storage';
import { generateQuizOptions, shuffleArray } from '../utils/quizHelper';
import { sound } from '../utils/sound';

interface BossArenaProps {
  stats: PlayerStats;
  onUpdateStats: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onCardAnswered: (cardId: number, isCorrect: boolean) => void;
  initialBossId?: string | null;
}

export const BossArena: React.FC<BossArenaProps> = ({
  stats,
  onUpdateStats,
  onCardAnswered,
  initialBossId
}) => {
  const [selectedBossId, setSelectedBossId] = useState<string>(initialBossId || BOSSES[0].id);
  const [bossFilter, setBossFilter] = useState<'all' | 'zone1' | 'zone2'>('all');
  const [inBattle, setInBattle] = useState<boolean>(false);

  useEffect(() => {
    if (initialBossId) {
      setSelectedBossId(initialBossId);
    }
  }, [initialBossId]);

  // Battle states
  const [bossHp, setBossHp] = useState<number>(100);
  const [playerHearts, setPlayerHearts] = useState<number>(3);
  const [maxHearts] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [currentCard, setCurrentCard] = useState<MuscleCard | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [removedOptions, setRemovedOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [battleLog, setBattleLog] = useState<{ id: number; text: string; type: 'hit' | 'crit' | 'hurt' | 'heal' | 'info' }[]>([]);
  const [floatingDamage, setFloatingDamage] = useState<{ id: number; text: string; isCrit: boolean; isBossHurt: boolean } | null>(null);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);
  const [bossHurtFlash, setBossHurtFlash] = useState<boolean>(false);
  const [playerHurtFlash, setPlayerHurtFlash] = useState<boolean>(false);
  const [bossAbilityTriggered, setBossAbilityTriggered] = useState<boolean>(false);
  const [bossAbilityAlert, setBossAbilityAlert] = useState<{ name: string; desc: string } | null>(null);

  // Powerups (once/twice per fight)
  const [potionAvailable, setPotionAvailable] = useState<boolean>(true);
  const [atpCharges, setAtpCharges] = useState<number>(2);
  const [shieldActive, setShieldActive] = useState<boolean>(false);

  // Question timer
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  const activeBoss = BOSSES.find(b => b.id === selectedBossId) || BOSSES[0];

  const logEvent = (text: string, type: 'hit' | 'crit' | 'hurt' | 'heal' | 'info') => {
    setBattleLog(prev => [{ id: Date.now() + Math.random(), text, type }, ...prev.slice(0, 4)]);
  };

  const triggerShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 350);
  };

  // Next turn
  const loadNextQuestion = useCallback((boss: Boss) => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    setRemovedOptions([]);
    setTimeLeft(16);

    // Pick card with bias towards boss weakness for tactical play
    let pool = MUSCLE_CARDS;
    if (Math.random() < 0.45) {
      const weakPool = MUSCLE_CARDS.filter(c => c.cat === boss.weakCategory);
      if (weakPool.length > 0) pool = weakPool;
    }

    const card = pool[Math.floor(Math.random() * pool.length)];
    setCurrentCard(card);
    setOptions(generateQuizOptions(card));
    setTimerRunning(true);
  }, []);

  // Start battle
  const startBattle = (boss: Boss) => {
    sound.playClick();
    setSelectedBossId(boss.id);
    setBossHp(boss.maxHp);
    setPlayerHearts(3);
    setCombo(0);
    setBattleResult(null);
    setPotionAvailable(true);
    setAtpCharges(2);
    setShieldActive(false);
    setBossHurtFlash(false);
    setPlayerHurtFlash(false);
    setBossAbilityTriggered(false);
    setBossAbilityAlert(null);
    setBattleLog([{ id: Date.now(), text: `Võitlus algas! ${boss.name} astus areenile.`, type: 'info' }]);
    setInBattle(true);
    loadNextQuestion(boss);
  };

  // Handle answer
  const handleAnswer = (pickedOption: string) => {
    if (isAnswered || !currentCard || battleResult) return;
    setIsAnswered(true);
    setTimerRunning(false);
    setSelectedAnswer(pickedOption);

    const isCorrect = pickedOption === currentCard.a;
    onCardAnswered(currentCard.id, isCorrect);

    if (isCorrect) {
      setBossHurtFlash(true);
      setTimeout(() => setBossHurtFlash(false), 550);

      const isWeakness = currentCard.cat === activeBoss.weakCategory;
      const newCombo = combo + 1;
      setCombo(newCombo);

      const isCrit = newCombo >= 3 || Math.random() < 0.15;
      const baseDamage = 75 + Math.floor(Math.random() * 25);
      const weaknessMultiplier = isWeakness ? 1.5 : 1.0;
      const comboMultiplier = 1 + (newCombo * 0.15);
      const critMultiplier = isCrit ? 1.6 : 1.0;

      const totalDamage = Math.round(baseDamage * weaknessMultiplier * comboMultiplier * critMultiplier);
      const newBossHp = Math.max(0, bossHp - totalDamage);
      setBossHp(newBossHp);

      if (isCrit) {
        sound.playCrit();
        logEvent(`⚡ KRIIILINE LÖÖK! ${totalDamage} kahju!`, 'crit');
      } else {
        sound.playCorrect();
        logEvent(`🎯 Tabamus! ${totalDamage} kahju bossile.`, 'hit');
      }

      setFloatingDamage({
        id: Date.now(),
        text: `-${totalDamage} HP${isCrit ? ' 💥 KRIIILINE!' : ''}`,
        isCrit,
        isBossHurt: true
      });

      // Boss ability trigger threshold (< 65% HP)
      if (!bossAbilityTriggered && newBossHp > 0 && newBossHp <= (activeBoss.maxHp * 0.65)) {
        setBossAbilityTriggered(true);
        sound.playBossAbility();
        setBossAbilityAlert({
          name: activeBoss.specialAbilityName,
          desc: activeBoss.specialAbilityDesc
        });
        logEvent(`⚡ ${activeBoss.name} vallandas erivõime: [${activeBoss.specialAbilityName}]!`, 'crit');
        setTimeout(() => setBossAbilityAlert(null), 4500);
      }

      if (newBossHp <= 0) {
        handleVictory();
        return;
      }
    } else {
      setCombo(0);

      if (shieldActive) {
        setShieldActive(false);
        sound.playHit();
        logEvent(`🛡️ Kõõluse kilp kaitses sind rünnaku eest!`, 'info');
      } else {
        setPlayerHurtFlash(true);
        setTimeout(() => setPlayerHurtFlash(false), 550);
        sound.playBossAttack();
        triggerShake();
        const nextHearts = playerHearts - 1;
        setPlayerHearts(nextHearts);
        logEvent(`💥 ${activeBoss.name} tegi vastulöögi! Kaotasid 1 südame.`, 'hurt');

        setFloatingDamage({
          id: Date.now(),
          text: `-1 ❤️ SÜDA`,
          isCrit: false,
          isBossHurt: false
        });

        if (nextHearts <= 0) {
          handleDefeat();
          return;
        }
      }
    }

    // Auto advance
    setTimeout(() => {
      if (bossHp > 0 && playerHearts > 0) {
        loadNextQuestion(activeBoss);
      }
    }, 1800);
  };

  // Timer countdown
  useEffect(() => {
    if (!timerRunning || !inBattle || isAnswered || battleResult) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAnswer('__AEG_LÄBI__');
          return 0;
        }
        if (prev <= 4) sound.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, inBattle, isAnswered, battleResult]);

  // Victory
  const handleVictory = () => {
    setBattleResult('victory');
    setTimerRunning(false);

    const isFirstTime = !stats.bossesDefeated.includes(activeBoss.id);
    if (isFirstTime) {
      sound.playLootDrop();
    } else {
      sound.playVictory();
    }

    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.55 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.6 }
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.6 }
      });
    }, 280);

    const loot = activeBoss.loot;

    onUpdateStats(prev => {
      const alreadyDefeated = prev.bossesDefeated.includes(activeBoss.id);
      const newDefeated = alreadyDefeated ? prev.bossesDefeated : [...prev.bossesDefeated, activeBoss.id];
      const newAchievements = [...prev.unlockedAchievements];
      if (!newAchievements.includes('boss_1')) newAchievements.push('boss_1');
      if (newDefeated.length >= 5 && !newAchievements.includes('boss_5')) newAchievements.push('boss_5');
      if (newDefeated.length >= BOSSES.length && !newAchievements.includes('boss_all')) {
        newAchievements.push('boss_all');
      }

      const newTitles = Array.isArray(prev.unlockedTitles) ? [...prev.unlockedTitles] : [];
      if (loot && !newTitles.includes(loot.title)) {
        newTitles.push(loot.title);
      }

      const newBadges = Array.isArray(prev.unlockedBadges) ? [...prev.unlockedBadges] : [];
      if (loot && !newBadges.includes(loot.badgeId)) {
        newBadges.push(loot.badgeId);
      }

      return {
        ...prev,
        xp: prev.xp + activeBoss.rewardXp,
        bossesDefeated: newDefeated,
        unlockedAchievements: newAchievements,
        unlockedTitles: newTitles,
        unlockedBadges: newBadges,
        activeTitle: prev.activeTitle || loot?.title,
        activeBadge: prev.activeBadge || loot?.badgeId
      };
    });
  };

  // Defeat
  const handleDefeat = () => {
    setBattleResult('defeat');
    setTimerRunning(false);
    sound.playWrong();
  };

  // Use potion
  const usePotion = () => {
    if (!potionAvailable || playerHearts >= maxHearts) return;
    sound.playCorrect();
    setPotionAvailable(false);
    setPlayerHearts(prev => Math.min(maxHearts, prev + 1));
    logEvent(`🧪 Müoglobiini eliksiir: Taastasid 1 südame!`, 'heal');
  };

  // Use ATP 50/50
  const useAtp5050 = () => {
    if (atpCharges <= 0 || !currentCard || isAnswered) return;
    sound.playClick();
    setAtpCharges(prev => prev - 1);

    const wrongOptions = options.filter(o => o !== currentCard.a);
    const toRemove = shuffleArray(wrongOptions).slice(0, 2);
    setRemovedOptions(toRemove);
    logEvent(`⚡ ATP Plahvatus: 2 valet vastust hävitati!`, 'info');
  };

  // Use tendon shield
  const useShield = () => {
    if (shieldActive || isAnswered) return;
    sound.playClick();
    setShieldActive(true);
    logEvent(`🛡️ Kõõluse kilp aktiveeritud! Järgmine eksimus on kaitstud.`, 'info');
  };

  // Keyboard shortcut listener for options (A, B, C, D)
  useEffect(() => {
    if (!inBattle || isAnswered || !currentCard || battleResult) return;

    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const map: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
      if (map[key] !== undefined && options[map[key]]) {
        const opt = options[map[key]];
        if (!removedOptions.includes(opt)) {
          handleAnswer(opt);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [inBattle, isAnswered, currentCard, battleResult, options, removedOptions]);

  // Outside of battle: Boss Selection Hall
  if (!inBattle) {
    const defeatedCount = stats.bossesDefeated.length;

    return (
      <div className="space-y-6">
        {/* Arena Hero Header */}
        <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-xl">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest block mb-2">
                Areeni Duellid & RPG
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Bricolage_Grotesque',sans-serif]">
                Alista 10 Lihaste Titaani
              </h2>
              <p className="mt-2 text-slate-300 text-sm leading-relaxed">
                Iga õige vastus teeb bossile kahju, kiired seeriad vallandavad kriitilised löögid ning õige kategooria küsimused tabavad vastase nõrkust 1.5× jõuga.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl">
                  🛡️
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-400">Sinu Elud (HP)</div>
                  <div className="text-base sm:text-lg font-black font-mono text-emerald-400 flex items-center gap-1.5">
                    3/3 ❤️ <span className="text-xs text-slate-400 font-normal">100 HP</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl">
                  ⚔️
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-400">Bosside Seis</div>
                  <div className="text-base sm:text-lg font-black font-mono text-white">
                    {defeatedCount} / {BOSSES.length} <span className="text-xs font-normal text-slate-400">alistatud</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone Filter Segmented Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-950/80 border border-white/[0.06] rounded-2xl">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => {
                sound.playClick();
                setBossFilter('all');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                bossFilter === 'all'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              Kõik 10 Bossi
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setBossFilter('zone1');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                bossFilter === 'zone1'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              I Tsoon: Alglahingud (1–5)
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setBossFilter('zone2');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                bossFilter === 'zone2'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              II Tsoon: Müoloogia Eliit (6–10)
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 px-3 hidden sm:block">
            Võidu tasu: <span className="text-amber-400 font-bold">+350 kuni +2800 XP</span>
          </div>
        </div>

        {/* Boss Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOSSES.filter((_, idx) => {
            if (bossFilter === 'zone1') return idx < 5;
            if (bossFilter === 'zone2') return idx >= 5;
            return true;
          }).map(boss => {
            const idx = BOSSES.findIndex(b => b.id === boss.id);
            const isDefeated = stats.bossesDefeated.includes(boss.id);
            const isUnlocked = idx === 0 || stats.bossesDefeated.includes(BOSSES[idx - 1].id) || stats.xp >= (idx * 280);
            const weakCat = CATEGORIES[boss.weakCategory];

            return (
              <div
                key={boss.id}
                className={`group rounded-2xl transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isDefeated
                    ? 'glass-panel border-emerald-500/30'
                    : isUnlocked
                    ? 'glass-panel-interactive'
                    : 'bg-slate-950/40 border border-slate-900 opacity-60'
                }`}
              >
                {/* Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/[0.08] flex items-center justify-center text-3xl shadow-inner">
                      {boss.avatar}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {boss.maxHp} HP
                      </span>
                      {isDefeated && (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Alistatud
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">
                    {boss.name}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium">{boss.title}</p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {boss.lore}
                  </p>
                </div>

                {/* Footer details */}
                <div className="p-5 pt-3 border-t border-white/[0.06] bg-slate-950/50">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400">Nõrkus:</span>
                    <span className="font-semibold text-rose-300 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-rose-400" />
                      {weakCat.shortName} (1.5x)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400">Bossi Saak:</span>
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5 truncate max-w-[170px]" title={`${boss.loot.badgeName} (${boss.loot.badgeRarity}) · Tiitel: „${boss.loot.title}”`}>
                      <span>{boss.loot.badgeIcon}</span>
                      <span className="truncate">{boss.loot.badgeName}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-4">
                    <span className="text-slate-400">Võidu tasu:</span>
                    <span className="font-mono font-bold text-amber-400">+{boss.rewardXp} XP</span>
                  </div>

                  <button
                    disabled={!isUnlocked}
                    onClick={() => startBattle(boss)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isUnlocked
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/50 active:scale-[0.98]'
                        : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    {isDefeated ? 'Võitle uuesti' : isUnlocked ? 'Alusta lahingut' : 'Lukustatud'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ACTIVE BATTLE VIEW
  const bossHpPercent = Math.max(0, Math.round((bossHp / activeBoss.maxHp) * 100));
  const playerHpPercent = Math.max(0, Math.round((playerHearts / maxHearts) * 100));
  const playerEquippedLoot = BOSSES.map(b => b.loot).find(l => l.badgeId === stats.activeBadge || l.title === stats.activeTitle);

  return (
    <div className={`space-y-4 max-w-3xl mx-auto transition-transform ${screenShake ? 'animate-bounce' : ''}`}>
      {/* Arena Stage Card */}
      <div className="relative rounded-3xl glass-panel p-5 sm:p-7 shadow-2xl overflow-hidden">
        {/* Boss Ability Dramatic Warning Banner */}
        {bossAbilityAlert && (
          <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-red-950/90 to-purple-950/90 border border-amber-500/60 shadow-xl shadow-amber-950/50 flex items-center gap-3 animate-pulse z-20">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl shrink-0">
              ⚡
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span>{activeBoss.name} vallandas erivõime:</span>
                <span className="underline decoration-amber-400 font-bold">{bossAbilityAlert.name}!</span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5 truncate">
                {bossAbilityAlert.desc}
              </p>
            </div>
          </div>
        )}

        {/* Floating damage number */}
        {floatingDamage && (
          <div 
            key={floatingDamage.id}
            className={`absolute top-1/4 ${floatingDamage.isBossHurt ? 'right-1/4' : 'left-1/4'} text-xl sm:text-2xl font-black font-mono tracking-tight animate-bounce z-30 pointer-events-none ${
              floatingDamage.isCrit 
                ? 'text-amber-400 text-3xl drop-shadow-[0_4px_12px_rgba(245,158,11,0.7)]' 
                : floatingDamage.isBossHurt 
                ? 'text-rose-400 drop-shadow-[0_2px_8px_rgba(244,63,94,0.6)]' 
                : 'text-red-500 drop-shadow-[0_2px_8px_rgba(239,68,68,0.7)]'
            }`}
          >
            {floatingDamage.text}
          </div>
        )}

        {/* DUAL COMBATANTS BATTLE HUD: Sina (Player) vs Boss */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-3 bg-slate-950/80 border border-white/[0.08] rounded-2xl p-4 sm:p-5 mb-6 relative overflow-hidden">
          {/* Subtle battle glow backdrop */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-rose-500/5 pointer-events-none" />

          {/* LEFT: Player (Sina / Õppur) with Health Bar & Lives */}
          <div className={`relative p-3.5 rounded-xl bg-slate-900/90 border transition-all duration-300 flex flex-col justify-between ${
            playerHurtFlash 
              ? 'border-rose-500 bg-rose-950/40 ring-2 ring-rose-500/50 scale-[0.98]' 
              : 'border-white/[0.08]'
          }`}>
            <div>
              {/* Player Header */}
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {playerEquippedLoot ? playerEquippedLoot.badgeIcon : '🛡️'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs sm:text-sm font-bold text-white truncate">
                      Sina {stats.activeTitle ? `· „${stats.activeTitle}”` : ''}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400 shrink-0">
                      {playerHearts} / {maxHearts} ❤️
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-mono text-slate-400 truncate">
                      Tase {stats.level} · {stats.levelTitle}
                    </span>
                    {shieldActive && (
                      <span className="text-[10px] font-bold text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded border border-sky-500/40 flex items-center gap-0.5 shrink-0">
                        <ShieldCheck className="w-3 h-3" /> Kilp
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Player Visual Health Bar with Tailwind CSS Transitions */}
              <div className="space-y-1 mt-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Minu Elud</span>
                  <span className={`font-bold transition-colors duration-300 ${
                    playerHearts <= 1 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                  }`}>
                    {playerHearts * 33 + (playerHearts === maxHearts ? 1 : 0)} / 100 HP ({playerHpPercent}%)
                  </span>
                </div>

                {/* Animated Health Bar Container */}
                <div className="relative w-full bg-slate-950 rounded-full h-3.5 overflow-hidden border border-white/[0.08] p-0.5 shadow-inner">
                  {/* Draining transition fill */}
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${
                      playerHpPercent > 50 
                        ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 shadow-emerald-900/40' 
                        : playerHpPercent > 25 
                        ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-amber-900/40' 
                        : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse shadow-red-950'
                    }`}
                    style={{ width: `${playerHpPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Heart Containers */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-1.5">
                {[...Array(maxHearts)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 transition-all duration-300 ${
                      i < playerHearts
                        ? 'fill-rose-500 text-rose-500 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                        : 'text-slate-800 scale-90'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {playerHearts === maxHearts ? 'Täis elujõud' : playerHearts === 1 ? 'Kriitiline!' : 'Ettevaatust'}
              </span>
            </div>
          </div>

          {/* CENTER: VS & Round HUD */}
          <div className="flex md:flex-col items-center justify-center gap-2 py-2 px-3 self-center">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/[0.12] flex items-center justify-center text-xs font-black font-mono text-amber-400 shadow-lg shadow-black/60 shrink-0">
              VS
            </div>

            {/* Turn Timer */}
            <div className="flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-full bg-slate-950 border border-white/[0.08] shadow-inner">
              <Clock className={`w-3.5 h-3.5 ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
              <span className={`font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-slate-200'}`}>
                {timeLeft}s
              </span>
            </div>

            {/* Combo Multiplier */}
            {combo > 1 ? (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold font-mono flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3 fill-amber-400" />
                {combo}x ({(1 + combo * 0.15).toFixed(1)}x)
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono hidden md:block">
                Kombo: 0x
              </span>
            )}
          </div>

          {/* RIGHT: Active Boss with Draining Visual Health Bar */}
          <div className={`relative p-3.5 rounded-xl bg-slate-900/90 border transition-all duration-300 flex flex-col justify-between ${
            bossHurtFlash 
              ? 'border-rose-500 bg-rose-950/40 ring-2 ring-rose-500/50 scale-[0.98]' 
              : 'border-white/[0.08]'
          }`}>
            <div>
              {/* Boss Header */}
              <div className="flex items-center gap-3 mb-2.5">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-950 border border-white/[0.08] flex items-center justify-center text-3xl shadow-inner shrink-0 transition-transform ${
                  bossHurtFlash ? 'rotate-6 scale-110' : ''
                }`}>
                  {activeBoss.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs sm:text-sm font-bold text-white truncate">
                      {activeBoss.name}
                    </span>
                    <span className="font-mono text-xs font-bold text-rose-400 shrink-0">
                      {bossHp} / {activeBoss.maxHp} HP
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-400 truncate">{activeBoss.title}</p>
                </div>
              </div>

              {/* Boss Visual Health Bar that Drains via Tailwind CSS Transitions */}
              <div className="space-y-1 mt-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Bossi Elud (HP)</span>
                  <span className={`font-bold transition-colors duration-300 ${
                    bossHpPercent <= 25 ? 'text-red-400 animate-pulse' : 'text-rose-400'
                  }`}>
                    {bossHpPercent}%
                  </span>
                </div>

                {/* Animated Health Bar Container */}
                <div className="relative w-full bg-slate-950 rounded-full h-3.5 overflow-hidden border border-white/[0.08] p-0.5 shadow-inner">
                  {/* Lingering ghost damage bar */}
                  <div 
                    className="absolute inset-0 bg-rose-950/50 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${bossHpPercent}%` }}
                  />
                  {/* Active Boss HP bar that smoothly drains on correct answers */}
                  <div 
                    className={`relative h-full rounded-full transition-all duration-500 ease-out shadow-sm ${
                      bossHpPercent > 50
                        ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 shadow-rose-900/50'
                        : bossHpPercent > 25
                        ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-red-500 shadow-amber-900/50'
                        : 'bg-gradient-to-r from-red-700 via-rose-600 to-red-500 animate-pulse shadow-red-950'
                    }`}
                    style={{ width: `${bossHpPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Boss Status & Weakness Footer */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-slate-400">
              <span className="text-rose-300 truncate">
                Nõrkus: {CATEGORIES[activeBoss.weakCategory].shortName} (1.5x)
              </span>
              <span className={`font-bold shrink-0 ${
                bossHpPercent <= 25 ? 'text-red-400 animate-pulse' : bossHpPercent <= 60 ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {bossHpPercent <= 25 ? '⚠️ KRIITILINE' : bossHpPercent <= 60 ? '⚡ Nõrgestatud' : '🛡️ Terve'}
              </span>
            </div>
          </div>
        </div>

        {/* Current Question Stage */}
        {currentCard && !battleResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span>{CATEGORIES[currentCard.cat].name}</span>
                {currentCard.cat === activeBoss.weakCategory && (
                  <span className="text-amber-400 font-bold">🎯 NÕRKUS! (1.5x)</span>
                )}
              </span>
              <div className="flex items-center gap-3">
                <button
                  disabled={isAnswered}
                  onClick={() => {
                    sound.playShuffle();
                    loadNextQuestion(activeBoss);
                  }}
                  title="Vaheta ja sega uus küsimus"
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <Shuffle className="w-3 h-3 text-amber-400" />
                  <span>Sega uus küsimus</span>
                </button>
                <span>Küsimus #{currentCard.id + 1}</span>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-white/[0.08] rounded-2xl p-5 sm:p-6">
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                {currentCard.q}
              </p>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt, idx) => {
                const isRemoved = removedOptions.includes(opt);
                const isSelected = selectedAnswer === opt;
                const isCorrect = isAnswered && opt === currentCard.a;
                const isWrongSelected = isAnswered && isSelected && !isCorrect;

                let btnStyle = 'bg-slate-900/90 hover:bg-slate-800/90 border-white/[0.08] text-slate-200';
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]';
                } else if (isWrongSelected) {
                  btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-200';
                } else if (isRemoved) {
                  btnStyle = 'opacity-20 line-through border-transparent text-slate-600 cursor-not-allowed';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered || isRemoved}
                    onClick={() => handleAnswer(opt)}
                    className={`p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-start gap-3 relative cursor-pointer ${btnStyle}`}
                  >
                    <span className="font-mono text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-white/[0.08] shrink-0 font-bold">
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    <span className="leading-snug flex-1">{opt}</span>
                    {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />}
                    {isWrongSelected && <XCircle className="w-4 h-4 text-rose-400 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Battle Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <button
                  disabled={!potionAvailable || playerHearts >= maxHearts || isAnswered}
                  onClick={usePotion}
                  title="Taasta 1 elusüda"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    potionAvailable && playerHearts < maxHearts && !isAnswered
                      ? 'bg-rose-950/60 border-rose-600/50 text-rose-300 hover:bg-rose-900/60 cursor-pointer'
                      : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5 text-rose-400" />
                  Eliksiir {potionAvailable ? '(1)' : '(0)'}
                </button>

                <button
                  disabled={atpCharges <= 0 || isAnswered}
                  onClick={useAtp5050}
                  title="Eemalda 2 valet varianti"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    atpCharges > 0 && !isAnswered
                      ? 'bg-amber-950/60 border-amber-600/50 text-amber-300 hover:bg-amber-900/60 cursor-pointer'
                      : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  ATP 50/50 ({atpCharges})
                </button>

                <button
                  disabled={shieldActive || isAnswered}
                  onClick={useShield}
                  title="Kaitse järgmise eksimuse eest"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    !shieldActive && !isAnswered
                      ? 'bg-sky-950/60 border-sky-600/50 text-sky-300 hover:bg-sky-900/60 cursor-pointer'
                      : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
                  Kõõluse Kilp
                </button>
              </div>

              {/* Retreat */}
              <button
                onClick={() => {
                  sound.playClick();
                  setInBattle(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                Taandu areenilt
              </button>
            </div>
          </div>
        )}

        {/* Victory Screen */}
        {battleResult === 'victory' && (
          <div className="py-8 text-center space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-emerald-950/50">
              🏆
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-['Bricolage_Grotesque',sans-serif]">
                VÕIT! {activeBoss.name} on alistatud!
              </h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto mt-2">
                Suurepärane täpsus! Sinu anatoomiateadmised murdsid vastase vastupanu.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              Saadud tasu: +{activeBoss.rewardXp} XP
            </div>

            {/* Unique Boss Loot Drop Card */}
            {activeBoss.loot && (
              <div className="max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 shadow-xl shadow-amber-950/40 text-left relative overflow-hidden group">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Uus Bossi Saak & Trofee
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    activeBoss.loot.badgeRarity === 'Legendaarne'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : activeBoss.loot.badgeRarity === 'Müütiline'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : activeBoss.loot.badgeRarity === 'Eepiline'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {activeBoss.loot.badgeRarity}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                    {activeBoss.loot.badgeIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                      {activeBoss.loot.badgeName}
                    </h4>
                    <div className="text-xs font-bold text-amber-400 mt-0.5">
                      Tiitel: <span className="underline underline-offset-2">„{activeBoss.loot.title}”</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {activeBoss.loot.lore}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Lisatud profiilikaardile
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Kuvatakse Minu Progressis
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setInBattle(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 cursor-pointer"
              >
                Tagasi Bosside nimekirja
              </button>
            </div>
          </div>
        )}

        {/* Defeat Screen */}
        {battleResult === 'defeat' && (
          <div className="py-8 text-center space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500 text-rose-400 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-rose-950/50">
              💀
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-['Bricolage_Grotesque',sans-serif]">
                Kaotus! Stamina sai otsa...
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
                Iga viga õpetab. Korda keerulisi kaarte Õppelaboris või proovi uuesti värske energiaga!
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => startBattle(activeBoss)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Proovi uuesti
              </button>
              <button
                onClick={() => setInBattle(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/[0.08] cursor-pointer"
              >
                Tagasi valikusse
              </button>
            </div>
          </div>
        )}

        {/* Battle Log */}
        {battleLog.length > 0 && (
          <div className="mt-5 pt-3 border-t border-white/[0.06]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
              Lahingu logi:
            </span>
            <div className="space-y-1 text-xs font-mono">
              {battleLog.slice(0, 3).map(entry => (
                <div
                  key={entry.id}
                  className={`leading-tight ${
                    entry.type === 'crit'
                      ? 'text-amber-400 font-bold'
                      : entry.type === 'hit'
                      ? 'text-emerald-400'
                      : entry.type === 'hurt'
                      ? 'text-rose-400'
                      : entry.type === 'heal'
                      ? 'text-sky-400'
                      : 'text-slate-400'
                  }`}
                >
                  {entry.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
