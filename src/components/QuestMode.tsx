import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Map, 
  Star, 
  ArrowLeft, 
  RotateCcw, 
  ChevronRight,
  CheckCircle2,
  Shuffle
} from 'lucide-react';
import { CATEGORIES, MUSCLE_CARDS, MuscleCard, CategoryInfo } from '../data/muscleCards';
import { PlayerStats } from '../utils/storage';
import { generateQuizOptions, shuffleArray } from '../utils/quizHelper';
import { sound } from '../utils/sound';

interface QuestModeProps {
  stats: PlayerStats;
  onUpdateStats: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onCardAnswered: (cardId: number, isCorrect: boolean) => void;
}

export const QuestMode: React.FC<QuestModeProps> = ({
  stats,
  onUpdateStats,
  onCardAnswered
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryInfo | null>(null);
  const [queue, setQueue] = useState<MuscleCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Start a chapter
  const startChapter = (cat: CategoryInfo) => {
    sound.playClick();
    const cards = shuffleArray(MUSCLE_CARDS.filter(c => c.cat === cat.id));
    setActiveCategory(cat);
    setQueue(cards);
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setIsFinished(false);
    setIsAnswered(false);
    setSelectedAnswer(null);

    if (cards.length > 0) {
      setOptions(generateQuizOptions(cards[0]));
    }
  };

  const handleAnswer = (picked: string) => {
    if (isAnswered || !queue[currentIndex]) return;
    setIsAnswered(true);
    setSelectedAnswer(picked);

    const card = queue[currentIndex];
    const isCorrect = picked === card.a;
    onCardAnswered(card.id, isCorrect);

    if (isCorrect) {
      sound.playCorrect();
      setCorrectAnswers(prev => prev + 1);
    } else {
      sound.playWrong();
    }
  };

  const nextCard = () => {
    sound.playClick();
    const nextIdx = currentIndex + 1;
    if (nextIdx >= queue.length) {
      finishChapter();
    } else {
      setCurrentIndex(nextIdx);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setOptions(generateQuizOptions(queue[nextIdx]));
    }
  };

  const finishChapter = () => {
    setIsFinished(true);
    sound.playVictory();

    const total = queue.length;
    const pct = total ? (correctAnswers / total) * 100 : 0;

    let earnedStars = 1;
    if (pct >= 99) earnedStars = 3;
    else if (pct >= 75) earnedStars = 2;

    if (earnedStars === 3) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    onUpdateStats(prev => {
      const currentStars = prev.chapterStars[activeCategory!.id] || 0;
      const newStars = Math.max(currentStars, earnedStars);
      const xpGained = earnedStars * 100 + (earnedStars === 3 ? 150 : 0);

      return {
        ...prev,
        xp: prev.xp + xpGained,
        chapterStars: {
          ...prev.chapterStars,
          [activeCategory!.id]: newStars
        }
      };
    });
  };

  const totalStars = Object.values(stats.chapterStars).reduce((sum, n) => sum + n, 0);

  // Chapter List
  if (!activeCategory) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-xl">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest block mb-2">
                Missioonid & Teekond
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Bricolage_Grotesque',sans-serif]">
                Lihaste Anatoomia 6 Peatükki
              </h2>
              <p className="mt-2 text-slate-300 text-sm leading-relaxed">
                Läbi anatoomia süsteemselt teemade kaupa. Teeni igas peatükis kuni 3 kuldset tähte ja saavuta täielik teadmiste meisterlikkus!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase">Tähed kokku</div>
                <div className="text-xl font-black font-mono text-white">
                  {totalStars} / 18 ⭐
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(CATEGORIES).map((cat, idx) => {
            const count = MUSCLE_CARDS.filter(c => c.cat === cat.id).length;
            const stars = stats.chapterStars[cat.id] || 0;

            return (
              <div
                key={cat.id}
                onClick={() => startChapter(cat)}
                className="group p-5 rounded-2xl glass-panel-interactive cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-teal-400">
                      Peatükk 0{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map(s => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">{count} kaarti</span>
                  <span className="font-semibold text-teal-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    {stars > 0 ? 'Korda' : 'Alusta'} missiooni
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Shuffle chapter questions
  const shuffleChapterQuestions = () => {
    sound.playShuffle();
    const shuffled = shuffleArray(queue);
    setQueue(shuffled);
    setCurrentIndex(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
    if (shuffled.length > 0) {
      setOptions(generateQuizOptions(shuffled[0]));
    }
  };

  // Active Chapter Playing View
  const currentCard = queue[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Chapter Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setActiveCategory(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kõik peatükid
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={shuffleChapterQuestions}
            title="Sega selle peatüki küsimuste järjekord"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/[0.08] hover:border-teal-400/50 text-slate-300 hover:text-teal-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5 text-teal-400" />
            <span>Sega järjekord</span>
          </button>
          <span className="text-xs font-mono text-slate-400">
            Küsimus {currentIndex + 1} / {queue.length}
          </span>
        </div>
      </div>

      {!isFinished && currentCard && (
        <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/[0.06]">
            <div 
              className="h-full bg-teal-500 transition-all duration-300 rounded-full"
              style={{ width: `${Math.round(((currentIndex + 1) / queue.length) * 100)}%` }}
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-teal-400">
              {activeCategory.name}
            </span>
            <p className="text-lg font-bold text-white leading-relaxed">
              {currentCard.q}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = isAnswered && opt === currentCard.a;
              const isWrong = isAnswered && isSelected && !isCorrect;

              let style = 'bg-slate-900/90 border-white/[0.08] text-slate-200 hover:bg-slate-800';
              if (isCorrect) style = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold';
              else if (isWrong) style = 'bg-rose-950/90 border-rose-500 text-rose-200';

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${style}`}
                >
                  <span className="font-mono text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-white/[0.08] shrink-0 font-bold">
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Next Button when answered */}
          {isAnswered && (
            <div className="pt-2 flex justify-end animate-in fade-in">
              <button
                onClick={nextCard}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-950/50 flex items-center gap-1.5 cursor-pointer"
              >
                Järgmine küsimus
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chapter Finished View */}
      {isFinished && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono tracking-wider text-teal-400">
              Peatükk läbitud!
            </span>
            <h3 className="text-2xl font-black text-white font-['Bricolage_Grotesque',sans-serif]">{activeCategory.name}</h3>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center items-center gap-2 py-2">
            {[1, 2, 3].map(s => {
              const pct = (correctAnswers / queue.length) * 100;
              const earned = s === 1 || (s === 2 && pct >= 75) || (s === 3 && pct >= 99);
              return (
                <Star
                  key={s}
                  className={`w-10 h-10 ${
                    earned ? 'fill-amber-400 text-amber-400 animate-bounce' : 'text-slate-800'
                  }`}
                />
              );
            })}
          </div>

          <div className="text-sm text-slate-300">
            Tulemus: <b className="text-white font-mono">{correctAnswers} / {queue.length}</b> õiget ({Math.round((correctAnswers / queue.length) * 100)}%)
          </div>

          <div className="flex justify-center gap-3 pt-3">
            <button
              onClick={() => startChapter(activeCategory)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/[0.08] flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Korda peatükki
            </button>
            <button
              onClick={() => setActiveCategory(null)}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 cursor-pointer"
            >
              Kõik peatükid
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
