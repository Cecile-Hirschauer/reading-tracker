import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { BookCategory, BookStatus } from './enums';

export interface BookAttributes {
  id: string;
  title: string;
  author: string;
  pages: number;
  category: BookCategory;
  status: BookStatus;
  currentPage: number;
  userId: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface BookCreationAttributes extends Optional<BookAttributes, 'id' | 'currentPage' | 'completedAt' | 'createdAt' | 'updatedAt'> {}

class Book extends Model<BookAttributes, BookCreationAttributes> implements BookAttributes {
  public id!: string;
  public title!: string;
  public author!: string;
  public pages!: number;
  public category!: BookCategory;
  public status!: BookStatus;
  public currentPage!: number;
  public userId!: string;
  public completedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Propriétés calculées
  public get progress(): number {
    if (this.pages === 0) return 0;
    return Math.round((this.currentPage / this.pages) * 100);
  }

  public get points(): number {
    // Points calculés selon les pages (seulement si le livre est complété)
    if (this.status !== BookStatus.COMPLETED) return 0;
    
    if (this.pages < 150) return 10;      // Livre court
    if (this.pages <= 300) return 20;     // Livre moyen
    return 30;                            // Livre long
  }

  // Méthodes d'instance
  public updateProgress(newCurrentPage: number): void {
    this.currentPage = Math.min(newCurrentPage, this.pages);
    
    // Marquer comme complété si on atteint la dernière page
    if (this.currentPage >= this.pages && this.status !== BookStatus.COMPLETED) {
      this.status = BookStatus.COMPLETED;
      this.completedAt = new Date();
    }
  }
}

Book.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    pages: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    category: {
      type: DataTypes.ENUM(...Object.values(BookCategory)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BookStatus)),
      allowNull: false,
      defaultValue: BookStatus.NOT_STARTED,
    },
    currentPage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: 'Book',
    tableName: 'books',
    timestamps: true,
  }
);

export default Book;
