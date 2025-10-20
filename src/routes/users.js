const express = require('express');
const router = express.Router();
const userManagementService = require('../services/userManagementService');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Apply authentication to all routes
router.use(verifyToken);
router.use(requireAdmin);

// Get all users with filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      search,
      email,
      username,
      firstName,
      lastName,
      sortBy,
      sortOrder,
      page,
      limit
    } = req.query;

    const filters = {
      search,
      email,
      username,
      firstName,
      lastName,
      sortBy,
      sortOrder
    };

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const result = await userManagementService.getAllUsers(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userDetails = await userManagementService.getUserDetails(userId);
    res.json(userDetails);
  } catch (error) {
    console.error('Get user details error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch user details' });
    }
  }
});

// Get user metadata
router.get('/:userId/metadata', async (req, res) => {
  try {
    const { userId } = req.params;
    const metadata = await userManagementService.getUserMetadata(userId);
    res.json(metadata);
  } catch (error) {
    console.error('Get user metadata error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch user metadata' });
    }
  }
});

// Get batch user metadata
router.post('/metadata/batch', async (req, res) => {
  try {
    const { userIds } = req.body;
    const { query } = req.query;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    const metadata = await userManagementService.getBatchUserMetadata(userIds, query);
    res.json(metadata);
  } catch (error) {
    console.error('Get batch user metadata error:', error);
    res.status(500).json({ error: 'Failed to fetch batch user metadata' });
  }
});

// Search users
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

    const result = await userManagementService.searchUsers(q, filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get user statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await userManagementService.getUserStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get user activity
router.get('/:userId/activity', async (req, res) => {
  try {
    const { userId } = req.params;
    const activity = await userManagementService.getUserActivity(userId);
    res.json(activity);
  } catch (error) {
    console.error('Get user activity error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch user activity' });
    }
  }
});

// Export users data
router.get('/export/csv', async (req, res) => {
  try {
    const { search, email, username, firstName, lastName } = req.query;
    
    const filters = {
      search,
      email,
      username,
      firstName,
      lastName
    };

    const csvData = await userManagementService.exportUsers(filters);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csvData);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ error: 'Failed to export users data' });
  }
});

// Get users by registration date range
router.get('/by-date-range', async (req, res) => {
  try {
    const { startDate, endDate, page, limit } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const filters = {
      startDate,
      endDate
    };

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const result = await userManagementService.getAllUsers(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Get users by date range error:', error);
    res.status(500).json({ error: 'Failed to fetch users by date range' });
  }
});

// Get recent users
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const filters = {
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    const pagination = {
      page: 1,
      limit: parseInt(limit)
    };

    const result = await userManagementService.getAllUsers(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Get recent users error:', error);
    res.status(500).json({ error: 'Failed to fetch recent users' });
  }
});

// Get users with avatars
router.get('/with-avatars', async (req, res) => {
  try {
    const { page, limit } = req.query;

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    // Get all users and filter those with avatars
    const allUsers = await userManagementService.getAllUsers({}, { page: 1, limit: 10000 });
    const usersWithAvatars = allUsers.users.filter(user => user.avtUrl);

    // Apply pagination
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedUsers = usersWithAvatars.slice(startIndex, endIndex);

    res.json({
      users: paginatedUsers,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: usersWithAvatars.length,
        totalPages: Math.ceil(usersWithAvatars.length / pagination.limit),
        hasNext: pagination.page < Math.ceil(usersWithAvatars.length / pagination.limit),
        hasPrev: pagination.page > 1
      }
    });
  } catch (error) {
    console.error('Get users with avatars error:', error);
    res.status(500).json({ error: 'Failed to fetch users with avatars' });
  }
});

module.exports = router;
