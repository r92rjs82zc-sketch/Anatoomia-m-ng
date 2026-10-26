import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  SpellCheck, 
  HelpCircle, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  Shuffle
} from 'lucide-react';
import { MUSCLE_CARDS, MuscleCard } from '../data/muscleCards';
import { PlayerStats } from '../utils/storage';
import { shuffleArray } from '../utils/quizHelper';
import { sound } from '../utils/sound';

interface LatinWordScrambleProps {
  stats: PlayerStats;
  onUpdateStats: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onCardAnswered: (cardId: number, isCorrect: boolean) => void;
}

// Extract word puzzle targets from Latin cards and key anatomical names
interface WordTarget {
  cardId: number;
  word: string; // The Latin term to spell
  clue: string;
  categoryName: string;
}

const LATIN_TARGETS: WordTarget[] = [
  { cardId: 0, word: 'MUSCULUS', clue: 'Mis on lihase ladinakeelne nimetus?', categoryName: 'Ehitus' },
  { cardId: 1, word: 'TENDO', clue: 'Mis on kõõluse ladinakeelne nimetus?', categoryName: 'Ehitus' },
  { cardId: 6, word: 'MYOLOGIA', clue: 'Kuidas nimetatakse lihaseid uurivat teadusharu (lad. k)?', categoryName: 'Ehitus' },
  { cardId: 7, word: 'ORIGO', clue: 'Lihase paigalpüsiv või väheliikuv algusosa', categoryName: 'Ehitus' },
  { cardId: 8, word: 'INSERTIO', clue: 'Lihase liikuvam vastasots kokkutõmbumisel', categoryName: 'Ehitus' },
  { cardId: 9, word: 'MYOCARDIUM', clue: 'Südame põhimassi moodustav lihaskude', categoryName: 'Koe tüübid' },
  { cardId: 14, word: 'BICEPS', clue: 'Kahelise alguspeaga lihas', categoryName: 'Kujud' },
  { cardId: 15, word: 'TRICEPS', clue: 'Kolmelise alguspeaga lihas', categoryName: 'Kujud' },
  { cardId: 16, word: 'QUADRICEPS', clue: 'Neljalise alguspeaga lihas', categoryName: 'Kujud' },
  { cardId: 23, word: 'SARTORIUS', clue: 'Inimese keha pikim lihas (rätsepalihas)', categoryName: 'Kujud' },
  { cardId: 24, word: 'VASTUS', clue: 'Ladina sõna, mis tähistab hiiglaslikku või väga suurt mõõdet', categoryName: 'Ladina tähendus' },
  { cardId: 25, word: 'MAXIMUS', clue: 'Ladina sõna, mis tähistab suurimat mõõdet', categoryName: 'Ladina tähendus' },
  { cardId: 26, word: 'MINIMUS', clue: 'Ladina sõna, mis tähistab väikseimat mõõdet', categoryName: 'Ladina tähendus' },
  { cardId: 27, word: 'LONGUS', clue: 'Ladina sõna, mis tähistab pikka mõõdet', categoryName: 'Ladina tähendus' },
  { cardId: 28, word: 'BREVIS', clue: 'Ladina sõna, mis tähistab lühikest mõõdet', categoryName: 'Ladina tähendus' },
  { cardId: 29, word: 'DELTOIDEUS', clue: 'Ladina sõna, mis tähistab kolmnurkset kuju', categoryName: 'Ladina tähendus' },
  { cardId: 30, word: 'LATISSIMUS', clue: 'Ladina sõna, mis tähistab laieimat kuju', categoryName: 'Ladina tähendus' },
  { cardId: 31, word: 'TRAPEZIUS', clue: 'Ladina sõna, mis tähistab trapetsikujulist kuju', categoryName: 'Ladina tähendus' },
  { cardId: 32, word: 'RECTUS', clue: 'Ladina sõna, mis tähistab otse ehk sirgelt kulgevaid kiude', categoryName: 'Ladina tähendus' },
  { cardId: 33, word: 'TRANSVERSUS', clue: 'Ladina sõna, mis tähistab risti kulgevaid kiude', categoryName: 'Ladina tähendus' },
  { cardId: 34, word: 'OBLIQUUS', clue: 'Ladina sõna, mis tähistab diagonaalselt ehk põiki kulgevaid kiude', categoryName: 'Ladina tähendus' },
  { cardId: 35, word: 'ORBICULARIS', clue: 'Ladina sõna, mis tähistab ringikujulist ehk sõõrjat asendit', categoryName: 'Ladina tähendus' },
  { cardId: 36, word: 'PECTORALIS', clue: 'Ladina sõna, mis tähistab rinna piirkonnas paiknemist', categoryName: 'Ladina tähendus' },
  { cardId: 37, word: 'GLUTEUS', clue: 'Ladina sõna, mis tähistab tuhara piirkonnas paiknemist', categoryName: 'Ladina tähendus' },
  { cardId: 38, word: 'BRACHII', clue: 'Ladina sõna, mis tähistab õlavarre piirkonnas paiknemist', categoryName: 'Ladina tähendus' },
  { cardId: 47, word: 'MASSETER', clue: 'Mälumisliigutuste sooritamiseks mõeldud mälurlihas', categoryName: 'Funktsioonid' },
  { cardId: 50, word: 'MYOGLOBIN', clue: 'Punastes lihaskiududes hapnikku talletav valk', categoryName: 'Füsioloogia' },
  { cardId: 54, word: 'SARCOMERE', clue: 'Skeletilihase struktuurne ja funktsionaalne ühik', categoryName: 'Füsioloogia' }
];

