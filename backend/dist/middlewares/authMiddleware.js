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
const firebaseAdmin_1 = __importDefault(require("../config/firebaseAdmin"));
// Verify Firebase ID Token
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return (0, responseHandler_1.sendResponse)(res, 401, false, 'Not authorized, no token');
        }
        // Verify token using firebase-admin
        const decodedToken = yield firebaseAdmin_1.default.auth().verifyIdToken(token);
        // Attach uid and email to req.user without DB logic
        req.user = {
            firebaseUid: decodedToken.uid,
            email: decodedToken.email,
        };
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
