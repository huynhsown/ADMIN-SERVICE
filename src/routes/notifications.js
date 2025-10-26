const express = require('express');
const router = express.Router();
const notificationManagementService = require('../services/notificationManagementService');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Apply authentication to all routes
router.use(verifyToken);
router.use(requireAdmin);

// Get all notifications with filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      toUserId,
      fromUserId,
      eventType,
      readFlag,
      startDate,
      endDate,
      search,
      sortBy,
      sortOrder,
      page,
      limit
    } = req.query;

    const filters = {
      toUserId,
      fromUserId,
      eventType,
      readFlag: readFlag !== undefined ? readFlag === 'true' : undefined,
      startDate,
      endDate,
      search,
      sortBy,
      sortOrder
    };

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const result = await notificationManagementService.getAllNotifications(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Get all notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get notification details
router.get('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notificationDetails = await notificationManagementService.getNotificationDetails(notificationId);
    res.json(notificationDetails);
  } catch (error) {
    console.error('Get notification details error:', error);
    if (error.message === 'Notification not found') {
      res.status(404).json({ error: 'Notification not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch notification details' });
    }
  }
});

// Delete notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const adminId = req.user.username; // Get admin ID from JWT

    const result = await notificationManagementService.deleteNotification(notificationId, adminId);
    res.json(result);
  } catch (error) {
    console.error('Delete notification error:', error);
    if (error.message === 'Notification not found') {
      res.status(404).json({ error: 'Notification not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }
});

// Mark notification as read/unread
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { readFlag } = req.body;
    const adminId = req.user.username; // Get admin ID from JWT

    if (typeof readFlag !== 'boolean') {
      return res.status(400).json({ error: 'readFlag must be a boolean value' });
    }

    const result = await notificationManagementService.markNotificationRead(notificationId, readFlag, adminId);
    res.json(result);
  } catch (error) {
    console.error('Mark notification error:', error);
    if (error.message === 'Notification not found') {
      res.status(404).json({ error: 'Notification not found' });
    } else {
      res.status(500).json({ error: 'Failed to mark notification' });
    }
  }
});

// Get notification statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await notificationManagementService.getNotificationStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Get notification statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
});

// Search notifications
router.get('/search', async (req, res) => {
  try {
    const { q, ...filters } = req.query;
    const { page, limit } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const result = await notificationManagementService.searchNotifications(q, filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Search notifications error:', error);
    res.status(500).json({ error: 'Failed to search notifications' });
  }
});

// Get notifications by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;

    const filters = { toUserId: userId };
    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const result = await notificationManagementService.getAllNotifications(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Get notifications by user error:', error);
    res.status(500).json({ error: 'Failed to fetch user notifications' });
  }
});

// Get notifications by event type
router.get('/event/:eventType', async (req, res) => {
  try {
    const { eventType } = req.params;
    const { page, limit } = req.query;

    const filters = { eventType };
    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const result = await notificationManagementService.getAllNotifications(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Get notifications by event type error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications by event type' });
  }
});

module.exports = router;
