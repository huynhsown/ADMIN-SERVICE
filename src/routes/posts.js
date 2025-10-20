const express = require('express');
const router = express.Router();
const postManagementService = require('../services/postManagementService');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Apply authentication to all routes
router.use(verifyToken);
router.use(requireAdmin);

// Get all posts with filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      authorId,
      type,
      visibility,
      startDate,
      endDate,
      search,
      sortBy,
      sortOrder,
      page,
      limit
    } = req.query;

    const filters = {
      authorId,
      type,
      visibility,
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

    const result = await postManagementService.getAllPosts(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get post details
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const postDetails = await postManagementService.getPostDetails(postId);
    res.json(postDetails);
  } catch (error) {
    console.error('Get post details error:', error);
    if (error.message === 'Post not found') {
      res.status(404).json({ error: 'Post not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch post details' });
    }
  }
});

// Get post comments
router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { page, limit } = req.query;

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const result = await postManagementService.getPostComments(postId, pagination);
    res.json(result);
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({ error: 'Failed to fetch post comments' });
  }
});

// Delete post (soft delete)
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const adminId = req.user.username; // Get admin ID from JWT

    const result = await postManagementService.deletePost(postId, adminId);
    res.json(result);
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Restore post
router.patch('/:postId/restore', async (req, res) => {
  try {
    const { postId } = req.params;
    const adminId = req.user.username; // Get admin ID from JWT

    const result = await postManagementService.restorePost(postId, adminId);
    res.json(result);
  } catch (error) {
    console.error('Restore post error:', error);
    res.status(500).json({ error: 'Failed to restore post' });
  }
});

// Delete comment
router.delete('/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const adminId = req.user.username; // Get admin ID from JWT

    const result = await postManagementService.deleteComment(commentId, adminId);
    res.json(result);
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Get post statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await postManagementService.getPostStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Get post statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch post statistics' });
  }
});

// Search posts
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

    const result = await postManagementService.searchPosts(q, filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

// Get posts by hashtag
router.get('/hashtag/:hashtag', async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { page, limit } = req.query;

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const result = await postManagementService.getPostsByHashtag(hashtag, pagination);
    res.json(result);
  } catch (error) {
    console.error('Get posts by hashtag error:', error);
    res.status(500).json({ error: 'Failed to fetch posts by hashtag' });
  }
});

// Get trending hashtags
router.get('/hashtags/trending', async (req, res) => {
  try {
    const result = await postManagementService.getTrendingHashtags();
    res.json(result);
  } catch (error) {
    console.error('Get trending hashtags error:', error);
    res.status(500).json({ error: 'Failed to fetch trending hashtags' });
  }
});

// Get posts by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;

    const filters = { authorId: userId };
    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const result = await postManagementService.getAllPosts(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Get posts by user error:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Get posts by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { page, limit } = req.query;

    const filters = { type };
    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const result = await postManagementService.getAllPosts(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Get posts by type error:', error);
    res.status(500).json({ error: 'Failed to fetch posts by type' });
  }
});

module.exports = router;
