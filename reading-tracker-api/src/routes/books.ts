import { Router, Request, Response } from 'express';
import { PrismaClient, BookStatus } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { calculatePoints, checkAndAwardBadges } from '../utils/gameLogic';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Get all books for current user
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category } = req.query;

    const whereClause: any = {
      userId: req.user!.id
    };

    if (status && typeof status === 'string') {
      whereClause.status = status as BookStatus;
    }

    if (category && typeof category === 'string') {
      whereClause.category = category;
    }

    const books = await prisma.book.findMany({
      where: whereClause,
      orderBy: [
        { status: 'asc' },
        { updatedAt: 'desc' }
      ],
    });

    res.json({ books });
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Get book by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findFirst({
      where: {
        id,
        userId: req.user!.id
      }
    });

    if (!book) {
      res.status(404).json({
        error: 'Livre non trouvé',
        message: 'Ce livre n\'existe pas ou ne vous appartient pas.'
      });
      return;
    }

    res.json({ book });
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Create new book
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, author, totalPages, category, currentPage = 0 } = req.body;

    // Validation
    if (!title || !author || !totalPages || !category) {
      res.status(400).json({
        error: 'Champs requis manquants',
        message: 'Titre, auteur, nombre de pages et catégorie sont requis.'
      });
      return;
    }

    if (totalPages <= 0) {
      res.status(400).json({
        error: 'Nombre de pages invalide',
        message: 'Le nombre de pages doit être supérieur à 0.'
      });
      return;
    }

    if (currentPage < 0 || currentPage > totalPages) {
      res.status(400).json({
        error: 'Page actuelle invalide',
        message: 'La page actuelle doit être entre 0 et le nombre total de pages.'
      });
      return;
    }

    // Determine initial status
    const status = currentPage >= totalPages ? BookStatus.COMPLETED : BookStatus.READING;

    const book = await prisma.book.create({
      data: {
        title: title.trim(),
        author: author.trim(),
        totalPages: parseInt(totalPages),
        currentPage: parseInt(currentPage),
        category: category.trim(),
        status,
        userId: req.user!.id,
        completedDate: status === BookStatus.COMPLETED ? new Date() : null,
        pointsEarned: status === BookStatus.COMPLETED ? calculatePoints(totalPages) : 0,
      },
    });

    // If book is completed, update user points and check badges
    if (status === BookStatus.COMPLETED) {
      const points = calculatePoints(totalPages);
      
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          totalPoints: {
            increment: points
          }
        }
      });

      // Check and award badges
      await checkAndAwardBadges(req.user!.id);
    }

    res.status(201).json({
      message: 'Livre ajouté avec succès',
      book
    });
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Update book
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, author, totalPages, currentPage, category, status } = req.body;

    // Check if book exists and belongs to user
    const existingBook = await prisma.book.findFirst({
      where: {
        id,
        userId: req.user!.id
      }
    });

    if (!existingBook) {
      res.status(404).json({
        error: 'Livre non trouvé',
        message: 'Ce livre n\'existe pas ou ne vous appartient pas.'
      });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    
    if (title) updateData.title = title.trim();
    if (author) updateData.author = author.trim();
    if (category) updateData.category = category.trim();
    if (totalPages) updateData.totalPages = parseInt(totalPages);
    if (currentPage !== undefined) updateData.currentPage = parseInt(currentPage);
    if (status) updateData.status = status as BookStatus;

    // Auto-determine status based on current page if not explicitly set
    if (currentPage !== undefined && totalPages && !status) {
      updateData.status = currentPage >= parseInt(totalPages) ? BookStatus.COMPLETED : BookStatus.READING;
    }

    // Handle completion
    const wasCompleted = existingBook.status === BookStatus.COMPLETED;
    const isNowCompleted = updateData.status === BookStatus.COMPLETED || 
      (updateData.currentPage && updateData.currentPage >= (updateData.totalPages || existingBook.totalPages));

    if (!wasCompleted && isNowCompleted) {
      // Book just got completed
      updateData.completedDate = new Date();
      const points = calculatePoints(updateData.totalPages
      }