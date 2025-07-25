"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Token d\'accès requis',
        });
        return;
    }
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    jsonwebtoken_1.default.verify(token, jwtSecret, (err, user) => {
        if (err) {
            res.status(403).json({
                success: false,
                message: 'Token invalide ou expiré',
            });
            return;
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        next();
        return;
    }
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    jsonwebtoken_1.default.verify(token, jwtSecret, (err, user) => {
        if (!err) {
            req.user = user;
        }
        next();
    });
};
exports.optionalAuth = optionalAuth;
