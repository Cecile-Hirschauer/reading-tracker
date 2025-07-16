"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookController = void 0;
const services_1 = require("../services");
const enums_1 = require("../models/enums");
class BookController {
    /**
     * Créer un nouveau livre
     */
    static async createBook(req, res) {
        try {
            const userId = req.user?.userId;
            const bookData = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            // Validation basique
            if (!bookData.title || !bookData.author || !bookData.pages || !bookData.category) {
                res.status(400).json({
                    success: false,
                    message: 'Titre, auteur, nombre de pages et catégorie sont requis',
                });
                return;
            }
            if (bookData.pages <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Le nombre de pages doit être supérieur à 0',
                });
                return;
            }
            const book = await services_1.BookService.createBook(userId, bookData);
            res.status(201).json({
                success: true,
                message: 'Livre créé avec succès',
                data: book,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la création du livre',
            });
        }
    }
    /**
     * Obtenir tous les livres de l'utilisateur
     */
    static async getUserBooks(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const category = req.query.category;
            const search = req.query.search;
            const result = await services_1.BookService.getUserBooks(userId, {
                page,
                limit,
                status,
                category,
                search,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération des livres',
            });
        }
    }
    /**
     * Obtenir un livre par ID
     */
    static async getBookById(req, res) {
        try {
            const userId = req.user?.userId;
            const { bookId } = req.params;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const book = await services_1.BookService.getBookById(bookId, userId);
            if (!book) {
                res.status(404).json({
                    success: false,
                    message: 'Livre non trouvé',
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: book,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération du livre',
            });
        }
    }
    /**
     * Mettre à jour un livre
     */
    static async updateBook(req, res) {
        try {
            const userId = req.user?.userId;
            const { bookId } = req.params;
            const updateData = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            // Validation des pages si fourni
            if (updateData.pages !== undefined && updateData.pages <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Le nombre de pages doit être supérieur à 0',
                });
                return;
            }
            const book = await services_1.BookService.updateBook(bookId, userId, updateData);
            res.status(200).json({
                success: true,
                message: 'Livre mis à jour avec succès',
                data: book,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du livre',
            });
        }
    }
    /**
     * Mettre à jour la progression d'un livre
     */
    static async updateProgress(req, res) {
        try {
            const userId = req.user?.userId;
            const { bookId } = req.params;
            const progressData = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            // Validation de la page courante
            if (progressData.currentPage < 0) {
                res.status(400).json({
                    success: false,
                    message: 'La page courante ne peut pas être négative',
                });
                return;
            }
            const book = await services_1.BookService.updateProgress(bookId, userId, progressData);
            res.status(200).json({
                success: true,
                message: 'Progression mise à jour avec succès',
                data: book,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la progression',
            });
        }
    }
    /**
     * Marquer un livre comme terminé
     */
    static async markAsCompleted(req, res) {
        try {
            const userId = req.user?.userId;
            const { bookId } = req.params;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const book = await services_1.BookService.markAsCompleted(bookId, userId);
            res.status(200).json({
                success: true,
                message: 'Livre marqué comme terminé',
                data: book,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la finalisation du livre',
            });
        }
    }
    /**
     * Supprimer un livre
     */
    static async deleteBook(req, res) {
        try {
            const userId = req.user?.userId;
            const { bookId } = req.params;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            await services_1.BookService.deleteBook(bookId, userId);
            res.status(200).json({
                success: true,
                message: 'Livre supprimé avec succès',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la suppression du livre',
            });
        }
    }
    /**
     * Obtenir les statistiques de lecture
     */
    static async getReadingStats(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const stats = await services_1.BookService.getReadingStats(userId);
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
     * Obtenir les livres par catégorie
     */
    static async getBooksByCategory(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const booksByCategory = await services_1.BookService.getBooksByCategory(userId);
            res.status(200).json({
                success: true,
                data: booksByCategory,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération des livres par catégorie',
            });
        }
    }
    /**
     * Obtenir les livres en cours de lecture
     */
    static async getCurrentlyReading(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const result = await services_1.BookService.getUserBooks(userId, {
                status: enums_1.BookStatus.READING,
                limit: 50, // Limite plus élevée pour les livres en cours
            });
            res.status(200).json({
                success: true,
                data: result.books,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération des livres en cours',
            });
        }
    }
    /**
     * Obtenir les livres terminés
     */
    static async getCompletedBooks(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await services_1.BookService.getUserBooks(userId, {
                status: enums_1.BookStatus.COMPLETED,
                page,
                limit,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la récupération des livres terminés',
            });
        }
    }
    /**
     * Rechercher des livres
     */
    static async searchBooks(req, res) {
        try {
            const userId = req.user?.userId;
            const { q: search } = req.query;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié',
                });
                return;
            }
            if (!search || typeof search !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Terme de recherche requis',
                });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await services_1.BookService.getUserBooks(userId, {
                search,
                page,
                limit,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erreur lors de la recherche de livres',
            });
        }
    }
}
exports.BookController = BookController;
