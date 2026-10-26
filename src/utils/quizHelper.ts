import { MuscleCard, MUSCLE_CARDS } from '../data/muscleCards';

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateDistractors(card: MuscleCard, count: number = 3): string[] {
  const sameCat = shuffleArray(
    MUSCLE_CARDS.filter(c => c.cat === card.cat && c.a !== card.a)
  );
  const diffCat = shuffleArray(
    MUSCLE_CARDS.filter(c => c.cat !== card.cat && c.a !== card.a)
  );

  const pool = [...sameCat, ...diffCat];
  const uniqueDistractors: string[] = [];

  for (const c of pool) {
    if (!uniqueDistractors.includes(c.a) && c.a !== card.a) {
      uniqueDistractors.push(c.a);
      if (uniqueDistractors.length >= count) break;
    }
  }

  return uniqueDistractors;
}

export function generateQuizOptions(card: MuscleCard): string[] {
  const distractors = generateDistractors(card, 3);
  return shuffleArray([card.a, ...distractors]);
}

// Fold text for comparison
export function foldText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(ehk|ja|musculus|m)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getAcceptedVariants(answer: string): string[] {
  const variants: string[] = [answer, answer.replace(/\(.*?\)/g, '')];

  const parentheticalMatches = answer.match(/\((.*?)\)/g) || [];
  parentheticalMatches.forEach(p => variants.push(p.slice(1, -1)));

  answer
    .replace(/\(.*?\)/g, '')
    .split(/\behk\b/)
    .forEach(p => variants.push(p));

  return variants.map(foldText).filter(Boolean);
}

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function isAnswerMatch(input: string, targetAnswer: string): boolean {
  const cleanInput = foldText(input);
  if (!cleanInput) return false;

  const validVariants = getAcceptedVariants(targetAnswer);
  if (validVariants.includes(cleanInput)) return true;

  // Allow 1 typo for shorter words or ratio for longer
  return validVariants.some(v => {
    if (v.length <= 4) return v === cleanInput;
    const maxErrors = v.length <= 12 ? 1 : Math.max(1, Math.floor(v.length / 7));
    return levenshteinDistance(v, cleanInput) <= maxErrors;
  });
}
