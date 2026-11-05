import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { connectDB } from './server/db/connection.js';
import authRoutes from './server/routes/authRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import serviceRoutes from './server/routes/serviceRoutes.js';
import staffRoutes from './server/routes/staffRoutes.js';
import scheduleRoutes from './server/routes/scheduleRoutes.js';
import appointmentRoutes from './server/routes/appointmentRoutes.js';
import paymentRoutes from './server/routes/paymentRoutes.js';
import reviewRoutes from './server/routes/reviewRoutes.js';
import reportRoutes from './server/routes/reportRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Initialize MongoDB connection
  await connectDB();

  // 2. Middlewares for parsing requests
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 3. Mount Backend API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/staff', staffRoutes);
  app.use('/api/schedules', scheduleRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/reports', reportRoutes);

  // 4. College Project 21 System Metadata Endpoint
  app.get('/api/system/info', (_req, res) => {
    res.json({
      projectNumber: 21,
      title: 'Salon and Spa Booking System',
      courseLevel: '2nd Year B.Tech / BCA / MCA Full Stack Internal Mark Project',
      techStack: {
        frontend: 'ReactJS (JavaScript), Vite, TailwindCSS, Context API, react-router-dom',
        backend: 'Node.js, Express.js (Router, Controller, Middleware, Models)',
        database: 'MongoDB Atlas with Mongoose Schemas & In-Memory Evaluation Store',
        security: 'JWT Authentication, bcrypt Password Hashing, Role Middleware'
      },
      roles: ['Admin', 'Receptionist', 'Service Provider', 'Customer'],
      models: ['User', 'Service', 'StaffProfile', 'Schedule', 'Appointment', 'Payment', 'Review']
    });
  });

  // 5. Mount Vite or Static Frontend
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🌸 Salon & Spa Booking System (Project 21) running on port ${PORT}`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
