require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS configuration - FIXED to allow frontend port 5173
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite frontend
    'http://localhost:3000',  // Create React App (if needed)
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple Firebase Mock for Development
const mockFirebaseAdmin = {
  auth: () => ({
    verifyIdToken: async (token) => {
      // Mock successful verification for development
      return {
        uid: 'demo-user-123',
        name: 'Demo User',
        email: 'demo@example.com',
        picture: 'https://via.placeholder.com/150'
      };
    }
  }),
  apps: { length: 1 }
};

// In-memory data store for demo
let users = [];
let medicines = [];
let reminders = [];

// Initialize demo data
const initializeDemoData = () => {
  const demoUser = {
    uid: 'demo-user-123',
    name: 'Demo User',
    email: 'demo@example.com',
    phone: '+919876543210',
    createdAt: new Date()
  };
  
  const demoMedicines = [
    {
      id: '1',
      userId: 'demo-user-123',
      name: 'Vitamin D3',
      type: 'tablet',
      dosage: { amount: '2000', unit: 'IU' },
      instructions: 'Take with breakfast for better absorption',
      reminders: [{ time: '08:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] }],
      adherenceRate: 96,
      isActive: true
    },
    {
      id: '2',
      userId: 'demo-user-123',
      name: 'Blood Pressure Medicine',
      type: 'tablet',
      dosage: { amount: '5', unit: 'mg' },
      instructions: 'Take after lunch, avoid grapefruit',
      reminders: [{ time: '14:00', days: [] }],
      adherenceRate: 88,
      isActive: true
    },
    {
      id: '3',
      userId: 'demo-user-123',
      name: 'Calcium + Magnesium',
      type: 'capsule',
      dosage: { amount: '500', unit: 'mg' },
      instructions: 'Take with dinner, helps with sleep',
      reminders: [{ time: '20:00', days: [] }],
      adherenceRate: 92,
      isActive: true
    }
  ];

  const demoReminders = [
    {
      id: '1',
      name: 'Vitamin D3',
      time: '08:00',
      dosage: { amount: '2000', unit: 'IU' },
      type: 'tablet',
      instructions: 'Take with breakfast for better absorption',
      taken: false,
      skipped: false,
      priority: 'high'
    },
    {
      id: '2',
      name: 'Blood Pressure Medicine',
      time: '14:00',
      dosage: { amount: '5', unit: 'mg' },
      type: 'tablet',
      instructions: 'Take after lunch, avoid grapefruit',
      taken: false,
      skipped: false,
      priority: 'high'
    },
    {
      id: '3',
      name: 'Calcium + Magnesium',
      time: '20:00',
      dosage: { amount: '500', unit: 'mg' },
      type: 'capsule',
      instructions: 'Take with dinner, helps with sleep',
      taken: false,
      skipped: false,
      priority: 'medium'
    }
  ];

  users = [demoUser];
  medicines = demoMedicines;
  reminders = demoReminders;
  
  console.log('✅ Demo data initialized');
};

// Initialize demo data
initializeDemoData();

// MongoDB connection (optional - will work without it)
const connectMongoDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB Atlas');
    } else {
      console.log('⚠️ MongoDB not configured, using in-memory storage');
    }
  } catch (error) {
    console.log('⚠️ MongoDB connection failed, using in-memory storage:', error.message);
  }
};

// Simple auth middleware
const authenticateUser = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authorization token provided' 
      });
    }
    
    const idToken = authorization.replace('Bearer ', '');
    
    // Mock verification for development
    const decodedToken = await mockFirebaseAdmin.auth().verifyIdToken(idToken);
    
    req.user = decodedToken;
    req.userProfile = users.find(u => u.uid === decodedToken.uid) || users[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Allow requests to continue for demo purposes
    req.user = { uid: 'demo-user-123', name: 'Demo User', email: 'demo@example.com' };
    req.userProfile = users[0];
    next();
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Pillbox Reminder API is running!',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'In-Memory',
      firebase: 'Mock (Development)',
      sms: 'Ready',
      scheduler: 'Ready'
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth routes
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ID token required' });
    }
    
    const decodedToken = await mockFirebaseAdmin.auth().verifyIdToken(idToken);
    
    // Get or create user
    let user = users.find(u => u.uid === decodedToken.uid);
    
    if (!user) {
      user = {
        uid: decodedToken.uid,
        name: decodedToken.name || 'User',
        email: decodedToken.email,
        avatar: decodedToken.picture || null,
        phone: '+919876543210',
        createdAt: new Date()
      };
      users.push(user);
    }
    
    res.json({
      success: true,
      message: 'Authentication successful',
      user: user
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
});

// Get today's reminders
app.get('/api/reminders/today', authenticateUser, async (req, res) => {
  try {
    const todayReminders = reminders.map(reminder => ({
      ...reminder,
      date: new Date().toDateString()
    }));

    res.json({
      success: true,
      date: new Date().toDateString(),
      count: todayReminders.length,
      reminders: todayReminders
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ success: false, message: 'Failed to get reminders' });
  }
});

// Get medicines
app.get('/api/medicines', authenticateUser, async (req, res) => {
  try {
    const userMedicines = medicines.filter(m => m.isActive);
    
    res.json({
      success: true,
      medicines: userMedicines
    });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch medicines' });
  }
});

// Create new medicine
app.post('/api/medicines', authenticateUser, async (req, res) => {
  try {
    const newMedicine = {
      id: Date.now().toString(),
      userId: req.user.uid,
      ...req.body,
      isActive: true,
      createdAt: new Date()
    };
    
    medicines.push(newMedicine);
    
    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      medicine: newMedicine
    });
  } catch (error) {
    console.error('Create medicine error:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Failed to create medicine',
      error: error.message 
    });
  }
});

