import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserBadgeAttributes {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserBadgeCreationAttributes extends Optional<UserBadgeAttributes, 'id' | 'unlockedAt' | 'createdAt' | 'updatedAt'> {}

class UserBadge extends Model<UserBadgeAttributes, UserBadgeCreationAttributes> implements UserBadgeAttributes {
  public id!: string;
  public userId!: string;
  public badgeId!: string;
  public unlockedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Méthodes d'instance
  public isRecentlyUnlocked(daysThreshold: number = 7): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.unlockedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold;
  }

  public getTimeSinceUnlock(): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.unlockedAt.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'à l\'instant';
    }
  }
}

UserBadge.init(
  {
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
  },
  {
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
  }
);

export default UserBadge;
