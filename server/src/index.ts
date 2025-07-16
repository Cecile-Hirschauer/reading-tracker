import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Sequelize, DataTypes, Model, Optional, Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';

// ===== CONFIGURATION BASE DE DONNÉES =====
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false,
  define: {
    timestamps: true,
    underscored: false,
  },
});

// ===== ENUMS =====
enum BookCategory {
  FICTION = 'fiction',
  NON_FICTION = 'non_fiction',
  SCIENCE = 'science',
  HISTORY = 'history',
  BIOGRAPHY = 'biography',
  FANTASY = 'fantasy',
  MYSTERY = 'mystery',
  ROMANCE = 'romance',
  THRILLER = 'thriller',
  SELF_HELP = 'self_help'
}

enum BookStatus {
  NOT_STARTED = 'not_started',
  READING = 'reading',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

enum BadgeRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

enum UserLevel {
  BEGINNER = 'beginner',
  AMATEUR = 'amateur',
  CONFIRMED = 'confirmed',
  EXPERT = 'expert'
}

// ===== INTERFACES =====
interface UserAttributes {
  id: string;
  email: string;
  password: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BookAttributes {
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

interface BadgeAttributes {
  id: string;
  name: string;
  description: string;
  condition: string;
  icon: string;
  rarity: BadgeRarity;
  createdAt: Date;
  updatedAt: Date;
}

interface UserBadgeAttributes {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ===== MODÈLES =====
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}
interface BookCreationAttributes extends Optional<BookAttributes, 'id' | 'currentPage' | 'completedAt' | 'createdAt' | 'updatedAt'> {}
interface BadgeCreationAttributes extends Optional<BadgeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}
interface UserBadgeCreationAttributes extends Optional<UserBadgeAttributes, 'id' | 'unlockedAt' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public username!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

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

  public get progress(): number {
    if (this.pages === 0) return 0;
    return Math.round((this.currentPage / this.pages) * 100);
  }

  public get points(): number {
    if (this.status !== BookStatus.COMPLETED) return 0;
    if (this.pages < 150) return 10;
    if (this.pages <= 300) return 20;
    return 30;
  }
}

class Badge extends Model<BadgeAttributes, BadgeCreationAttributes> implements BadgeAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public condition!: string;
  public icon!: string;
  public rarity!: BadgeRarity;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getRarityPoints(): number {
    switch (this.rarity) {
      case BadgeRarity.COMMON: return 5;
      case BadgeRarity.RARE: return 10;
      case BadgeRarity.EPIC: return 20;
      case BadgeRarity.LEGENDARY: return 50;
      default: return 5;
    }
  }
}

class UserBadge extends Model<UserBadgeAttributes, UserBadgeCreationAttributes> implements UserBadgeAttributes {
  public id!: string;
  public userId!: string;
  public badgeId!: string;
  public unlockedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ===== INITIALISATION DES MODÈLES =====
User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [6, 255] },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { len: [3, 50] },
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
});

Book.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [1, 255] },
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [1, 255] },
  },
  pages: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
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
    validate: { min: 0 },
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
}, {
  sequelize,
  modelName: 'Book',
  tableName: 'books',
  timestamps: true,
});

Badge.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { len: [1, 100] },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { len: [1, 500] },
  },
  condition: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [1, 100] },
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [1, 50] },
  },
  rarity: {
    type: DataTypes.ENUM(...Object.values(BadgeRarity)),
    allowNull: false,
    defaultValue: BadgeRarity.COMMON,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Badge',
  tableName: 'badges',
  timestamps: true,
});

UserBadge.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  badgeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'badges',
      key: 'id',
    },
  },
  unlockedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'UserBadge',
  tableName: 'user_badges',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'badgeId'],
      name: 'unique_user_badge',
    },
  ],
});

// ===== ASSOCIATIONS =====
User.hasMany(Book, { foreignKey: 'userId', as: 'books', onDelete: 'CASCADE' });
Book.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.belongsToMany(Badge, { through: UserBadge, foreignKey: 'userId', otherKey: 'badgeId', as: 'badges' });
Badge.belongsToMany(User, { through: UserBadge, foreignKey: 'badgeId', otherKey: 'userId', as: 'users' });

UserBadge.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserBadge.belongsTo(Badge, { foreignKey: 'badgeId', as: 'badge' });
User.hasMany(UserBadge, { foreignKey: 'userId', as: 'userBadges' });
Badge.hasMany(UserBadge, { foreignKey: 'badgeId', as: 'userBadges' });

