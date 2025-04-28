const express = require('express');
const { protect } = require('../middleware/auth');
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require('../controllers/chatController');

const router = express.Router();

router.use(protect);

router.route('/').post(accessChat);
router.route('/').get(fetchChats);
router.route('/group').post(createGroupChat);
router.route('/group/:chatId').put(renameGroup);
router.route('/group/:chatId/add').put(addToGroup);
router.route('/group/:chatId/remove').put(removeFromGroup);

module.exports = router; 