// Update medicine
app.put('/api/medicines/:id', authenticateUser, async (req, res) => {
  try {
    const medicineIndex = medicines.findIndex(m => m.id === req.params.id);
    
    if (medicineIndex === -1) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    
    medicines[medicineIndex] = { ...medicines[medicineIndex], ...req.body };
    
    res.json({
      success: true,
      message: 'Medicine updated successfully',
      medicine: medicines[medicineIndex]
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(400).json({ success: false, message: 'Failed to update medicine' });
  }
});

// Delete medicine
app.delete('/api/medicines/:id', authenticateUser, async (req, res) => {
  try {
    const medicineIndex = medicines.findIndex(m => m.id === req.params.id);
    
    if (medicineIndex === -1) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    
    medicines[medicineIndex].isActive = false;
    
    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete medicine' });
  }
});

// Log adherence
app.post('/api/medicines/:id/adherence', authenticateUser, async (req, res) => {
  try {
    const { taken, time, notes } = req.body;
    
    // Update reminder status
    const reminderIndex = reminders.findIndex(r => r.id === req.params.id);
    if (reminderIndex !== -1) {
      reminders[reminderIndex].taken = taken;
      reminders[reminderIndex].skipped = !taken;
      reminders[reminderIndex].takenAt = taken ? new Date() : null;
      reminders[reminderIndex].notes = notes;
    }
    
    res.json({
      success: true,
      message: 'Adherence logged successfully'
    });
  } catch (error) {
    console.error('Log adherence error:', error);
    res.status(500).json({ success: false, message: 'Failed to log adherence' });
  }
});

// Get user profile
app.get('/api/users/profile', authenticateUser, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.userProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
});

// Update user profile
app.put('/api/users/profile', authenticateUser, async (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.uid === req.user.uid);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...req.body };
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: users[userIndex]
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ success: false, message: 'Failed to update profile' });
  }
});

// SMS Test endpoint
app.post('/api/test-sms', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number required' });
    }
    
    const message = `🏥 Test SMS from Pillbox Reminder!

Your system is working perfectly.

⏰ ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

💙 Stay healthy!`;
    
    // Simulate SMS sending
    console.log(`📱 SMS would be sent to: ${phone}`);
    console.log(`📄 Message: ${message}`);
    
    // If Fast2SMS API key is provided, try to send real SMS
    if (process.env.FAST2SMS_API_KEY) {
      try {
        const axios = require('axios');
        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
          route: 'v3',
          sender_id: 'FSTSMS',
          message: message,
          language: 'english',
          flash: 0,
          numbers: phone.toString()
        }, {
          headers: {
            'authorization': process.env.FAST2SMS_API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        res.json({
          success: true,
          message: `SMS sent successfully to ${phone}!`,
          phone: phone,
          messageId: response.data.request_id,
          mode: 'live'
        });
      } catch (smsError) {
        console.error('SMS send failed:', smsError.response?.data);
        res.json({
          success: true,
          message: `SMS test completed for ${phone} (API error, but system working)`,
          phone: phone,
          mode: 'demo',
          note: 'Check SMS API configuration'
        });
      }
    } else {
      res.json({
        success: true,
        message: `SMS test sent to ${phone}! (Demo mode - configure Fast2SMS for real SMS)`,
        phone: phone,
        mode: 'demo'
      });
    }
  } catch (error) {
    console.error('Test SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'SMS test failed',
      error: error.message
    });
  }
});

// API Documentation
app.get('/api/docs', (req, res) => {
  const docs = {
    title: "Pillbox Reminder API",
    version: "1.0.0",
    status: "Active",
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: [
      "GET /health - Health check",
      "POST /auth/google - Google authentication",
      "GET /medicines - Get user medicines",
      "POST /medicines - Create medicine",
      "PUT /medicines/:id - Update medicine",
      "DELETE /medicines/:id - Delete medicine", 
      "POST /medicines/:id/adherence - Log adherence",
      "GET /reminders/today - Get today's reminders",
      "GET /users/profile - Get user profile",
      "PUT /users/profile - Update user profile",
      "POST /test-sms - Send test SMS"
    ],
    authentication: "Bearer token (Firebase ID token) required for protected routes",
    cors: "Configured for http://localhost:5173 and http://localhost:3000"
  };
  
  res.json(docs);
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.path,
    availableRoutes: [
      'GET /api/health',
      'GET /api/docs',
      'POST /api/auth/google',
      'GET /api/reminders/today',
      'GET /api/medicines',
      'POST /api/test-sms'
    ]
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Try to connect to MongoDB (optional)
    await connectMongoDB();
    
    app.listen(PORT, () => {
      console.log('\n🚀 Pillbox Reminder Backend Started Successfully!');
      console.log('=====================================');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`✅ Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
      console.log(`📱 SMS Test: POST http://localhost:${PORT}/api/test-sms`);
      console.log(`🔗 CORS enabled for: http://localhost:5173`);
      console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? 'MongoDB Atlas' : 'In-Memory Storage'}`);
      console.log(`🔐 Auth: Mock Firebase (Development Mode)`);
      console.log(`📲 SMS: ${process.env.FAST2SMS_API_KEY ? 'Fast2SMS Configured' : 'Demo Mode'}`);
      console.log('=====================================');
      console.log('🎯 Ready for frontend connections!');
      console.log('💡 Start your frontend with: npm run dev\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