// ===== BADGES PRÉDÉFINIS =====
const PREDEFINED_BADGES = [
  {
    name: "Première Lecture",
    description: "Félicitations ! Vous avez terminé votre premier livre.",
    condition: "complete_1_book",
    icon: "📖",
    rarity: BadgeRarity.COMMON,
  },
  {
    name: "Lecteur Assidu",
    description: "Vous avez terminé 5 livres. Votre passion pour la lecture grandit !",
    condition: "complete_5_books",
    icon: "📚",
    rarity: BadgeRarity.RARE,
  },
  {
    name: "Bibliophile",
    description: "20 livres terminés ! Vous êtes un véritable amoureux des livres.",
    condition: "complete_20_books",
    icon: "🏆",
    rarity: BadgeRarity.EPIC,
  },
  {
    name: "Maître Lecteur",
    description: "50 livres terminés ! Vous êtes une légende de la lecture.",
    condition: "complete_50_books",
    icon: "👑",
    rarity: BadgeRarity.LEGENDARY,
  },
];

// ===== MIDDLEWARE D'AUTHENTIFICATION =====
const authenticateToken = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token d\'accès requis',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token invalide',
    });
  }
};

// ===== FONCTIONS UTILITAIRES =====
const calculateUserLevel = (totalPoints: number): UserLevel => {
  if (totalPoints <= 50) return UserLevel.BEGINNER;
  if (totalPoints <= 150) return UserLevel.AMATEUR;
  if (totalPoints <= 300) return UserLevel.CONFIRMED;
  return UserLevel.EXPERT;
};

const getUserTotalPoints = async (userId: string): Promise<number> => {
  const books = await Book.findAll({
    where: { userId, status: BookStatus.COMPLETED }
  });
  
  const bookPoints = books.reduce((total, book) => total + book.points, 0);
  
  const userBadges = await UserBadge.findAll({
    where: { userId },
    include: [{ model: Badge, as: 'badge' }]
  });
  
  const badgePoints = userBadges.reduce((total, userBadge: any) => {
    return total + (userBadge.badge?.getRarityPoints() || 0);
  }, 0);

  return bookPoints + badgePoints;
};

