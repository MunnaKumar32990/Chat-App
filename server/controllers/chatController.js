const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

// @desc    Create or access one-on-one chat
// @route   POST /api/chats
// @access  Private
const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId param not sent with request"
      });
    }

    let chat = await Chat.findOne({
      isGroupChat: false,
      users: {
        $all: [req.user._id, userId],
        $size: 2
      }
    })
    .populate("users", "-password")
    .populate("latestMessage");

    if (chat) {
      return res.json({
        success: true,
        chat
      });
    }

    // Create new chat
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    chat = await Chat.create(chatData);
    chat = await Chat.findById(chat._id).populate("users", "-password");

    res.status(201).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Access chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accessing chat'
    });
  }
};

// @desc    Get all chats for a user
// @route   GET /api/chats
// @access  Private
const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } }
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      chats
    });
  } catch (error) {
    console.error('Fetch chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chats'
    });
  }
};

// @desc    Create group chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = async (req, res) => {
  try {
    if (!req.body.users || !req.body.name) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields"
      });
    }

    let users = JSON.parse(req.body.users);

    if (users.length < 2) {
      return res.status(400).json({
        success: false,
        message: "More than 2 users are required to form a group chat"
      });
    }

    users.push(req.user._id);

    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json({
      success: true,
      chat: fullGroupChat
    });
  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating group chat'
    });
  }
};

// @desc    Rename group chat
// @route   PUT /api/chats/group/:chatId
// @access  Private
const renameGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    res.json({
      success: true,
      chat: updatedChat
    });
  } catch (error) {
    console.error('Rename group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error renaming group'
    });
  }
};

// @desc    Add user to group
// @route   PUT /api/chats/group/:chatId/add
// @access  Private
const addToGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    res.json({
      success: true,
      chat: added
    });
  } catch (error) {
    console.error('Add to group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding user to group'
    });
  }
};

// @desc    Remove user from group
// @route   PUT /api/chats/group/:chatId/remove
// @access  Private
const removeFromGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    res.json({
      success: true,
      chat: removed
    });
  } catch (error) {
    console.error('Remove from group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing user from group'
    });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
}; 