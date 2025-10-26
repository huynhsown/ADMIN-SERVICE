const { pgPool, cassandraClient, redisClient } = require('../config/database');
const CassandraHelper = require('../utils/cassandraHelper');

class PostManagementService {
  // Get all posts with pagination and filters
  async getAllPosts(filters = {}, pagination = {}) {
    try {

      const {
        authorId,
        type,
        visibility,
        startDate,
        endDate,
        search,
        delete_flag,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = filters;

      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM sme_posts';
      const params = [];

      // Handle delete_flag filter
      if (delete_flag === undefined) {
        // Show all posts (both active and deleted) - remove WHERE clause entirely
        query += '';
      } else {
        query += ' WHERE delete_flag = ?';
        params.push(delete_flag);
      }

      // Build WHERE clause
      let hasWhereClause = delete_flag !== undefined;
      
      if (authorId) {
        query += hasWhereClause ? ' AND author_id = ?' : ' WHERE author_id = ?';
        params.push(authorId);
        hasWhereClause = true;
      }

      if (type) {
        query += hasWhereClause ? ' AND type = ?' : ' WHERE type = ?';
        params.push(type);
        hasWhereClause = true;
      }

      if (visibility) {
        query += hasWhereClause ? ' AND visibility = ?' : ' WHERE visibility = ?';
        params.push(visibility);
        hasWhereClause = true;
      }

      if (startDate) {
        query += hasWhereClause ? ' AND created_at >= ?' : ' WHERE created_at >= ?';
        params.push(new Date(startDate));
        hasWhereClause = true;
      }

      if (endDate) {
        query += hasWhereClause ? ' AND created_at <= ?' : ' WHERE created_at <= ?';
        params.push(new Date(endDate));
        hasWhereClause = true;
      }

      // Add ALLOW FILTERING for complex queries
      query += ' ALLOW FILTERING';

      // Execute query
      const result = await CassandraHelper.executeInPostKeyspace(query, params);
      
      // Sort in application (Cassandra doesn't support ORDER BY on non-partition keys)
      let posts = result.rows;
      
      // Apply search filter at application level
      if (search) {
        posts = posts.filter(post => 
          post.content && post.content.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (sortBy === 'created_at') {
        posts = posts.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
        });
      }

      // Pagination
      const total = posts.length;
      const paginatedPosts = posts.slice(offset, offset + limit);

      // Get author information for each post
      const postsWithAuthors = await Promise.all(
        paginatedPosts.map(async (post) => {
          try {
            // Convert UUID object to string for PostgreSQL query
            const authorIdString = post.author_id.toString();
            
            const authorResult = await pgPool.query(
              'SELECT "userId", username, "firstName", "lastName", email, "avtUrl" FROM "User" WHERE "userId" = $1',
              [authorIdString]
            );
            
            return {
              ...post,
              author: authorResult.rows[0] || null
            };
          } catch (error) {
            console.error('Error fetching author info for', post.author_id, ':', error);
            return {
              ...post,
              author: null
            };
          }
        })
      );

      return {
        posts: postsWithAuthors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all posts:', error);
      throw error;
    }
  }

  // Get post details with full information
  async getPostDetails(postId) {
    try {
      // Get post
      const postResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT * FROM sme_posts WHERE post_id = ?',
        [postId]
      );

      if (postResult.rows.length === 0) {
        throw new Error('Post not found');
      }

      const post = postResult.rows[0];

      // Get author information
      let author = null;
      try {
        // Convert UUID object to string for PostgreSQL query
        const authorIdString = post.author_id.toString();
        
        const authorResult = await pgPool.query(
          'SELECT "userId", username, "firstName", "lastName", email, "avtUrl", "createdAt" FROM "User" WHERE "userId" = $1',
          [authorIdString]
        );
        author = authorResult.rows[0] || null;
      } catch (error) {
        console.error('Error fetching author info:', error);
      }

      // Get media
      const mediaResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT * FROM sme_post_media WHERE post_id = ?',
        [postId]
      );

      // Get mentions
      const mentionsResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT * FROM sme_post_mentions WHERE post_id = ?',
        [postId]
      );

      // Get hashtags - need to use ALLOW FILTERING since we're querying by post_id only
      const hashtagsResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT * FROM sme_posts_by_hashtag WHERE post_id = ? ALLOW FILTERING',
        [postId]
      );

