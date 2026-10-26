import { BOSSES } from '../data/muscleCards';

export type CardMastery = 'new' | 'learn' | 'known';

export interface PlayerStats {
  xp: number;
  level: number;
  levelTitle: string;
  cardStatus: Record<number, CardMastery>;
  bestStreak: number;
  totalAnswers: number;
  correctAnswers: number;
  bossesDefeated: string[];
  speedrunHighScore: number;
  speedrunBestAnswers: number;
  chapterStars: Record<string, number>;
  unlockedAchievements: string[];
  unlockedTitles: string[];
  unlockedBadges: string[];
  activeTitle?: string;
  activeBadge?: string;
}

const STORAGE_KEY = 'musculus_arena_save_v1';
const LEGACY_STORAGE_KEY = 'lihased-progress-v1';

export const LEVEL_TITLES = [
  { level: 1, xp: 0, title: 'Algaja Venitaja' },
  { level: 2, xp: 200, title: 'Müofibrilli Õpipoiss' },
  { level: 3, xp: 500, title: 'Tahtele Alluv Muskel' },
  { level: 4, xp: 900, title: 'Kõõluste Tundja' },
  { level: 5, xp: 1400, title: 'Sarkomeeri Insener' },
  { level: 6, xp: 2000, title: 'Ladina Nomenklatuuri Magister' },
  { level: 7, xp: 2800, title: 'Biomehaanika Ekspert' },
  { level: 8, xp: 3800, title: 'Hüpertroofia Meister' },
  { level: 9, xp: 5000, title: 'Müoloogia Doktor' },
  { level: 10, xp: 6500, title: 'Musculus Arena Titaan' },
  { level: 12, xp: 8500, title: 'Olümpose Lihasepooljumal' },
  { level: 15, xp: 12000, title: 'Absoluutne Lihasejumal' }
];

export function getLevelInfo(xp: number) {
  let cur = LEVEL_TITLES[0];
  let next = LEVEL_TITLES[1];

  for (let i = 0; i < LEVEL_TITLES.length; i++) {
    if (xp >= LEVEL_TITLES[i].xp) {
      cur = LEVEL_TITLES[i];
      next = LEVEL_TITLES[i + 1] || { level: cur.level + 1, xp: cur.xp + 3000, title: cur.title };
    }
  }

  const prevXp = cur.xp;
  const nextXp = next.xp;
  const progressInLevel = Math.max(0, xp - prevXp);
  const xpNeeded = Math.max(1, nextXp - prevXp);
  const progressPercent = Math.min(100, Math.round((progressInLevel / xpNeeded) * 100));

  return {
    level: cur.level,
    title: cur.title,
    nextTitle: next.title,
    currentXp: xp,
    progressPercent,
    xpToNext: Math.max(0, nextXp - xp)
  };
}

export function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const bossesDefeated: string[] = parsed.bossesDefeated || [];
      const unlockedTitles: string[] = Array.isArray(parsed.unlockedTitles) ? [...parsed.unlockedTitles] : [];
      const unlockedBadges: string[] = Array.isArray(parsed.unlockedBadges) ? [...parsed.unlockedBadges] : [];

      // Auto-backfill loot for any previously defeated bosses
      bossesDefeated.forEach(bId => {
        const b = BOSSES.find(x => x.id === bId);
        if (b?.loot) {
          if (!unlockedTitles.includes(b.loot.title)) unlockedTitles.push(b.loot.title);
          if (!unlockedBadges.includes(b.loot.badgeId)) unlockedBadges.push(b.loot.badgeId);
        }
      });

      return {
        xp: parsed.xp || 0,
        level: getLevelInfo(parsed.xp || 0).level,
        levelTitle: getLevelInfo(parsed.xp || 0).title,
        cardStatus: parsed.cardStatus || {},
        bestStreak: parsed.bestStreak || 0,
        totalAnswers: parsed.totalAnswers || 0,
        correctAnswers: parsed.correctAnswers || 0,
        bossesDefeated,
        speedrunHighScore: parsed.speedrunHighScore || 0,
        speedrunBestAnswers: parsed.speedrunBestAnswers || 0,
        chapterStars: parsed.chapterStars || {},
        unlockedAchievements: parsed.unlockedAchievements || [],
        unlockedTitles,
        unlockedBadges,
        activeTitle: parsed.activeTitle || (unlockedTitles[0] || undefined),
        activeBadge: parsed.activeBadge || (unlockedBadges[0] || undefined)
      };
    }

    // Try to migrate legacy progress if available
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    let migratedStatus: Record<number, CardMastery> = {};
    if (legacy) {
      try {
        const legProg = JSON.parse(legacy);
        migratedStatus = legProg || {};
      } catch {
        // ignore
      }
    }

    return {
      xp: 0,
      level: 1,
      levelTitle: LEVEL_TITLES[0].title,
      cardStatus: migratedStatus,
      bestStreak: 0,
      totalAnswers: 0,
      correctAnswers: 0,
      bossesDefeated: [],
      speedrunHighScore: 0,
      speedrunBestAnswers: 0,
      chapterStars: {},
      unlockedAchievements: [],
      unlockedTitles: [],
      unlockedBadges: [],
      activeTitle: undefined,
      activeBadge: undefined
    };
  } catch {
    return {
      xp: 0,
      level: 1,
      levelTitle: LEVEL_TITLES[0].title,
      cardStatus: {},
      bestStreak: 0,
      totalAnswers: 0,
      correctAnswers: 0,
      bossesDefeated: [],
      speedrunHighScore: 0,
      speedrunBestAnswers: 0,
      chapterStars: {},
      unlockedAchievements: [],
      unlockedTitles: [],
      unlockedBadges: [],
      activeTitle: undefined,
      activeBadge: undefined
    };
  }
}

export function saveStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    // Keep legacy key synced for card statuses
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(stats.cardStatus));
  } catch {
    // Ignore storage errors
  }
}

export function resetAllStats(): PlayerStats {
  const blank: PlayerStats = {
    xp: 0,
    level: 1,
    levelTitle: LEVEL_TITLES[0].title,
    cardStatus: {},
    bestStreak: 0,
    totalAnswers: 0,
    correctAnswers: 0,
    bossesDefeated: [],
    speedrunHighScore: 0,
    speedrunBestAnswers: 0,
    chapterStars: {},
    unlockedAchievements: [],
    unlockedTitles: [],
    unlockedBadges: [],
    activeTitle: undefined,
    activeBadge: undefined
  };
  saveStats(blank);
  return blank;
}
