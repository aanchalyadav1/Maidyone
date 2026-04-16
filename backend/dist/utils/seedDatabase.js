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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const Worker_1 = __importDefault(require("../models/Worker"));
const Service_1 = __importDefault(require("../models/Service"));
const Booking_1 = __importDefault(require("../models/Booking"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Notification_1 = __importDefault(require("../models/Notification"));
dotenv_1.default.config();
const seedData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uri = process.env.MONGO_URI || '';
        if (!uri)
            throw new Error('MONGO_URI is missing');
        yield mongoose_1.default.connect(uri);
        console.log('MongoDB connection established for seeding.');
        // Clear existing data
        yield Promise.all([
            User_1.default.deleteMany({}),
            Worker_1.default.deleteMany({}),
            Service_1.default.deleteMany({}),
            Booking_1.default.deleteMany({}),
            Payment_1.default.deleteMany({}),
            Ticket_1.default.deleteMany({}),
            Notification_1.default.deleteMany({})
        ]);
        console.log('Old collections cleared.');
        // 1. Create Services
        const service1 = yield Service_1.default.create({
            name: 'Room Cleaning', category: 'Cleaning', description: 'Standard room cleaning', basePrice: 50, isActive: true
        });
        const service2 = yield Service_1.default.create({
            name: 'Plumbing Repair', category: 'Maintenance', description: 'Fix leaks and pipes', basePrice: 80, isActive: true
        });
        // 2. Create Admin & Users
        const admin = yield User_1.default.create({
            firebaseUid: 'admin-seed-uid', name: 'Mr. Raj', email: 'raj@maidyone.com', role: 'admin', status: 'active', avatar: 'https://i.pravatar.cc/150?img=11'
        });
        const user1 = yield User_1.default.create({
            firebaseUid: 'user1-seed-uid', name: 'Michael Roberts', email: 'michael.roberts@email.com', phoneNumber: '+1 234 567 8900', role: 'user', status: 'active', avatar: 'https://i.pravatar.cc/150?u=michael'
        });
        const user2 = yield User_1.default.create({
            firebaseUid: 'user2-seed-uid', name: 'Priya Sharma', email: 'priya@email.com', role: 'user', status: 'active'
        });
        // 3. Create Workers
        const workerUser1 = yield User_1.default.create({
            firebaseUid: 'worker1-seed-uid', name: 'Anita Dodve', email: 'anita@email.com', role: 'worker', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Anita'
        });
        const workerUser2 = yield User_1.default.create({
            firebaseUid: 'worker2-seed-uid', name: 'Rahul Verma', email: 'rahul@email.com', role: 'worker', status: 'active'
        });
        const worker1 = yield Worker_1.default.create({
            user: workerUser1._id, skills: [service1._id], isOnline: true, rating: 4.8, totalJobs: 145, verificationStatus: 'verified', location: { lat: 22.7, lng: 75.8 }
        });
        const worker2 = yield Worker_1.default.create({
            user: workerUser2._id, skills: [service2._id], isOnline: false, rating: 4.5, totalJobs: 80, verificationStatus: 'pending'
        });
        // 4. Create Bookings (Ensuring Dashboard Trend picks up multiple dates)
        const today = new Date();
        const d1 = new Date(today);
        d1.setDate(today.getDate() - 2);
        const d2 = new Date(today);
        d2.setDate(today.getDate() - 1);
        const booking1 = yield Booking_1.default.create({
            bookingId: 'BK12345', user: user1._id, worker: worker1._id, service: service1._id, status: 'Confirmed', date: d1, address: 'Oceanview Apartment', totalAmount: 855, notes: 'VIP Client'
        });
        const booking2 = yield Booking_1.default.create({
            bookingId: 'BK-7844', user: user2._id, worker: worker1._id, service: service1._id, status: 'In Progress', date: d2, address: 'Vijay Nagar', totalAmount: 150
        });
        const booking3 = yield Booking_1.default.create({
            bookingId: 'BK-7845', user: user2._id, service: service2._id, status: 'Pending', date: today, address: 'Indore Central', totalAmount: 80
        });
        const booking4 = yield Booking_1.default.create({
            bookingId: 'BK-COMPLETED', user: user1._id, worker: worker2._id, service: service2._id, status: 'Completed', date: d1, address: 'Bhopal South', totalAmount: 200
        });
        // 5. Create Payments
        yield Payment_1.default.create({ paymentId: 'PAY-100', booking: booking1._id, user: user1._id, amount: 855, status: 'Completed', method: 'Card' });
        yield Payment_1.default.create({ paymentId: 'PAY-101', booking: booking2._id, user: user2._id, amount: 150, status: 'Pending', method: 'Cash' });
        yield Payment_1.default.create({ paymentId: 'PAY-102', booking: booking4._id, user: user1._id, amount: 200, status: 'Completed', method: 'Wallet' });
        // 6. Create Tickets
        yield Ticket_1.default.create({ ticketId: 'TCK-555', user: user2._id, subject: 'Payment Issue', description: 'Double charged on booking.', status: 'Open', priority: 'High' });
        yield Ticket_1.default.create({ ticketId: 'TCK-556', user: user1._id, assignedTo: worker1._id, subject: 'Worker late', description: 'Worker is 30 mins late.', status: 'In Progress', priority: 'Medium' });
        // 7. Create Notifications
        yield Notification_1.default.create({ recipient: admin._id, title: 'New Worker Signup', message: 'Anita Dodve signed up.', type: 'System' });
        yield Notification_1.default.create({ recipient: user1._id, title: 'Booking Confirmed', message: 'Your booking BK12345 is confirmed.', type: 'Booking', relatedId: booking1._id.toString() });
        console.log('✅ Relational mock data successfully seeded!');
        process.exit(0);
    }
    catch (err) {
        console.error('Seeding completely failed:', err);
        process.exit(1);
    }
});
seedData();
