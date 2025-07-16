"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookService = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const enums_1 = require("../models/enums");
class BookService {
    /**
     * Créer un nouveau livre
     */
    static async createBook(userId, bookData) {
        try {
            const book = await models_1.Book.create({
                ...bookData,
                category: bookData.category,
                userId,
                status: enums_1.BookStatus.NOT_STARTED,
                currentPage: 0,
            });
            return this.formatBookResponse(book);
        }
        catch (error) {
            throw new Error(`Erreur lors de la création du livre: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Obtenir un livre par ID
     */
    static async getBookById(bookId, userId) {
        try {
            const book = await models_1.Book.findOne({
                where: {
                    id: bookId,
                    userId
                },
                include: [
                    {
                        model: models_1.User,
                        as: 'user',
                        attributes: ['id', 'username'],
                    },
                ],
            });
            return book ? this.formatBookResponse(book) : null;
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération du livre: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Obtenir tous les livres d'un utilisateur
     */
    static async getUserBooks(userId, options = {}) {
        try {
            const { status, category, page = 1, limit = 10, search } = options;
            const offset = (page - 1) * limit;
            const whereClause = { userId };
            if (status) {
                whereClause.status = status;
            }
            if (category) {
                whereClause.category = category;
            }
            if (search) {
                whereClause[sequelize_1.Op.or] = [
                    { title: { [sequelize_1.Op.like]: `%${search}%` } },
                    { author: { [sequelize_1.Op.like]: `%${search}%` } },
                ];
            }
            const { count, rows } = await models_1.Book.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [['updatedAt', 'DESC']],
            });
            const books = rows.map(book => this.formatBookResponse(book));
            return {
                books,
                total: count,
                pages: Math.ceil(count / limit),
            };
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération des livres: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Mettre à jour un livre
     */
    static async updateBook(bookId, userId, updateData) {
        try {
            const book = await models_1.Book.findOne({
                where: {
                    id: bookId,
                    userId
                },
            });
            if (!book) {
                throw new Error('Livre non trouvé');
            }
            const updatePayload = { ...updateData };
            if (updateData.category) {
                updatePayload.category = updateData.category;
            }
            if (updateData.status) {
                updatePayload.status = updateData.status;
            }
            await book.update(updatePayload);
            return this.formatBookResponse(book);
        }
        catch (error) {
            throw new Error(`Erreur lors de la mise à jour du livre: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Mettre à jour la progression d'un livre
     */
    static async updateProgress(bookId, userId, progressData) {
        try {
            const book = await models_1.Book.findOne({
                where: {
                    id: bookId,
                    userId
                },
            });
            if (!book) {
                throw new Error('Livre non trouvé');
            }
            const oldStatus = book.status;
            book.updateProgress(progressData.currentPage);
            // Si le statut change de "pas commencé" à "en cours", mettre à jour
            if (oldStatus === enums_1.BookStatus.NOT_STARTED && book.currentPage > 0) {
                book.status = enums_1.BookStatus.READING;
            }
            await book.save();
            // Vérifier les badges après mise à jour de la progression
            if (book.status === enums_1.BookStatus.COMPLETED && oldStatus !== enums_1.BookStatus.COMPLETED) {
                await this.checkAndUnlockBadges(userId);
            }
            return this.formatBookResponse(book);
        }
        catch (error) {
            throw new Error(`Erreur lors de la mise à jour de la progression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Supprimer un livre
     */
    static async deleteBook(bookId, userId) {
        try {
            const book = await models_1.Book.findOne({
                where: {
                    id: bookId,
                    userId
                },
            });
            if (!book) {
                throw new Error('Livre non trouvé');
            }
            await book.destroy();
        }
        catch (error) {
            throw new Error(`Erreur lors de la suppression du livre: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Obtenir les statistiques de lecture d'un utilisateur
     */
    static async getReadingStats(userId) {
        try {
            const books = await models_1.Book.findAll({ where: { userId } });
            const stats = {
                totalBooks: books.length,
                completedBooks: books.filter(book => book.status === enums_1.BookStatus.COMPLETED).length,
                currentlyReading: books.filter(book => book.status === enums_1.BookStatus.READING).length,
                notStarted: books.filter(book => book.status === enums_1.BookStatus.NOT_STARTED).length,
                paused: books.filter(book => book.status === enums_1.BookStatus.PAUSED).length,
                totalPages: books.reduce((total, book) => total + book.pages, 0),
                pagesRead: books.reduce((total, book) => total + book.currentPage, 0),
                averageProgress: books.length > 0 ? books.reduce((total, book) => total + book.progress, 0) / books.length : 0,
                categoriesRead: [...new Set(books.map(book => book.category))],
                totalPoints: books.filter(book => book.status === enums_1.BookStatus.COMPLETED).reduce((total, book) => total + book.points, 0),
            };
            return stats;
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération des statistiques: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Marquer un livre comme terminé
     */
    static async markAsCompleted(bookId, userId) {
        try {
            const book = await models_1.Book.findOne({
                where: {
                    id: bookId,
                    userId
                },
            });
            if (!book) {
                throw new Error('Livre non trouvé');
            }
            const oldStatus = book.status;
            book.status = enums_1.BookStatus.COMPLETED;
            book.currentPage = book.pages;
            book.completedAt = new Date();
            await book.save();
            // Vérifier les badges après completion
            if (oldStatus !== enums_1.BookStatus.COMPLETED) {
                await this.checkAndUnlockBadges(userId);
            }
            return this.formatBookResponse(book);
        }
        catch (error) {
            throw new Error(`Erreur lors de la finalisation du livre: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Obtenir les livres par catégorie
     */
    static async getBooksByCategory(userId) {
        try {
            const books = await models_1.Book.findAll({
                where: { userId },
                order: [['updatedAt', 'DESC']],
            });
            const booksByCategory = {};
            books.forEach(book => {
                const category = book.category;
                if (!booksByCategory[category]) {
                    booksByCategory[category] = [];
                }
                booksByCategory[category].push(this.formatBookResponse(book));
            });
            return booksByCategory;
        }
        catch (error) {
            throw new Error(`Erreur lors de la récupération des livres par catégorie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }
    /**
     * Vérifier et débloquer les badges après une action
     */
    static async checkAndUnlockBadges(userId) {
        try {
            const books = await models_1.Book.findAll({ where: { userId } });
            const completedBooks = books.filter(book => book.status === enums_1.BookStatus.COMPLETED);
            const categoriesRead = [...new Set(completedBooks.map(book => book.category))];
            // Badge "Première Lecture" - 1 livre complété
            if (completedBooks.length === 1) {
                await this.unlockBadgeByCondition(userId, 'complete_1_book');
            }
            // Badge "Lecteur Assidu" - 5 livres complétés
            if (completedBooks.length === 5) {
                await this.unlockBadgeByCondition(userId, 'complete_5_books');
            }
            // Badge "Bibliophile" - 20 livres complétés
            if (completedBooks.length === 20) {
                await this.unlockBadgeByCondition(userId, 'complete_20_books');
            }
            // Badge "Maître Lecteur" - 50 livres complétés
            if (completedBooks.length === 50) {
                await this.unlockBadgeByCondition(userId, 'complete_50_books');
            }
            // Badge "Explorer les Genres" - 3 genres différents
            if (categoriesRead.length === 3) {
                await this.unlockBadgeByCondition(userId, 'read_3_genres');
            }
            // Badge "Aventurier Littéraire" - 5 genres différents
            if (categoriesRead.length === 5) {
                await this.unlockBadgeByCondition(userId, 'read_5_genres');
            }
            // Badge "Collectionneur de Genres" - tous les genres
            if (categoriesRead.length === Object.keys(enums_1.BookCategory).length) {
                await this.unlockBadgeByCondition(userId, 'read_all_genres');
            }
            // Vérifier les badges de performance pour le dernier livre complété
            const lastCompletedBook = completedBooks[completedBooks.length - 1];
            if (lastCompletedBook) {
                // Badge "Marathon de Lecture" - livre > 300 pages
                if (lastCompletedBook.pages > 300) {
                    await this.unlockBadgeByCondition(userId, 'complete_book_over_300_pages');
                }
                // Badge "Dévoreur de Pavés" - livre > 500 pages
                if (lastCompletedBook.pages > 500) {
                    await this.unlockBadgeByCondition(userId, 'complete_book_over_500_pages');
                }
            }
            // Vérifier les badges temporels
            await this.checkTemporalBadges(userId, completedBooks);
        }
        catch (error) {
            console.error('Erreur lors de la vérification des badges:', error);
        }
    }
    /**
     * Vérifier les badges basés sur le temps
     */
    static async checkTemporalBadges(userId, completedBooks) {
        const now = new Date();
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        // Badge "Lecture Rapide" - 5 livres en 2 semaines
        const booksInTwoWeeks = completedBooks.filter(book => book.completedAt && new Date(book.completedAt) >= twoWeeksAgo);
        if (booksInTwoWeeks.length >= 5) {
            await this.unlockBadgeByCondition(userId, 'complete_5_books_in_2_weeks');
        }
        // Badge "Lecteur du Mois" - 10 livres en un mois
        const booksInMonth = completedBooks.filter(book => book.completedAt && new Date(book.completedAt) >= oneMonthAgo);
        if (booksInMonth.length >= 10) {
            await this.unlockBadgeByCondition(userId, 'complete_10_books_in_month');
        }
        // Badge "Défi Annuel" - 30 livres dans l'année
        const booksInYear = completedBooks.filter(book => book.completedAt && new Date(book.completedAt) >= oneYearAgo);
        if (booksInYear.length >= 30) {
            await this.unlockBadgeByCondition(userId, 'complete_30_books_in_year');
        }
    }
    /**
     * Débloquer un badge par condition
     */
    static async unlockBadgeByCondition(userId, condition) {
        try {
            const badge = await models_1.Badge.findOne({ where: { condition } });
            if (!badge)
                return;
            // Vérifier si l'utilisateur a déjà ce badge
            const existingUserBadge = await models_1.UserBadge.findOne({
                where: { userId, badgeId: badge.id }
            });
            if (!existingUserBadge) {
                await models_1.UserBadge.create({
                    userId,
                    badgeId: badge.id,
                    unlockedAt: new Date(),
                });
            }
        }
        catch (error) {
            console.error(`Erreur lors du déblocage du badge ${condition}:`, error);
        }
    }
    /**
     * Formater la réponse d'un livre
     */
    static formatBookResponse(book) {
        return {
            id: book.id,
            title: book.title,
            author: book.author,
            pages: book.pages,
            category: book.category,
            status: book.status,
            currentPage: book.currentPage,
            progress: book.progress,
            points: book.points,
            completedAt: book.completedAt,
            createdAt: book.createdAt,
            updatedAt: book.updatedAt,
        };
    }
}
exports.BookService = BookService;
