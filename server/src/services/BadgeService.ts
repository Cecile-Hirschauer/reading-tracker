import { Op } from 'sequelize';
import { Badge, User, UserBadge } from '../models';
import { BadgeAttributes, BadgeResponse } from '../models/types';
import { BadgeRarity } from '../models/enums';

export class BadgeService {
  /**
   * Obtenir tous les badges disponibles
   */
  static async getAllBadges(page: number = 1, limit: number = 20): Promise<{ badges: BadgeResponse[]; total: number; pages: number }> {
    try {
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Badge.findAndCountAll({
        limit,
        offset,
        order: [['rarity', 'ASC'], ['name', 'ASC']],
      });

      const badges = rows.map(badge => this.formatBadgeResponse(badge));

      return {
        badges,
        total: count,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des badges: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtenir un badge par ID
   */
  static async getBadgeById(badgeId: string): Promise<BadgeResponse | null> {
    try {
      const badge = await Badge.findByPk(badgeId);
      return badge ? this.formatBadgeResponse(badge) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du badge: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtenir les badges d'un utilisateur
   */
  static async getUserBadges(userId: string): Promise<BadgeResponse[]> {
    try {
      const userBadges = await UserBadge.findAll({
        where: { userId },
        include: [
          {
            model: Badge,
            as: 'badge',
          },
        ],
        order: [['unlockedAt', 'DESC']],
      });

      return userBadges.map((userBadge: any) => ({
        ...this.formatBadgeResponse(userBadge.badge),
        unlockedAt: userBadge.unlockedAt,
      }));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des badges utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtenir les badges par rareté
   */
  static async getBadgesByRarity(rarity: BadgeRarity): Promise<BadgeResponse[]> {
    try {
      const badges = await Badge.findAll({
        where: { rarity },
        order: [['name', 'ASC']],
      });

      return badges.map(badge => this.formatBadgeResponse(badge));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des badges par rareté: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Créer un nouveau badge (admin)
   */
  static async createBadge(badgeData: Omit<BadgeAttributes, 'id' | 'createdAt' | 'updatedAt'>): Promise<BadgeResponse> {
    try {
      // Vérifier si un badge avec cette condition existe déjà
      const existingBadge = await Badge.findOne({ where: { condition: badgeData.condition } });
      if (existingBadge) {
        throw new Error('Un badge avec cette condition existe déjà');
      }

      const badge = await Badge.create(badgeData);
      return this.formatBadgeResponse(badge);
    } catch (error) {
      throw new Error(`Erreur lors de la création du badge: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Mettre à jour un badge (admin)
   */
  static async updateBadge(badgeId: string, updateData: Partial<BadgeAttributes>): Promise<BadgeResponse> {
    try {
      const badge = await Badge.findByPk(badgeId);
      if (!badge) {
        throw new Error('Badge non trouvé');
      }

      // Vérifier l'unicité de la condition si modifiée
      if (updateData.condition && updateData.condition !== badge.condition) {
        const existingBadge = await Badge.findOne({ where: { condition: updateData.condition } });
        if (existingBadge) {
          throw new Error('Un badge avec cette condition existe déjà');
        }
      }

      await badge.update(updateData);
      return this.formatBadgeResponse(badge);
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du badge: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Supprimer un badge (admin)
   */
  static async deleteBadge(badgeId: string): Promise<void> {
    try {
      const badge = await Badge.findByPk(badgeId);
      if (!badge) {
        throw new Error('Badge non trouvé');
      }

      // Supprimer d'abord toutes les associations UserBadge
      await UserBadge.destroy({ where: { badgeId } });
      
      // Puis supprimer le badge
      await badge.destroy();
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du badge: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Attribuer manuellement un badge à un utilisateur (admin)
   */
  static async assignBadgeToUser(userId: string, badgeId: string): Promise<void> {
    try {
      // Vérifier que l'utilisateur existe
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier que le badge existe
      const badge = await Badge.findByPk(badgeId);
      if (!badge) {
        throw new Error('Badge non trouvé');
      }

      // Vérifier si l'utilisateur a déjà ce badge
      const existingUserBadge = await UserBadge.findOne({
        where: { userId, badgeId }
      });

      if (existingUserBadge) {
        throw new Error('L\'utilisateur possède déjà ce badge');
      }

      // Créer l'association
      await UserBadge.create({
        userId,
        badgeId,
        unlockedAt: new Date(),
      });
    } catch (error) {
      throw new Error(`Erreur lors de l'attribution du badge: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Retirer un badge d'un utilisateur (admin)
   */
  static async removeBadgeFromUser(userId: string, badgeId: string): Promise<void> {
    try {
      const userBadge = await UserBadge.findOne({
        where: { userId, badgeId }
      });

      if (!userBadge) {
        throw new Error('L\'utilisateur ne possède pas ce badge');
      }

      await userBadge.destroy();
    } catch (error) {
      throw new Error(`Erreur lors du retrait du badge: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtenir les statistiques des badges
   */
  static async getBadgeStats(): Promise<any> {
    try {
      const totalBadges = await Badge.count();
      const badgesByRarity = await Badge.findAll({
        attributes: ['rarity'],
        group: ['rarity'],
      });

      const rarityStats = await Promise.all(
        Object.values(BadgeRarity).map(async (rarity) => {
          const count = await Badge.count({ where: { rarity } });
          return { rarity, count };
        })
      );

      const totalUnlocks = await UserBadge.count();
      const uniqueUsersWithBadges = await UserBadge.count({
        distinct: true,
        col: 'userId',
      });

      // Badge le plus populaire
      const popularBadge = await UserBadge.findAll({
        attributes: ['badgeId'],
        group: ['badgeId'],
        order: [[Badge.sequelize!.fn('COUNT', Badge.sequelize!.col('badgeId')), 'DESC']],
        limit: 1,
        include: [
          {
            model: Badge,
            as: 'badge',
            attributes: ['name', 'icon'],
          },
        ],
      });

      return {
        totalBadges,
        rarityStats,
        totalUnlocks,
        uniqueUsersWithBadges,
        mostPopularBadge: popularBadge.length > 0 ? popularBadge[0] : null,
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques des badges: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtenir les badges récemment débloqués
   */
  static async getRecentlyUnlockedBadges(limit: number = 10): Promise<any[]> {
    try {
      const recentUnlocks = await UserBadge.findAll({
        include: [
          {
            model: Badge,
            as: 'badge',
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username'],
          },
        ],
        order: [['unlockedAt', 'DESC']],
        limit,
      });

      return recentUnlocks.map((unlock: any) => ({
        badge: this.formatBadgeResponse(unlock.badge),
        user: {
          id: unlock.user.id,
          username: unlock.user.username,
        },
        unlockedAt: unlock.unlockedAt,
      }));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des badges récents: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Vérifier si un utilisateur peut débloquer de nouveaux badges
   */
  static async checkAvailableBadges(userId: string): Promise<BadgeResponse[]> {
    try {
      // Obtenir tous les badges que l'utilisateur n'a pas encore
      const userBadgeIds = await UserBadge.findAll({
        where: { userId },
        attributes: ['badgeId'],
      }).then(badges => badges.map(b => b.badgeId));

      const availableBadges = await Badge.findAll({
        where: {
          id: { [Op.notIn]: userBadgeIds },
        },
        order: [['rarity', 'ASC'], ['name', 'ASC']],
      });

      return availableBadges.map(badge => this.formatBadgeResponse(badge));
    } catch (error) {
      throw new Error(`Erreur lors de la vérification des badges disponibles: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtenir le leaderboard des badges
   */
  static async getBadgeLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const leaderboard = await UserBadge.findAll({
        attributes: [
          'userId',
          [UserBadge.sequelize!.fn('COUNT', UserBadge.sequelize!.col('badgeId')), 'badgeCount'],
        ],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username'],
          },
        ],
        group: ['userId', 'user.id'],
        order: [[UserBadge.sequelize!.fn('COUNT', UserBadge.sequelize!.col('badgeId')), 'DESC']],
        limit,
      });

      return leaderboard.map((entry: any) => ({
        user: {
          id: entry.user.id,
          username: entry.user.username,
        },
        badgeCount: parseInt(entry.get('badgeCount') as string),
      }));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du leaderboard: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Formater la réponse d'un badge
   */
  private static formatBadgeResponse(badge: any): BadgeResponse {
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      condition: badge.condition,
      icon: badge.icon,
      rarity: badge.rarity,
    };
  }
}
