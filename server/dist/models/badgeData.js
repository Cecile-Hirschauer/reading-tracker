"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBadgePoints = exports.getBadgesByRarity = exports.getBadgeByCondition = exports.PREDEFINED_BADGES = void 0;
const enums_1 = require("./enums");
exports.PREDEFINED_BADGES = [
    // Badges de quantité
    {
        name: "Première Lecture",
        description: "Félicitations ! Vous avez terminé votre premier livre.",
        condition: "complete_1_book",
        icon: "📖",
        rarity: enums_1.BadgeRarity.COMMON,
    },
    {
        name: "Lecteur Assidu",
        description: "Vous avez terminé 5 livres. Votre passion pour la lecture grandit !",
        condition: "complete_5_books",
        icon: "📚",
        rarity: enums_1.BadgeRarity.RARE,
    },
    {
        name: "Bibliophile",
        description: "20 livres terminés ! Vous êtes un véritable amoureux des livres.",
        condition: "complete_20_books",
        icon: "🏆",
        rarity: enums_1.BadgeRarity.EPIC,
    },
    {
        name: "Maître Lecteur",
        description: "50 livres terminés ! Vous êtes une légende de la lecture.",
        condition: "complete_50_books",
        icon: "👑",
        rarity: enums_1.BadgeRarity.LEGENDARY,
    },
    // Badges de diversité
    {
        name: "Explorer les Genres",
        description: "Vous avez lu dans 3 genres différents. La diversité enrichit l'esprit !",
        condition: "read_3_genres",
        icon: "🌟",
        rarity: enums_1.BadgeRarity.COMMON,
    },
    {
        name: "Aventurier Littéraire",
        description: "5 genres explorés ! Votre curiosité littéraire n'a pas de limites.",
        condition: "read_5_genres",
        icon: "🗺️",
        rarity: enums_1.BadgeRarity.RARE,
    },
    {
        name: "Collectionneur de Genres",
        description: "Vous avez lu dans tous les genres disponibles. Impressionnant !",
        condition: "read_all_genres",
        icon: "🎭",
        rarity: enums_1.BadgeRarity.LEGENDARY,
    },
    // Badges de performance
    {
        name: "Lecture Rapide",
        description: "5 livres terminés en 2 semaines ! Vous dévorez les pages.",
        condition: "complete_5_books_in_2_weeks",
        icon: "⚡",
        rarity: enums_1.BadgeRarity.EPIC,
    },
    {
        name: "Marathon de Lecture",
        description: "Vous avez terminé un livre de plus de 300 pages. Quelle endurance !",
        condition: "complete_book_over_300_pages",
        icon: "🏃‍♂️",
        rarity: enums_1.BadgeRarity.RARE,
    },
    {
        name: "Dévoreur de Pavés",
        description: "Vous avez terminé un livre de plus de 500 pages. Respect !",
        condition: "complete_book_over_500_pages",
        icon: "📕",
        rarity: enums_1.BadgeRarity.EPIC,
    },
    // Badges d'objectifs mensuels/annuels
    {
        name: "Lecteur du Mois",
        description: "10 livres terminés en un mois ! Votre rythme est impressionnant.",
        condition: "complete_10_books_in_month",
        icon: "📅",
        rarity: enums_1.BadgeRarity.EPIC,
    },
    {
        name: "Défi Annuel",
        description: "30 livres terminés dans l'année ! Vous avez relevé le défi.",
        condition: "complete_30_books_in_year",
        icon: "🎯",
        rarity: enums_1.BadgeRarity.LEGENDARY,
    },
    // Badges de régularité
    {
        name: "Lecteur Régulier",
        description: "Vous avez lu au moins un livre par semaine pendant un mois.",
        condition: "read_weekly_for_month",
        icon: "⏰",
        rarity: enums_1.BadgeRarity.RARE,
    },
    {
        name: "Habitude de Lecture",
        description: "100 jours consécutifs avec de la lecture. C'est devenu une habitude !",
        condition: "read_100_consecutive_days",
        icon: "🔥",
        rarity: enums_1.BadgeRarity.EPIC,
    },
    // Badges spéciaux
    {
        name: "Critique Littéraire",
        description: "Vous avez ajouté des notes à 10 livres différents.",
        condition: "add_notes_to_10_books",
        icon: "✍️",
        rarity: enums_1.BadgeRarity.RARE,
    },
    {
        name: "Perfectionniste",
        description: "Vous avez terminé 10 livres avec 100% de progression.",
        condition: "complete_10_books_perfectly",
        icon: "💯",
        rarity: enums_1.BadgeRarity.EPIC,
    },
    {
        name: "Pionnier",
        description: "Vous êtes parmi les premiers utilisateurs de l'application !",
        condition: "early_adopter",
        icon: "🚀",
        rarity: enums_1.BadgeRarity.LEGENDARY,
    },
];
// Fonction utilitaire pour obtenir un badge par condition
const getBadgeByCondition = (condition) => {
    return exports.PREDEFINED_BADGES.find(badge => badge.condition === condition);
};
exports.getBadgeByCondition = getBadgeByCondition;
// Fonction utilitaire pour obtenir tous les badges d'une rareté donnée
const getBadgesByRarity = (rarity) => {
    return exports.PREDEFINED_BADGES.filter(badge => badge.rarity === rarity);
};
exports.getBadgesByRarity = getBadgesByRarity;
// Fonction utilitaire pour calculer les points d'un badge selon sa rareté
const calculateBadgePoints = (rarity) => {
    switch (rarity) {
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
};
exports.calculateBadgePoints = calculateBadgePoints;
