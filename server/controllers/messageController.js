const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/attachments');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with safer character replacement
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-');
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${originalName}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images, documents, audio files and text files
  if (
    file.mimetype.startsWith('image/') || 
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimetype === 'text/plain' ||
    file.mimetype.startsWith('audio/') ||
    file.mimetype === 'application/octet-stream' ||
    file.mimetype === 'audio/mp4' ||
    file.mimetype === 'audio/mpeg' ||
    file.mimetype === 'audio/ogg' ||
    file.mimetype === 'audio/webm' ||
    file.mimetype === 'audio/wav'
  ) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file format: ${file.mimetype}`), false);
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: fileFilter
});

// @desc    Send new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Please provide chat ID"
      });
    }

    if (!content && !req.file) {
      return res.status(400).json({
        success: false, 
        message: "Message cannot be empty"
      });
    }

    let newMessage = {
      sender: req.user._id,
      content: content || "",
      chat: chatId,
    };

    let message = await Message.create(newMessage);

    message = await message.populate("sender", "username avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// @desc    Get all messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username avatar email")
      .populate("chat");

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:chatId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    await Message.updateMany(
      { 
        chat: chatId, 
        readBy: { $ne: req.user._id }
      },
      { 
        $push: { readBy: req.user._id } 
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if current user is the message sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload file and create message
// @route   POST /api/messages/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    console.log('Processing file upload request');
    // Use multer middleware for single file upload
    const uploadMiddleware = upload.single('file');

    uploadMiddleware(req, res, async function (err) {
      if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'Error uploading file'
        });
      }

      if (!req.file) {
        console.error('No file in request');
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { chatId } = req.body;

      if (!chatId) {
        console.error('No chatId in request');
        return res.status(400).json({
          success: false,
          message: 'Chat ID is required'
        });
      }

      console.log('File uploaded successfully:', req.file);

      // Get file info with proper URL path
      const protocol = req.protocol;
      const host = req.get('host');
      const fileUrl = `${protocol}://${host}/uploads/attachments/${req.file.filename}`;
      const fileType = req.file.mimetype;
      const fileName = req.file.originalname;
      const fileSize = req.file.size;

      // Create message with file attachment
      let newMessage = {
        sender: req.user._id,
        chat: chatId,
        fileUrl,
        fileType,
        fileName,
        fileSize,
        isFileMessage: true
      };

      console.log('Creating new message with attachment:', newMessage);

      let message = await Message.create(newMessage);

      message = await message.populate("sender", "username avatar");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "username avatar email",
      });

      await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

      res.status(201).json({
        success: true,
        message
      });
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file'
    });
  }
};

module.exports = {
  sendMessage,
  getAllMessages,
  markAsRead,
  deleteMessage,
  uploadFile
}; 