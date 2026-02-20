const router = require('express').Router();
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');

// Create new conversation
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, groupName, groupAdmin, isGroup, groupPicture } = req.body;

    // Check if conversation already exists (for one-on-one)
    if (!isGroup) {
      const existingConversation = await Conversation.findOne({
        members: { $all: [req.user.id, receiverId] },
        isGroup: false
      });

      if (existingConversation) {
        return res.json(existingConversation);
      }
    }

    const newConversation = new Conversation({
      members: isGroup ? req.body.members : [req.user.id, receiverId],
      groupName,
      groupAdmin,
      isGroup: isGroup || false,
      groupPicture: groupPicture || ''
    });

    const savedConversation = await newConversation.save();
    res.json(savedConversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get conversations of a user
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.user.id] }
    })
    .populate('members', 'username profilePicture')
    .populate('groupAdmin', 'username profilePicture')
    .sort({ updatedAt: -1 });
    
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get conversation by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('members', 'username profilePicture')
      .populate('groupAdmin', 'username profilePicture');
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update group
router.put('/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'This is not a group conversation' });
    }

    if (conversation.groupAdmin.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only group admin can update the group' });
    }

    const { groupName, groupPicture } = req.body;
    const updateData = {};
    if (groupName) updateData.groupName = groupName;
    if (groupPicture) updateData.groupPicture = groupPicture;

    const updatedConversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json(updatedConversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add member to group
router.put('/:id/add', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'This is not a group conversation' });
    }

    if (conversation.groupAdmin.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only group admin can add members' });
    }

    const { userId } = req.body;
    
    if (conversation.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already in the group' });
    }

    await conversation.updateOne({ $push: { members: userId } });
    res.json({ message: 'User added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove member from group
router.put('/:id/remove', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'This is not a group conversation' });
    }

    if (conversation.groupAdmin.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only group admin can remove members' });
    }

    const { userId } = req.body;
    
    if (!conversation.members.includes(userId)) {
      return res.status(400).json({ message: 'User is not in the group' });
    }

    await conversation.updateOne({ $pull: { members: userId } });
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leave group
router.put('/:id/leave', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isGroup) {
      return res.status(400).json({ message: 'This is not a group conversation' });
    }

    if (!conversation.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are not in this group' });
    }

    // If the admin is leaving, assign a new admin
    if (conversation.groupAdmin.toString() === req.user.id) {
      const newAdmin = conversation.members.find(m => m.toString() !== req.user.id);
      if (newAdmin) {
        conversation.groupAdmin = newAdmin;
        await conversation.save();
      }
    }

    await conversation.updateOne({ $pull: { members: req.user.id } });
    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete conversation
router.delete('/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // For groups, only admin can delete
    if (conversation.isGroup && conversation.groupAdmin.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only group admin can delete the group' });
    }

    // For one-on-one, either member can delete
    if (!conversation.isGroup && !conversation.members.includes(req.user.id)) {
      return res.status(401).json({ message: 'You are not in this conversation' });
    }

    await conversation.deleteOne();
    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
