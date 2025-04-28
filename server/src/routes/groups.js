const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for group icon uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/groups');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// Create new group
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    const { memberIds } = req.body;

    const group = new Group({
      name,
      description,
      creator: req.user._id,
      admins: [req.user._id],
      settings: { isPrivate }
    });

    // Add creator as first member
    await group.addMember(req.user._id, 'admin');

    // Add other members if provided
    if (memberIds && memberIds.length > 0) {
      for (const memberId of memberIds) {
        await group.addMember(memberId);
      }
    }

    await group.save();

    // Emit socket event for real-time updates
    req.app.get('io').emit('newGroup', { group });

    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all groups for current user
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user._id
    })
    .populate('creator', 'username profilePicture')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific group
router.get('/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('creator', 'username profilePicture')
      .populate('members.user', 'username profilePicture isOnline lastSeen')
      .populate('lastMessage');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is member
    if (!group.members.some(member => member.user._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update group
router.patch('/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update group' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'settings'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => {
      if (update === 'settings') {
        Object.keys(req.body.settings).forEach(key => {
          group.settings[key] = req.body.settings[key];
        });
      } else {
        group[update] = req.body[update];
      }
    });

    await group.save();

    // Emit socket event for real-time updates
    req.app.get('io').to(req.params.groupId).emit('groupUpdated', { group });

    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update group icon
router.post('/:groupId/icon', auth, upload.single('icon'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update group icon' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    group.icon = req.file.path;
    await group.save();

    // Emit socket event for real-time updates
    req.app.get('io').to(req.params.groupId).emit('groupIconUpdated', { icon: group.icon });

    res.json({ icon: group.icon });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add members to group
router.post('/:groupId/members', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to add members' });
    }

    const { memberIds } = req.body;
    const addedMembers = [];

    for (const memberId of memberIds) {
      const user = await User.findById(memberId);
      if (!user) {
        continue;
      }

      const added = await group.addMember(memberId);
      if (added) {
        addedMembers.push(user);
      }
    }

    // Emit socket event for real-time updates
    req.app.get('io').to(req.params.groupId).emit('membersAdded', { members: addedMembers });

    res.json({ message: 'Members added successfully', addedMembers });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove member from group
router.delete('/:groupId/members/:memberId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to remove members' });
    }

    // Cannot remove creator
    if (group.creator.toString() === req.params.memberId) {
      return res.status(400).json({ message: 'Cannot remove group creator' });
    }

    await group.removeMember(req.params.memberId);

    // Emit socket event for real-time updates
    req.app.get('io').to(req.params.groupId).emit('memberRemoved', { memberId: req.params.memberId });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update member role
router.patch('/:groupId/members/:memberId/role', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update member roles' });
    }

    const { role } = req.body;
    if (!['member', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updated = await group.updateMemberRole(req.params.memberId, role);
    if (!updated) {
      return res.status(404).json({ message: 'Member not found in group' });
    }

    // Emit socket event for real-time updates
    req.app.get('io').to(req.params.groupId).emit('memberRoleUpdated', {
      memberId: req.params.memberId,
      role
    });

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leave group
router.post('/:groupId/leave', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Cannot leave if creator
    if (group.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Group creator cannot leave the group' });
    }

    await group.removeMember(req.user._id);

    // Emit socket event for real-time updates
    req.app.get('io').to(req.params.groupId).emit('memberLeft', {
      memberId: req.user._id
    });

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 