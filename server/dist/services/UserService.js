"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const enums_1 = require("../models/enums");
class UserService {
    /**
     * Créer un nouvel utilisateur
     */
    static async createUser(userData) {
        try {
            // Vérifier si l'email existe déjà
            const existingUser = await models_1.User.findOne({ where: { email: userData.email } });
            if (existingUser) {
                throw new Error('Un utilisateur avec cet email existe déjà');
            }
            // Vérifier si le nom d'utilisateur existe déjà
            const existingUsername = await models_1.User.findOne({ where: { username: userData.username } });
            if (existingUsername) {
                throw new Error('Ce nom d\'utilisateur est déjà pris');
            }
            // Hasher le mot de passe
            const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
            // Créer l'utilisateur
            const user = await models_1.User.create({
                email: userData.email,
                username: userData.username,
                password: hashedPassword,
            });
            // Générer le token JWT
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                },
                token,
            };
        }
        catch (error) {
            throw new Error(`Erreur lors de la création de l'utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Authentifier un utilisateur
     */
    static async loginUser(loginData) {
        try {
            // Trouver l'utilisateur par email
            const user = await models_1.User.findOne({ where: { email: loginData.email } });
            if (!user) {
                throw new Error('Email ou mot de passe incorrect');
            }
            // Vérifier le mot de passe
            const isPasswordValid = await bcryptjs_1.default.compare(loginData.password, user.password);
            if (!isPasswordValid) {
                throw new Error('Email ou mot de passe incorrect');
            }
            // Générer le token JWT
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                },
                token,
            };
        }
        catch (error) {
            throw new Error(`Erreur lors de la connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Obtenir un utilisateur par ID
     */
    static async getUserById(userId) {
        try {
            return await models_1.User.findByPk(userId, {
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: models_1.Book,
                        as: 'books',
                    },
                    {
                        model: models_1.Badge,
                        as: 'badges',
                        through: { attributes: ['unlockedAt'] },
                    },
                ],
            });
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Obtenir les statistiques d'un utilisateur
     */
    static async getUserStats(userId) {
        try {
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            return await user.getStats();
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération des statistiques: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Mettre à jour le profil utilisateur
     */
    static async updateUser(userId, updateData) {
        try {
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            // Si le mot de passe est fourni, le hasher
            if (updateData.password) {
                updateData.password = await bcryptjs_1.default.hash(updateData.password, 10);
            }
            // Vérifier l'unicité de l'email si modifié
            if (updateData.email && updateData.email !== user.email) {
                const existingUser = await models_1.User.findOne({ where: { email: updateData.email } });
                if (existingUser) {
                    throw new Error('Un utilisateur avec cet email existe déjà');
                }
            }
            // Vérifier l'unicité du nom d'utilisateur si modifié
            if (updateData.username && updateData.username !== user.username) {
                const existingUsername = await models_1.User.findOne({ where: { username: updateData.username } });
                if (existingUsername) {
                    throw new Error('Ce nom d\'utilisateur est déjà pris');
                }
            }
            await user.update(updateData);
            // Retourner l'utilisateur sans le mot de passe
            const updatedUser = await models_1.User.findByPk(userId, {
                attributes: { exclude: ['password'] },
            });
            return updatedUser;
        }
        catch (error) {
            throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Supprimer un utilisateur
     */
    static async deleteUser(userId) {
        try {
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            await user.destroy();
        }
        catch (error) {
            throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Obtenir tous les utilisateurs (admin)
     */
    static async getAllUsers(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await models_1.User.findAndCountAll({
                attributes: { exclude: ['password'] },
                limit,
                offset,
                order: [['createdAt', 'DESC']],
            });
            return {
                users: rows,
                total: count,
                pages: Math.ceil(count / limit),
            };
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération des utilisateurs: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Vérifier un token JWT
     */
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
        }
        catch (error) {
            throw new Error('Token invalide');
        }
    }
    /**
     * Obtenir le dashboard d'un utilisateur
     */
    static async getUserDashboard(userId) {
        try {
            const user = await models_1.User.findByPk(userId, {
                attributes: { exclude: ['password'] },
            });
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            const stats = await user.getStats();
            const level = await user.getUserLevel();
            const totalPoints = await user.getTotalPoints();
            // Livres récents
            const recentBooks = await models_1.Book.findAll({
                where: { userId },
                order: [['updatedAt', 'DESC']],
                limit: 5,
            });
            // Livres en cours de lecture
            const currentlyReading = await models_1.Book.findAll({
                where: {
                    userId,
                    status: enums_1.BookStatus.READING
                },
                order: [['updatedAt', 'DESC']],
            });
            // Badges récents
            const recentBadges = await models_1.UserBadge.findAll({
                where: { userId },
                include: [{ model: models_1.Badge, as: 'badge' }],
                order: [['unlockedAt', 'DESC']],
                limit: 5,
            });
            return {
                user: {
                    id: user.id,
                    username: user.username,
                    level,
                    totalPoints,
                },
                stats,
                recentBooks: recentBooks.map(book => ({
                    ...book.toJSON(),
                    progress: book.progress,
                    points: book.points,
                })),
                recentBadges: recentBadges.map((userBadge) => ({
                    ...(userBadge.badge || {}),
                    unlockedAt: userBadge.unlockedAt,
                })),
                currentlyReading: currentlyReading.map(book => ({
                    ...book.toJSON(),
                    progress: book.progress,
                    points: book.points,
                })),
            };
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération du dashboard: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
}
exports.UserService = UserService;
UserService.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
UserService.JWT_EXPIRES_IN = '7d';
