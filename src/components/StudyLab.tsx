import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  GraduationCap, 
  Search, 
  RotateCcw, 
  Check, 
  X, 
  HelpCircle,
  Eye,
  Filter,
  Layers,
  Sparkles,
  Shuffle,
  ArrowUpDown
} from 'lucide-react';
import { CATEGORIES, MUSCLE_CARDS, MuscleCard, CategoryInfo } from '../data/muscleCards';
import { PlayerStats, CardMastery } from '../utils/storage';
import { generateQuizOptions, shuffleArray, isAnswerMatch } from '../utils/quizHelper';
import { sound } from '../utils/sound';

type StudySubMode = 'flash' | 'quiz' | 'type' | 'list';

interface StudyLabProps {
  stats: PlayerStats;
  onUpdateStats: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onCardAnswered: (cardId: number, isCorrect: boolean) => void;
  initialCard?: MuscleCard | null;
  shuffleTrigger?: number;
}

export const StudyLab: React.FC<StudyLabProps> = ({
  stats,
  onUpdateStats,
  onCardAnswered,
  initialCard,
  shuffleTrigger
}) => {
  const [subMode, setSubMode] = useState<StudySubMode>('flash');
  const [selectedCats, setSelectedCats] = useState<Set<string>>(
    new Set(Object.keys(CATEGORIES))
  );
  const [onlyWeak, setOnlyWeak] = useState<boolean>(false);
  const [orderMode, setOrderMode] = useState<'random' | 'sequential'>('random');
  const [queue, setQueue] = useState<MuscleCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quiz mode state
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState<boolean>(false);

  // Type mode state
  const [typeInput, setTypeInput] = useState<string>('');
  const [isTypeAnswered, setIsTypeAnswered] = useState<boolean>(false);
  const [typeAutoMatch, setTypeAutoMatch] = useState<boolean>(false);

  // Session stats
  const [sessionRight, setSessionRight] = useState<number>(0);
  const [sessionWrong, setSessionWrong] = useState<number>(0);
  const [missedCards, setMissedCards] = useState<MuscleCard[]>([]);

  // Filter pool
  const getPool = useCallback(() => {
    return MUSCLE_CARDS.filter(c => {
      const catMatch = selectedCats.has(c.cat);
      const weakMatch = !onlyWeak || stats.cardStatus[c.id] !== 'known';
      return catMatch && weakMatch;
    });
  }, [selectedCats, onlyWeak, stats.cardStatus]);

  // Start / restart deck
  const startDeck = useCallback((customCards?: MuscleCard[], forceMode?: 'random' | 'sequential') => {
    const activeOrder = forceMode || orderMode;
    const pool = customCards || getPool();
    const prepared = activeOrder === 'random' 
      ? shuffleArray(pool) 
      : [...pool].sort((a, b) => a.id - b.id);

    setQueue(prepared);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsQuizAnswered(false);
    setQuizSelected(null);
    setTypeInput('');
    setIsTypeAnswered(false);
    setMissedCards([]);
    setSessionRight(0);
    setSessionWrong(0);

    if (prepared.length > 0 && subMode === 'quiz') {
      setQuizOptions(generateQuizOptions(prepared[0]));
    }
  }, [getPool, subMode, orderMode]);

  // Shuffle current queue manually
  const shuffleNow = () => {
    sound.playShuffle();
    setOrderMode('random');
    startDeck(undefined, 'random');
  };

  // Toggle order mode
  const toggleOrderMode = () => {
    sound.playClick();
    const nextMode = orderMode === 'random' ? 'sequential' : 'random';
    setOrderMode(nextMode);
    startDeck(undefined, nextMode);
  };

  // Initial load
  useEffect(() => {
    if (initialCard) {
      startDeck([initialCard]);
    } else {
      startDeck();
    }
  }, [selectedCats, onlyWeak, subMode]);

  // Listen to external shuffle trigger
  useEffect(() => {
    if (shuffleTrigger && shuffleTrigger > 0) {
      startDeck(undefined, 'random');
    }
  }, [shuffleTrigger]);

  const currentCard = queue[currentIndex];

  // Grade flashcard
  const gradeFlashcard = (known: boolean) => {
    if (!currentCard) return;
    sound.playClick();
    onCardAnswered(currentCard.id, known);

    if (known) {
      sound.playCorrect();
      setSessionRight(prev => prev + 1);
    } else {
      sound.playWrong();
      setSessionWrong(prev => prev + 1);
      if (!missedCards.some(m => m.id === currentCard.id)) {
        setMissedCards(prev => [...prev, currentCard]);
      }
      // Re-insert 3-4 cards later for spaced repetition
      const reinsertPos = Math.min(queue.length, currentIndex + 4);
      setQueue(prev => {
        const copy = [...prev];
        copy.splice(reinsertPos, 0, currentCard);
        return copy;
      });
    }

    // Advance
    setCurrentIndex(prev => prev + 1);
    setIsFlipped(false);
  };

  // Quiz Pick
  const handleQuizPick = (picked: string) => {
    if (isQuizAnswered || !currentCard) return;
    setIsQuizAnswered(true);
    setQuizSelected(picked);

    const isCorrect = picked === currentCard.a;
    onCardAnswered(currentCard.id, isCorrect);

    if (isCorrect) {
      sound.playCorrect();
      setSessionRight(prev => prev + 1);
    } else {
      sound.playWrong();
      setSessionWrong(prev => prev + 1);
      if (!missedCards.some(m => m.id === currentCard.id)) {
        setMissedCards(prev => [...prev, currentCard]);
      }
    }
  };

  const nextQuiz = () => {
    sound.playClick();
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setIsQuizAnswered(false);
    setQuizSelected(null);
    if (nextIdx < queue.length) {
      setQuizOptions(generateQuizOptions(queue[nextIdx]));
    }
  };

  // Type Submit
  const handleTypeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isTypeAnswered || !currentCard) return;

    const matched = isAnswerMatch(typeInput, currentCard.a);
    setIsTypeAnswered(true);
    setTypeAutoMatch(matched);

    if (matched) {
      sound.playCorrect();
      setSessionRight(prev => prev + 1);
      onCardAnswered(currentCard.id, true);
    } else {
      sound.playWrong();
    }
  };

  const gradeTypeManual = (correct: boolean) => {
    if (!currentCard) return;
    sound.playClick();
    onCardAnswered(currentCard.id, correct);

    if (correct) {
      setSessionRight(prev => prev + 1);
    } else {
      setSessionWrong(prev => prev + 1);
      if (!missedCards.some(m => m.id === currentCard.id)) {
        setMissedCards(prev => [...prev, currentCard]);
      }
    }

    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setIsTypeAnswered(false);
    setTypeInput('');
    setTypeAutoMatch(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (subMode === 'type' && !isTypeAnswered) return;
      }

      if (subMode === 'flash' && currentCard) {
        if (e.code === 'Space') {
          e.preventDefault();
          setIsFlipped(prev => !prev);
        } else if (isFlipped && e.key === '1') {
          e.preventDefault();
          gradeFlashcard(false);
        } else if (isFlipped && e.key === '2') {
          e.preventDefault();
          gradeFlashcard(true);
        }
      } else if (subMode === 'quiz' && isQuizAnswered && e.key === 'Enter') {
        e.preventDefault();
        nextQuiz();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [subMode, isFlipped, isQuizAnswered, currentCard]);

  // Filter category toggle
  const toggleCategory = (catId: string) => {
    sound.playClick();
    const all = selectedCats.size === Object.keys(CATEGORIES).length;
    if (catId === '*') {
      setSelectedCats(new Set(Object.keys(CATEGORIES)));
    } else if (all) {
      setSelectedCats(new Set([catId]));
    } else {
      const next = new Set(selectedCats);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      if (next.size === 0) setSelectedCats(new Set(Object.keys(CATEGORIES)));
      else setSelectedCats(next);
    }
  };

  // Filtered list for "list" mode
  const filteredListCards = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return MUSCLE_CARDS.filter(c => {
      const matchCat = selectedCats.has(c.cat);
      const matchText = !q || c.q.toLowerCase().includes(q) || c.a.toLowerCase().includes(q);
      const matchWeak = !onlyWeak || stats.cardStatus[c.id] !== 'known';
      return matchCat && matchText && matchWeak;
    });
  }, [searchQuery, selectedCats, onlyWeak, stats.cardStatus]);

  const isRoundOver = queue.length > 0 && currentIndex >= queue.length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Sub-mode Tabs */}
      <div className="flex gap-1 p-1.5 bg-slate-950/80 border border-white/[0.06] rounded-2xl overflow-x-auto shadow-inner">
        {[
          { id: 'flash', label: 'Kaardid (Flashcard)' },
          { id: 'quiz', label: 'Valikvastused' },
          { id: 'type', label: 'Kirjuta vastus' },
          { id: 'list', label: 'Kõik kaardid (Kataloog)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              setSubMode(tab.id as StudySubMode);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              subMode === tab.id
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => toggleCategory('*')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            selectedCats.size === Object.keys(CATEGORIES).length
              ? 'bg-slate-200 text-slate-950 border-slate-200'
              : 'bg-slate-900/80 text-slate-400 border-white/[0.06] hover:border-white/[0.15]'
          }`}
        >
          Kõik teemad
        </button>

        {Object.values(CATEGORIES).map(cat => {
          const isSelected = selectedCats.has(cat.id) && selectedCats.size !== Object.keys(CATEGORIES).length;
          const count = MUSCLE_CARDS.filter(c => c.cat === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-900/80 text-slate-400 border-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              <span>{cat.shortName}</span>
              <span className="font-mono text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}

        <button
          onClick={() => {
            sound.playClick();
            setOnlyWeak(!onlyWeak);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ml-auto transition-all cursor-pointer ${
            onlyWeak
              ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
              : 'bg-slate-900/80 text-slate-400 border-white/[0.06] hover:border-white/[0.15]'
          }`}
        >
          Ainult kordamist vajavad
        </button>
      </div>

      {/* Shuffle & Ordering Controls Bar */}
      {subMode !== 'list' && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/70 border border-white/[0.06] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Järjestus:</span>
            <button
              onClick={toggleOrderMode}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                orderMode === 'random' 
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40' 
                  : 'bg-slate-900 text-slate-300 border border-white/[0.08]'
              }`}
            >
              {orderMode === 'random' ? (
                <>
                  <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Juhuslikult segatud</span>
                </>
              ) : (
                <>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Järjestikune (#1 kuni #60)</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={shuffleNow}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-white/[0.08] hover:border-amber-500/50 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span>Sega pakk uuesti</span>
          </button>
        </div>
      )}

      {/* FLASHCARD MODE */}
      {subMode === 'flash' && !isRoundOver && currentCard && (
        <div className="space-y-4">
          <div
            onClick={() => {
              sound.playClick();
              setIsFlipped(!isFlipped);
            }}
            tabIndex={0}
            role="button"
            className="w-full min-h-[300px] sm:min-h-[340px] glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all shadow-xl group select-none relative overflow-hidden"
          >
            {/* Header info */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-slate-300">
                {CATEGORIES[currentCard.cat].name}
              </span>
              <span>{currentIndex + 1} / {queue.length}</span>
            </div>

            {/* Question / Answer */}
            <div className="my-auto py-6">
              <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed text-center font-['Plus_Jakarta_Sans',sans-serif]">
                {currentCard.q}
              </p>

              {isFlipped ? (
                <div className="mt-6 pt-6 border-t border-dashed border-rose-500/40 text-center animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-rose-400 block mb-1">
                    Vastus
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-rose-200">
                    {currentCard.a}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center mt-6 flex items-center justify-center gap-1">
                  Mõtle vastus läbi ja klõpsa kaardil · <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/[0.1] font-mono text-[10px]">Tühik</kbd>
                </p>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Klõpsa kaarti pööramiseks</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Eye className="w-3.5 h-3.5" />
                {isFlipped ? 'Vastus nähtaval' : 'Peidetud'}
              </span>
            </div>
          </div>

          {/* Flashcard Grade Buttons */}
          <div className="flex gap-3">
            <button
              disabled={!isFlipped}
              onClick={() => gradeFlashcard(false)}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
                isFlipped
                  ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 hover:bg-amber-900/60 shadow-lg cursor-pointer'
                  : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <X className="w-4 h-4 text-amber-400" />
              Ei teadnud <kbd className="ml-1 font-mono text-xs px-1 bg-slate-900/60 rounded">1</kbd>
            </button>

            <button
              disabled={!isFlipped}
              onClick={() => gradeFlashcard(true)}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
                isFlipped
                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60 shadow-lg cursor-pointer'
                  : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Check className="w-4 h-4 text-emerald-400" />
              Teadsin <kbd className="ml-1 font-mono text-xs px-1 bg-slate-900/60 rounded">2</kbd>
            </button>
          </div>
        </div>
      )}

      {/* QUIZ MODE */}
      {subMode === 'quiz' && !isRoundOver && currentCard && (
        <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-slate-300">
              {CATEGORIES[currentCard.cat].name}
            </span>
            <span>{currentIndex + 1} / {queue.length}</span>
          </div>

          <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {currentCard.q}
          </p>

          <div className="space-y-3">
            {quizOptions.map((opt, idx) => {
              const isSelected = quizSelected === opt;
              const isCorrect = isQuizAnswered && opt === currentCard.a;
              const isWrong = isQuizAnswered && isSelected && !isCorrect;

              let style = 'bg-slate-900/90 border-white/[0.08] text-slate-200 hover:bg-slate-800';
              if (isCorrect) style = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold';
              else if (isWrong) style = 'bg-rose-950/90 border-rose-500 text-rose-200';

              return (
                <button
                  key={idx}
                  disabled={isQuizAnswered}
                  onClick={() => handleQuizPick(opt)}
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

          {isQuizAnswered && (
            <div className="pt-2 flex items-center justify-between animate-in fade-in">
              <span className={`text-sm font-bold ${quizSelected === currentCard.a ? 'text-emerald-400' : 'text-rose-400'}`}>
                {quizSelected === currentCard.a ? 'Õige vastus!' : 'Vale. Õige vastus on märgitud roheliselt.'}
              </span>
              <button
                onClick={nextQuiz}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white"
              >
                Järgmine (Enter)
              </button>
            </div>
          )}
        </div>
      )}

      {/* TYPE MODE */}
      {subMode === 'type' && !isRoundOver && currentCard && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
              {CATEGORIES[currentCard.cat].name}
            </span>
            <span>{currentIndex + 1} / {queue.length}</span>
          </div>

          <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {currentCard.q}
          </p>

          <form onSubmit={handleTypeSubmit} className="space-y-4">
            <input
              type="text"
              disabled={isTypeAnswered}
              value={typeInput}
              onChange={e => setTypeInput(e.target.value)}
              placeholder="Kirjuta vastus siia..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 text-base"
              autoFocus
            />

            {!isTypeAnswered ? (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeSubmit()}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Ei tea
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Kontrolli (Enter)
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 block mb-1">
                    Õige vastus:
                  </span>
                  <div className="text-base font-bold text-white">{currentCard.a}</div>
                </div>

                {typeInput && (
                  <div className="text-xs text-slate-400">
                    Sinu vastus: <span className="text-slate-200 font-semibold">{typeInput}</span>
                  </div>
                )}

                {typeAutoMatch ? (
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold text-sm">Õige!</span>
                    <button
                      onClick={() => gradeTypeManual(true)}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
                    >
                      Järgmine (Enter)
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">Võrdle ise: kas mõte oli sama?</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => gradeTypeManual(false)}
                        className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-950/60 border border-rose-600/50 text-rose-300"
                      >
                        Vale (1)
                      </button>
                      <button
                        onClick={() => gradeTypeManual(true)}
                        className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-950/60 border border-emerald-600/50 text-emerald-300"
                      >
                        Mul oli õige (2)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      )}

      {/* ROUND FINISHED VIEW */}
      {isRoundOver && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-3xl mx-auto">
            🎓
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Ring läbi!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Õigeid: <b className="text-emerald-400">{sessionRight}</b> · Eksisid: <b className="text-rose-400">{sessionWrong}</b>
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            {missedCards.length > 0 && (
              <button
                onClick={() => startDeck(missedCards)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow"
              >
                Korda vigaseid ({missedCards.length})
              </button>
            )}
            <button
              onClick={() => startDeck()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Alusta uuesti
            </button>
          </div>
        </div>
      )}

      {/* ALL CARDS LIST (CATALOG) */}
      {subMode === 'list' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Otsi anatoomiakaarti (nt sarkomeer, flexor, biceps, kude)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 text-sm"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden">
            {filteredListCards.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Otsingule ei leitud ühtegi kaarti.
              </div>
            ) : (
              filteredListCards.map(c => {
                const status = stats.cardStatus[c.id] || 'new';
                let dotColor = 'bg-slate-700';
                if (status === 'known') dotColor = 'bg-emerald-500';
                else if (status === 'learn') dotColor = 'bg-amber-500';

                return (
                  <div key={c.id} className="p-4 hover:bg-slate-850 transition-colors flex items-start gap-3">
                    <span className={`w-2.5 h-2.5 rounded-xs mt-1.5 shrink-0 ${dotColor}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                          {CATEGORIES[c.cat].shortName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">#{c.id + 1}</span>
                      </div>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">{c.q}</p>
                      <p className="text-sm text-white font-bold mt-1 text-rose-300 leading-relaxed">{c.a}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