      // Get comments count
      const commentsResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT COUNT(*) as count FROM sme_comments_by_post WHERE post_id = ?',
        [postId]
      );

      // Get reactions count (from reaction service)
      let reactions = { total: 0, byType: {} };
      try {
        await cassandraClient.execute(`USE ${process.env.CASSANDRA_KEYSPACE_REACTION || 'sme_reaction_keyspace'}`);
        const reactionsResult = await cassandraClient.execute(
          'SELECT COUNT(*) as total FROM sme_reactions WHERE target_id = ? AND target_type = ?',
          [postId, 'post']
        );
        reactions.total = parseInt(reactionsResult.rows[0].total);
      } catch (error) {
        console.error('Error fetching reactions:', error);
      }

      return {
        ...post,
        author,
        media: mediaResult.rows,
        mentions: mentionsResult.rows,
        hashtags: hashtagsResult.rows,
        commentsCount: parseInt(commentsResult.rows[0].count),
        reactions
      };
    } catch (error) {
      console.error('Error getting post details:', error);
      throw error;
    }
  }

  // Get comments for a post
  async getPostComments(postId, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      // Get comments
      const commentsResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT * FROM sme_comments_by_post WHERE post_id = ? ORDER BY created_at ASC',
        [postId]
      );

      const total = commentsResult.rows.length;
      const paginatedComments = commentsResult.rows.slice(offset, offset + limit);

      // Get author information for each comment
      const commentsWithAuthors = await Promise.all(
        paginatedComments.map(async (comment) => {
          try {
            const authorResult = await pgPool.query(
              'SELECT "userId", username, "firstName", "lastName", "avtUrl" FROM "User" WHERE "userId" = $1',
              [comment.author_id.toString()]
            );
            
            return {
              ...comment,
              author: authorResult.rows[0] || null
            };
          } catch (error) {
            console.error('Error fetching comment author info:', error);
            return {
              ...comment,
              author: null
            };
          }
        })
      );

      return {
        comments: commentsWithAuthors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting post comments:', error);
      throw error;
    }
  }

  // Delete post (soft delete)
  async deletePost(postId, adminId) {
    try {
      // Update post delete_flag
      await CassandraHelper.executeInPostKeyspace(
        'UPDATE sme_posts SET delete_flag = true, updated_at = ? WHERE post_id = ?',
        [new Date(), postId]
      );

      // Update post_by_author delete_flag
      const postResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT author_id, created_at FROM sme_posts WHERE post_id = ?',
        [postId]
      );

      if (postResult.rows.length > 0) {
        const post = postResult.rows[0];
        await CassandraHelper.executeInPostKeyspace(
          'UPDATE sme_posts_by_author SET delete_flag = true, updated_at = ? WHERE author_id = ? AND created_at = ? AND post_id = ?',
          [new Date(), post.author_id, post.created_at, postId]
        );
      }

      // Log admin action
      console.log(`Admin ${adminId} deleted post ${postId}`);

      return { success: true, message: 'Post deleted successfully' };
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Restore post
  async restorePost(postId, adminId) {
    try {
      // Update post delete_flag
      await CassandraHelper.executeInPostKeyspace(
        'UPDATE sme_posts SET delete_flag = false, updated_at = ? WHERE post_id = ?',
        [new Date(), postId]
      );

      // Update post_by_author delete_flag
      const postResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT author_id, created_at FROM sme_posts WHERE post_id = ?',
        [postId]
      );

      if (postResult.rows.length > 0) {
        const post = postResult.rows[0];
        await CassandraHelper.executeInPostKeyspace(
          'UPDATE sme_posts_by_author SET delete_flag = false, updated_at = ? WHERE author_id = ? AND created_at = ? AND post_id = ?',
          [new Date(), post.author_id, post.created_at, postId]
        );
      }

      // Log admin action
      console.log(`Admin ${adminId} restored post ${postId}`);

      return { success: true, message: 'Post restored successfully' };
    } catch (error) {
      console.error('Error restoring post:', error);
      throw error;
    }
  }

  // Delete comment
  async deleteComment(commentId, adminId) {
    try {
      // Update comment delete_flag
      await CassandraHelper.executeInPostKeyspace(
        'UPDATE sme_comments SET delete_flag = true, updated_at = ? WHERE comment_id = ?',
        [new Date(), commentId]
      );

      // Update comment_by_post delete_flag
      const commentResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT post_id, created_at FROM sme_comments WHERE comment_id = ?',
        [commentId]
      );

      if (commentResult.rows.length > 0) {
        const comment = commentResult.rows[0];
        await CassandraHelper.executeInPostKeyspace(
          'UPDATE sme_comments_by_post SET delete_flag = true, updated_at = ? WHERE post_id = ? AND created_at = ? AND comment_id = ?',
          [new Date(), comment.post_id, comment.created_at, commentId]
        );
      }

      // Log admin action
      console.log(`Admin ${adminId} deleted comment ${commentId}`);

      return { success: true, message: 'Comment deleted successfully' };
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Get post statistics for admin
  async getPostStatistics() {
    try {
      // Total posts
      const totalPostsResult = await CassandraHelper.executeInPostKeyspace('SELECT COUNT(*) as total FROM sme_posts');
      const totalPosts = parseInt(totalPostsResult.rows[0].total);

      // Active posts (not deleted)
      const activePostsResult = await CassandraHelper.executeInPostKeyspace('SELECT COUNT(*) as active FROM sme_posts WHERE delete_flag = false');
      const activePosts = parseInt(activePostsResult.rows[0].active);

      // Deleted posts
      const deletedPostsResult = await CassandraHelper.executeInPostKeyspace('SELECT COUNT(*) as deleted FROM sme_posts WHERE delete_flag = true');
      const deletedPosts = parseInt(deletedPostsResult.rows[0].deleted);

      // Posts by type
      const allPostsResult = await CassandraHelper.executeInPostKeyspace('SELECT type FROM sme_posts');
      const postsByType = {};
      allPostsResult.rows.forEach(row => {
        const type = row.type || 'unknown';
        postsByType[type] = (postsByType[type] || 0) + 1;
      });

      // Posts by visibility
      const allPostsVisibilityResult = await CassandraHelper.executeInPostKeyspace('SELECT visibility FROM sme_posts');
      const postsByVisibility = {};
      allPostsVisibilityResult.rows.forEach(row => {
        const visibility = row.visibility || 'unknown';
        postsByVisibility[visibility] = (postsByVisibility[visibility] || 0) + 1;
      });

      // Posts created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayPostsResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT COUNT(*) as today FROM sme_posts WHERE created_at >= ? ALLOW FILTERING',
        [today]
      );
      const todayPosts = parseInt(todayPostsResult.rows[0].today);

      // Posts created this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekPostsResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT COUNT(*) as week FROM sme_posts WHERE created_at >= ? ALLOW FILTERING',
        [weekAgo]
      );
      const weekPosts = parseInt(weekPostsResult.rows[0].week);

      // Posts created this month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthPostsResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT COUNT(*) as month FROM sme_posts WHERE created_at >= ? ALLOW FILTERING',
        [monthAgo]
      );
      const monthPosts = parseInt(monthPostsResult.rows[0].month);

      // Top authors by post count
      const allPostsAuthorResult = await CassandraHelper.executeInPostKeyspace('SELECT author_id FROM sme_posts WHERE delete_flag = false');
      const authorPostCounts = {};
      allPostsAuthorResult.rows.forEach(row => {
        const authorId = row.author_id;
        authorPostCounts[authorId] = (authorPostCounts[authorId] || 0) + 1;
      });

      const topAuthors = Object.entries(authorPostCounts)
        .map(([authorId, count]) => ({ authorId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        total: totalPosts,
        active: activePosts,
        deleted: deletedPosts,
        byType: postsByType,
        byVisibility: postsByVisibility,
        today: todayPosts,
        week: weekPosts,
        month: monthPosts,
        topAuthors
      };
    } catch (error) {
      console.error('Error getting post statistics:', error);
      throw error;
    }
  }

  // Search posts
  async searchPosts(query, filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      // Get all posts and filter at application level
      const allPostsResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT * FROM sme_posts WHERE delete_flag = false ALLOW FILTERING'
      );

      // Apply search filter at application level
      const searchResult = allPostsResult.rows.filter(post => 
        post.content && post.content.toLowerCase().includes(query.toLowerCase())
      );

      // Sort by relevance (simple: by created_at for now)
      const sortedPosts = searchResult.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Pagination
      const total = sortedPosts.length;
      const paginatedPosts = sortedPosts.slice(offset, offset + limit);

      // Get author information
      const postsWithAuthors = await Promise.all(
        paginatedPosts.map(async (post) => {
          try {
            const authorResult = await pgPool.query(
              'SELECT "userId", username, "firstName", "lastName", "avtUrl" FROM "User" WHERE "userId" = $1',
              [post.author_id.toString()]
            );
            
            return {
              ...post,
              author: authorResult.rows[0] || null
            };
          } catch (error) {
            return {
              ...post,
              author: null
            };
          }
        })
      );

      return {
        posts: postsWithAuthors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        query
      };
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }

  // Get posts by hashtag
  async getPostsByHashtag(hashtag, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      // Get posts by hashtag
      const hashtagResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT post_id, author_id, created_at FROM sme_posts_by_hashtag WHERE tag = ? ORDER BY created_at DESC',
        [hashtag]
      );

      const total = hashtagResult.rows.length;
      const paginatedHashtags = hashtagResult.rows.slice(offset, offset + limit);

      // Get full post details
      const posts = await Promise.all(
        paginatedHashtags.map(async (hashtagRow) => {
          try {
            const postResult = await CassandraHelper.executeInPostKeyspace(
              'SELECT * FROM sme_posts WHERE post_id = ?',
              [hashtagRow.post_id]
            );

            if (postResult.rows.length === 0) return null;

            const post = postResult.rows[0];

            // Get author info
            const authorResult = await pgPool.query(
              'SELECT "userId", username, "firstName", "lastName", "avtUrl" FROM "User" WHERE "userId" = $1',
              [post.author_id.toString()]
            );

            return {
              ...post,
              author: authorResult.rows[0] || null
            };
          } catch (error) {
            console.error('Error fetching post details:', error);
            return null;
          }
        })
      );

      // Filter out null results
      const validPosts = posts.filter(post => post !== null);

      return {
        posts: validPosts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        hashtag
      };
    } catch (error) {
      console.error('Error getting posts by hashtag:', error);
      throw error;
    }
  }

  // Get trending hashtags
  async getTrendingHashtags() {
    try {
      // Get all hashtags
      const hashtagsResult = await CassandraHelper.executeInPostKeyspace('SELECT tag FROM sme_hashtags');
      
      const hashtagCounts = {};
      for (const row of hashtagsResult.rows) {
        const tag = row.tag;
        const countResult = await CassandraHelper.executeInPostKeyspace(
          'SELECT COUNT(*) as count FROM sme_posts_by_hashtag WHERE tag = ?',
          [tag]
        );
        hashtagCounts[tag] = parseInt(countResult.rows[0].count);
      }

      // Sort by count and get top 20
      const trendingHashtags = Object.entries(hashtagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      return { hashtags: trendingHashtags };
    } catch (error) {
      console.error('Error getting trending hashtags:', error);
      throw error;
    }
  }
}

module.exports = new PostManagementService();
