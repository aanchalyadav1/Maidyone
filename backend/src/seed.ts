import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from './models/User';
import Worker from './models/Worker';
import Service from './models/Service';
import Booking from './models/Booking';
import Payment from './models/Payment';
import Ticket from './models/Ticket';
import Notification from './models/Notification';

dotenv.config();

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI || '';
    if (!uri) throw new Error('MONGO_URI is missing');

    await mongoose.connect(uri);
    console.log('MongoDB connection established for seeding ✅');

    // 🔥 CLEAR OLD DATA
    await Promise.all([
      User.deleteMany({}),
      Worker.deleteMany({}),
      Service.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Ticket.deleteMany({}),
      Notification.deleteMany({})
    ]);

    // =========================
    // 1. SERVICES
    // =========================
    const svCleaning = await Service.create({
      name: 'Home Deep Cleaning',
      category: 'Cleaning',
      description: 'Complete deep cleaning of the home.',
      basePrice: 1500,
      isActive: true
    });

    const svPlumbing = await Service.create({
      name: 'Pipe and Leak Repair',
      category: 'Plumbing',
      description: 'Fixing leaks and unclogging pipes.',
      basePrice: 800,
      isActive: true
    });

    const svElectric = await Service.create({
      name: 'Electrical Wiring',
      category: 'Electrician',
      description: 'Fixing electrical issues.',
      basePrice: 1200,
      isActive: true
    });

    const svPainting = await Service.create({
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
    const admin = await User.create({
      firebaseUid: 'admin-100',
      name: 'Ayush Sharma',
      email: 'admin@maidyone.com',
      phoneNumber: '9770335431',
      password: '1234',
      role: 'admin',
      status: 'active',
      avatar: 'https://i.pravatar.cc/150?img=11'
    });

    const u1 = await User.create({
      firebaseUid: 'user-101',
      name: 'Rohan Gupta',
      email: 'rohan.gupta@email.com',
      phoneNumber: '9876543210',
      password: '1234',
      role: 'user',
      status: 'active'
    });

    const u2 = await User.create({
      firebaseUid: 'user-102',
      name: 'Aarohi Patel',
      email: 'aarohi.p@email.com',
      phoneNumber: '9876543211',
      password: '1234',
      role: 'user',
      status: 'active'
    });

    const u3 = await User.create({
      firebaseUid: 'user-103',
      name: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      phoneNumber: '9876543212',
      password: '1234',
      role: 'user',
      status: 'active'
    });

    const u4 = await User.create({
      firebaseUid: 'user-104',
      name: 'Neha Reddy',
      email: 'neha.r@email.com',
      phoneNumber: '9876543213',
      password: '1234',
      role: 'user',
      status: 'active'
    });

    const u5 = await User.create({
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

    const wu1 = await User.create({
      firebaseUid: 'worker-201',
      name: 'Sanjay Kumar',
      email: 'sanjay.k@worker.com',
      phoneNumber: '9000000001',
      password: '1234',
      role: 'worker',
      status: 'active'
    });

    const wu2 = await User.create({
      firebaseUid: 'worker-202',
      name: 'Pooja Verma',
      email: 'pooja.v@worker.com',
      phoneNumber: '9000000002',
      password: '1234',
      role: 'worker',
      status: 'active'
    });

    const wu3 = await User.create({
      firebaseUid: 'worker-203',
      name: 'Ramesh Yadav',
      email: 'ramesh.y@worker.com',
      phoneNumber: '9000000003',
      password: '1234',
      role: 'worker',
      status: 'active'
    });

    const wu4 = await User.create({
      firebaseUid: 'worker-204',
      name: 'Kavita Joshi',
      email: 'kavita.j@worker.com',
      phoneNumber: '9000000004',
      password: '1234',
      role: 'worker',
      status: 'active'
    });

    const w1 = await Worker.create({
      user: wu1._id,
      skills: [svCleaning._id, svPainting._id],
      isOnline: true,
      rating: 4.8,
      totalJobs: 145,
      verificationStatus: 'verified'
    });

    const w2 = await Worker.create({
      user: wu2._id,
      skills: [svPlumbing._id, svElectric._id],
      isOnline: false,
      rating: 4.5,
      totalJobs: 56,
      verificationStatus: 'verified'
    });

    const w3 = await Worker.create({
      user: wu3._id,
      skills: [svCleaning._id],
      isOnline: true,
      rating: 4.9,
      totalJobs: 300,
      verificationStatus: 'verified'
    });

    const w4 = await Worker.create({
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
    const subDays = (d: number) => new Date(today.getTime() - 86400000 * d);
    const addDays = (d: number) => new Date(today.getTime() + 86400000 * d);

    const b1 = await Booking.create({
      bookingId: 'BK-5001',
      user: u1._id,
      worker: w1._id,
      service: svCleaning._id,
      status: 'Completed',
      date: subDays(1),
      address: 'Mumbai',
      totalAmount: 1800
    });

    const b2 = await Booking.create({
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

    await Payment.create({
      paymentId: 'PAY001',
      booking: b1._id,
      user: u1._id,
      amount: 1800,
      status: 'Completed',
      method: 'Card'
    });

    await Payment.create({
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

    await Ticket.create({
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

    await Notification.create({
      recipient: admin._id,
      title: 'New User Registered',
      message: 'A new user joined',
      type: 'System'
    });

    console.log('✅ DATABASE SEEDED SUCCESSFULLY 🚀');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();