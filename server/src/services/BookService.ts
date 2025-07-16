import { Op } from 'sequelize';
import { Book, User, Badge, UserBadge } from '../models';
import { BookAttributes, CreateBookRequest, UpdateBookRequest, UpdateProgressRequest, BookResponse } from '../models/types';
import { BookStatus, BookCategory } from '../models/enums';

export class BookService {
  /**
   * Créer un nouveau livre
   */
  static async createBook(userId: string, bookData: CreateBookRequest): Promise<BookResponse> {
    try {
      const book = await Book.create({
        ...bookData,
        category: bookData.category as BookCategory,
        userId,
        status: BookStatus.NOT_STARTED,
        currentPage: 0,
      });

      return this.formatBookResponse(book);
    } catch (error) {
      throw new Error(`Erreur lors de la création du livre: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtenir un livre par ID
   */
  static async getBookById(bookId: string, userId: string): Promise<BookResponse | null> {
    try {
      const book = await Book.findOne({
        where: { 
          id: bookId,
          userId 
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username'],
          },
        ],
      });

      return book ? this.formatBookResponse(book) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du livre: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtenir tous les livres d'un utilisateur
   */
  static async getUserBooks(
    userId: string,
    options: {
      status?: BookStatus;
      category?: BookCategory;
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<{ books: BookResponse[]; total: number; pages: number }> {
    try {
      const { status, category, page = 1, limit = 10, search } = options;
      const offset = (page - 1) * limit;

      const whereClause: any = { userId };

      if (status) {
        whereClause.status = status;
      }

      if (category) {
        whereClause.category = category;
      }

      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { author: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Book.findAndCountAll({
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
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des livres: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Mettre à jour un livre
   */
  static async updateBook(bookId: string, userId: string, updateData: UpdateBookRequest): Promise<BookResponse> {
    try {
      const book = await Book.findOne({
        where: { 
          id: bookId,
          userId 
        },
      });

      if (!book) {
        throw new Error('Livre non trouvé');
      }

      const updatePayload: any = { ...updateData };
      if (updateData.category) {
        updatePayload.category = updateData.category as BookCategory;
      }
      if (updateData.status) {
        updatePayload.status = updateData.status as BookStatus;
      }

      await book.update(updatePayload);

      return this.formatBookResponse(book);
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du livre: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Mettre à jour la progression d'un livre
   */
  static async updateProgress(bookId: string, userId: string, progressData: UpdateProgressRequest): Promise<BookResponse> {
    try {
      const book = await Book.findOne({
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
      if (oldStatus === BookStatus.NOT_STARTED && book.currentPage > 0) {
        book.status = BookStatus.READING;
      }

      await book.save();

      // Vérifier les badges après mise à jour de la progression
      if (book.status === BookStatus.COMPLETED && oldStatus !== BookStatus.COMPLETED) {
        await this.checkAndUnlockBadges(userId);
      }

      return this.formatBookResponse(book);
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la progression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Supprimer un livre
   */
  static async deleteBook(bookId: string, userId: string): Promise<void> {
    try {
      const book = await Book.findOne({
        where: { 
          id: bookId,
          userId 
        },
      });

      if (!book) {
        throw new Error('Livre non trouvé');
      }

      await book.destroy();
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du livre: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtenir les statistiques de lecture d'un utilisateur
   */
  static async getReadingStats(userId: string): Promise<any> {
    try {
      const books = await Book.findAll({ where: { userId } });
      
      const stats = {
        totalBooks: books.length,
        completedBooks: books.filter(book => book.status === BookStatus.COMPLETED).length,
        currentlyReading: books.filter(book => book.status === BookStatus.READING).length,
        notStarted: books.filter(book => book.status === BookStatus.NOT_STARTED).length,
        paused: books.filter(book => book.status === BookStatus.PAUSED).length,
        totalPages: books.reduce((total, book) => total + book.pages, 0),
        pagesRead: books.reduce((total, book) => total + book.currentPage, 0),
        averageProgress: books.length > 0 ? books.reduce((total, book) => total + book.progress, 0) / books.length : 0,
        categoriesRead: [...new Set(books.map(book => book.category))],
        totalPoints: books.filter(book => book.status === BookStatus.COMPLETED).reduce((total, book) => total + book.points, 0),
      };

      return stats;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Marquer un livre comme terminé
   */
  static async markAsCompleted(bookId: string, userId: string): Promise<BookResponse> {
    try {
      const book = await Book.findOne({
        where: { 
          id: bookId,
          userId 
        },
      });

      if (!book) {
        throw new Error('Livre non trouvé');
      }

      const oldStatus = book.status;
      book.status = BookStatus.COMPLETED;
      book.currentPage = book.pages;
      book.completedAt = new Date();

      await book.save();

      // Vérifier les badges après completion
      if (oldStatus !== BookStatus.COMPLETED) {
        await this.checkAndUnlockBadges(userId);
      }

      return this.formatBookResponse(book);
    } catch (error) {
      throw new Error(`Erreur lors de la finalisation du livre: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtenir les livres par catégorie
   */
  static async getBooksByCategory(userId: string): Promise<Record<string, BookResponse[]>> {
    try {
      const books = await Book.findAll({
        where: { userId },
        order: [['updatedAt', 'DESC']],
      });

      const booksByCategory: Record<string, BookResponse[]> = {};

      books.forEach(book => {
        const category = book.category;
        if (!booksByCategory[category]) {
          booksByCategory[category] = [];
        }
        booksByCategory[category].push(this.formatBookResponse(book));
      });

      return booksByCategory;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des livres par catégorie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Vérifier et débloquer les badges après une action
   */
  private static async checkAndUnlockBadges(userId: string): Promise<void> {
    try {
      const books = await Book.findAll({ where: { userId } });
      const completedBooks = books.filter(book => book.status === BookStatus.COMPLETED);
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
      if (categoriesRead.length === Object.keys(BookCategory).length) {
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

    } catch (error) {
      console.error('Erreur lors de la vérification des badges:', error);
    }
  }

  /**
   * Vérifier les badges basés sur le temps
   */
  private static async checkTemporalBadges(userId: string, completedBooks: any[]): Promise<void> {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Badge "Lecture Rapide" - 5 livres en 2 semaines
    const booksInTwoWeeks = completedBooks.filter(book => 
      book.completedAt && new Date(book.completedAt) >= twoWeeksAgo
    );
    if (booksInTwoWeeks.length >= 5) {
      await this.unlockBadgeByCondition(userId, 'complete_5_books_in_2_weeks');
    }

    // Badge "Lecteur du Mois" - 10 livres en un mois
    const booksInMonth = completedBooks.filter(book => 
      book.completedAt && new Date(book.completedAt) >= oneMonthAgo
    );
    if (booksInMonth.length >= 10) {
      await this.unlockBadgeByCondition(userId, 'complete_10_books_in_month');
    }

    // Badge "Défi Annuel" - 30 livres dans l'année
    const booksInYear = completedBooks.filter(book => 
      book.completedAt && new Date(book.completedAt) >= oneYearAgo
    );
    if (booksInYear.length >= 30) {
      await this.unlockBadgeByCondition(userId, 'complete_30_books_in_year');
    }
  }

  /**
   * Débloquer un badge par condition
   */
  private static async unlockBadgeByCondition(userId: string, condition: string): Promise<void> {
    try {
      const badge = await Badge.findOne({ where: { condition } });
      if (!badge) return;

      // Vérifier si l'utilisateur a déjà ce badge
      const existingUserBadge = await UserBadge.findOne({
        where: { userId, badgeId: badge.id }
      });

      if (!existingUserBadge) {
        await UserBadge.create({
          userId,
          badgeId: badge.id,
          unlockedAt: new Date(),
        });
      }
    } catch (error) {
      console.error(`Erreur lors du déblocage du badge ${condition}:`, error);
    }
  }

  /**
   * Formater la réponse d'un livre
   */
  private static formatBookResponse(book: any): BookResponse {
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
