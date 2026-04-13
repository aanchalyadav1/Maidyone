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
exports.triggerNotification = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const responseHandler_1 = require("../utils/responseHandler");
// Placeholder for FCM Integration Service
// import { sendPushNotification } from '../services/firebaseService';
const getNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, isRead, page = '1', limit = '10' } = req.query;
        const query = {};
        if (userId)
            query.recipient = userId;
        if (isRead !== undefined)
            query.isRead = isRead === 'true';
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;
        const notifications = yield Notification_1.default.find(query)
            .skip(startIndex)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        const total = yield Notification_1.default.countDocuments(query);
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Notifications fetched', {
            notifications,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getNotifications = getNotifications;
/**
 * Service function to trigger notifications programmatically
 * (Used internally by other controllers, not a route handler)
 */
const triggerNotification = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield Notification_1.default.create(data);
        // Abstract FCM call
        // await sendPushNotification(notification.recipient, notification.title, notification.message);
        return notification;
    }
    catch (error) {
        console.error('Notification trigger failed:', error);
        // Non-blocking error logging
    }
});
exports.triggerNotification = triggerNotification;
