const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Import models
const User = require('./models/User');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const JobApplication = require('./models/JobApplication');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/samb-laundry';

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (if needed)
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.log('⚠️  Running without database connection');
});

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    message: 'Backend server is running',
    database: dbStatus
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    message: 'SAMB Laundry API',
    version: '1.0.0',
    database: dbStatus,
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      services: '/api/services',
      bookings: '/api/bookings'
    }
  });
});

// Authentication endpoint with MongoDB
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        }
      });
    }

    // Find user in MongoDB
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // For demo purposes, accept any password
    // In production, use bcrypt.compare(password, user.password)
    const tokens = {
      accessToken: 'demo-access-token-' + Date.now(),
      refreshToken: 'demo-refresh-token-' + Date.now()
    };
    
    res.json({
      success: true,
      message: 'Login successful',
      data: { 
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        tokens 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed',
        code: 'LOGIN_ERROR'
      }
    });
  }
});

// Registration endpoint with MongoDB
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration request body:', req.body);

    const {
      email,
      password,
      name,
      phone,
      address,
      city,
      region,
      role,
      preferredService,
      preferredTime,
      notifications,
      newsletter
    } = req.body;

    if (!email || !password || !name) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email, password, and name are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(409).json({
        success: false,
        error: {
          message: 'User with this email already exists',
          code: 'USER_EXISTS'
        }
      });
    }

    // Create new user
    const user = new User({
      email,
      password, // In production, hash this with bcrypt
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' ') || '',
      phone,
      address,
      city,
      region,
      role: role || 'customer',
      preferredService,
      preferredTime,
      notifications,
      newsletter
    });

    console.log('Saving user:', user);
    await user.save();
    console.log('User saved successfully');

    // Generate tokens
    const tokens = {
      accessToken: 'demo-access-token-' + Date.now(),
      refreshToken: 'demo-refresh-token-' + Date.now()
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        tokens
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Registration failed',
        code: 'REGISTRATION_ERROR'
      }
    });
  }
});

// Services endpoint with MongoDB
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find({ isAvailable: true });
    res.json({
      success: true,
      data: { services }
    });
  } catch (error) {
    console.error('Services error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch services',
        code: 'SERVICES_ERROR'
      }
    });
  }
});

// Create service endpoint
app.post('/api/services', async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create service',
        code: 'CREATE_SERVICE_ERROR'
      }
    });
  }
});

// Users endpoint
app.get('/api/users', async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password');
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch users',
        code: 'USERS_ERROR'
      }
    });
  }
});

// Update user profile endpoint
app.put('/api/users/profile', async (req, res) => {
  try {
    const { firstName, lastName, phone, address, city, region } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    console.log('Profile update request:', { firstName, lastName, phone, address, city, region });

    // Get user email from token (in production, decode JWT properly)
    // For now, use the email from localStorage if available
    const userData = JSON.parse(req.headers['x-user-data'] || '{}');
    const email = userData.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User email required',
          code: 'MISSING_EMAIL'
        }
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        firstName,
        lastName,
        phone,
        address,
        city,
        region
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update profile',
        code: 'UPDATE_PROFILE_ERROR'
      }
    });
  }
});

// Update user endpoint
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role, department, address, city, region, isActive } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, phone, role, department, address, city, region, isActive },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update user',
        code: 'UPDATE_USER_ERROR'
      }
    });
  }
});

// Delete user endpoint
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete user',
        code: 'DELETE_USER_ERROR'
      }
    });
  }
});

// Delete user account endpoint
app.delete('/api/users/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    // For demo, delete first user (in production, decode token to get user ID)
    await User.findOneAndDelete({});

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete account',
        code: 'DELETE_ACCOUNT_ERROR'
      }
    });
  }
});

// Bookings endpoint
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    console.error('Bookings error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch bookings',
        code: 'BOOKINGS_ERROR'
      }
    });
  }
});

// Create booking endpoint
app.post('/api/bookings', async (req, res) => {
  try {
    console.log('Received booking request:', req.body);
    
    const { customer, service, address, date, notes, deliveryOption, pickupLocation, deliveryLocation, userId, status } = req.body;
    
    // Validate required fields
    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Customer name and phone are required',
          code: 'MISSING_CUSTOMER_INFO'
        }
      });
    }
    
    if (!service) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Service is required',
          code: 'MISSING_SERVICE'
        }
      });
    }
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Address is required',
          code: 'MISSING_ADDRESS'
        }
      });
    }
    
    if (!date) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Date is required',
          code: 'MISSING_DATE'
        }
      });
    }

    const booking = new Booking({
      customer,
      service,
      serviceName: service,
      address,
      date: new Date(date),
      notes,
      deliveryOption: deliveryOption || 'both',
      pickupLocation,
      deliveryLocation,
      userId,
      status: status || 'pending'
    });
    
    await booking.save();
    console.log('Booking created successfully:', booking);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create booking: ' + error.message,
        code: 'CREATE_BOOKING_ERROR'
      }
    });
  }
});

// Delete booking endpoint
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete booking',
        code: 'DELETE_BOOKING_ERROR'
      }
    });
  }
});

// Update booking status endpoint
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update booking',
        code: 'UPDATE_BOOKING_ERROR'
      }
    });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Name, email, and message are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // For demo purposes, just log the message
    // In production, save to database or send email
    console.log('Contact form submission:', { name, email, phone, subject, message });

    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to send message',
        code: 'CONTACT_ERROR'
      }
    });
  }
});

// Job application endpoint
app.post('/api/job-applications', async (req, res) => {
  try {
    console.log('Job application received:', req.body);
    
    const application = new JobApplication(req.body);
    await application.save();
    
    console.log('Job application saved successfully:', application);

    res.json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Job application error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to submit application',
        code: 'APPLICATION_ERROR'
      }
    });
  }
});

// Get all job applications (admin only)
app.get('/api/job-applications', async (req, res) => {
  try {
    const applications = await JobApplication.find().sort({ submittedAt: -1 });
    res.json({
      success: true,
      data: { applications }
    });
  } catch (error) {
    console.error('Fetch job applications error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch applications',
        code: 'FETCH_APPLICATIONS_ERROR'
      }
    });
  }
});

// Respond to job application (accept/reject)
app.put('/api/job-applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse, adminName } = req.body;

    const updatedApplication = await JobApplication.findByIdAndUpdate(
      id,
      {
        status,
        adminResponse,
        adminName,
        respondedAt: new Date()
      },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        }
      });
    }

    console.log('Application updated:', updatedApplication);

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      data: { application: updatedApplication }
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update application',
        code: 'UPDATE_APPLICATION_ERROR'
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 React frontend should connect to: http://localhost:${PORT}/api`);
  console.log(`🗄️  MongoDB connection: ${MONGODB_URI}`);
});

module.exports = app;
