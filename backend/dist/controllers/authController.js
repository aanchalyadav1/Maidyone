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
exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const responseHandler_1 = require("../utils/responseHandler");
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return (0, responseHandler_1.sendResponse)(res, 400, false, 'Please provide phone and password');
        }
        // Find user by phoneNumber
        const user = yield User_1.default.findOne({ phoneNumber: phone });
        if (!user) {
            return (0, responseHandler_1.sendResponse)(res, 401, false, 'Invalid credentials');
        }
        // Compare password (plain for now)
        if (user.password !== password) {
            return (0, responseHandler_1.sendResponse)(res, 401, false, 'Invalid credentials');
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_key_123', { expiresIn: '1d' });
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Logged in successfully', {
            user: {
                id: user._id,
                uid: user.firebaseUid,
                role: user.role,
                phoneNumber: user.phoneNumber,
                email: user.email,
                name: user.name,
            },
            token
        });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
