"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent une authentification
router.use(middleware_1.authenticateToken);
// Routes principales des livres
router.post('/', middleware_1.validateBookData, controllers_1.BookController.createBook);
router.get('/', middleware_1.validatePagination, controllers_1.BookController.getUserBooks);
router.get('/stats', controllers_1.BookController.getReadingStats);
router.get('/categories', controllers_1.BookController.getBooksByCategory);
router.get('/reading', controllers_1.BookController.getCurrentlyReading);
router.get('/completed', middleware_1.validatePagination, controllers_1.BookController.getCompletedBooks);
router.get('/search', middleware_1.validatePagination, controllers_1.BookController.searchBooks);
// Routes spécifiques à un livre
router.get('/:bookId', (0, middleware_1.validateUUID)('bookId'), controllers_1.BookController.getBookById);
router.put('/:bookId', (0, middleware_1.validateUUID)('bookId'), middleware_1.validateBookUpdate, controllers_1.BookController.updateBook);
router.put('/:bookId/progress', (0, middleware_1.validateUUID)('bookId'), middleware_1.validateProgressUpdate, controllers_1.BookController.updateProgress);
router.put('/:bookId/complete', (0, middleware_1.validateUUID)('bookId'), controllers_1.BookController.markAsCompleted);
router.delete('/:bookId', (0, middleware_1.validateUUID)('bookId'), controllers_1.BookController.deleteBook);
exports.default = router;
