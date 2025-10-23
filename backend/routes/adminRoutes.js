const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const Owner = require('../models/Owner');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(protect, restrictTo('admin'));

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const propertiesCount = await Property.countDocuments();
    const usersCount = await User.countDocuments({ role: 'user' });
    const ownersCount = await Owner.countDocuments();
    const featuredPropertiesCount = await Property.countDocuments({ featured: true });
    
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('owner', 'fullName');
    
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');
    
    res.json({
      stats: {
        properties: propertiesCount,
        users: usersCount,
        owners: ownersCount,
        featured: featuredPropertiesCount
      },
      recentProperties,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User management - Get all users
router.get('/users', async (req, res) => {
  try {
    const role = req.query.role || 'user';
    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User management - Get a user
router.get('/users/:id', async (req, res) => {
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

// User management - Update a user
router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, fullName, role } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    user.username = username || user.username;
    user.email = email || user.email;
    user.fullName = fullName || user.fullName;
    
    // Only update role if provided and different
    if (role && role !== user.role) {
      // If changing to/from owner role, create/delete owner profile
      if (role === 'owner' && user.role !== 'owner') {
        // Create owner profile
        await Owner.create({
          userId: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: req.body.phone || '000-000-0000' // Default phone if not provided
        });
      } else if (user.role === 'owner' && role !== 'owner') {
        // Delete owner profile and associated properties
        const owner = await Owner.findOne({ userId: user._id });
        if (owner) {
          await Property.deleteMany({ owner: owner._id });
          await Owner.deleteOne({ _id: owner._id });
        }
      }
      
      user.role = role;
    }
    
    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    await user.save();
    
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// User management - Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user is an owner, delete owner profile and properties
    if (user.role === 'owner') {
      const owner = await Owner.findOne({ userId: user._id });
      if (owner) {
        await Property.deleteMany({ owner: owner._id });
        await Owner.deleteOne({ _id: owner._id });
      }
    }
    
    // Delete user
    await User.deleteOne({ _id: user._id });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Feature or unfeature a property
router.patch('/properties/:id/feature', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Toggle featured status
    property.featured = !property.featured;
    await property.save();
    
    res.json({
      id: property._id,
      featured: property.featured,
      message: `Property ${property.featured ? 'featured' : 'unfeatured'} successfully`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
