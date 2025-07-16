"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class UserBadge extends sequelize_1.Model {
    // Méthodes d'instance
    isRecentlyUnlocked(daysThreshold = 7) {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.unlockedAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= daysThreshold;
    }
    getTimeSinceUnlock() {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.unlockedAt.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        if (diffDays > 0) {
            return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        }
        else if (diffHours > 0) {
            return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        }
        else if (diffMinutes > 0) {
            return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        }
        else {
            return 'à l\'instant';
        }
    }
}
UserBadge.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    badgeId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'badges',
            key: 'id',
        },
    },
    unlockedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
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
exports.default = UserBadge;
