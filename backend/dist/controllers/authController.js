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
const User_1 = __importDefault(require("../models/User"));
const responseHandler_1 = require("../utils/responseHandler");
const firebaseAdmin_1 = __importDefault(require("../config/firebaseAdmin"));
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const firebaseUid = decodedToken.uid;
        const email = decodedToken.email;
        // Check MongoDB: if user not exists -> create
        let user = yield User_1.default.findOne({ firebaseUid });
        if (!user) {
            user = yield User_1.default.create({
                firebaseUid,
                email,
                name: decodedToken.name || (email === null || email === void 0 ? void 0 : email.split('@')[0]) || 'New User',
                role: 'user',
                status: 'active'
            });
        }
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
