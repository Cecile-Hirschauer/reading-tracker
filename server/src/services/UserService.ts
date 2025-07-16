import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Book, Badge, UserBadge } from '../models';
import { UserAttributes, RegisterRequest, LoginRequest, AuthResponse, UserStats } from '../models/types';
import { BookStatus } from '../models/enums';

export class UserService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN = '7d';

  /**
   * Créer un nouvel utilisateur
   */
  static async createUser(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Vérifier si le nom d'utilisateur existe déjà
      const existingUsername = await User.findOne({ where: { username: userData.username } });
      if (existingUsername) {
        throw new Error('Ce nom d\'utilisateur est déjà pris');
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Créer l'utilisateur
      const user = await User.create({
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
      });

      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      };
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Authentifier un utilisateur
   */
  static async loginUser(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Trouver l'utilisateur par email
      const user = await User.findOne({ where: { email: loginData.email } });
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      };
    } catch (error) {
      throw new Error(`Erreur lors de la connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtenir un utilisateur par ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      return await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Book,
            as: 'books',
          },
          {
            model: Badge,
            as: 'badges',
            through: { attributes: ['unlockedAt'] },
          },
        ],
      });
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtenir les statistiques d'un utilisateur
   */
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      return await user.getStats();
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  static async updateUser(userId: string, updateData: Partial<UserAttributes>): Promise<User> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Si le mot de passe est fourni, le hasher
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      // Vérifier l'unicité de l'email si modifié
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({ where: { email: updateData.email } });
        if (existingUser) {
          throw new Error('Un utilisateur avec cet email existe déjà');
        }
      }

      // Vérifier l'unicité du nom d'utilisateur si modifié
      if (updateData.username && updateData.username !== user.username) {
        const existingUsername = await User.findOne({ where: { username: updateData.username } });
        if (existingUsername) {
          throw new Error('Ce nom d\'utilisateur est déjà pris');
        }
      }

      await user.update(updateData);
      
      // Retourner l'utilisateur sans le mot de passe
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
      });

      return updatedUser!;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Supprimer un utilisateur
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      await user.destroy();
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Obtenir tous les utilisateurs (admin)
   */
  static async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number; pages: number }> {
    try {
      const offset = (page - 1) * limit;
      
      const { count, rows } = await User.findAndCountAll({
        attributes: { exclude: ['password'] },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        users: rows,
        total: count,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Vérifier un token JWT
   */
  static verifyToken(token: string): { userId: string; email: string } {
    try {
      return jwt.verify(token, this.JWT_SECRET) as { userId: string; email: string };
    } catch (error) {
      throw new Error('Token invalide');
    }
  }

  /**
   * Obtenir le dashboard d'un utilisateur
   */
  static async getUserDashboard(userId: string) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const stats = await user.getStats();
      const level = await user.getUserLevel();
      const totalPoints = await user.getTotalPoints();

      // Livres récents
      const recentBooks = await Book.findAll({
        where: { userId },
        order: [['updatedAt', 'DESC']],
        limit: 5,
      });

      // Livres en cours de lecture
      const currentlyReading = await Book.findAll({
        where: { 
          userId,
          status: BookStatus.READING 
        },
        order: [['updatedAt', 'DESC']],
      });

      // Badges récents
      const recentBadges = await UserBadge.findAll({
        where: { userId },
        include: [{ model: Badge, as: 'badge' }],
        order: [['unlockedAt', 'DESC']],
        limit: 5,
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          level,
          totalPoints,
        },
        stats,
        recentBooks: recentBooks.map(book => ({
          ...book.toJSON(),
          progress: book.progress,
          points: book.points,
        })),
        recentBadges: recentBadges.map((userBadge: any) => ({
          ...(userBadge.badge || {}),
          unlockedAt: userBadge.unlockedAt,
        })),
        currentlyReading: currentlyReading.map(book => ({
          ...book.toJSON(),
          progress: book.progress,
          points: book.points,
        })),
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du dashboard: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}
