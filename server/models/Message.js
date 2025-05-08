const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // File attachment fields
  isFileMessage: {
    type: Boolean,
    default: false
  },
  fileUrl: {
    type: String
  },
  fileType: {
    type: String
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  attachments: [{
    type: String,
    default: []
  }]
}, {
  timestamps: true
});

// Validate that either content or file attachment is provided
messageSchema.pre('save', function(next) {
  if (!this.content && !this.isFileMessage) {
    throw new Error('Message must have either content or file attachment');
  }
  next();
});

// Add indexes for better query performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message; 