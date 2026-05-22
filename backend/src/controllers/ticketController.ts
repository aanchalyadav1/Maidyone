import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Ticket from '../models/Ticket';
import Notification from '../models/Notification';
import { sendResponse } from '../utils/responseHandler';

const ALLOWED_STATUSES   = ['Open', 'In Progress', 'Resolved', 'Closed'] as const;
const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;

export const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, priority, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (status) {
      if (!ALLOWED_STATUSES.includes(status as any)) {
        return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
      }
      query.status = status;
    }
    if (priority) {
      if (!ALLOWED_PRIORITIES.includes(priority as any)) {
        return sendResponse(res, 400, false, `Invalid priority. Allowed: ${ALLOWED_PRIORITIES.join(', ')}`);
      }
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { ticketId: { $regex: String(search).trim(), $options: 'i' } },
        { subject:  { $regex: String(search).trim(), $options: 'i' } },
      ];
    }

    const pageNum  = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));

    const tickets = await Ticket.find(query)
      .populate('user', 'name email phoneNumber')
      .populate('assignedTo', 'user')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Ticket.countDocuments(query);
    sendResponse(res, 200, true, 'Tickets fetched', {
      tickets,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo');
    if (!ticket) return sendResponse(res, 404, false, 'Ticket not found');
    sendResponse(res, 200, true, 'Ticket details fetched', ticket);
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, description, priority, userId } = req.body;

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return sendResponse(res, 400, false, 'subject is required');
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return sendResponse(res, 400, false, 'description is required');
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return sendResponse(res, 400, false, 'Valid userId is required');
    }
    if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
      return sendResponse(res, 400, false, `Invalid priority. Allowed: ${ALLOWED_PRIORITIES.join(', ')}`);
    }

    const tId = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = await Ticket.create({
      ticketId: tId,
      user: userId,
      subject: subject.trim(),
      description: description.trim(),
      priority: priority || 'Medium',
    });

    await Notification.create({
      recipient: userId,
      title: 'Ticket Created',
      message: `Your ticket ${tId} has been opened and is pending review.`,
      type: 'Ticket',
      relatedId: tId,
    });

    sendResponse(res, 201, true, 'Ticket created', newTicket);
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, assignedTo } = req.body;

    const updateData: any = {};
    if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return sendResponse(res, 400, false, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
      }
      updateData.status = status;
    }
    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return sendResponse(res, 400, false, 'Invalid assignedTo ID');
      }
      updateData.assignedTo = assignedTo;
    }

    if (Object.keys(updateData).length === 0) {
      return sendResponse(res, 400, false, 'No valid fields to update');
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    });
    if (!ticket) return sendResponse(res, 404, false, 'Ticket not found');

    if (status) {
      await Notification.create({
        recipient: ticket.user,
        title: `Ticket ${status}`,
        message: `Your ticket ${ticket.ticketId} status has been updated to ${status}.`,
        type: 'Ticket',
        relatedId: ticket.ticketId,
      });
    }

    sendResponse(res, 200, true, 'Ticket updated', ticket);
  } catch (error) {
    next(error);
  }
};
