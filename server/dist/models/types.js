"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBadgePoints = exports.getBadgesByRarity = exports.getBadgeByCondition = exports.PREDEFINED_BADGES = exports.UserLevel = exports.BadgeRarity = exports.BookStatus = exports.BookCategory = void 0;
// Export des enums
var enums_1 = require("./enums");
Object.defineProperty(exports, "BookCategory", { enumerable: true, get: function () { return enums_1.BookCategory; } });
Object.defineProperty(exports, "BookStatus", { enumerable: true, get: function () { return enums_1.BookStatus; } });
Object.defineProperty(exports, "BadgeRarity", { enumerable: true, get: function () { return enums_1.BadgeRarity; } });
Object.defineProperty(exports, "UserLevel", { enumerable: true, get: function () { return enums_1.UserLevel; } });
var badgeData_1 = require("./badgeData");
Object.defineProperty(exports, "PREDEFINED_BADGES", { enumerable: true, get: function () { return badgeData_1.PREDEFINED_BADGES; } });
Object.defineProperty(exports, "getBadgeByCondition", { enumerable: true, get: function () { return badgeData_1.getBadgeByCondition; } });
Object.defineProperty(exports, "getBadgesByRarity", { enumerable: true, get: function () { return badgeData_1.getBadgesByRarity; } });
Object.defineProperty(exports, "calculateBadgePoints", { enumerable: true, get: function () { return badgeData_1.calculateBadgePoints; } });
