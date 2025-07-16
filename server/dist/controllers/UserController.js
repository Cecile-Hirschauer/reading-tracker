"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const services_1 = require("../services");
class UserController {
    /**
     * Créer un nouvel utilisateur (inscription)
     */
    static async register(req, res) {
        try {
            const userData = req.body;
            // Validation basique
            if (!userData.email || !userData.username || !userData.password) {
                res.status(400).json({
                    success: false,
                    message: 'Email, nom d\'utilisateur et mot de passe sont requis',
                });
                return;
            }
            if (userData.password.length < 6) {
                res.status(400).json({
                    success: false,
                    message: 'Le mot de passe doit contenir au moins 6 caractères',
                });
                return;
            }
            const result = await services_1.UserService.createUser(userData);
            res.status(201).json({
                success: true,
                message: 'Utilisateur créé avec succès',
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la création de l\'utilisateur',
            });
        }
    }
    /**
     * Connexion utilisateur
     */
    static async login(req, res) {
        try {
            const loginData = req.body;
            // Validation basique
            if (!loginData.email || !loginData.password) {
                res.status(400).json({
                    success: false,
                    message: 'Email et mot de passe sont requis',
                });
                return;
            }
            const result = await services_1.UserService.loginUser(loginData);
            res.status(200).json({
                success: true,
                message: 'Connexion réussie',
                data: result,
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la connexion',
            });
        }
    }
    /**
     * Obtenir le profil de l'utilisateur connecté
     */
    static async getProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const user = await services_1.UserService.getUserById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé',
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération du profil',
            });
        }
    }
    /**
     * Mettre à jour le profil utilisateur
     */
    static async updateProfile(req, res) {
        try {
            const userId = req.user?.userId;
            const updateData = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const updatedUser = await services_1.UserService.updateUser(userId, updateData);
            res.status(200).json({
                success: true,
                message: 'Profil mis à jour avec succès',
                data: updatedUser,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil',
            });
        }
    }
    /**
     * Supprimer le compte utilisateur
     */
    static async deleteAccount(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            await services_1.UserService.deleteUser(userId);
            res.status(200).json({
                success: true,
                message: 'Compte supprimé avec succès',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la suppression du compte',
            });
        }
    }
    /**
     * Obtenir les statistiques de l'utilisateur
     */
    static async getStats(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const stats = await services_1.UserService.getUserStats(userId);
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération des statistiques',
            });
        }
    }
    /**
     * Obtenir le dashboard de l'utilisateur
     */
    static async getDashboard(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const dashboard = await services_1.UserService.getUserDashboard(userId);
            res.status(200).json({
                success: true,
                data: dashboard,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération du dashboard',
            });
        }
    }
    /**
     * Obtenir tous les utilisateurs (admin)
     */
    static async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await services_1.UserService.getAllUsers(page, limit);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération des utilisateurs',
            });
        }
    }
    /**
     * Obtenir un utilisateur par ID (admin)
     */
    static async getUserById(req, res) {
        try {
            const { userId } = req.params;
            const user = await services_1.UserService.getUserById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé',
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération de l\'utilisateur',
            });
        }
    }
    /**
     * Mettre à jour un utilisateur (admin)
     */
    static async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const updateData = req.body;
            const updatedUser = await services_1.UserService.updateUser(userId, updateData);
            res.status(200).json({
                success: true,
                message: 'Utilisateur mis à jour avec succès',
                data: updatedUser,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'utilisateur',
            });
        }
    }
    /**
     * Supprimer un utilisateur (admin)
     */
    static async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            await services_1.UserService.deleteUser(userId);
            res.status(200).json({
                success: true,
                message: 'Utilisateur supprimé avec succès',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'utilisateur',
            });
        }
    }
}
exports.UserController = UserController;
