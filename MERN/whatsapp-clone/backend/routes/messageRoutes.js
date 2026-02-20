const router = require('express').Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { conversationId, text, image } = req.body;

    const newMessage = new Message({
      conversationId,
      sender: req.user.id,
      text,
      image
    });

    const savedMessage = await newMessage.save();

    // Update conversation with latest message
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { lastMessage: savedMessage._id }
    });

    res.json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages by conversation ID
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ 
      conversationId: req.params.conversationId 
    })
    .populate('sender', 'username profilePicture')
    .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as seen
router.put('/seen/:conversationId', auth, async (req, res) => {
  try {
    await Message.updateMany(
      { 
        conversationId: req.params.conversationId,
        sender: { $ne: req.user.id },
        seen: false 
      },
      { $set: { seen: true } }
    );
    
    res.json({ message: 'Messages marked as seen' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(401).json({ message: 'You can only delete your own messages' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
