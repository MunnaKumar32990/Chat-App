const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  try {
    let token;
    
    console.log('Auth middleware called');
    console.log('Cookies:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);
    
    // Check for token in cookies or Authorization header
    if (req.cookies && req.cookies.token) {
      console.log('Found token in cookies');
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      console.log('Found token in authorization header');
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      console.log('No token found, authentication failed');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }
    
    console.log('Verifying token');
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallbacksecretkey'
    );
    
    console.log('Token verified, decoded ID:', decoded.id);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('User authenticated:', user._id);
    
    // Set user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      // Clear the expired cookie
      res.cookie('token', '', {
        expires: new Date(0),
        httpOnly: true,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Token expired, please login again'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Authentication failed: ' + (error.message || 'Unknown error')
    });
  }
};

// For routes that can work with or without authentication
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies or Authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      // Continue without user authentication
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallbacksecretkey'
    );
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without user authentication on error
    console.error('Optional auth error:', error.message);
    next();
  }
};

module.exports = { protect, optionalAuth }; 