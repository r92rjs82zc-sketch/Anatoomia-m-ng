/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, GameMode } from './components/Navbar';
import { SarcomereStrip } from './components/SarcomereStrip';
import { BossArena } from './components/BossArena';
import { SpeedrunMode } from './components/SpeedrunMode';
import { QuestMode } from './components/QuestMode';
import { LatinWordScramble } from './components/LatinWordScramble';
import { StudyLab } from './components/StudyLab';
import { ProgressDashboard } from './components/ProgressDashboard';
import { AchievementsModal } from './components/AchievementsModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { 
  loadStats, 
  saveStats, 
  resetAllStats, 
  PlayerStats, 
  getLevelInfo 
} from './utils/storage';
import { MUSCLE_CARDS, MuscleCard } from './data/muscleCards';

export default function App() {
  const [stats, setStats] = useState<PlayerStats>(() => loadStats());
  const [currentMode, setCurrentMode] = useState<GameMode>('boss');
  const [streak, setStreak] = useState<number>(0);
  const [studyCard, setStudyCard] = useState<MuscleCard | null>(null);
  const [targetBossId, setTargetBossId] = useState<string | null>(null);
  const [shuffleTrigger, setShuffleTrigger] = useState<number>(0);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // Card answered callback
  const handleCardAnswered = (cardId: number, isCorrect: boolean) => {
    setStats(prev => {
      const newStatus = { ...prev.cardStatus };
      newStatus[cardId] = isCorrect ? 'known' : 'learn';

      const nextStreak = isCorrect ? streak + 1 : 0;
      setStreak(nextStreak);

      const nextBestStreak = Math.max(prev.bestStreak, nextStreak);
      const nextTotal = prev.totalAnswers + 1;
      const nextCorrect = prev.correctAnswers + (isCorrect ? 1 : 0);
      const nextXp = prev.xp + (isCorrect ? 25 : 5);

      // Check achievements
      const newAchievements = [...prev.unlockedAchievements];
      if (isCorrect && !newAchievements.includes('first_blood')) {
        newAchievements.push('first_blood');
      }
      if (nextStreak >= 5 && !newAchievements.includes('streak_5')) {
        newAchievements.push('streak_5');
      }
      if (nextStreak >= 10 && !newAchievements.includes('streak_10')) {
        newAchievements.push('streak_10');
      }

      // Card mastery achievements
      const knownCount = Object.values(newStatus).filter(s => s === 'known').length;
      if (knownCount >= 30 && !newAchievements.includes('half_deck')) {
        newAchievements.push('half_deck');
      }
      if (knownCount >= 60 && !newAchievements.includes('full_deck')) {
        newAchievements.push('full_deck');
      }

      // Latin cards mastery
      const latinKnownCount = MUSCLE_CARDS.filter(c => c.cat === 'nimi' && newStatus[c.id] === 'known').length;
      if (latinKnownCount >= 15 && !newAchievements.includes('latin_pro')) {
        newAchievements.push('latin_pro');
      }

      // Level check
      const levelInfo = getLevelInfo(nextXp);
      if (levelInfo.level >= 5 && !newAchievements.includes('level_5')) {
        newAchievements.push('level_5');
      }
      if (levelInfo.level >= 10 && !newAchievements.includes('level_10')) {
        newAchievements.push('level_10');
      }

      return {
        ...prev,
        xp: nextXp,
        cardStatus: newStatus,
        bestStreak: nextBestStreak,
        totalAnswers: nextTotal,
        correctAnswers: nextCorrect,
        unlockedAchievements: newAchievements
      };
    });
  };

  const handleUpdateStats = (updater: (prev: PlayerStats) => PlayerStats) => {
    setStats(prev => updater(prev));
  };

  const handleReset = () => {
    const blank = resetAllStats();
    setStats(blank);
    setStreak(0);
  };

  const handleSarcomereCardClick = (card: MuscleCard) => {
    setStudyCard(card);
    setCurrentMode('study');
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-rose-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        stats={stats}
        currentMode={currentMode}
        onSelectMode={mode => {
          setStudyCard(null);
          setCurrentMode(mode);
        }}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenReset={() => setIsResetOpen(true)}
        streak={streak}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Sarcomere Strip on top of all modes */}
        <SarcomereStrip
          cardStatus={stats.cardStatus}
          onCardClick={handleSarcomereCardClick}
          onShuffleAll={() => setShuffleTrigger(prev => prev + 1)}
        />

        {/* Dynamic Mode Content */}
        {currentMode === 'boss' && (
          <BossArena
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onCardAnswered={handleCardAnswered}
            initialBossId={targetBossId}
          />
        )}

        {currentMode === 'speedrun' && (
          <SpeedrunMode
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onCardAnswered={handleCardAnswered}
          />
        )}

        {currentMode === 'quest' && (
          <QuestMode
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onCardAnswered={handleCardAnswered}
          />
        )}

        {currentMode === 'words' && (
          <LatinWordScramble
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onCardAnswered={handleCardAnswered}
          />
        )}

        {currentMode === 'study' && (
          <StudyLab
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onCardAnswered={handleCardAnswered}
            initialCard={studyCard}
            shuffleTrigger={shuffleTrigger}
          />
        )}

        {currentMode === 'progress' && (
          <ProgressDashboard
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onNavigateToStudy={(catId, onlyWeak) => {
              setCurrentMode('study');
            }}
            onNavigateToBoss={(bossId) => {
              if (bossId) setTargetBossId(bossId);
              setCurrentMode('boss');
            }}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] py-6 text-center text-xs text-slate-500 font-mono">
        <p>Musculus Arena · Lihaste Anatoomia & Füsioloogia · 60 Kaarti</p>
      </footer>

      {/* Modals */}
      <AchievementsModal
        stats={stats}
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />

      <ResetConfirmModal
        isOpen={isResetOpen}
        onConfirm={handleReset}
        onClose={() => setIsResetOpen(false)}
      />
    </div>
  );
}
