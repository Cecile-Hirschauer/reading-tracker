"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = 5001;
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.json({ message: 'Minimal server works!' });
});
app.get('/test', (req, res) => {
    res.json({ message: 'Test route works!' });
});
app.listen(PORT, () => {
    console.log(`Minimal server running on port ${PORT}`);
});
