import { Sequelize } from 'sequelize';
import path from 'path';

// Configuration de la base de données SQLite avec Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false, // Utiliser camelCase au lieu de snake_case
  },
});

// Fonction pour tester la connexion à la base de données
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    throw error;
  }
};

// Fonction pour fermer la connexion à la base de données
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('✅ Connexion à la base de données fermée.');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture de la connexion:', error);
    throw error;
  }
};

export { sequelize };
