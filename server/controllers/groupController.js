const Group = require('../models/groupModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    
    // Validate input
    if (!name || !members || !members.length) {
      return res.status(400).json({
        success: false,
        message: 'Please provide group name and members'
      });
    }
    
    // Add current user to members
    const users = [...members, req.user._id];
    
    // Create new group chat
    const groupChat = await Chat.create({
      name,
      users,
      isGroupChat: true,
      groupAdmin: req.user._id
    });
    
    // Get full group details
    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('users', '-password')
      .populate('groupAdmin', '-password');
    
    res.status(201).json({
      success: true,
      chat: fullGroupChat
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Fetch all groups for a user
exports.fetchGroups = async (req, res) => {
  try {
    // Find all group chats that the user is part of
    const groups = await Chat.find({
      isGroupChat: true,
      users: { $elemMatch: { $eq: req.user._id } }
    })
    .populate('users', '-password')
    .populate('groupAdmin', '-password')
    .populate('latestMessage')
    .sort({ updatedAt: -1 });
    
    // Populate the sender of the latest message
    const populatedGroups = await User.populate(groups, {
      path: 'latestMessage.sender',
      select: 'name avatar email'
    });
    
    res.status(200).json({
      success: true,
      groups: populatedGroups
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update group name
exports.updateGroupName = async (req, res) => {
  try {
    const { chatId, name } = req.body;
    
    // Validate input
    if (!chatId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide group ID and new name'
      });
    }
    
    // Find and update the group
    const updatedGroup = await Chat.findByIdAndUpdate(
      chatId,
      { name },
      { new: true }
    )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');
    
    // Check if group exists
    if (!updatedGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    res.status(200).json({
      success: true,
      chat: updatedGroup
    });
  } catch (error) {
    console.error('Error updating group name:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add user to group
exports.addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    
    // Validate input
    if (!chatId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide group ID and user ID'
      });
    }
    
    // Check if the requesting user is group admin
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can add members'
      });
    }
    
    // Add user to group
    const updatedGroup = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: userId } },
      { new: true }
    )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');
    
    res.status(200).json({
      success: true,
      chat: updatedGroup
    });
  } catch (error) {
    console.error('Error adding user to group:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove user from group
exports.removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    
    // Validate input
    if (!chatId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide group ID and user ID'
      });
    }
    
    // Check if the requesting user is group admin
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Only group admin can remove members (except self-removal)
    if (chat.groupAdmin.toString() !== req.user._id.toString() && 
        userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can remove members'
      });
    }
    
    // Remove user from group
    const updatedGroup = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');
    
    res.status(200).json({
      success: true,
      chat: updatedGroup
    });
  } catch (error) {
    console.error('Error removing user from group:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 