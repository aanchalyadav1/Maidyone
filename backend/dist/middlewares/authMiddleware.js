"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// In a real implementation this would verify Firebase JWT/custom JWT
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return (0, responseHandler_1.sendResponse)(res, 401, false, 'Not authorized, no token');
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret_key_123');
        const dbUser = yield User_1.default.findById(decoded.id);
        if (!dbUser) {
            return (0, responseHandler_1.sendResponse)(res, 401, false, 'The user belonging to this token no longer exists.');
        }
        // Bind actual Mongoose Document to Request
        req.user = dbUser;
        next();
    }
    catch (error) {
        return (0, responseHandler_1.sendResponse)(res, 401, false, 'Not authorized, token failed');
    }
});
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            return (0, responseHandler_1.sendResponse)(res, 403, false, 'Forbidden: Insufficient privileges');
        }
        next();
    };
};
exports.authorize = authorize;
