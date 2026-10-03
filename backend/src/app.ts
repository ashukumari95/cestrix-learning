import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

import orgRoutes from './routes/organization.routes';
import planRoutes from './routes/plan.routes';
import academicRoutes from './routes/academic.routes';
import userRoutes from './routes/user.routes';
import lmsRoutes from './routes/lms.routes';
import questionRoutes from './routes/question.routes';
import mistakeRoutes from './routes/mistake.routes';
import analyticsRoutes from './routes/analytics.routes';
import dashboardRoutes from './routes/dashboard.routes';
import aiRoutes from './routes/ai.routes';
import testRoutes from './routes/test.routes';
import genericRoutes from './routes/generic.routes';
import uploadRoutes from './routes/upload.routes';
import authRoutes from './routes/auth.routes';
import feeRoutes from './routes/fee.routes';
import attendanceRoutes from './routes/attendance.routes';
import notificationRoutes from './routes/notification.routes';
import settingsRoutes from './routes/settings.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/superadmin/organizations', orgRoutes);
app.use('/api/v1/superadmin/plans', planRoutes);

app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/coaching/academic', academicRoutes);
app.use('/api/v1/coaching/users', userRoutes);
app.use('/api/v1/coaching/lms', lmsRoutes);
app.use('/api/v1/coaching/dashboard', dashboardRoutes);
app.use('/api/v1/coaching/questions', questionRoutes);
app.use('/api/v1/coaching/settings', settingsRoutes);

// Advanced Engine Routes
app.use('/api/v1/coaching/tests', testRoutes);
app.use('/api/v1/students/mistakes', mistakeRoutes);
app.use('/api/v1/students/analytics', analyticsRoutes);
app.use('/api/v1/coaching/ai', aiRoutes);
app.use('/api/v1/coaching/fees', feeRoutes);
app.use('/api/v1/coaching/attendance', attendanceRoutes);
app.use('/api/v1/coaching/notifications', notificationRoutes);

// Generic CRUD Route for all Prisma Models
app.use('/api/v1/resource', genericRoutes);

app.use('/api/v1/upload', uploadRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Cestrix Learning API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
