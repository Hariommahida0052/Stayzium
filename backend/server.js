const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Routes files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const offerRoutes = require('./routes/offerRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const { checkMaintenanceMode } = require('./middlewares/maintenanceMiddleware');
const { trackRequest, trackError } = require('./utils/healthTracker');

// Global Middlewares
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests
app.use(trackRequest); // Track total requests

// Apply maintenance mode check globally
app.use(checkMaintenanceMode);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payouts', payoutRoutes);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route for testing
app.get('/api', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Welcome to Hotel Booking API v1.0' 
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running successfully. Access API at /api'
  });
});

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  trackError();
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const http = require('http');
const { initSocket } = require('./utils/socket');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
