import { Router } from 'express';
import { BadgeController } from '../controllers';
import {
  authenticateToken,
  optionalAuth,
  validateBadgeData,
  validatePagination,
  validateUUID,
} from '../middleware';

const router = Router();

// Routes publiques (avec authentification optionnelle)
router.get('/', optionalAuth, validatePagination, BadgeController.getAllBadges);
router.get('/stats', BadgeController.getBadgeStats);
router.get('/recent', BadgeController.getRecentlyUnlockedBadges);
router.get('/leaderboard', BadgeController.getBadgeLeaderboard);
router.get('/rarity/:rarity', BadgeController.getBadgesByRarity);

// Routes protégées (utilisateur connecté)
router.use(authenticateToken);

// Routes utilisateur (avant les routes avec paramètres)
router.get('/user/my-badges', BadgeController.getUserBadges);
router.get('/user/available', BadgeController.checkAvailableBadges);
router.get('/user/:userId', 
  validateUUID('userId'), 
  BadgeController.getUserBadgesById
);

// Routes admin (gestion des badges)
router.post('/', validateBadgeData, BadgeController.createBadge);

// Routes admin (gestion des attributions)
router.post('/:badgeId/assign/:userId', 
  validateUUID('badgeId'), 
  validateUUID('userId'), 
  BadgeController.assignBadgeToUser
);
router.delete('/:badgeId/remove/:userId', 
  validateUUID('badgeId'), 
  validateUUID('userId'), 
  BadgeController.removeBadgeFromUser
);

// Routes spécifiques à un badge (à la fin pour éviter les conflits)
router.get('/:badgeId', validateUUID('badgeId'), BadgeController.getBadgeById);
router.put('/:badgeId', validateUUID('badgeId'), BadgeController.updateBadge);
router.delete('/:badgeId', validateUUID('badgeId'), BadgeController.deleteBadge);

export default router;
