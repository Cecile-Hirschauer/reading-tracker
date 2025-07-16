"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// Routes publiques (authentification)
router.post('/register', middleware_1.validateUserRegistration, controllers_1.UserController.register);
router.post('/login', middleware_1.validateUserLogin, controllers_1.UserController.login);
// Routes protégées (utilisateur connecté)
router.use(middleware_1.authenticateToken);
// Profil utilisateur
router.get('/profile', controllers_1.UserController.getProfile);
router.put('/profile', controllers_1.UserController.updateProfile);
router.delete('/account', controllers_1.UserController.deleteAccount);
// Statistiques et dashboard
router.get('/stats', controllers_1.UserController.getStats);
router.get('/dashboard', controllers_1.UserController.getDashboard);
// Routes admin (gestion des utilisateurs)
router.get('/', middleware_1.validatePagination, controllers_1.UserController.getAllUsers);
router.get('/:userId', (0, middleware_1.validateUUID)('userId'), controllers_1.UserController.getUserById);
router.put('/:userId', (0, middleware_1.validateUUID)('userId'), controllers_1.UserController.updateUser);
router.delete('/:userId', (0, middleware_1.validateUUID)('userId'), controllers_1.UserController.deleteUser);
exports.default = router;
