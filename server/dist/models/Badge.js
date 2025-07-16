"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const enums_1 = require("./enums");
class Badge extends sequelize_1.Model {
    // Méthodes d'instance
    getRarityColor() {
        switch (this.rarity) {
            case enums_1.BadgeRarity.COMMON:
                return '#6B7280'; // Gray
            case enums_1.BadgeRarity.RARE:
                return '#3B82F6'; // Blue
            case enums_1.BadgeRarity.EPIC:
                return '#8B5CF6'; // Purple
            case enums_1.BadgeRarity.LEGENDARY:
                return '#F59E0B'; // Amber
            default:
                return '#6B7280';
        }
    }
    getRarityPoints() {
        switch (this.rarity) {
            case enums_1.BadgeRarity.COMMON:
                return 5;
            case enums_1.BadgeRarity.RARE:
                return 10;
            case enums_1.BadgeRarity.EPIC:
                return 20;
            case enums_1.BadgeRarity.LEGENDARY:
                return 50;
            default:
                return 5;
        }
    }
}
Badge.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [1, 100],
        },
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [1, 500],
        },
    },
    condition: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 100],
        },
    },
    icon: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 50],
        },
    },
    rarity: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(enums_1.BadgeRarity)),
        allowNull: false,
        defaultValue: enums_1.BadgeRarity.COMMON,
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
    modelName: 'Badge',
    tableName: 'badges',
    timestamps: true,
});
exports.default = Badge;
