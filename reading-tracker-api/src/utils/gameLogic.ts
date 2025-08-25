import { PrismaClient, BadgeType, BookStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Calculate points based on book length
 */
export const calculatePoints = (totalPages: number): number => {
  if (totalPages < 150) return 10;      // Livre court
  if (totalPages <= 300) return 20;     // Livre moyen
  return 30;                            // Livre long
};

/**
 * Calculate user level based on total points
 */
export const calculateLevel = (totalPoints: number): number => {
  if (totalPoints >= 301) return 4;     // Expert
  if (totalPoints >= 151) return 3;     // Confirmé
  if (totalPoints >= 51) return 2;      // Amateur
  return 1;                             // Débutant
};

/**
 * Get level info with progress to next level
 */
export const getLevelInfo = (totalPoints: number) => {
  const currentLevel = calculateLevel(totalPoints);
  
  const levelThresholds = [0, 51, 151, 301];
  const levelNames = ['Débutant', 'Amateur', 'Confirmé', 'Expert'];
  
  const currentThreshold = levelThresholds[currentLevel - 1];
  const nextThreshold = levelThresholds[currentLevel] || null;
  
  let pointsToNext = 0;
  let progressPercentage = 100;
  
  if (nextThreshold !== null) {
    pointsToNext = nextThreshold - totalPoints;
    const rangeSize = nextThreshold - currentThreshold;
    const currentProgress = totalPoints - currentThreshold;
    progressPercentage = Math.round((currentProgress / rangeSize) * 100);
  }
  
  return {
    currentLevel,
    levelName: levelNames[currentLevel - 1],
    totalPoints,
    pointsToNext: Math.max(0, pointsToNext),
    progressPercentage,
    isMaxLevel: currentLevel === 4
  };
};

/**
 * Badge definitions with their unlock criteria
 */
const BADGE_DEFINITIONS = {
  [BadgeType.FIRST_BOOK]: {
    name: 'Première Lecture',
    description: 'Félicitations pour votre premier livre terminé !',
    check: async (userId: string) => {
      const completedBooks = await prisma.book.count({
        where: { userId, status: BookStatus.COMPLETED }
      });
      return completedBooks >= 1;
    }
  },
  [BadgeType.READER_5_BOOKS]: {
    name: 'Lecteur·trice assidu·e',
    description: '5 livres terminés - Vous prenez goût à la lecture !',
    check: async (userId: string) => {
      const completedBooks = await prisma.book.count({
        where: { userId, status: BookStatus.COMPLETED }
      });
      return completedBooks >= 5;
    }
  },
  [BadgeType.BIBLIOPHILE_20_BOOKS]: {
    name: 'Bibliophile',
    description: '20 livres terminés - Vous êtes un·e vrai·e passionné·e !',
    check: async (userId: string) => {
      const completedBooks = await prisma.book.count({
        where: { userId, status: BookStatus.COMPLETED }
      });
      return completedBooks >= 20;
    }
  },
  [BadgeType.GENRE_EXPLORER_3]: {
    name: 'Explorer les genres',
    description: 'Vous avez lu dans 3 genres différents',
    check: async (userId: string) => {
      const genres = await prisma.book.groupBy({
        by: ['category'],
        where: { userId, status: BookStatus.COMPLETED },
      });
      return genres.length >= 3;
    }
  },
  [BadgeType.LITERARY_ADVENTURER_5]: {
    name: 'Aventurier·ère littéraire',
    description: 'Vous avez exploré 5 genres différents',
    check: async (userId: string) => {
      const genres = await prisma.book.groupBy({
        by: ['category'],
        where: { userId, status: BookStatus.COMPLETED },
      });
      return genres.length >= 5;
    }
  },
  [BadgeType.MARATHON_READER]: {
    name: 'Marathon de lecture',
    description: 'Vous avez terminé un livre de plus de 300 pages',
    check: async (userId: string) => {
      const longBooks = await prisma.book.count({
        where: { 
          userId, 
          status: BookStatus.COMPLETED,
          totalPages: { gte: 300 }
        }
      });
      return longBooks >= 1;
    }
  },
  [BadgeType.SPEED_READER]: {
    name: 'Lecture rapide',
    description: '5 livres terminés en moins de 2 semaines',
    check: async (userId: string) => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      const recentBooks = await prisma.book.count({
        where: {
          userId,
          status: BookStatus.COMPLETED,
          completedDate: { gte: twoWeeksAgo }
        }
      });
      return recentBooks >= 5;
    }
  },
  [BadgeType.MONTHLY_10_BOOKS]: {
    name: '10 livres dans un mois',
    description: 'Performance exceptionnelle : 10 livres en 30 jours !',
    check: async (userId: string) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyBooks = await prisma.book.count({
        where: {
          userId,
          status: BookStatus.COMPLETED,
          completedDate: { gte: thirtyDaysAgo }
        }
      });
      return monthlyBooks >= 10;
    }
  },
  [BadgeType.YEARLY_30_BOOKS]: {
    name: '30 livres dans l\'année',
    description: 'Lecteur·trice accompli·e : 30 livres en 365 jours !',
    check: async (userId: string) => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const yearlyBooks = await prisma.book.count({
        where: {
          userId,
          status: BookStatus.COMPLETED,
          completedDate: { gte: oneYearAgo }
        }
      });
      return yearlyBooks >= 30;
    }
  }
};

