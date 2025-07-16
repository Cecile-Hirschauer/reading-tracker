"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// Routes publiques (avec authentification optionnelle)
router.get('/', middleware_1.optionalAuth, middleware_1.validatePagination, controllers_1.BadgeController.getAllBadges);
router.get('/stats', controllers_1.BadgeController.getBadgeStats);
router.get('/recent', controllers_1.BadgeController.getRecentlyUnlockedBadges);
router.get('/leaderboard', controllers_1.BadgeController.getBadgeLeaderboard);
router.get('/rarity/:rarity', controllers_1.BadgeController.getBadgesByRarity);
// Routes protégées (utilisateur connecté)
router.use(middleware_1.authenticateToken);
// Routes utilisateur (avant les routes avec paramètres)
router.get('/user/my-badges', controllers_1.BadgeController.getUserBadges);
router.get('/user/available', controllers_1.BadgeController.checkAvailableBadges);
router.get('/user/:userId', (0, middleware_1.validateUUID)('userId'), controllers_1.BadgeController.getUserBadgesById);
// Routes admin (gestion des badges)
router.post('/', middleware_1.validateBadgeData, controllers_1.BadgeController.createBadge);
// Routes admin (gestion des attributions)
router.post('/:badgeId/assign/:userId', (0, middleware_1.validateUUID)('badgeId'), (0, middleware_1.validateUUID)('userId'), controllers_1.BadgeController.assignBadgeToUser);
router.delete('/:badgeId/remove/:userId', (0, middleware_1.validateUUID)('badgeId'), (0, middleware_1.validateUUID)('userId'), controllers_1.BadgeController.removeBadgeFromUser);
// Routes spécifiques à un badge (à la fin pour éviter les conflits)
router.get('/:badgeId', (0, middleware_1.validateUUID)('badgeId'), controllers_1.BadgeController.getBadgeById);
router.put('/:badgeId', (0, middleware_1.validateUUID)('badgeId'), controllers_1.BadgeController.updateBadge);
router.delete('/:badgeId', (0, middleware_1.validateUUID)('badgeId'), controllers_1.BadgeController.deleteBadge);
exports.default = router;
