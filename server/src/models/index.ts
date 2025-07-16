import User from './User';
import Book from './Book';
import Badge from './Badge';
import UserBadge from './UserBadge';

// Définition des associations
const setupAssociations = () => {
  // User - Book (One-to-Many)
  User.hasMany(Book, {
    foreignKey: 'userId',
    as: 'books',
    onDelete: 'CASCADE',
  });
  
  Book.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // User - Badge (Many-to-Many through UserBadge)
  User.belongsToMany(Badge, {
    through: UserBadge,
    foreignKey: 'userId',
    otherKey: 'badgeId',
    as: 'badges',
  });

  Badge.belongsToMany(User, {
    through: UserBadge,
    foreignKey: 'badgeId',
    otherKey: 'userId',
    as: 'users',
  });

  // UserBadge associations
  UserBadge.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  UserBadge.belongsTo(Badge, {
    foreignKey: 'badgeId',
    as: 'badge',
  });

  User.hasMany(UserBadge, {
    foreignKey: 'userId',
    as: 'userBadges',
  });

  Badge.hasMany(UserBadge, {
    foreignKey: 'badgeId',
    as: 'userBadges',
  });
};

// Initialiser les associations
setupAssociations();

// Exporter tous les modèles
export {
  User,
  Book,
  Badge,
  UserBadge,
  setupAssociations,
};

// Export par défaut pour faciliter l'importation
export default {
  User,
  Book,
  Badge,
  UserBadge,
  setupAssociations,
};
