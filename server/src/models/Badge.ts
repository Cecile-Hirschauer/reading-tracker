import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { BadgeRarity } from './enums';

export interface BadgeAttributes {
  id: string;
  name: string;
  description: string;
  condition: string;
  icon: string;
  rarity: BadgeRarity;
  createdAt: Date;
  updatedAt: Date;
}

interface BadgeCreationAttributes extends Optional<BadgeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Badge extends Model<BadgeAttributes, BadgeCreationAttributes> implements BadgeAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public condition!: string;
  public icon!: string;
  public rarity!: BadgeRarity;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Méthodes d'instance
  public getRarityColor(): string {
    switch (this.rarity) {
      case BadgeRarity.COMMON:
        return '#6B7280'; // Gray
      case BadgeRarity.RARE:
        return '#3B82F6'; // Blue
      case BadgeRarity.EPIC:
        return '#8B5CF6'; // Purple
      case BadgeRarity.LEGENDARY:
        return '#F59E0B'; // Amber
      default:
        return '#6B7280';
    }
  }

  public getRarityPoints(): number {
    switch (this.rarity) {
      case BadgeRarity.COMMON:
        return 5;
      case BadgeRarity.RARE:
        return 10;
      case BadgeRarity.EPIC:
        return 20;
      case BadgeRarity.LEGENDARY:
        return 50;
      default:
        return 5;
    }
  }
}

Badge.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 500],
      },
    },
    condition: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
      },
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50],
      },
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
  },
  {
    sequelize,
    modelName: 'Badge',
    tableName: 'badges',
    timestamps: true,
  }
);

export default Badge;
