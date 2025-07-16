"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeService = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const enums_1 = require("../models/enums");
class BadgeService {
    /**
     * Obtenir tous les badges disponibles
     */
    static async getAllBadges(page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await models_1.Badge.findAndCountAll({
                limit,
                offset,
                order: [['rarity', 'ASC'], ['name', 'ASC']],
            });
            const badges = rows.map(badge => this.formatBadgeResponse(badge));
            return {
                badges,
                total: count,
                pages: Math.ceil(count / limit),
            };
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération des badges: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Obtenir un badge par ID
     */
    static async getBadgeById(badgeId) {
        try {
            const badge = await models_1.Badge.findByPk(badgeId);
            return badge ? this.formatBadgeResponse(badge) : null;
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération du badge: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Obtenir les badges d'un utilisateur
     */
    static async getUserBadges(userId) {
        try {
            const userBadges = await models_1.UserBadge.findAll({
                where: { userId },
                include: [
                    {
                        model: models_1.Badge,
                        as: 'badge',
                    },
                ],
                order: [['unlockedAt', 'DESC']],
            });
            return userBadges.map((userBadge) => ({
                ...this.formatBadgeResponse(userBadge.badge),
                unlockedAt: userBadge.unlockedAt,
            }));
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération des badges utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Obtenir les badges par rareté
     */
    static async getBadgesByRarity(rarity) {
        try {
            const badges = await models_1.Badge.findAll({
                where: { rarity },
                order: [['name', 'ASC']],
            });
            return badges.map(badge => this.formatBadgeResponse(badge));
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération des badges par rareté: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Créer un nouveau badge (admin)
     */
    static async createBadge(badgeData) {
        try {
            // Vérifier si un badge avec cette condition existe déjà
            const existingBadge = await models_1.Badge.findOne({ where: { condition: badgeData.condition } });
            if (existingBadge) {
                throw new Error('Un badge avec cette condition existe déjà');
            }
            const badge = await models_1.Badge.create(badgeData);
            return this.formatBadgeResponse(badge);
        }
        catch (error) {
            throw new Error(`Erreur lors de la création du badge: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Mettre à jour un badge (admin)
     */
    static async updateBadge(badgeId, updateData) {
        try {
            const badge = await models_1.Badge.findByPk(badgeId);
            if (!badge) {
                throw new Error('Badge non trouvé');
            }
            // Vérifier l'unicité de la condition si modifiée
            if (updateData.condition && updateData.condition !== badge.condition) {
                const existingBadge = await models_1.Badge.findOne({ where: { condition: updateData.condition } });
                if (existingBadge) {
                    throw new Error('Un badge avec cette condition existe déjà');
                }
            }
            await badge.update(updateData);
            return this.formatBadgeResponse(badge);
        }
        catch (error) {
            throw new Error(`Erreur lors de la mise à jour du badge: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Supprimer un badge (admin)
     */
    static async deleteBadge(badgeId) {
        try {
            const badge = await models_1.Badge.findByPk(badgeId);
            if (!badge) {
                throw new Error('Badge non trouvé');
            }
            // Supprimer d'abord toutes les associations UserBadge
            await models_1.UserBadge.destroy({ where: { badgeId } });
            // Puis supprimer le badge
            await badge.destroy();
        }
        catch (error) {
            throw new Error(`Erreur lors de la suppression du badge: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Attribuer manuellement un badge à un utilisateur (admin)
     */
    static async assignBadgeToUser(userId, badgeId) {
        try {
            // Vérifier que l'utilisateur existe
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            // Vérifier que le badge existe
            const badge = await models_1.Badge.findByPk(badgeId);
            if (!badge) {
                throw new Error('Badge non trouvé');
            }
            // Vérifier si l'utilisateur a déjà ce badge
            const existingUserBadge = await models_1.UserBadge.findOne({
                where: { userId, badgeId }
            });
            if (existingUserBadge) {
                throw new Error('L\'utilisateur possède déjà ce badge');
            }
            // Créer l'association
            await models_1.UserBadge.create({
                userId,
                badgeId,
                unlockedAt: new Date(),
            });
        }
        catch (error) {
            throw new Error(`Erreur lors de l'attribution du badge: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Retirer un badge d'un utilisateur (admin)
     */
    static async removeBadgeFromUser(userId, badgeId) {
        try {
            const userBadge = await models_1.UserBadge.findOne({
                where: { userId, badgeId }
            });
            if (!userBadge) {
                throw new Error('L\'utilisateur ne possède pas ce badge');
            }
            await userBadge.destroy();
        }
        catch (error) {
            throw new Error(`Erreur lors du retrait du badge: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Obtenir les statistiques des badges
     */
    static async getBadgeStats() {
        try {
            const totalBadges = await models_1.Badge.count();
            const badgesByRarity = await models_1.Badge.findAll({
                attributes: ['rarity'],
                group: ['rarity'],
            });
            const rarityStats = await Promise.all(Object.values(enums_1.BadgeRarity).map(async (rarity) => {
                const count = await models_1.Badge.count({ where: { rarity } });
                return { rarity, count };
            }));
            const totalUnlocks = await models_1.UserBadge.count();
            const uniqueUsersWithBadges = await models_1.UserBadge.count({
                distinct: true,
                col: 'userId',
            });
            // Badge le plus populaire
            const popularBadge = await models_1.UserBadge.findAll({
                attributes: ['badgeId'],
                group: ['badgeId'],
                order: [[models_1.Badge.sequelize.fn('COUNT', models_1.Badge.sequelize.col('badgeId')), 'DESC']],
                limit: 1,
                include: [
                    {
                        model: models_1.Badge,
                        as: 'badge',
                        attributes: ['name', 'icon'],
                    },
                ],
            });
            return {
                totalBadges,
                rarityStats,
                totalUnlocks,
                uniqueUsersWithBadges,
                mostPopularBadge: popularBadge.length > 0 ? popularBadge[0] : null,
            };
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération des statistiques des badges: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Obtenir les badges récemment débloqués
     */
    static async getRecentlyUnlockedBadges(limit = 10) {
        try {
            const recentUnlocks = await models_1.UserBadge.findAll({
                include: [
                    {
                        model: models_1.Badge,
                        as: 'badge',
                    },
                    {
                        model: models_1.User,
                        as: 'user',
                        attributes: ['id', 'username'],
                    },
                ],
                order: [['unlockedAt', 'DESC']],
                limit,
            });
            return recentUnlocks.map((unlock) => ({
                badge: this.formatBadgeResponse(unlock.badge),
                user: {
                    id: unlock.user.id,
                    username: unlock.user.username,
                },
                unlockedAt: unlock.unlockedAt,
            }));
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération des badges récents: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Vérifier si un utilisateur peut débloquer de nouveaux badges
     */
    static async checkAvailableBadges(userId) {
        try {
            // Obtenir tous les badges que l'utilisateur n'a pas encore
            const userBadgeIds = await models_1.UserBadge.findAll({
                where: { userId },
                attributes: ['badgeId'],
            }).then(badges => badges.map(b => b.badgeId));
            const availableBadges = await models_1.Badge.findAll({
                where: {
                    id: { [sequelize_1.Op.notIn]: userBadgeIds },
                },
                order: [['rarity', 'ASC'], ['name', 'ASC']],
            });
            return availableBadges.map(badge => this.formatBadgeResponse(badge));
        }
        catch (error) {
            throw new Error(`Erreur lors de la vérification des badges disponibles: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Obtenir le leaderboard des badges
     */
    static async getBadgeLeaderboard(limit = 10) {
        try {
            const leaderboard = await models_1.UserBadge.findAll({
                attributes: [
                    'userId',
                    [models_1.UserBadge.sequelize.fn('COUNT', models_1.UserBadge.sequelize.col('badgeId')), 'badgeCount'],
                ],
                include: [
                    {
                        model: models_1.User,
                        as: 'user',
                        attributes: ['id', 'username'],
                    },
                ],
                group: ['userId', 'user.id'],
                order: [[models_1.UserBadge.sequelize.fn('COUNT', models_1.UserBadge.sequelize.col('badgeId')), 'DESC']],
                limit,
            });
            return leaderboard.map((entry) => ({
                user: {
                    id: entry.user.id,
                    username: entry.user.username,
                },
                badgeCount: parseInt(entry.get('badgeCount')),
            }));
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération du leaderboard: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Formater la réponse d'un badge
     */
    static formatBadgeResponse(badge) {
        return {
            id: badge.id,
            name: badge.name,
            description: badge.description,
            condition: badge.condition,
            icon: badge.icon,
            rarity: badge.rarity,
        };
    }
}
exports.BadgeService = BadgeService;
