import { DataTypes, Model, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';
import { UserLevel, BookStatus } from './enums';
import type { BookAttributes } from './Book';
import type { BadgeAttributes } from './Badge';
import type { UserBadgeAttributes } from './UserBadge';

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public username!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly books?: BookAttributes[];
  public readonly badges?: BadgeAttributes[];
  public readonly userBadges?: UserBadgeAttributes[];

  public static associations: {
    books: Association<User, any>;
    badges: Association<User, any>;
    userBadges: Association<User, any>;
  };

  // Méthodes d'instance
  public async getTotalPoints(): Promise<number> {
    // Import dynamique pour éviter les dépendances circulaires
    const { Book, UserBadge, Badge } = await import('./index');
    
    // Calculer les points des livres complétés
    const books = await Book.findAll({
      where: { 
        userId: this.id,
        status: BookStatus.COMPLETED 
      }
    });
    
    const bookPoints = books.reduce((total: number, book: any) => {
      return total + book.points;
    }, 0);

    // Calculer les points des badges
    const userBadges = await UserBadge.findAll({
      where: { userId: this.id },
      include: [{ model: Badge, as: 'badge' }]
    });
    
    const badgePoints = userBadges.reduce((total: number, userBadge: any) => {
      return total + (userBadge.badge?.getRarityPoints() || 0);
    }, 0);

    return bookPoints + badgePoints;
  }

  public async getUserLevel(): Promise<UserLevel> {
    const totalPoints = await this.getTotalPoints();
    if (totalPoints <= 50) return UserLevel.BEGINNER;
    if (totalPoints <= 150) return UserLevel.AMATEUR;
    if (totalPoints <= 300) return UserLevel.CONFIRMED;
    return UserLevel.EXPERT;
  }

  // Méthode pour obtenir les statistiques de l'utilisateur
  public async getStats() {
    const { Book, Badge } = await import('./index');
    
    const books = await Book.findAll({ where: { userId: this.id } });
    const completedBooks = books.filter((book: any) => book.status === BookStatus.COMPLETED);
    const readingBooks = books.filter((book: any) => book.status === BookStatus.READING);
    const totalPages = completedBooks.reduce((total: number, book: any) => total + book.pages, 0);
    const totalPoints = await this.getTotalPoints();
    const level = await this.getUserLevel();
    const badges = await Badge.findAll({
      include: [{
        model: User,
        as: 'users',
        where: { id: this.id },
        through: { attributes: [] }
      }]
    });

    return {
      totalBooks: books.length,
      completedBooks: completedBooks.length,
      currentlyReading: readingBooks.length,
      totalPages,
      totalPoints,
      level,
      badgesCount: badges.length,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
