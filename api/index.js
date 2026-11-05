// Vercel Serverless Function entry point for Project 21
import express from 'express';
import { connectDB } from '../server/db/connection.js';
import authRoutes from '../server/routes/authRoutes.js';
import userRoutes from '../server/routes/userRoutes.js';
import serviceRoutes from '../server/routes/serviceRoutes.js';
import staffRoutes from '../server/routes/staffRoutes.js';
import scheduleRoutes from '../server/routes/scheduleRoutes.js';
import appointmentRoutes from '../server/routes/appointmentRoutes.js';
import paymentRoutes from '../server/routes/paymentRoutes.js';
import reviewRoutes from '../server/routes/reviewRoutes.js';
import reportRoutes from '../server/routes/reportRoutes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB or memory store
connectDB().catch(err => console.warn('Serverless DB connect:', err));

// Mount routes with and without /api prefix for flexibility on Vercel
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/services', serviceRoutes);
app.use('/staff', staffRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/payments', paymentRoutes);
app.use('/reviews', reviewRoutes);
app.use('/reports', reportRoutes);

export default app;
