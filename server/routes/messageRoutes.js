const express = require('express');
const { protect } = require('../middleware/auth');
const {
  sendMessage,
  getAllMessages,
  markAsRead,
  deleteMessage,
  uploadFile
} = require('../controllers/messageController');

const router = express.Router();

router.use(protect);

// All routes are protected
router.route('/').post(sendMessage);
router.route('/:chatId').get(getAllMessages);
router.route('/:chatId/read').put(markAsRead);
router.route('/:messageId').delete(deleteMessage);
router.route('/upload').post(uploadFile);

module.exports = router; 