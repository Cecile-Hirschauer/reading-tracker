"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAssociations = exports.UserBadge = exports.Badge = exports.Book = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Book_1 = __importDefault(require("./Book"));
exports.Book = Book_1.default;
const Badge_1 = __importDefault(require("./Badge"));
exports.Badge = Badge_1.default;
const UserBadge_1 = __importDefault(require("./UserBadge"));
exports.UserBadge = UserBadge_1.default;
// Définition des associations
const setupAssociations = () => {
    // User - Book (One-to-Many)
    User_1.default.hasMany(Book_1.default, {
        foreignKey: 'userId',
        as: 'books',
        onDelete: 'CASCADE',
    });
    Book_1.default.belongsTo(User_1.default, {
        foreignKey: 'userId',
        as: 'user',
    });
    // User - Badge (Many-to-Many through UserBadge)
    User_1.default.belongsToMany(Badge_1.default, {
        through: UserBadge_1.default,
        foreignKey: 'userId',
        otherKey: 'badgeId',
        as: 'badges',
    });
    Badge_1.default.belongsToMany(User_1.default, {
        through: UserBadge_1.default,
        foreignKey: 'badgeId',
        otherKey: 'userId',
        as: 'users',
    });
    // UserBadge associations
    UserBadge_1.default.belongsTo(User_1.default, {
        foreignKey: 'userId',
        as: 'user',
    });
    UserBadge_1.default.belongsTo(Badge_1.default, {
        foreignKey: 'badgeId',
        as: 'badge',
    });
    User_1.default.hasMany(UserBadge_1.default, {
        foreignKey: 'userId',
        as: 'userBadges',
    });
    Badge_1.default.hasMany(UserBadge_1.default, {
        foreignKey: 'badgeId',
        as: 'userBadges',
    });
};
exports.setupAssociations = setupAssociations;
// Initialiser les associations
setupAssociations();
// Export par défaut pour faciliter l'importation
exports.default = {
    User: User_1.default,
    Book: Book_1.default,
    Badge: Badge_1.default,
    UserBadge: UserBadge_1.default,
    setupAssociations,
};