export const LatinWordScramble: React.FC<LatinWordScrambleProps> = ({
  stats,
  onUpdateStats,
  onCardAnswered
}) => {
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [scrambledLetters, setScrambledLetters] = useState<{ id: number; char: string; used: boolean }[]>([]);
  const [slots, setSlots] = useState<{ id: number; char: string; sourceId: number }[]>([]);
  const [solvedWordsCount, setSolvedWordsCount] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [hintUsed, setHintUsed] = useState<boolean>(false);

  const currentTarget = LATIN_TARGETS[targetIndex];

  // Initialize current word
  const initWord = (idx: number) => {
    const target = LATIN_TARGETS[idx];
    const letters = target.word.split('').map((char, i) => ({
      id: i,
      char,
      used: false
    }));

    // Add 2-3 extra distractor letters for a fun puzzle challenge
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const extraCount = target.word.length > 7 ? 2 : 3;
    for (let e = 0; e < extraCount; e++) {
      letters.push({
        id: letters.length + e,
        char: alphabet[Math.floor(Math.random() * alphabet.length)],
        used: false
      });
    }

    setScrambledLetters(shuffleArray(letters));
    setSlots([]);
    setIsSuccess(false);
    setHintUsed(false);
  };

  useEffect(() => {
    initWord(targetIndex);
  }, [targetIndex]);

  // Click letter tile
  const pickLetter = (tile: { id: number; char: string; used: boolean }) => {
    if (tile.used || isSuccess) return;
    if (slots.length >= currentTarget.word.length) return;

    sound.playClick();
    setScrambledLetters(prev => prev.map(t => t.id === tile.id ? { ...t, used: true } : t));
    const newSlots = [...slots, { id: slots.length, char: tile.char, sourceId: tile.id }];
    setSlots(newSlots);

    // Check completion
    if (newSlots.length === currentTarget.word.length) {
      checkWord(newSlots.map(s => s.char).join(''));
    }
  };

  // Remove letter from slot
  const removeSlot = (slotIdx: number) => {
    if (isSuccess) return;
    sound.playClick();
    const removed = slots[slotIdx];
    setScrambledLetters(prev => prev.map(t => t.id === removed.sourceId ? { ...t, used: false } : t));
    setSlots(prev => prev.filter((_, i) => i !== slotIdx));
  };

  // Check word
  const checkWord = (spelled: string) => {
    if (spelled === currentTarget.word) {
      sound.playCorrect();
      setIsSuccess(true);
      setSolvedWordsCount(prev => prev + 1);
      onCardAnswered(currentTarget.cardId, true);

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });

      onUpdateStats(prev => ({
        ...prev,
        xp: prev.xp + 80
      }));
    } else {
      sound.playWrong();
    }
  };

  // Use Hint (fills in next correct letter)
  const useHint = () => {
    if (isSuccess || slots.length >= currentTarget.word.length) return;
    sound.playClick();
    setHintUsed(true);

    const nextNeededChar = currentTarget.word[slots.length];
    // Find unused tile that matches
    const matchingTile = scrambledLetters.find(t => !t.used && t.char === nextNeededChar);
    if (matchingTile) {
      pickLetter(matchingTile);
    }
  };

  // Next word (sequential or random)
  const nextPuzzle = () => {
    sound.playClick();
    const nextIdx = (targetIndex + 1) % LATIN_TARGETS.length;
    setTargetIndex(nextIdx);
  };

  // Pick random puzzle
  const pickRandomPuzzle = () => {
    sound.playShuffle();
    let nextIdx = Math.floor(Math.random() * LATIN_TARGETS.length);
    if (nextIdx === targetIndex && LATIN_TARGETS.length > 1) {
      nextIdx = (nextIdx + 1) % LATIN_TARGETS.length;
    }
    setTargetIndex(nextIdx);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest block mb-2">
              Ladina Nomenklatuur
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Bricolage_Grotesque',sans-serif]">
              Ladina Sõnade Dekrüpteerija
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Pane tähed õigesse järjekorda ja õpi meditsiinilisi lihaste tüvesid!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={pickRandomPuzzle}
              title="Vali juhuslik ladina sõna"
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900 border border-white/[0.08] hover:border-sky-400/50 text-slate-300 hover:text-sky-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-sky-400" />
              <span>Sega sõna</span>
            </button>
            <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-white/[0.08] font-mono text-xs">
              <span className="text-slate-400">Lahendatud:</span>
              <span className="font-bold text-sky-400">{solvedWordsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Puzzle Box */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        {/* Clue Section */}
        <div className="space-y-2 text-center">
          <span className="text-xs font-mono text-slate-400">
            {currentTarget.categoryName} · Mõistatus #{targetIndex + 1}/{LATIN_TARGETS.length}
          </span>
          <p className="text-base sm:text-lg font-bold text-white pt-1">
            "{currentTarget.clue}"
          </p>
        </div>

        {/* Word Answer Slots */}
        <div className="flex flex-wrap justify-center gap-2 py-2">
          {currentTarget.word.split('').map((_, idx) => {
            const slot = slots[idx];
            return (
              <button
                key={idx}
                disabled={!slot || isSuccess}
                onClick={() => removeSlot(idx)}
                className={`w-10 h-12 sm:w-12 sm:h-14 rounded-2xl border-2 font-mono font-extrabold text-xl flex items-center justify-center transition-all cursor-pointer ${
                  isSuccess
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 scale-105'
                    : slot
                    ? 'bg-slate-900 border-sky-400 text-white shadow-md'
                    : 'bg-slate-950/60 border-white/[0.1] text-slate-600 border-dashed'
                }`}
              >
                {slot ? slot.char : ''}
              </button>
            );
          })}
        </div>

        {/* Scrambled Available Letters */}
        {!isSuccess && (
          <div className="space-y-3">
            <div className="text-center text-xs text-slate-400 font-mono">
              Klõpsa tähti sõna moodustamiseks:
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {scrambledLetters.map(tile => (
                <button
                  key={tile.id}
                  disabled={tile.used}
                  onClick={() => pickLetter(tile)}
                  className={`w-10 h-11 sm:w-11 sm:h-12 rounded-xl font-mono font-bold text-base transition-all ${
                    tile.used
                      ? 'opacity-20 bg-slate-800 text-slate-600 scale-90 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white shadow hover:scale-105 active:scale-95'
                  }`}
                >
                  {tile.char}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          <button
            onClick={() => initWord(targetIndex)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Tühjenda tähed
          </button>

          <div className="flex items-center gap-2">
            {!isSuccess && (
              <button
                onClick={useHint}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Vihje
              </button>
            )}

            {isSuccess && (
              <button
                onClick={nextPuzzle}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-sky-950/50 animate-bounce"
              >
                Järgmine ladina sõna
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
