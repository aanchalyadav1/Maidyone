"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controllers/bookingController");
// import { protect, authorize } from '../middlewares/authMiddleware';
const router = (0, express_1.Router)();
// Apply auth middleware here in reality.
// router.use(protect);
router.get('/', bookingController_1.getBookings);
router.post('/', bookingController_1.createBooking);
router.get('/:id', bookingController_1.getBookingById);
router.patch('/:id/status', bookingController_1.updateBookingStatus);
router.patch('/:id/assign-worker', bookingController_1.assignWorker);
exports.default = router;
