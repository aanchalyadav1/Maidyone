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
exports.updateTicketStatus = exports.createTicket = exports.getTicketById = exports.getTickets = void 0;
const Ticket_1 = __importDefault(require("../models/Ticket"));
const responseHandler_1 = require("../utils/responseHandler");
const getTickets = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, priority, page = '1', limit = '10' } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (priority)
            query.priority = priority;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;
        const tickets = yield Ticket_1.default.find(query)
            .populate('user', 'name email phoneNumber')
            .populate('assignedTo', 'user')
            .skip(startIndex)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        const total = yield Ticket_1.default.countDocuments(query);
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Tickets fetched', {
            tickets,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getTickets = getTickets;
const getTicketById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = yield Ticket_1.default.findById(req.params.id)
            .populate('user', 'name email')
            .populate('assignedTo');
        if (!ticket)
            return (0, responseHandler_1.sendResponse)(res, 404, false, 'Ticket not found');
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Ticket details fetched', ticket);
    }
    catch (error) {
        next(error);
    }
});
exports.getTicketById = getTicketById;
const createTicket = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subject, description, priority, userId } = req.body;
        if (!subject || !description || !userId) {
            return (0, responseHandler_1.sendResponse)(res, 400, false, 'Subject, description and userId are required');
        }
        const tId = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTicket = yield Ticket_1.default.create({
            ticketId: tId,
            user: userId,
            subject,
            description,
            priority: priority || 'Medium'
        });
        (0, responseHandler_1.sendResponse)(res, 201, true, 'Ticket created', newTicket);
    }
    catch (error) {
        next(error);
    }
});
exports.createTicket = createTicket;
const updateTicketStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, assignedTo } = req.body;
        const updateData = {};
        if (status)
            updateData.status = status;
        if (assignedTo)
            updateData.assignedTo = assignedTo;
        const ticket = yield Ticket_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!ticket)
            return (0, responseHandler_1.sendResponse)(res, 404, false, 'Ticket not found');
        (0, responseHandler_1.sendResponse)(res, 200, true, 'Ticket updated', ticket);
    }
    catch (error) {
        next(error);
    }
});
exports.updateTicketStatus = updateTicketStatus;
