"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Route de test simple
router.get('/test', (req, res) => {
    res.json({ message: 'Test route works!' });
});
exports.default = router;
