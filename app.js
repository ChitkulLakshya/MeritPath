const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const College = require('./models/College');
const sampleColleges = require('./seedData/collegeData');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collegeconnect';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  // Seed database if empty
  seedDatabase();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Seed Database Function
async function seedDatabase() {
  try {
    const collegeCount = await College.countDocuments();
    
    if (collegeCount === 0) {
      await College.insertMany(sampleColleges);
      console.log('College data seeded successfully!');
    } else {
      console.log('College collection already has data. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// API Routes

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username,
      email,
      password_hash
    });

    await user.save();

    res.status(201).json({ 
      message: 'User registered successfully',
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ 
      message: 'Login successful',
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// College Recommendations
app.post('/api/recommendations', async (req, res) => {
  try {
    const { mcetRank, intermediateMarks, desiredCourse } = req.body;

    // Validation
    if (!mcetRank || !intermediateMarks || !desiredCourse) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const rank = Number(mcetRank);
    const marks = Number(intermediateMarks);
    const course = desiredCourse.toUpperCase();

    if (isNaN(rank) || isNaN(marks)) {
      return res.status(400).json({ error: 'MCET rank and intermediate marks must be numbers' });
    }

    if (!['CSE', 'ECE', 'MECH'].includes(course)) {
      return res.status(400).json({ error: 'Invalid course. Must be CSE, ECE, or MECH' });
    }

    // Find matching colleges
    // Logic: 
    // - course matches desiredCourse
    // - mcet_rank_cutoff >= user's mcetRank (allowing weaker rank to qualify)
    // - intermediate_marks_cutoff <= user's intermediateMarks (user's marks are higher)
    const colleges = await College.find({
      course: course,
      mcet_rank_cutoff: { $gte: rank },
      intermediate_marks_cutoff: { $lte: marks }
    }).sort({ mcet_rank_cutoff: 1 }); // Sort by best match first (ascending order)

    res.json({
      count: colleges.length,
      colleges: colleges
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Server error during recommendation' });
  }
});

// Get all colleges (for testing/admin purposes)
app.get('/api/colleges', async (req, res) => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    res.json({ colleges });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

