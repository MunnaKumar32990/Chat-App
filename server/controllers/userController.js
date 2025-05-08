const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (id) => {
  // Create a more robust payload with user ID, timestamps, and additional security fields
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id,
    iat: now,                     // Issued at timestamp
    exp: now + (30 * 24 * 60 * 60), // Expires in 30 days
    jti: Math.random().toString(36).substring(2) + Date.now().toString(36) // Unique token ID
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET);
};

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, username, email, password } = req.body;

    // Validate required fields
    if (!name || !username || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check for valid email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check for minimum password length
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists with more detailed error
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('User already exists with username:', username);
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      username,
      email,
      password
    });

    console.log('User created successfully:', user._id);

    // Generate token
    const token = generateToken(user._id);
    console.log('Token generated successfully');

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });

    console.log('Token set in cookie, sending response');

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        token: token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key errors specifically
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = `${field === 'email' ? 'Email' : 'Username'} already exists`;
      
      return res.status(400).json({
        success: false,
        message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during registration'
    });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt with email:', email);

    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (user && (await user.comparePassword(password))) {
      // Update user status to online
      user.status = 'online';
      user.lastSeen = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);
      console.log('Token generated successfully for user:', user._id);

      // Set token in cookie
      console.log('Setting cookie with token');
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      });

      console.log('Token set in cookie, sending response');

      // Send response
      res.status(200).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
          status: user.status,
        }
      });
    } else {
      console.log('Invalid login credentials for email:', email);
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Logout user
exports.logoutUser = async (req, res) => {
  try {
    console.log('Logout request received');
    
    // Update user's online status
    if (req.user && req.user._id) {
      const User = require('../models/User');
      
      const user = await User.findById(req.user._id);
      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        await user.save();
        console.log(`User ${user._id} marked as offline`);
      }
    }
    
    // Clear cookie
    res.cookie('token', '', {
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });

    console.log('Cookie cleared, sending response');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during logout'
    });
  }
};

// Get current user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.status(200).json({
        success: true,
        user
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, status, avatar } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (status) updateData.status = status;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { username: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find({
      ...keyword,
      _id: { $ne: req.user?._id }
    }).select('-password');

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add friend
exports.addFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    // Check if friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already friends
    const user = await User.findById(req.user._id);
    if (user.friends.includes(friendId)) {
      return res.status(400).json({
        success: false,
        message: 'Already friends with this user'
      });
    }

    // Add to friends list for both users
    await User.findByIdAndUpdate(req.user._id, {
      $push: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $push: { friends: req.user._id }
    });

    res.status(200).json({
      success: true,
      message: 'Friend added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove friend
exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    // Remove from friends list for both users
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: req.user._id }
    });

    res.status(200).json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, username, bio } = req.body;
    
    // Validate required fields
    if (!name || !username) {
      return res.status(400).json({
        success: false,
        message: 'Name and username are required'
      });
    }
    
    // Check if username is already taken (by another user)
    if (username !== req.user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }
    
    // Update user object
    const updateData = {
      name,
      username,
      bio: bio || req.user.bio // Keep existing bio if not provided
    };
    
    // Add avatar if uploaded
    if (req.file) {
      // Get server URL
      const protocol = req.protocol;
      const host = req.get('host');
      const avatarUrl = `${protocol}://${host}/uploads/avatars/${req.file.filename}`;
      
      updateData.avatar = avatarUrl;
    }
    
    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    // Generate new token to maintain session
    const token = jwt.sign(
      { id: updatedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      token // Send new token to client
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Find all users except the current user
    // Sort by: online users first, then by name
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .sort({ status: -1, name: 1 });
    
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users'
    });
  }
};

// Exports are already defined above using exports.functionName pattern 