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
    console.log('MongoDB connection established for seeding.');

    // Clear existing data to forcefully refresh the massive dataset
    await Promise.all([
      User.deleteMany({}), Worker.deleteMany({}), Service.deleteMany({}),
      Booking.deleteMany({}), Payment.deleteMany({}), Ticket.deleteMany({}), Notification.deleteMany({})
    ]);

    // 1. Create Services
    const svCleaning = await Service.create({ name: 'Home Deep Cleaning', category: 'Cleaning', description: 'Complete deep cleaning of the home.', basePrice: 1500, isActive: true });
    const svPlumbing = await Service.create({ name: 'Pipe and Leak Repair', category: 'Plumbing', description: 'Fixing leaks and unclogging pipes.', basePrice: 800, isActive: true });
    const svElectric = await Service.create({ name: 'Electrical Wiring', category: 'Electrician', description: 'Fixing electrical issues.', basePrice: 1200, isActive: true });
    const svPainting = await Service.create({ name: 'Wall Painting', category: 'Painting', description: 'Full room painting.', basePrice: 4500, isActive: true });

    // 2. Create Users
    const admin = await User.create({ firebaseUid: 'admin-100', name: 'Ayush Sharma', email: 'admin@maidyone.com', role: 'admin', status: 'active', avatar: 'https://i.pravatar.cc/150?img=11' });
    const u1 = await User.create({ firebaseUid: 'user-101', name: 'Rohan Gupta', email: 'rohan.gupta@email.com', phoneNumber: '+91 9876543210', role: 'user', status: 'active' });
    const u2 = await User.create({ firebaseUid: 'user-102', name: 'Aarohi Patel', email: 'aarohi.p@email.com', phoneNumber: '+91 9876543211', role: 'user', status: 'active' });
    const u3 = await User.create({ firebaseUid: 'user-103', name: 'Vikram Singh', email: 'vikram.singh@email.com', phoneNumber: '+91 9876543212', role: 'user', status: 'active' });
    const u4 = await User.create({ firebaseUid: 'user-104', name: 'Neha Reddy', email: 'neha.r@email.com', phoneNumber: '+91 9876543213', role: 'user', status: 'active' });
    const u5 = await User.create({ firebaseUid: 'user-105', name: 'Arjun Das', email: 'arjun.d@email.com', phoneNumber: '+91 9876543214', role: 'user', status: 'active' });

    // 3. Create Workers
    const wu1 = await User.create({ firebaseUid: 'worker-201', name: 'Sanjay Kumar', email: 'sanjay.k@worker.com', role: 'worker', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Sanjay' });
    const wu2 = await User.create({ firebaseUid: 'worker-202', name: 'Pooja Verma', email: 'pooja.v@worker.com', role: 'worker', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Pooja' });
    const wu3 = await User.create({ firebaseUid: 'worker-203', name: 'Ramesh Yadav', email: 'ramesh.y@worker.com', role: 'worker', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Ramesh' });
    const wu4 = await User.create({ firebaseUid: 'worker-204', name: 'Kavita Joshi', email: 'kavita.j@worker.com', role: 'worker', status: 'active' });

    const w1 = await Worker.create({ user: wu1._id, skills: [svCleaning._id, svPainting._id], isOnline: true, rating: 4.8, totalJobs: 145, verificationStatus: 'verified' });
    const w2 = await Worker.create({ user: wu2._id, skills: [svPlumbing._id, svElectric._id], isOnline: false, rating: 4.5, totalJobs: 56, verificationStatus: 'verified' });
    const w3 = await Worker.create({ user: wu3._id, skills: [svCleaning._id], isOnline: true, rating: 4.9, totalJobs: 300, verificationStatus: 'verified' });
    const w4 = await Worker.create({ user: wu4._id, skills: [svElectric._id], isOnline: true, rating: 4.2, totalJobs: 20, verificationStatus: 'pending' });

    // 4. Create 15 Bookings for a rich UI experience
    const today = new Date();
    const subDays = (d: number) => new Date(today.getTime() - 86400000 * d);
    const addDays = (d: number) => new Date(today.getTime() + 86400000 * d);

    const b1 = await Booking.create({ bookingId: 'BK-5001', user: u1._id, worker: w1._id, service: svCleaning._id, status: 'Completed', date: subDays(1), address: 'Andheri West, Mumbai', totalAmount: 1800 });
    const b2 = await Booking.create({ bookingId: 'BK-5002', user: u2._id, worker: w2._id, service: svPlumbing._id, status: 'Confirmed', date: addDays(1), address: 'Koramangala, Bangalore', totalAmount: 850 });
    const b3 = await Booking.create({ bookingId: 'BK-5003', user: u3._id, service: svElectric._id, status: 'Pending', date: addDays(2), address: 'Banjara Hills, Hyderabad', totalAmount: 1200 });
    const b4 = await Booking.create({ bookingId: 'BK-5004', user: u4._id, worker: w3._id, service: svCleaning._id, status: 'Cancelled', date: subDays(3), address: 'Vasant Kunj, Delhi', totalAmount: 1500 });
    const b5 = await Booking.create({ bookingId: 'BK-5005', user: u5._id, worker: w1._id, service: svPainting._id, status: 'Completed', date: subDays(2), address: 'Salt Lake, Kolkata', totalAmount: 4800 });
    const b6 = await Booking.create({ bookingId: 'BK-5006', user: u1._id, worker: w4._id, service: svElectric._id, status: 'In Progress', date: today, address: 'Andheri West, Mumbai', totalAmount: 1500 });
    const b7 = await Booking.create({ bookingId: 'BK-5007', user: u2._id, worker: w2._id, service: svPlumbing._id, status: 'Completed', date: subDays(4), address: 'Indiranagar, Bangalore', totalAmount: 900 });
    const b8 = await Booking.create({ bookingId: 'BK-5008', user: u3._id, worker: w1._id, service: svCleaning._id, status: 'Completed', date: subDays(5), address: 'Jubilee Hills, Hyderabad', totalAmount: 1600 });
    const b9 = await Booking.create({ bookingId: 'BK-5009', user: u4._id, worker: w2._id, service: svElectric._id, status: 'Confirmed', date: addDays(3), address: 'Dwarka, Delhi', totalAmount: 1400 });
    const b10 = await Booking.create({ bookingId: 'BK-5010', user: u5._id, service: svCleaning._id, status: 'Pending', date: addDays(4), address: 'New Town, Kolkata', totalAmount: 1500 });
    const b11 = await Booking.create({ bookingId: 'BK-5011', user: u3._id, worker: w3._id, service: svCleaning._id, status: 'Completed', date: subDays(6), address: 'Kondapur, Hyderabad', totalAmount: 1500 });
    const b12 = await Booking.create({ bookingId: 'BK-5012', user: u1._id, worker: w4._id, service: svElectric._id, status: 'Cancelled', date: subDays(1), address: 'Bandra, Mumbai', totalAmount: 1200 });

    // 5. Create Payments (Linked to bookings)
    await Payment.create({ paymentId: 'PAY001', booking: b1._id, user: u1._id, amount: 1800, status: 'Completed', method: 'Card' });
    await Payment.create({ paymentId: 'PAY002', booking: b2._id, user: u2._id, amount: 850, status: 'Pending', method: 'Cash' });
    await Payment.create({ paymentId: 'PAY003', booking: b3._id, user: u3._id, amount: 1200, status: 'Pending', method: 'Wallet' });
    await Payment.create({ paymentId: 'PAY004', booking: b4._id, user: u4._id, amount: 1500, status: 'Refunded', method: 'Card' });
    await Payment.create({ paymentId: 'PAY005', booking: b5._id, user: u5._id, amount: 4800, status: 'Completed', method: 'Card' });
    await Payment.create({ paymentId: 'PAY006', booking: b6._id, user: u1._id, amount: 1500, status: 'Pending', method: 'Cash' });
    await Payment.create({ paymentId: 'PAY007', booking: b7._id, user: u2._id, amount: 900, status: 'Completed', method: 'Wallet' });
    await Payment.create({ paymentId: 'PAY008', booking: b8._id, user: u3._id, amount: 1600, status: 'Completed', method: 'Card' });
    await Payment.create({ paymentId: 'PAY011', booking: b11._id, user: u3._id, amount: 1500, status: 'Completed', method: 'Wallet' });

    // 6. Create Tickets
    await Ticket.create({ ticketId: 'TCK-201', user: u2._id, assignedTo: w2._id, subject: 'Job not finished properly', description: 'Plumber left without testing.', status: 'Open', priority: 'High' });
    await Ticket.create({ ticketId: 'TCK-202', user: u4._id, subject: 'Refund Request Delayed', description: 'Requesting refund for cancelled job.', status: 'In Progress', priority: 'Medium' });
    await Ticket.create({ ticketId: 'TCK-203', user: u1._id, assignedTo: w4._id, subject: 'Worker failed to arrive', description: 'Worker got lost.', status: 'Resolved', priority: 'Urgent' });

    // 7. Create Notifications
    await Notification.create({ recipient: admin._id, title: 'New Registration', message: 'User Aarohi Patel has registered.', type: 'System' });
    await Notification.create({ recipient: u2._id, title: 'Booking Confirmed', message: 'Your plumbing booking has been confirmed.', type: 'Booking', relatedId: b2._id.toString() });

    console.log('✅ Database successfully seeded with rich, realistic Indian data!');
    process.exit(0);

  } catch (err) {
    console.error('Seeding completely failed:', err);
    process.exit(1);
  }
};

seedData();
