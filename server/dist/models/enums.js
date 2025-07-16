"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLevel = exports.BadgeRarity = exports.BookStatus = exports.BookCategory = void 0;
var BookCategory;
(function (BookCategory) {
    BookCategory["FICTION"] = "fiction";
    BookCategory["NON_FICTION"] = "non_fiction";
    BookCategory["SCIENCE"] = "science";
    BookCategory["HISTORY"] = "history";
    BookCategory["BIOGRAPHY"] = "biography";
    BookCategory["FANTASY"] = "fantasy";
    BookCategory["MYSTERY"] = "mystery";
    BookCategory["ROMANCE"] = "romance";
    BookCategory["THRILLER"] = "thriller";
    BookCategory["SELF_HELP"] = "self_help";
})(BookCategory || (exports.BookCategory = BookCategory = {}));
var BookStatus;
(function (BookStatus) {
    BookStatus["NOT_STARTED"] = "not_started";
    BookStatus["READING"] = "reading";
    BookStatus["COMPLETED"] = "completed";
    BookStatus["PAUSED"] = "paused";
})(BookStatus || (exports.BookStatus = BookStatus = {}));
var BadgeRarity;
(function (BadgeRarity) {
    BadgeRarity["COMMON"] = "common";
    BadgeRarity["RARE"] = "rare";
    BadgeRarity["EPIC"] = "epic";
    BadgeRarity["LEGENDARY"] = "legendary";
})(BadgeRarity || (exports.BadgeRarity = BadgeRarity = {}));
var UserLevel;
(function (UserLevel) {
    UserLevel["BEGINNER"] = "beginner";
    UserLevel["AMATEUR"] = "amateur";
    UserLevel["CONFIRMED"] = "confirmed";
    UserLevel["EXPERT"] = "expert"; // 301+ points
})(UserLevel || (exports.UserLevel = UserLevel = {}));
