import { Router } from 'express';
import { BookController } from '../controllers';
import {
  authenticateToken,
  validateBookData,
  validateBookUpdate,
  validateProgressUpdate,
  validatePagination,
  validateUUID,
} from '../middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes principales des livres
router.post('/', validateBookData, BookController.createBook);
router.get('/', validatePagination, BookController.getUserBooks);
router.get('/stats', BookController.getReadingStats);
router.get('/categories', BookController.getBooksByCategory);
router.get('/reading', BookController.getCurrentlyReading);
router.get('/completed', validatePagination, BookController.getCompletedBooks);
router.get('/search', validatePagination, BookController.searchBooks);

// Routes spécifiques à un livre
router.get('/:bookId', validateUUID('bookId'), BookController.getBookById);
router.put('/:bookId', validateUUID('bookId'), validateBookUpdate, BookController.updateBook);
router.put('/:bookId/progress', validateUUID('bookId'), validateProgressUpdate, BookController.updateProgress);
router.put('/:bookId/complete', validateUUID('bookId'), BookController.markAsCompleted);
router.delete('/:bookId', validateUUID('bookId'), BookController.deleteBook);

export default router;
