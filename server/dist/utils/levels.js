"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLevelUpMessage = exports.hasLevelChanged = exports.getAllLevels = exports.getLevelProgress = exports.getNextLevel = exports.getPointsToNextLevel = exports.getLevelInfo = exports.getUserLevel = void 0;
const enums_1 = require("../models/enums");
/**
 * Détermine le niveau d'un utilisateur selon ses points totaux
 */
const getUserLevel = (totalPoints) => {
    if (totalPoints <= 50)
        return enums_1.UserLevel.BEGINNER;
    if (totalPoints <= 150)
        return enums_1.UserLevel.AMATEUR;
    if (totalPoints <= 300)
        return enums_1.UserLevel.CONFIRMED;
    return enums_1.UserLevel.EXPERT;
};
exports.getUserLevel = getUserLevel;
/**
 * Retourne les informations détaillées d'un niveau
 */
const getLevelInfo = (level) => {
    const levelData = {
        [enums_1.UserLevel.BEGINNER]: {
            name: 'Débutant',
            description: 'Vous commencez votre aventure littéraire',
            color: '#6B7280', // Gray
            minPoints: 0,
            maxPoints: 50,
            icon: '📚',
        },
        [enums_1.UserLevel.AMATEUR]: {
            name: 'Amateur',
            description: 'Votre passion pour la lecture grandit',
            color: '#3B82F6', // Blue
            minPoints: 51,
            maxPoints: 150,
            icon: '📖',
        },
        [enums_1.UserLevel.CONFIRMED]: {
            name: 'Confirmé',
            description: 'Vous êtes un lecteur expérimenté',
            color: '#8B5CF6', // Purple
            minPoints: 151,
            maxPoints: 300,
            icon: '🏆',
        },
        [enums_1.UserLevel.EXPERT]: {
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
exports.getLevelInfo = getLevelInfo;
/**
 * Calcule les points nécessaires pour atteindre le niveau suivant
 */
const getPointsToNextLevel = (currentPoints) => {
    const currentLevel = (0, exports.getUserLevel)(currentPoints);
    switch (currentLevel) {
        case enums_1.UserLevel.BEGINNER:
            return 51 - currentPoints;
        case enums_1.UserLevel.AMATEUR:
            return 151 - currentPoints;
        case enums_1.UserLevel.CONFIRMED:
            return 301 - currentPoints;
        case enums_1.UserLevel.EXPERT:
            return null; // Niveau maximum atteint
        default:
            return null;
    }
};
exports.getPointsToNextLevel = getPointsToNextLevel;
/**
 * Retourne le niveau suivant
 */
const getNextLevel = (currentLevel) => {
    switch (currentLevel) {
        case enums_1.UserLevel.BEGINNER:
            return enums_1.UserLevel.AMATEUR;
        case enums_1.UserLevel.AMATEUR:
            return enums_1.UserLevel.CONFIRMED;
        case enums_1.UserLevel.CONFIRMED:
            return enums_1.UserLevel.EXPERT;
        case enums_1.UserLevel.EXPERT:
            return null; // Niveau maximum
        default:
            return null;
    }
};
exports.getNextLevel = getNextLevel;
/**
 * Calcule le pourcentage de progression vers le niveau suivant
 */
const getLevelProgress = (currentPoints) => {
    const currentLevel = (0, exports.getUserLevel)(currentPoints);
    const levelInfo = (0, exports.getLevelInfo)(currentLevel);
    if (currentLevel === enums_1.UserLevel.EXPERT) {
        return 100; // Niveau maximum atteint
    }
    const pointsInCurrentLevel = currentPoints - levelInfo.minPoints;
    const pointsNeededForLevel = levelInfo.maxPoints - levelInfo.minPoints;
    return Math.round((pointsInCurrentLevel / pointsNeededForLevel) * 100);
};
exports.getLevelProgress = getLevelProgress;
/**
 * Retourne tous les niveaux avec leurs informations
 */
const getAllLevels = () => {
    return Object.values(enums_1.UserLevel).map(level => ({
        level,
        ...(0, exports.getLevelInfo)(level),
    }));
};
exports.getAllLevels = getAllLevels;
/**
 * Vérifie si un utilisateur a changé de niveau après avoir gagné des points
 */
const hasLevelChanged = (oldPoints, newPoints) => {
    const oldLevel = (0, exports.getUserLevel)(oldPoints);
    const newLevel = (0, exports.getUserLevel)(newPoints);
    return oldLevel !== newLevel;
};
exports.hasLevelChanged = hasLevelChanged;
/**
 * Retourne le message de félicitations pour un nouveau niveau
 */
const getLevelUpMessage = (newLevel) => {
    const levelInfo = (0, exports.getLevelInfo)(newLevel);
    return `🎉 Félicitations ! Vous avez atteint le niveau ${levelInfo.name} ! ${levelInfo.description}`;
};
exports.getLevelUpMessage = getLevelUpMessage;
