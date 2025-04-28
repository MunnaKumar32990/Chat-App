const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/attachments');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get private chat messages
router.get('/private/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ],
      chatType: 'private',
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('sender', 'username profilePicture')
    .populate('recipient', 'username profilePicture');

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get group chat messages
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const messages = await Message.find({
      group: req.params.groupId,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('sender', 'username profilePicture')
    .populate('mentions', 'username profilePicture');

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send private message
router.post('/private', auth, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content,
      chatType: 'private'
    });

    await message.save();

    // Emit socket event for real-time updates
    req.app.get('io').to(recipientId).emit('newMessage', {
      message: await message.populate('sender', 'username profilePicture')
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Send group message
router.post('/group', auth, async (req, res) => {
  try {
    const { groupId, content } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is member of the group
    if (!group.members.some(member => member.user.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const message = new Message({
      sender: req.user._id,
      group: groupId,
      content,
      chatType: 'group'
    });

    await message.save();

    // Update group's last message and activity
    group.lastMessage = message._id;
    group.lastActivity = new Date();
    await group.save();

    // Emit socket event for real-time updates
    req.app.get('io').to(groupId).emit('newMessage', {
      message: await message.populate('sender', 'username profilePicture')
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload attachment
router.post('/attachment', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
    res.json({
      type: fileType,
      url: req.file.path,
      name: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Edit message
router.patch('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    message.content = req.body.content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await message.softDelete(req.user._id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.post('/read', auth, async (req, res) => {
  try {
    const { messageIds } = req.body;
    await Promise.all(
      messageIds.map(async (messageId) => {
        const message = await Message.findById(messageId);
        if (message) {
          await message.markAsRead(req.user._id);
        }
      })
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 