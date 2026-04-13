import { Request, Response, NextFunction } from 'express';
import Ticket from '../models/Ticket';
import { sendResponse } from '../utils/responseHandler';

export const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, priority, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const tickets = await Ticket.find(query)
      .populate('user', 'name email phoneNumber')
      .populate('assignedTo', 'user')
      .skip(startIndex)
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
    
    if (!subject || !description || !userId) {
      return sendResponse(res, 400, false, 'Subject, description and userId are required');
    }

    const tId = `TK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket = await Ticket.create({
      ticketId: tId,
      user: userId,
      subject,
      description,
      priority: priority || 'Medium'
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
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!ticket) return sendResponse(res, 404, false, 'Ticket not found');
    
    sendResponse(res, 200, true, 'Ticket updated', ticket);
  } catch (error) {
    next(error);
  }
};
