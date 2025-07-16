"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const enums_1 = require("./enums");
class Book extends sequelize_1.Model {
    // Propriétés calculées
    get progress() {
        if (this.pages === 0)
            return 0;
        return Math.round((this.currentPage / this.pages) * 100);
    }
    get points() {
        // Points calculés selon les pages (seulement si le livre est complété)
        if (this.status !== enums_1.BookStatus.COMPLETED)
            return 0;
        if (this.pages < 150)
            return 10; // Livre court
        if (this.pages <= 300)
            return 20; // Livre moyen
        return 30; // Livre long
    }
    // Méthodes d'instance
    updateProgress(newCurrentPage) {
        this.currentPage = Math.min(newCurrentPage, this.pages);
        // Marquer comme complété si on atteint la dernière page
        if (this.currentPage >= this.pages && this.status !== enums_1.BookStatus.COMPLETED) {
            this.status = enums_1.BookStatus.COMPLETED;
            this.completedAt = new Date();
        }
    }
}
Book.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 255],
        },
    },
    author: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 255],
        },
    },
    pages: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    },
    category: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(enums_1.BookCategory)),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(enums_1.BookStatus)),
        allowNull: false,
        defaultValue: enums_1.BookStatus.NOT_STARTED,
    },
    currentPage: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    completedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
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
    modelName: 'Book',
    tableName: 'books',
    timestamps: true,
});
exports.default = Book;