/**
 * Check and award badges for a user
 */
export const checkAndAwardBadges = async (userId: string): Promise<BadgeType[]> => {
  const newBadges: BadgeType[] = [];

  // Get existing badges for this user
  const existingBadges = await prisma.badge.findMany({
    where: { userId },
    select: { type: true }
  });
  
  const existingBadgeTypes = new Set(existingBadges.map(b => b.type));

  // Check each badge type
  for (const [badgeType, definition] of Object.entries(BADGE_DEFINITIONS)) {
    const badgeTypeEnum = badgeType as BadgeType;
    
    // Skip if user already has this badge
    if (existingBadgeTypes.has(badgeTypeEnum)) {
      continue;
    }

    // Check if user meets criteria for this badge
    const meetsCondition = await definition.check(userId);
    
    if (meetsCondition) {
      // Award the badge
      await prisma.badge.create({
        data: {
          userId,
          type: badgeTypeEnum,
          name: definition.name,
          description: definition.description
        }
      });
      
      newBadges.push(badgeTypeEnum);
    }
  }

  // Update user level based on current points
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalPoints: true, currentLevel: true }
  });

  if (user) {
    const newLevel = calculateLevel(user.totalPoints);
    if (newLevel !== user.currentLevel) {
      await prisma.user.update({
        where: { id: userId },
        data: { currentLevel: newLevel }
      });
    }
  }

  return newBadges;
};

/**
 * Get all available badge definitions
 */
export const getAllBadgeDefinitions = () => {
  return Object.entries(BADGE_DEFINITIONS).map(([type, def]) => ({
    type: type as BadgeType,
    name: def.name,
    description: def.description
  }));
};

/**
 * Get progress towards unearned badges
 */
export const getBadgeProgress = async (userId: string) => {
  const progress: Array<{
    type: BadgeType;
    name: string;
    description: string;
    earned: boolean;
    progress?: string;
  }> = [];

  // Get existing badges
  const existingBadges = await prisma.badge.findMany({
    where: { userId },
    select: { type: true }
  });
  const existingBadgeTypes = new Set(existingBadges.map(b => b.type));

  // Get user stats for progress calculation
  const [completedBooks, genres, user] = await Promise.all([
    prisma.book.count({ where: { userId, status: BookStatus.COMPLETED } }),
    prisma.book.groupBy({
      by: ['category'],
      where: { userId, status: BookStatus.COMPLETED },
    }),
    prisma.user.findUnique({ where: { id: userId } })
  ]);

  for (const [badgeType, definition] of Object.entries(BADGE_DEFINITIONS)) {
    const badgeTypeEnum = badgeType as BadgeType;
    const isEarned = existingBadgeTypes.has(badgeTypeEnum);
    
    let progressText = '';
    if (!isEarned) {
      switch (badgeTypeEnum) {
        case BadgeType.READER_5_BOOKS:
          progressText = `${completedBooks}/5 livres`;
          break;
        case BadgeType.BIBLIOPHILE_20_BOOKS:
          progressText = `${completedBooks}/20 livres`;
          break;
        case BadgeType.GENRE_EXPLORER_3:
          progressText = `${genres.length}/3 genres`;
          break;
        case BadgeType.LITERARY_ADVENTURER_5:
          progressText = `${genres.length}/5 genres`;
          break;
        default:
          progressText = 'En cours...';
      }
    }

    progress.push({
      type: badgeTypeEnum,
      name: definition.name,
      description: definition.description,
      earned: isEarned,
      progress: isEarned ? undefined : progressText
    });
  }

  return progress;
};