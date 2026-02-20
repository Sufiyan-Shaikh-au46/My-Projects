const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users
router.get('/all', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search users by username
router.get('/search/:username', auth, async (req, res) => {
  try {
    const users = await User.find({ 
      username: { $regex: req.params.username, $options: 'i' },
      _id: { $ne: req.user.id }
    }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get followers
router.get('/followers/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const followers = await Promise.all(
      user.followers.map(async (followerId) => {
        const user = await User.findById(followerId).select('-password');
        return user;
      })
    );
    res.json(followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get followings
router.get('/followings/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const followings = await Promise.all(
      user.followings.map(async (followingId) => {
        const user = await User.findById(followingId).select('-password');
        return user;
      })
    );
    res.json(followings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
