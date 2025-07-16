import { Router } from 'express';
import { UserController } from '../controllers';
import {
  authenticateToken,
  validateUserRegistration,
  validateUserLogin,
  validatePagination,
  validateUUID,
} from '../middleware';

const router = Router();

// Routes publiques (authentification)
router.post('/register', validateUserRegistration, UserController.register);
router.post('/login', validateUserLogin, UserController.login);

// Routes protégées (utilisateur connecté)
router.use(authenticateToken);

// Profil utilisateur
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.delete('/account', UserController.deleteAccount);

// Statistiques et dashboard
router.get('/stats', UserController.getStats);
router.get('/dashboard', UserController.getDashboard);

// Routes admin (gestion des utilisateurs)
router.get('/', validatePagination, UserController.getAllUsers);
router.get('/:userId', validateUUID('userId'), UserController.getUserById);
router.put('/:userId', validateUUID('userId'), UserController.updateUser);
router.delete('/:userId', validateUUID('userId'), UserController.deleteUser);

export default router;
