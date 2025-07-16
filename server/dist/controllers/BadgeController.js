"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeController = void 0;
const services_1 = require("../services");
const enums_1 = require("../models/enums");
class BadgeController {
    /**
     * Obtenir tous les badges disponibles
     */
    static async getAllBadges(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await services_1.BadgeService.getAllBadges(page, limit);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération des badges',
            });
        }
    }
    /**
     * Obtenir un badge par ID
     */
    static async getBadgeById(req, res) {
        try {
            const { badgeId } = req.params;
            const badge = await services_1.BadgeService.getBadgeById(badgeId);
            if (!badge) {
                res.status(404).json({
                    success: false,
                    message: 'Badge non trouvé',
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: badge,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération du badge',
            });
        }
    }
    /**
     * Obtenir les badges de l'utilisateur connecté
     */
    static async getUserBadges(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const badges = await services_1.BadgeService.getUserBadges(userId);
            res.status(200).json({
                success: true,
                data: badges,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération des badges utilisateur',
            });
        }
    }
    /**
     * Obtenir les badges par rareté
     */
    static async getBadgesByRarity(req, res) {
        try {
            const { rarity } = req.params;
            // Vérifier que la rareté est valide
            if (!Object.values(enums_1.BadgeRarity).includes(rarity)) {
                res.status(400).json({
                    success: false,
                    message: 'Rareté invalide',
                });
                return;
            }
            const badges = await services_1.BadgeService.getBadgesByRarity(rarity);
            res.status(200).json({
                success: true,
                data: badges,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération des badges par rareté',
            });
        }
    }
    /**
     * Vérifier les badges disponibles pour l'utilisateur
     */
    static async checkAvailableBadges(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const availableBadges = await services_1.BadgeService.checkAvailableBadges(userId);
            res.status(200).json({
                success: true,
                data: availableBadges,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la vérification des badges disponibles',
            });
        }
    }
    /**
     * Obtenir les statistiques des badges
     */
    static async getBadgeStats(req, res) {
        try {
            const stats = await services_1.BadgeService.getBadgeStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération des statistiques des badges',
            });
        }
    }
    /**
     * Obtenir les badges récemment débloqués
     */
    static async getRecentlyUnlockedBadges(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const recentBadges = await services_1.BadgeService.getRecentlyUnlockedBadges(limit);
            res.status(200).json({
                success: true,
                data: recentBadges,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération des badges récents',
            });
        }
    }
    /**
     * Obtenir le leaderboard des badges
     */
    static async getBadgeLeaderboard(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const leaderboard = await services_1.BadgeService.getBadgeLeaderboard(limit);
            res.status(200).json({
                success: true,
                data: leaderboard,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération du leaderboard',
            });
        }
    }
    // ===== MÉTHODES ADMIN =====
    /**
     * Créer un nouveau badge (admin)
     */
    static async createBadge(req, res) {
        try {
            const badgeData = req.body;
            // Validation basique
            if (!badgeData.name || !badgeData.description || !badgeData.condition || !badgeData.icon || !badgeData.rarity) {
                res.status(400).json({
                    success: false,
                    message: 'Nom, description, condition, icône et rareté sont requis',
                });
                return;
            }
            // Vérifier que la rareté est valide
            if (!Object.values(enums_1.BadgeRarity).includes(badgeData.rarity)) {
                res.status(400).json({
                    success: false,
                    message: 'Rareté invalide',
                });
                return;
            }
            const badge = await services_1.BadgeService.createBadge(badgeData);
            res.status(201).json({
                success: true,
                message: 'Badge créé avec succès',
                data: badge,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la création du badge',
            });
        }
    }
    /**
     * Mettre à jour un badge (admin)
     */
    static async updateBadge(req, res) {
        try {
            const { badgeId } = req.params;
            const updateData = req.body;
            // Vérifier que la rareté est valide si fournie
            if (updateData.rarity && !Object.values(enums_1.BadgeRarity).includes(updateData.rarity)) {
                res.status(400).json({
                    success: false,
                    message: 'Rareté invalide',
                });
                return;
            }
            const badge = await services_1.BadgeService.updateBadge(badgeId, updateData);
            res.status(200).json({
                success: true,
                message: 'Badge mis à jour avec succès',
                data: badge,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du badge',
            });
        }
    }
    /**
     * Supprimer un badge (admin)
     */
    static async deleteBadge(req, res) {
        try {
            const { badgeId } = req.params;
            await services_1.BadgeService.deleteBadge(badgeId);
            res.status(200).json({
                success: true,
                message: 'Badge supprimé avec succès',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la suppression du badge',
            });
        }
    }
    /**
     * Attribuer un badge à un utilisateur (admin)
     */
    static async assignBadgeToUser(req, res) {
        try {
            const { badgeId, userId } = req.params;
            await services_1.BadgeService.assignBadgeToUser(userId, badgeId);
            res.status(200).json({
                success: true,
                message: 'Badge attribué avec succès',
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de l\'attribution du badge',
            });
        }
    }
    /**
     * Retirer un badge d'un utilisateur (admin)
     */
    static async removeBadgeFromUser(req, res) {
        try {
            const { badgeId, userId } = req.params;
            await services_1.BadgeService.removeBadgeFromUser(userId, badgeId);
            res.status(200).json({
                success: true,
                message: 'Badge retiré avec succès',
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors du retrait du badge',
            });
        }
    }
    /**
     * Obtenir les badges d'un utilisateur spécifique (admin)
     */
    static async getUserBadgesById(req, res) {
        try {
            const { userId } = req.params;
            const badges = await services_1.BadgeService.getUserBadges(userId);
            res.status(200).json({
                success: true,
                data: badges,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération des badges utilisateur',
            });
        }
    }
}
exports.BadgeController = BadgeController;
