export enum BookCategory {
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

export enum BookStatus {
  NOT_STARTED = 'not_started',
  READING = 'reading',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

export enum BadgeRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum UserLevel {
  BEGINNER = 'beginner',      // 0-50 points
  AMATEUR = 'amateur',        // 51-150 points
  CONFIRMED = 'confirmed',    // 151-300 points
  EXPERT = 'expert'          // 301+ points
}
