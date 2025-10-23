const express = require('express');
const router = express.Router();
const Owner = require('../models/Owner');
const User = require('../models/User');
const Property = require('../models/Property');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Get all owners (admin only)
router.get('/', async (req, res) => {
  try {
    // Filter by userId if provided
    const filter = {};
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    
    const owners = await Owner.find(filter).populate('userId', 'username email');
    res.json(owners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single owner
router.get('/:id', async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id).populate('userId', 'username email');
    
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    
    res.json(owner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update owner profile (owner can update their own profile, admin can update any)
router.put('/:id', protect, restrictTo('owner', 'admin'), async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id);
    
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    
    // Check authorization - owner can only update their own profile
    if (req.user.role === 'owner' && owner.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    // Update owner profile
    const { fullName, phone, email } = req.body;
    
    const updatedOwner = await Owner.findByIdAndUpdate(
      req.params.id,
      { fullName, phone, email },
      { new: true, runValidators: true }
    );
    
    // Update corresponding user if name or email changed
    if (fullName || email) {
      const updateData = {};
      if (fullName) updateData.fullName = fullName;
      if (email) updateData.email = email;
      
      await User.findByIdAndUpdate(owner.userId, updateData);
    }
    
    res.json(updatedOwner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete owner (admin only)
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id);
    
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    
    // Delete all properties belonging to this owner
    await Property.deleteMany({ owner: owner._id });
    
    // Delete owner and associated user
    await Owner.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(owner.userId);
    
    res.json({ message: 'Owner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get owner's properties
router.get('/:id/properties', async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.params.id })
                                     .sort({ createdAt: -1 });
    
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
