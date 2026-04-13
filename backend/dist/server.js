"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = require("./config/db");
const errorHandler_1 = require("./middlewares/errorHandler");
// Route imports
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const workerRoutes_1 = __importDefault(require("./routes/workerRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
dotenv_1.default.config();
(0, db_1.connectDB)();
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// API Routes
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/users', userRoutes_1.default);
app.use('/api/v1/workers', workerRoutes_1.default);
app.use('/api/v1/bookings', bookingRoutes_1.default);
app.use('/api/v1/services', serviceRoutes_1.default);
app.use('/api/v1/payments', paymentRoutes_1.default);
app.use('/api/v1/tickets', ticketRoutes_1.default);
app.use('/api/v1/notifications', notificationRoutes_1.default);
app.use('/api/v1/dashboard', dashboardRoutes_1.default);
// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});
// Error handling Middleware
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
