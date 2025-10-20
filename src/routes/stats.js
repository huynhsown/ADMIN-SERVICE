const express = require('express');
const router = express.Router();
const statsService = require('../services/statsService');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Apply authentication to all routes
router.use(verifyToken);
router.use(requireAdmin);

// Dashboard overview
router.get('/dashboard', async (req, res) => {
  try {
    const overview = await statsService.getDashboardOverview();
    res.json(overview);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// User statistics
router.get('/users', async (req, res) => {
  try {
    const userStats = await statsService.getUserStats();
    res.json(userStats);
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Post statistics
router.get('/posts', async (req, res) => {
  try {
    const postStats = await statsService.getPostStats();
    res.json(postStats);
  } catch (error) {
    console.error('Post stats error:', error);
    res.status(500).json({ error: 'Failed to fetch post statistics' });
  }
});

// Comment statistics
router.get('/comments', async (req, res) => {
  try {
    const commentStats = await statsService.getCommentStats();
    res.json(commentStats);
  } catch (error) {
    console.error('Comment stats error:', error);
    res.status(500).json({ error: 'Failed to fetch comment statistics' });
  }
});

// Reaction statistics
router.get('/reactions', async (req, res) => {
  try {
    const reactionStats = await statsService.getReactionStats();
    res.json(reactionStats);
  } catch (error) {
    console.error('Reaction stats error:', error);
    res.status(500).json({ error: 'Failed to fetch reaction statistics' });
  }
});

// Notification statistics
router.get('/notifications', async (req, res) => {
  try {
    const notificationStats = await statsService.getNotificationStats();
    res.json(notificationStats);
  } catch (error) {
    console.error('Notification stats error:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
});

// User analytics
router.get('/users/analytics', async (req, res) => {
  try {
    const analytics = await statsService.getUserAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// System health check
router.get('/health', async (req, res) => {
  try {
    const health = await statsService.getSystemHealth();
    res.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Failed to check system health' });
  }
});

module.exports = router;
