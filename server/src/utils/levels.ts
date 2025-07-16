import { UserLevel } from '../models/enums';

/**
 * Détermine le niveau d'un utilisateur selon ses points totaux
 */
export const getUserLevel = (totalPoints: number): UserLevel => {
  if (totalPoints <= 50) return UserLevel.BEGINNER;
  if (totalPoints <= 150) return UserLevel.AMATEUR;
  if (totalPoints <= 300) return UserLevel.CONFIRMED;
  return UserLevel.EXPERT;
};

/**
 * Retourne les informations détaillées d'un niveau
 */
export const getLevelInfo = (level: UserLevel) => {
  const levelData = {
    [UserLevel.BEGINNER]: {
      name: 'Débutant',
      description: 'Vous commencez votre aventure littéraire',
      color: '#6B7280', // Gray
      minPoints: 0,
      maxPoints: 50,
      icon: '📚',
    },
    [UserLevel.AMATEUR]: {
      name: 'Amateur',
      description: 'Votre passion pour la lecture grandit',
      color: '#3B82F6', // Blue
      minPoints: 51,
      maxPoints: 150,
      icon: '📖',
    },
    [UserLevel.CONFIRMED]: {
      name: 'Confirmé',
      description: 'Vous êtes un lecteur expérimenté',
      color: '#8B5CF6', // Purple
      minPoints: 151,
      maxPoints: 300,
      icon: '🏆',
    },
    [UserLevel.EXPERT]: {
      name: 'Expert',
      description: 'Vous êtes un maître de la lecture',
      color: '#F59E0B', // Amber
      minPoints: 301,
      maxPoints: Infinity,
      icon: '👑',
    },
  };

  return levelData[level];
};

/**
 * Calcule les points nécessaires pour atteindre le niveau suivant
 */
export const getPointsToNextLevel = (currentPoints: number): number | null => {
  const currentLevel = getUserLevel(currentPoints);
  
  switch (currentLevel) {
    case UserLevel.BEGINNER:
      return 51 - currentPoints;
    case UserLevel.AMATEUR:
      return 151 - currentPoints;
    case UserLevel.CONFIRMED:
      return 301 - currentPoints;
    case UserLevel.EXPERT:
      return null; // Niveau maximum atteint
    default:
      return null;
  }
};

/**
 * Retourne le niveau suivant
 */
export const getNextLevel = (currentLevel: UserLevel): UserLevel | null => {
  switch (currentLevel) {
    case UserLevel.BEGINNER:
      return UserLevel.AMATEUR;
    case UserLevel.AMATEUR:
      return UserLevel.CONFIRMED;
    case UserLevel.CONFIRMED:
      return UserLevel.EXPERT;
    case UserLevel.EXPERT:
      return null; // Niveau maximum
    default:
      return null;
  }
};

/**
 * Calcule le pourcentage de progression vers le niveau suivant
 */
export const getLevelProgress = (currentPoints: number): number => {
  const currentLevel = getUserLevel(currentPoints);
  const levelInfo = getLevelInfo(currentLevel);
  
  if (currentLevel === UserLevel.EXPERT) {
    return 100; // Niveau maximum atteint
  }
  
  const pointsInCurrentLevel = currentPoints - levelInfo.minPoints;
  const pointsNeededForLevel = levelInfo.maxPoints - levelInfo.minPoints;
  
  return Math.round((pointsInCurrentLevel / pointsNeededForLevel) * 100);
};

/**
 * Retourne tous les niveaux avec leurs informations
 */
export const getAllLevels = () => {
  return Object.values(UserLevel).map(level => ({
    level,
    ...getLevelInfo(level),
  }));
};

/**
 * Vérifie si un utilisateur a changé de niveau après avoir gagné des points
 */
export const hasLevelChanged = (oldPoints: number, newPoints: number): boolean => {
  const oldLevel = getUserLevel(oldPoints);
  const newLevel = getUserLevel(newPoints);
  return oldLevel !== newLevel;
};

/**
 * Retourne le message de félicitations pour un nouveau niveau
 */
export const getLevelUpMessage = (newLevel: UserLevel): string => {
  const levelInfo = getLevelInfo(newLevel);
  return `🎉 Félicitations ! Vous avez atteint le niveau ${levelInfo.name} ! ${levelInfo.description}`;
};
