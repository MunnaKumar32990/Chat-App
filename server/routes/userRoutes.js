const express = require('express');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  registerUser,
  loginUser,
  getUserProfile,
  searchUsers,
  logoutUser,
  updateUserProfile,
  getAllUsers
} = require('../controllers/userController');

const router = express.Router();

// Configure multer storage for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  }
});

// Configure file filter for avatar uploads
const fileFilter = (req, file, cb) => {
  // Allow only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize upload with limited file size (2MB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter
});

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Test authentication route (for token testing)
router.get('/test-auth', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication successful!',
    user: {
      id: req.user._id,
      email: req.user.email,
      username: req.user.username
    }
  });
});

// Protected routes
router.get('/profile', protect, getUserProfile);
router.patch('/profile', protect, upload.single('avatar'), updateUserProfile);
router.get('/search', protect, searchUsers);
router.get('/logout', protect, logoutUser);
router.get('/', protect, getAllUsers);

module.exports = router; 