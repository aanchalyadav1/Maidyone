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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const responseHandler_1 = require("../utils/responseHandler");
// In a real implementation this would verify Firebase JWT/custom JWT
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return (0, responseHandler_1.sendResponse)(res, 401, false, 'Not authorized, no token provided');
        }
        // Mock user decoding
        req.user = { uid: '123', role: 'admin' }; // Replace with real decode
        next();
    }
    catch (error) {
        (0, responseHandler_1.sendResponse)(res, 401, false, 'Not authorized, token failed');
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
