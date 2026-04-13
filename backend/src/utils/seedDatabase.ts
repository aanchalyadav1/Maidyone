import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Worker from '../models/Worker';
import Service from '../models/Service';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import Ticket from '../models/Ticket';
import Notification from '../models/Notification';

dotenv.config();

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI || '';
    if (!uri) throw new Error('MONGO_URI is missing');
    
    await mongoose.connect(uri);
    console.log('MongoDB connection established for seeding.');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Worker.deleteMany({}),
      Service.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Ticket.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('Old collections cleared.');

    // 1. Create Services
    const service1 = await Service.create({
      name: 'Room Cleaning', category: 'Cleaning', description: 'Standard room cleaning', basePrice: 50, isActive: true
    });
    const service2 = await Service.create({
      name: 'Plumbing Repair', category: 'Maintenance', description: 'Fix leaks and pipes', basePrice: 80, isActive: true
    });

    // 2. Create Admin & Users
    const admin = await User.create({
      firebaseUid: 'admin-seed-uid', name: 'Mr. Raj', email: 'raj@maidyone.com', role: 'admin', status: 'active', avatar: 'https://i.pravatar.cc/150?img=11'
    });
    const user1 = await User.create({
      firebaseUid: 'user1-seed-uid', name: 'Michael Roberts', email: 'michael.roberts@email.com', phoneNumber: '+1 234 567 8900', role: 'user', status: 'active', avatar: 'https://i.pravatar.cc/150?u=michael'
    });
    const user2 = await User.create({
      firebaseUid: 'user2-seed-uid', name: 'Priya Sharma', email: 'priya@email.com', role: 'user', status: 'active'
    });

    // 3. Create Workers
    const workerUser1 = await User.create({
      firebaseUid: 'worker1-seed-uid', name: 'Anita Dodve', email: 'anita@email.com', role: 'worker', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Anita'
    });
    const workerUser2 = await User.create({
      firebaseUid: 'worker2-seed-uid', name: 'Rahul Verma', email: 'rahul@email.com', role: 'worker', status: 'active'
    });

    const worker1 = await Worker.create({
      user: workerUser1._id, skills: [service1._id], isOnline: true, rating: 4.8, totalJobs: 145, verificationStatus: 'verified', location: { lat: 22.7, lng: 75.8 }
    });
    const worker2 = await Worker.create({
      user: workerUser2._id, skills: [service2._id], isOnline: false, rating: 4.5, totalJobs: 80, verificationStatus: 'pending'
    });

    // 4. Create Bookings (Ensuring Dashboard Trend picks up multiple dates)
    const today = new Date();
    const d1 = new Date(today); d1.setDate(today.getDate() - 2);
    const d2 = new Date(today); d2.setDate(today.getDate() - 1);
    
    const booking1 = await Booking.create({
      bookingId: 'BK12345', user: user1._id, worker: worker1._id, service: service1._id, status: 'Confirmed', date: d1, address: 'Oceanview Apartment', totalAmount: 855, notes: 'VIP Client'
    });
    const booking2 = await Booking.create({
      bookingId: 'BK-7844', user: user2._id, worker: worker1._id, service: service1._id, status: 'In Progress', date: d2, address: 'Vijay Nagar', totalAmount: 150
    });
    const booking3 = await Booking.create({
      bookingId: 'BK-7845', user: user2._id, service: service2._id, status: 'Pending', date: today, address: 'Indore Central', totalAmount: 80
    });
    const booking4 = await Booking.create({
      bookingId: 'BK-COMPLETED', user: user1._id, worker: worker2._id, service: service2._id, status: 'Completed', date: d1, address: 'Bhopal South', totalAmount: 200
    });

    // 5. Create Payments
    await Payment.create({ paymentId: 'PAY-100', booking: booking1._id, user: user1._id, amount: 855, status: 'Completed', method: 'Card' });
    await Payment.create({ paymentId: 'PAY-101', booking: booking2._id, user: user2._id, amount: 150, status: 'Pending', method: 'Cash' });
    await Payment.create({ paymentId: 'PAY-102', booking: booking4._id, user: user1._id, amount: 200, status: 'Completed', method: 'Wallet' });

    // 6. Create Tickets
    await Ticket.create({ ticketId: 'TCK-555', user: user2._id, subject: 'Payment Issue', description: 'Double charged on booking.', status: 'Open', priority: 'High' });
    await Ticket.create({ ticketId: 'TCK-556', user: user1._id, assignedTo: worker1._id, subject: 'Worker late', description: 'Worker is 30 mins late.', status: 'In Progress', priority: 'Medium' });

    // 7. Create Notifications
    await Notification.create({ recipient: admin._id, title: 'New Worker Signup', message: 'Anita Dodve signed up.', type: 'System' });
    await Notification.create({ recipient: user1._id, title: 'Booking Confirmed', message: 'Your booking BK12345 is confirmed.', type: 'Booking', relatedId: booking1._id.toString() });

    console.log('✅ Relational mock data successfully seeded!');
    process.exit(0);

  } catch (err) {
    console.error('Seeding completely failed:', err);
    process.exit(1);
  }
};

seedData();
