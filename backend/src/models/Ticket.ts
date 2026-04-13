import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  ticketId: string;
  user: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', index: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'], 
      default: 'Open',
      index: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<ITicket>('Ticket', TicketSchema);
