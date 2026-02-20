const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, isAdmin: newUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = newUser._doc;
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user._doc;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/update', auth, async (req, res) => {
  try {
    const { username, email, profilePicture, coverPicture, desc, city, relationship } = req.body;
    
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (profilePicture) updateData.profilePicture = profilePicture;
    if (coverPicture) updateData.coverPicture = coverPicture;
    if (desc) updateData.desc = desc;
    if (city) updateData.city = city;
    if (relationship) updateData.relationship = relationship;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Follow user
router.put('/follow/:id', auth, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!currentUser.followings.includes(req.params.id)) {
      await currentUser.updateOne({ $push: { followings: req.params.id } });
      await userToFollow.updateOne({ $push: { followers: req.user.id } });
      res.json({ message: 'User followed successfully' });
    } else {
      res.status(400).json({ message: 'You already follow this user' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unfollow user
router.put('/unfollow/:id', auth, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.followings.includes(req.params.id)) {
      await currentUser.updateOne({ $pull: { followings: req.params.id } });
      await userToUnfollow.updateOne({ $pull: { followers: req.user.id } });
      res.json({ message: 'User unfollowed successfully' });
    } else {
      res.status(400).json({ message: 'You do not follow this user' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
