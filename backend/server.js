require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');

// Validate required environment variables at startup
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}
if (!process.env.OPENROUTER_API_KEY) {
  console.error('❌ FATAL: OPENROUTER_API_KEY environment variable is required');
  process.exit(1);
}

// Models (load before associations)
const User = require('./models/User');
const AIReport = require('./models/AIReport');
const HealthData = require('./models/HealthData');
const Medication = require('./models/Medication');
const Appointment = require('./models/Appointment');
const HealthProfile = require('./models/HealthProfile');
const ChatHistory = require('./models/ChatHistory');
const Prescription = require('./models/Prescription');

// Associations
AIReport.belongsTo(User, { foreignKey: 'userId', as: 'patient' });
User.hasOne(HealthProfile, { foreignKey: 'userId' });
User.hasMany(Medication, { foreignKey: 'userId' });
User.hasMany(Appointment, { foreignKey: 'userId' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
User.hasMany(HealthData, { foreignKey: 'userId' });
Prescription.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

// Routes
const authRoutes        = require('./routes/authRoutes');
const healthRoutes      = require('./routes/healthRoutes');
const chatRoutes        = require('./routes/chatRoutes');
const aiRoutes          = require('./routes/aiRoutes');
const statsRoutes       = require('./routes/statsRoutes');
const medicationRoutes  = require('./routes/medicationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const profileRoutes     = require('./routes/profileRoutes');
const doctorRoutes      = require('./routes/doctorRoutes');

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Too many requests.' } }));
app.use('/api/ai', rateLimit({ windowMs: 60 * 1000, max: 15, message: { error: 'AI limit reached. Wait a moment.' } }));

// Mount routes
app.use('/api/auth',         authRoutes);
app.use('/api/health',       healthRoutes);
app.use('/api/chat',         chatRoutes);
app.use('/api/ai',           aiRoutes);
app.use('/api/stats',        statsRoutes);
app.use('/api/medications',  medicationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/profile',      profileRoutes);
app.use('/api/doctor',       doctorRoutes);

app.get('/api/status', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 HealthGuide Server running on port ${PORT}`);
});
