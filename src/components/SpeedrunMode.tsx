import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Zap, 
  Timer, 
  Flame, 
  Trophy, 
  RotateCcw, 
  Sparkles, 
  Play
} from 'lucide-react';
import { MUSCLE_CARDS, MuscleCard, CATEGORIES } from '../data/muscleCards';
import { PlayerStats } from '../utils/storage';
import { generateQuizOptions } from '../utils/quizHelper';
import { sound } from '../utils/sound';

interface SpeedrunModeProps {
  stats: PlayerStats;
  onUpdateStats: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onCardAnswered: (cardId: number, isCorrect: boolean) => void;
}

export const SpeedrunMode: React.FC<SpeedrunModeProps> = ({
  stats,
  onUpdateStats,
  onCardAnswered
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestRunStreak, setBestRunStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalAttempted, setTotalAttempted] = useState<number>(0);
  const [currentCard, setCurrentCard] = useState<MuscleCard | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ text: string; isBonus: boolean } | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const questionStartTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pick next question
  const nextQuestion = () => {
    const card = MUSCLE_CARDS[Math.floor(Math.random() * MUSCLE_CARDS.length)];
    setCurrentCard(card);
    setOptions(generateQuizOptions(card));
    questionStartTimeRef.current = Date.now();
  };

  // Start speedrun
  const startGame = () => {
    sound.playClick();
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setBestRunStreak(0);
    setCorrectCount(0);
    setTotalAttempted(0);
    setIsGameOver(false);
    setLastFeedback(null);
    setIsPlaying(true);
    nextQuestion();
  };

  // Answer handler
  const handleAnswer = (picked: string) => {
    if (!currentCard || !isPlaying || isGameOver) return;

    const isCorrect = picked === currentCard.a;
    const responseTimeSec = (Date.now() - questionStartTimeRef.current) / 1000;
    setTotalAttempted(prev => prev + 1);
    onCardAnswered(currentCard.id, isCorrect);

    if (isCorrect) {
      sound.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestRunStreak(prev => Math.max(prev, newStreak));
      setCorrectCount(prev => prev + 1);

      let multiplier = 1;
      if (newStreak >= 10) multiplier = 4;
      else if (newStreak >= 6) multiplier = 3;
      else if (newStreak >= 3) multiplier = 2;

      let bonusSeconds = 0;
      if (responseTimeSec < 2.5) {
        bonusSeconds = 2;
        setTimeLeft(prev => Math.min(90, prev + 2));
      }

      const pointsEarned = 100 * multiplier + (bonusSeconds ? 50 : 0);
      setScore(prev => prev + pointsEarned);

      setLastFeedback({
        text: `+${pointsEarned} PTS ${bonusSeconds ? '(+2s Kiirus!)' : ''}`,
        isBonus: true
      });
    } else {
      sound.playWrong();
      setStreak(0);
      setTimeLeft(prev => Math.max(0, prev - 3));
      setLastFeedback({
        text: `-3s Aja trahv!`,
        isBonus: false
      });
    }

    nextQuestion();
  };

  // Timer loop
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          endGame();
          return 0;
        }
        if (prev <= 5) sound.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isGameOver]);

  const endGame = () => {
    setIsGameOver(true);
    setIsPlaying(false);
    sound.playVictory();

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });

    onUpdateStats(prev => {
      const newAchievements = [...prev.unlockedAchievements];
      if (correctCount >= 20 && !newAchievements.includes('speed_master')) {
        newAchievements.push('speed_master');
      }

      return {
        ...prev,
        xp: prev.xp + Math.round(score / 5),
        speedrunHighScore: Math.max(prev.speedrunHighScore, score),
        speedrunBestAnswers: Math.max(prev.speedrunBestAnswers, correctCount),
        unlockedAchievements: newAchievements
      };
    });
  };

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying || isGameOver || !currentCard) return;

    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const map: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
      if (map[key] !== undefined && options[map[key]]) {
        handleAnswer(options[map[key]]);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, isGameOver, currentCard, options]);

  const getRank = (finalScore: number) => {
    if (finalScore >= 3500) return { rank: 'S', color: 'text-amber-400 border-amber-400/50 bg-amber-400/10', title: 'Olümpose Titaan' };
    if (finalScore >= 2400) return { rank: 'A', color: 'text-rose-400 border-rose-400/50 bg-rose-400/10', title: 'Müoloogia Magister' };
    if (finalScore >= 1400) return { rank: 'B', color: 'text-sky-400 border-sky-400/50 bg-sky-400/10', title: 'Kogenud Anatoom' };
    if (finalScore >= 600) return { rank: 'C', color: 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10', title: 'Skeleti Õppur' };
    return { rank: 'D', color: 'text-slate-400 border-slate-700 bg-slate-800/40', title: 'Algaja Venitus' };
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-2">
              Välkmäng & Adrenaliin
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Bricolage_Grotesque',sans-serif]">
              60 Sekundit Puhast Kiirust
            </h2>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
              Vasta võimalikult paljudele anatoomiaküsimustele enne, kui aeg lõppeb! Kiired vastused annavad lisaaega (+2s), vead võtavad maha (-3s) ja järjestikused tabamused kordistavad punkte kuni 4×!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-400">Tippmark</div>
              <div className="text-xl font-black font-mono text-white">
                {stats.speedrunHighScore} PTS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Game Card */}
      {!isPlaying && !isGameOver && (
        <div className="glass-panel rounded-3xl p-8 sm:p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl mx-auto">
            ⚡
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white mb-2 font-['Bricolage_Grotesque',sans-serif]">
              Kas oled valmis stardiks?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Küsimused katavad kõiki 60 anatoomiakaarti. Kasuta hiirt või klaviatuuri klahve <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/[0.1] text-amber-300 font-mono text-[10px]">A</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/[0.1] text-amber-300 font-mono text-[10px]">B</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/[0.1] text-amber-300 font-mono text-[10px]">C</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/[0.1] text-amber-300 font-mono text-[10px]">D</kbd>.
            </p>
          </div>
          <button
            onClick={startGame}
            className="px-8 py-3.5 rounded-2xl font-black text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/60 flex items-center gap-2 mx-auto transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Alusta Kiirrünnakut!
          </button>
        </div>
      )}

      {/* Active Playing View */}
      {isPlaying && currentCard && !isGameOver && (
        <div className="glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
          {/* Top HUD */}
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono font-black text-lg border ${
                timeLeft <= 10 
                  ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse' 
                  : 'bg-slate-950 border-white/[0.08] text-amber-400'
              }`}>
                <Timer className="w-4 h-4" />
                {timeLeft}s
              </div>
              {lastFeedback && (
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                  lastFeedback.isBonus ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-700/50' : 'text-rose-400 bg-rose-950/60 border border-rose-700/50'
                }`}>
                  {lastFeedback.text}
                </span>
              )}
            </div>

            {/* Score & Streak */}
            <div className="flex items-center gap-3">
              {streak >= 3 && (
                <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {streak >= 10 ? '4x ULTRA!' : streak >= 6 ? '3x TULINE!' : '2x KOMBO!'}
                </div>
              )}
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Skoor</div>
                <div className="text-xl font-black font-mono text-white tracking-tight">
                  {score}
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="text-slate-300">
                {CATEGORIES[currentCard.cat].name}
              </span>
              <span>Õiged: {correctCount} / {totalAttempted}</span>
            </div>

            <div className="bg-slate-950/80 border border-white/[0.08] rounded-2xl p-5 min-h-[90px] flex items-center">
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentCard.q}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  className="p-4 rounded-xl border border-white/[0.08] bg-slate-900/90 hover:bg-slate-800 hover:border-amber-500/50 text-slate-200 text-left text-sm font-medium transition-all active:scale-[0.98] flex items-start gap-3 cursor-pointer"
                >
                  <span className="font-mono text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-white/[0.08] shrink-0 font-bold">
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="space-y-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Kiirrünnaku Tulemus
            </span>
            <div className="flex items-center justify-center gap-3">
              <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl font-black font-mono ${getRank(score).color}`}>
                {getRank(score).rank}
              </div>
              <div className="text-left">
                <div className="text-2xl font-extrabold text-white font-mono">{score} PUNKTI</div>
                <div className="text-xs text-amber-400 font-semibold">{getRank(score).title}</div>
              </div>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto bg-slate-950/80 border border-white/[0.08] rounded-2xl p-3 text-center">
            <div>
              <div className="text-[11px] text-slate-400">Õigeid</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">{correctCount}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Täpsus</div>
              <div className="text-lg font-bold text-sky-400 font-mono">
                {totalAttempted ? Math.round((correctCount / totalAttempted) * 100) : 0}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Pikim Seeria</div>
              <div className="text-lg font-bold text-amber-400 font-mono">{bestRunStreak}x</div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
            <Sparkles className="w-4 h-4" />
            Teenisid: +{Math.round(score / 5)} XP!
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Mängi uuesti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
