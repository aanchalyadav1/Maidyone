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
const User_1 = __importDefault(require("./models/User"));
const Worker_1 = __importDefault(require("./models/Worker"));
const Service_1 = __importDefault(require("./models/Service"));
const Booking_1 = __importDefault(require("./models/Booking"));
const Payment_1 = __importDefault(require("./models/Payment"));
const Ticket_1 = __importDefault(require("./models/Ticket"));
const Notification_1 = __importDefault(require("./models/Notification"));
dotenv_1.default.config();
const seedData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uri = process.env.MONGO_URI || '';
        if (!uri)
            throw new Error('MONGO_URI is missing');
        yield mongoose_1.default.connect(uri);
        console.log('MongoDB connection established for seeding ✅');
        // 🔥 CLEAR OLD DATA
        yield Promise.all([
            User_1.default.deleteMany({}),
            Worker_1.default.deleteMany({}),
            Service_1.default.deleteMany({}),
            Booking_1.default.deleteMany({}),
            Payment_1.default.deleteMany({}),
            Ticket_1.default.deleteMany({}),
            Notification_1.default.deleteMany({})
        ]);
        // =========================
        // 1. SERVICES
        // =========================
        const svCleaning = yield Service_1.default.create({
            name: 'Home Deep Cleaning',
            category: 'Cleaning',
            description: 'Complete deep cleaning of the home.',
            basePrice: 1500,
            isActive: true
        });
        const svPlumbing = yield Service_1.default.create({
            name: 'Pipe and Leak Repair',
            category: 'Plumbing',
            description: 'Fixing leaks and unclogging pipes.',
            basePrice: 800,
            isActive: true
        });
        const svElectric = yield Service_1.default.create({
            name: 'Electrical Wiring',
            category: 'Electrician',
            description: 'Fixing electrical issues.',
            basePrice: 1200,
            isActive: true
        });
        const svPainting = yield Service_1.default.create({
            name: 'Wall Painting',
            category: 'Painting',
            description: 'Full room painting.',
            basePrice: 4500,
            isActive: true
        });
        // =========================
        // 2. USERS
        // =========================
        // 🔥 ADMIN (FIXED - IMPORTANT)
        const admin = yield User_1.default.create({
            firebaseUid: 'admin-100',
            name: 'Ayush Sharma',
            email: 'admin@maidyone.com',
            phoneNumber: '9770335431',
            password: '1234',
            role: 'admin',
            status: 'active',
            avatar: 'https://i.pravatar.cc/150?img=11'
        });
        const u1 = yield User_1.default.create({
            firebaseUid: 'user-101',
            name: 'Rohan Gupta',
            email: 'rohan.gupta@email.com',
            phoneNumber: '9876543210',
            password: '1234',
            role: 'user',
            status: 'active'
        });
        const u2 = yield User_1.default.create({
            firebaseUid: 'user-102',
            name: 'Aarohi Patel',
            email: 'aarohi.p@email.com',
            phoneNumber: '9876543211',
            password: '1234',
            role: 'user',
            status: 'active'
        });
        const u3 = yield User_1.default.create({
            firebaseUid: 'user-103',
            name: 'Vikram Singh',
            email: 'vikram.singh@email.com',
            phoneNumber: '9876543212',
            password: '1234',
            role: 'user',
            status: 'active'
        });
        const u4 = yield User_1.default.create({
            firebaseUid: 'user-104',
            name: 'Neha Reddy',
            email: 'neha.r@email.com',
            phoneNumber: '9876543213',
            password: '1234',
            role: 'user',
            status: 'active'
        });
        const u5 = yield User_1.default.create({
            firebaseUid: 'user-105',
            name: 'Arjun Das',
            email: 'arjun.d@email.com',
            phoneNumber: '9876543214',
            password: '1234',
            role: 'user',
            status: 'active'
        });
        // =========================
        // 3. WORKERS
        // =========================
        const wu1 = yield User_1.default.create({
            firebaseUid: 'worker-201',
            name: 'Sanjay Kumar',
            email: 'sanjay.k@worker.com',
            phoneNumber: '9000000001',
            password: '1234',
            role: 'worker',
            status: 'active'
        });
        const wu2 = yield User_1.default.create({
            firebaseUid: 'worker-202',
            name: 'Pooja Verma',
            email: 'pooja.v@worker.com',
            phoneNumber: '9000000002',
            password: '1234',
            role: 'worker',
            status: 'active'
        });
        const wu3 = yield User_1.default.create({
            firebaseUid: 'worker-203',
            name: 'Ramesh Yadav',
            email: 'ramesh.y@worker.com',
            phoneNumber: '9000000003',
            password: '1234',
            role: 'worker',
            status: 'active'
        });
        const wu4 = yield User_1.default.create({
            firebaseUid: 'worker-204',
            name: 'Kavita Joshi',
            email: 'kavita.j@worker.com',
            phoneNumber: '9000000004',
            password: '1234',
            role: 'worker',
            status: 'active'
        });
        const w1 = yield Worker_1.default.create({
            user: wu1._id,
            skills: [svCleaning._id, svPainting._id],
            isOnline: true,
            rating: 4.8,
            totalJobs: 145,
            verificationStatus: 'verified'
        });
        const w2 = yield Worker_1.default.create({
            user: wu2._id,
            skills: [svPlumbing._id, svElectric._id],
            isOnline: false,
            rating: 4.5,
            totalJobs: 56,
            verificationStatus: 'verified'
        });
        const w3 = yield Worker_1.default.create({
            user: wu3._id,
            skills: [svCleaning._id],
            isOnline: true,
            rating: 4.9,
            totalJobs: 300,
            verificationStatus: 'verified'
        });
        const w4 = yield Worker_1.default.create({
            user: wu4._id,
            skills: [svElectric._id],
            isOnline: true,
            rating: 4.2,
            totalJobs: 20,
            verificationStatus: 'pending'
        });
        // =========================
        // 4. BOOKINGS
        // =========================
        const today = new Date();
        const subDays = (d) => new Date(today.getTime() - 86400000 * d);
        const addDays = (d) => new Date(today.getTime() + 86400000 * d);
        const b1 = yield Booking_1.default.create({
            bookingId: 'BK-5001',
            user: u1._id,
            worker: w1._id,
            service: svCleaning._id,
            status: 'Completed',
            date: subDays(1),
            address: 'Mumbai',
            totalAmount: 1800
        });
        const b2 = yield Booking_1.default.create({
            bookingId: 'BK-5002',
            user: u2._id,
            worker: w2._id,
            service: svPlumbing._id,
            status: 'Confirmed',
            date: addDays(1),
            address: 'Bangalore',
            totalAmount: 850
        });
        // =========================
        // 5. PAYMENTS
        // =========================
        yield Payment_1.default.create({
            paymentId: 'PAY001',
            booking: b1._id,
            user: u1._id,
            amount: 1800,
            status: 'Completed',
            method: 'Card'
        });
        yield Payment_1.default.create({
            paymentId: 'PAY002',
            booking: b2._id,
            user: u2._id,
            amount: 850,
            status: 'Pending',
            method: 'Cash'
        });
        // =========================
        // 6. TICKETS
        // =========================
        yield Ticket_1.default.create({
            ticketId: 'TCK-201',
            user: u2._id,
            assignedTo: w2._id,
            subject: 'Job issue',
            description: 'Work incomplete',
            status: 'Open',
            priority: 'High'
        });
        // =========================
        // 7. NOTIFICATIONS
        // =========================
        yield Notification_1.default.create({
            recipient: admin._id,
            title: 'New User Registered',
            message: 'A new user joined',
            type: 'System'
        });
        console.log('✅ DATABASE SEEDED SUCCESSFULLY 🚀');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
});
seedData();