// ===== INITIALISATION DES BADGES =====
const initializeBadges = async (): Promise<void> => {
  try {
    for (const badgeData of PREDEFINED_BADGES) {
      const existingBadge = await Badge.findOne({
        where: { condition: badgeData.condition }
      });

      if (!existingBadge) {
        await Badge.create(badgeData);
        console.log(`✅ Badge créé: ${badgeData.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des badges:', error);
  }
};

// ===== CRÉATION DE L'APPLICATION EXPRESS =====
const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES DE BASE =====
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Bienvenue sur l\'API Reading Tracker',
    version: '1.0.0',
    endpoints: {
      users: '/api/v1/users',
      books: '/api/v1/books',
      badges: '/api/v1/badges'
    }
  });
});

app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Reading Tracker API v1.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: {
        register: 'POST /api/v1/users/register',
        login: 'POST /api/v1/users/login',
        profile: 'GET /api/v1/users/profile',
        stats: 'GET /api/v1/users/stats'
      },
      books: {
        create: 'POST /api/v1/books',
        list: 'GET /api/v1/books',
        get: 'GET /api/v1/books/:bookId',
        update: 'PUT /api/v1/books/:bookId',
        updateProgress: 'PUT /api/v1/books/:bookId/progress',
        delete: 'DELETE /api/v1/books/:bookId'
      },
      badges: {
        list: 'GET /api/v1/badges',
        myBadges: 'GET /api/v1/badges/user/my-badges'
      }
    }
  });
});

// ===== ROUTES UTILISATEUR =====

// Inscription
app.post('/api/v1/users/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, nom d\'utilisateur et mot de passe requis',
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email ou nom d\'utilisateur déjà utilisé',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de l\'inscription',
    });
  }
});

// Connexion
app.post('/api/v1/users/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis',
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la connexion',
    });
  }
});

// Profil utilisateur
app.get('/api/v1/users/profile', authenticateToken, async (req: any, res: Response) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    const totalPoints = await getUserTotalPoints(user.id);
    const level = calculateUserLevel(totalPoints);

    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        totalPoints,
        level,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du profil',
    });
  }
});

// Statistiques utilisateur
app.get('/api/v1/users/stats', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    
    const books = await Book.findAll({ where: { userId } });
    const completedBooks = books.filter(book => book.status === BookStatus.COMPLETED);
    const readingBooks = books.filter(book => book.status === BookStatus.READING);
    const totalPages = completedBooks.reduce((total, book) => total + book.pages, 0);
    const totalPoints = await getUserTotalPoints(userId);
    const level = calculateUserLevel(totalPoints);
    
    const badges = await UserBadge.findAll({
      where: { userId },
      include: [{ model: Badge, as: 'badge' }]
    });

    res.status(200).json({
      success: true,
      data: {
        totalBooks: books.length,
        completedBooks: completedBooks.length,
        currentlyReading: readingBooks.length,
        totalPages,
        totalPoints,
        level,
        badgesCount: badges.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des statistiques',
    });
  }
});

// ===== ROUTES LIVRE =====

// Créer un livre
app.post('/api/v1/books', authenticateToken, async (req: any, res: Response) => {
  try {
    const { title, author, pages, category } = req.body;
    const userId = req.user.userId;

    if (!title || !author || !pages || !category) {
      return res.status(400).json({
        success: false,
        message: 'Titre, auteur, nombre de pages et catégorie sont requis',
      });
    }

    if (pages <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Le nombre de pages doit être supérieur à 0',
      });
    }

    const book = await Book.create({
      title,
      author,
      pages,
      category,
      status: BookStatus.NOT_STARTED,
      userId,
    });

    res.status(201).json({
      success: true,
      message: 'Livre créé avec succès',
      data: {
        ...book.toJSON(),
        progress: book.progress,
        points: book.points,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création du livre',
    });
  }
});

// Obtenir tous les livres de l'utilisateur
app.get('/api/v1/books', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as BookStatus;
    const category = req.query.category as BookCategory;
    const search = req.query.search as string;

    const where: any = { userId };
    
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: books } = await Book.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const booksWithProgress = books.map(book => ({
      ...book.toJSON(),
      progress: book.progress,
      points: book.points,
    }));

    res.status(200).json({
      success: true,
      data: {
        books: booksWithProgress,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des livres',
    });
  }
});

// Obtenir un livre par ID
app.get('/api/v1/books/:bookId', authenticateToken, async (req: any, res: Response) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId;

    const book = await Book.findOne({
      where: { id: bookId, userId }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...book.toJSON(),
        progress: book.progress,
        points: book.points,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du livre',
    });
  }
});

// Mettre à jour un livre
app.put('/api/v1/books/:bookId', authenticateToken, async (req: any, res: Response) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    if (updateData.pages !== undefined && updateData.pages <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Le nombre de pages doit être supérieur à 0',
      });
    }

    const book = await Book.findOne({
      where: { id: bookId, userId }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé',
      });
    }

    await book.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Livre mis à jour avec succès',
      data: {
        ...book.toJSON(),
        progress: book.progress,
        points: book.points,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du livre',
    });
  }
});

// Mettre à jour la progression d'un livre
app.put('/api/v1/books/:bookId/progress', authenticateToken, async (req: any, res: Response) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId;
    const { currentPage } = req.body;

    if (currentPage < 0) {
      return res.status(400).json({
        success: false,
        message: 'La page courante ne peut pas être négative',
      });
    }

    const book = await Book.findOne({
      where: { id: bookId, userId }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé',
      });
    }

    const newCurrentPage = Math.min(currentPage, book.pages);
    const updateData: any = { currentPage: newCurrentPage };

    // Marquer comme complété si on atteint la dernière page
    if (newCurrentPage >= book.pages && book.status !== BookStatus.COMPLETED) {
      updateData.status = BookStatus.COMPLETED;
      updateData.completedAt = new Date();
    } else if (newCurrentPage > 0 && book.status === BookStatus.NOT_STARTED) {
      updateData.status = BookStatus.READING;
    }

    await book.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Progression mise à jour avec succès',
      data: {
        ...book.toJSON(),
        progress: book.progress,
        points: book.points,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour de la progression',
    });
  }
});

// Supprimer un livre
app.delete('/api/v1/books/:bookId', authenticateToken, async (req: any, res: Response) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId;

    const book = await Book.findOne({
      where: { id: bookId, userId }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé',
      });
    }

    await book.destroy();

    res.status(200).json({
      success: true,
      message: 'Livre supprimé avec succès',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression du livre',
    });
  }
});

// ===== ROUTES BADGE =====

// Obtenir tous les badges
app.get('/api/v1/badges', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: badges } = await Badge.findAndCountAll({
      limit,
      offset,
      order: [['rarity', 'ASC'], ['name', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: {
        badges,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des badges',
    });
  }
});

// Obtenir les badges de l'utilisateur
app.get('/api/v1/badges/user/my-badges', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const userBadges = await UserBadge.findAll({
      where: { userId },
      include: [{ model: Badge, as: 'badge' }],
      order: [['unlockedAt', 'DESC']],
    });

    const badges = userBadges.map((userBadge: any) => ({
      ...userBadge.badge.toJSON(),
      unlockedAt: userBadge.unlockedAt,
    }));

    res.status(200).json({
      success: true,
      data: badges,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des badges utilisateur',
    });
  }
});

// Gestion des erreurs 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false,
    message: 'Route non trouvée',
    path: req.path
  });
});

// Gestion des erreurs globales
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// ===== DÉMARRAGE DU SERVEUR =====
const startServer = async (): Promise<void> => {
  try {
    // Synchroniser la base de données
    await sequelize.sync({ force: false });
    console.log('✅ Base de données synchronisée');
    
    // Initialiser les badges prédéfinis
    await initializeBadges();
    console.log('✅ Badges initialisés');
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
      console.log(`📚 API disponible sur http://localhost:${PORT}/api/v1`);
      console.log(`🏠 Page d'accueil: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();
