import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db';
import { errorHandler } from './middlewares/errorHandler';
import { env, validateEnvOrThrow } from './config/env';

// Route imports
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import workerRoutes from './routes/workerRoutes';
import bookingRoutes from './routes/bookingRoutes';
import serviceRoutes from './routes/serviceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import ticketRoutes from './routes/ticketRoutes';
import notificationRoutes from './routes/notificationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import couponRoutes from './routes/couponRoutes';
import bannerRoutes from './routes/bannerRoutes';

validateEnvOrThrow();
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/workers', workerRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/banners', bannerRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'OK', data: {} });
});

// Error handling Middleware
app.use(errorHandler);

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});
