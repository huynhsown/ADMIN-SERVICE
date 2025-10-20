const express = require('express');
const router = express.Router();
const roleManagementService = require('../services/roleManagementService');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Apply authentication to all routes
router.use(verifyToken);
router.use(requireAdmin);

// Get user roles
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const roles = await roleManagementService.getUserRoles(userId);
    res.json({ roles });
  } catch (error) {
    console.error('Get user roles error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch user roles' });
    }
  }
});

// Assign role to user
router.post('/assign', async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }

    await roleManagementService.assignRoleToUser(userId, role);
    res.json({ message: 'Role assigned successfully' });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ error: 'Failed to assign role' });
  }
});

// Remove role from user
router.post('/remove', async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }

    await roleManagementService.removeRoleFromUser(userId, role);
    res.json({ message: 'Role removed successfully' });
  } catch (error) {
    console.error('Remove role error:', error);
    res.status(500).json({ error: 'Failed to remove role' });
  }
});

// Get available roles
router.get('/available', async (req, res) => {
  try {
    const roles = await roleManagementService.getAvailableRoles();
    res.json({ roles });
  } catch (error) {
    console.error('Get available roles error:', error);
    res.status(500).json({ error: 'Failed to fetch available roles' });
  }
});

// Get role statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await roleManagementService.getRoleStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Get role statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch role statistics' });
  }
});

// Activate user
router.post('/user/:userId/activate', async (req, res) => {
  try {
    const { userId } = req.params;
    await roleManagementService.activateUser(userId);
    res.json({ message: 'User activated successfully' });
  } catch (error) {
    console.error('Activate user error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to activate user' });
    }
  }
});

// Deactivate user
router.post('/user/:userId/deactivate', async (req, res) => {
  try {
    const { userId } = req.params;
    await roleManagementService.deactivateUser(userId);
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to deactivate user' });
    }
  }
});

// Get user status
router.get('/user/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const status = await roleManagementService.getUserStatus(userId);
    res.json(status);
  } catch (error) {
    console.error('Get user status error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch user status' });
    }
  }
});

module.exports = router;
