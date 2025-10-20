const { pgPool, cassandraClient, neo4jDriver, redisClient } = require('../config/database');
const CassandraHelper = require('../utils/cassandraHelper');

class StatsService {
  // User Statistics
  async getUserStats() {
    try {
      const client = await pgPool.connect();
      
      // Total users
      const totalUsersResult = await client.query('SELECT COUNT(*) as total FROM "User"');
      const totalUsers = parseInt(totalUsersResult.rows[0].total);

      // Users created today
      const todayUsersResult = await client.query(`
        SELECT COUNT(*) as today 
        FROM "User" 
        WHERE DATE("createdAt") = CURRENT_DATE
      `);
      const todayUsers = parseInt(todayUsersResult.rows[0].today);

      // Users created this week
      const weekUsersResult = await client.query(`
        SELECT COUNT(*) as week 
        FROM "User" 
        WHERE "createdAt" >= CURRENT_DATE - INTERVAL '7 days'
      `);
      const weekUsers = parseInt(weekUsersResult.rows[0].week);

      // Users created this month
      const monthUsersResult = await client.query(`
        SELECT COUNT(*) as month 
        FROM "User" 
        WHERE "createdAt" >= DATE_TRUNC('month', CURRENT_DATE)
      `);
      const monthUsers = parseInt(monthUsersResult.rows[0].month);

      // Recent users (last 10)
      const recentUsersResult = await client.query(`
        SELECT "userId", username, "firstName", "lastName", email, "createdAt"
        FROM "User"
        ORDER BY "createdAt" DESC
        LIMIT 10
      `);

      client.release();

      return {
        total: totalUsers,
        today: todayUsers,
        week: weekUsers,
        month: monthUsers,
        recent: recentUsersResult.rows
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Post Statistics
  async getPostStats() {
    try {
      // Total posts
      const totalPostsResult = await CassandraHelper.executeInPostKeyspace('SELECT COUNT(*) as total FROM sme_posts');
      const totalPosts = parseInt(totalPostsResult.rows[0].total);

      // Posts today - using ALLOW FILTERING for Cassandra
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayPostsResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT COUNT(*) as today FROM sme_posts WHERE created_at >= ? ALLOW FILTERING',
        [today]
      );
      const todayPosts = parseInt(todayPostsResult.rows[0].today);

      // Posts this week - using ALLOW FILTERING for Cassandra
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekPostsResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT COUNT(*) as week FROM sme_posts WHERE created_at >= ? ALLOW FILTERING',
        [weekAgo]
      );
      const weekPosts = parseInt(weekPostsResult.rows[0].week);

      // Posts by type - Get all posts and group in application
      const allPostsResult = await CassandraHelper.executeInPostKeyspace(`
        SELECT type FROM sme_posts
      `);
      
      // Group by type in application
      const postsByType = {};
      allPostsResult.rows.forEach(row => {
        const type = row.type || 'unknown';
        postsByType[type] = (postsByType[type] || 0) + 1;
      });
      
      const postsByTypeResult = {
        rows: Object.entries(postsByType).map(([type, count]) => ({ type, count }))
      };

      // Recent posts - Get all posts and sort in application
      const allPostsForRecentResult = await CassandraHelper.executeInPostKeyspace(`
        SELECT post_id, author_id, type, content, created_at
        FROM sme_posts
      `);
      
      // Sort by created_at in application and get top 10
      const recentPostsResult = {
        rows: allPostsForRecentResult.rows
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
      };

      return {
        total: totalPosts,
        today: todayPosts,
        week: weekPosts,
        byType: postsByTypeResult.rows,
        recent: recentPostsResult.rows
      };
    } catch (error) {
      console.error('Error getting post stats:', error);
      // Return default values if tables don't exist
      return {
        total: 0,
        today: 0,
        week: 0,
        byType: [],
        recent: []
      };
    }
  }

  // Comment Statistics
  async getCommentStats() {
    try {
      // Total comments
      const totalCommentsResult = await CassandraHelper.executeInPostKeyspace('SELECT COUNT(*) as total FROM sme_comments');
      const totalComments = parseInt(totalCommentsResult.rows[0].total);

      // Comments today - using ALLOW FILTERING for Cassandra
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCommentsResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT COUNT(*) as today FROM sme_comments WHERE created_at >= ? ALLOW FILTERING',
        [today]
      );
      const todayComments = parseInt(todayCommentsResult.rows[0].today);

      // Comments this week - using ALLOW FILTERING for Cassandra
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekCommentsResult = await CassandraHelper.executeInPostKeyspace(
        'SELECT COUNT(*) as week FROM sme_comments WHERE created_at >= ? ALLOW FILTERING',
        [weekAgo]
      );
      const weekComments = parseInt(weekCommentsResult.rows[0].week);

      // Comments by post (top 10 most commented posts) - Get all and group in application
      const allCommentsResult = await CassandraHelper.executeInPostKeyspace(`
        SELECT post_id FROM sme_comments_by_post
      `);
      
      // Group by post_id in application
      const commentsByPost = {};
      allCommentsResult.rows.forEach(row => {
        const postId = row.post_id;
        commentsByPost[postId] = (commentsByPost[postId] || 0) + 1;
      });
      
      // Sort and get top 10
      const topCommentedPostsResult = {
        rows: Object.entries(commentsByPost)
          .map(([post_id, comment_count]) => ({ post_id, comment_count }))
          .sort((a, b) => b.comment_count - a.comment_count)
          .slice(0, 10)
      };

      return {
        total: totalComments,
        today: todayComments,
        week: weekComments,
        topCommentedPosts: topCommentedPostsResult.rows
      };
    } catch (error) {
      console.error('Error getting comment stats:', error);
      // Return default values if tables don't exist
      return {
        total: 0,
        today: 0,
        week: 0,
        topCommentedPosts: []
      };
    }
  }

  // Reaction Statistics
  async getReactionStats() {
    try {
      // Total reactions
      const totalReactionsResult = await CassandraHelper.executeInReactionKeyspace('SELECT COUNT(*) as total FROM sme_reactions');
      const totalReactions = parseInt(totalReactionsResult.rows[0].total);

      // Reactions by type - Get all and group in application
      const allReactionsResult = await CassandraHelper.executeInReactionKeyspace(`
        SELECT reaction_type, target_type, target_id FROM sme_reactions
      `);
      
      // Group by reaction_type in application
      const reactionsByType = {};
      const reactionsByTarget = {};
      const reactionsByPost = {};
      
      allReactionsResult.rows.forEach(row => {
        const reactionType = row.reaction_type || 'unknown';
        const targetType = row.target_type || 'unknown';
        const targetId = row.target_id;
        
        reactionsByType[reactionType] = (reactionsByType[reactionType] || 0) + 1;
        reactionsByTarget[targetType] = (reactionsByTarget[targetType] || 0) + 1;
        
        if (targetType === 'post') {
          reactionsByPost[targetId] = (reactionsByPost[targetId] || 0) + 1;
        }
      });
      
      const reactionsByTypeResult = {
        rows: Object.entries(reactionsByType).map(([reaction_type, count]) => ({ reaction_type, count }))
      };
      
      const reactionsByTargetResult = {
        rows: Object.entries(reactionsByTarget).map(([target_type, count]) => ({ target_type, count }))
      };
      
      const topReactedPostsResult = {
        rows: Object.entries(reactionsByPost)
          .map(([target_id, reaction_count]) => ({ target_id, target_type: 'post', reaction_count }))
          .sort((a, b) => b.reaction_count - a.reaction_count)
          .slice(0, 10)
      };

      return {
        total: totalReactions,
        byType: reactionsByTypeResult.rows,
        byTargetType: reactionsByTargetResult.rows,
        topReactedPosts: topReactedPostsResult.rows
      };
    } catch (error) {
      console.error('Error getting reaction stats:', error);
      // Return default values if tables don't exist
      return {
        total: 0,
        byType: [],
        byTargetType: [],
        topReactedPosts: []
      };
    }
  }

  // Notification Statistics
  async getNotificationStats() {
    try {
      // Total notifications
      const totalNotificationsResult = await CassandraHelper.executeInNotificationKeyspace('SELECT COUNT(*) as total FROM sme_notifications');
      const totalNotifications = parseInt(totalNotificationsResult.rows[0].total);

      // Notifications by event type - Get all and group in application
      const allNotificationsResult = await CassandraHelper.executeInNotificationKeyspace(`
        SELECT event_type FROM sme_notifications
      `);
      
      // Group by event_type in application
      const notificationsByType = {};
      allNotificationsResult.rows.forEach(row => {
        const eventType = row.event_type || 'unknown';
        notificationsByType[eventType] = (notificationsByType[eventType] || 0) + 1;
      });
      
      const notificationsByTypeResult = {
        rows: Object.entries(notificationsByType).map(([event_type, count]) => ({ event_type, count }))
      };

      // Unread notifications - using ALLOW FILTERING for Cassandra
      const unreadNotificationsResult = await CassandraHelper.executeInNotificationKeyspace(`
        SELECT COUNT(*) as unread
        FROM sme_notifications
        WHERE read_flag = false ALLOW FILTERING
      `);
      const unreadNotifications = parseInt(unreadNotificationsResult.rows[0].unread);

      // Recent notifications - Get all notifications and sort in application
      const allNotificationsForRecentResult = await CassandraHelper.executeInNotificationKeyspace(`
        SELECT notification_id, to_user_id, from_user_id, event_type, message, created_at
        FROM sme_notifications
      `);
      
      // Sort by created_at in application and get top 10
      const recentNotificationsResult = {
        rows: allNotificationsForRecentResult.rows
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
      };

      return {
        total: totalNotifications,
        unread: unreadNotifications,
        byType: notificationsByTypeResult.rows,
        recent: recentNotificationsResult.rows
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      // Return default values if tables don't exist
      return {
        total: 0,
        unread: 0,
        byType: [],
        recent: []
      };
    }
  }

  // System Health Check
  async getSystemHealth() {
    try {
      const health = {
        databases: {},
        services: {},
        timestamp: new Date().toISOString()
      };

      // Check PostgreSQL
      try {
        const client = await pgPool.connect();
        await client.query('SELECT 1');
        health.databases.postgresql = { status: 'healthy', responseTime: Date.now() };
        client.release();
      } catch (error) {
        health.databases.postgresql = { status: 'unhealthy', error: error.message };
      }

      // Check Cassandra
      try {
        await cassandraClient.execute('SELECT now() FROM system.local');
        health.databases.cassandra = { status: 'healthy', responseTime: Date.now() };
      } catch (error) {
        health.databases.cassandra = { status: 'unhealthy', error: error.message };
      }

      // Check Neo4j
      try {
        const session = neo4jDriver.session();
        await session.run('RETURN 1');
        health.databases.neo4j = { status: 'healthy', responseTime: Date.now() };
        await session.close();
      } catch (error) {
        health.databases.neo4j = { status: 'unhealthy', error: error.message };
      }

      // Check Redis
      try {
        await redisClient.ping();
        health.databases.redis = { status: 'healthy', responseTime: Date.now() };
      } catch (error) {
        health.databases.redis = { status: 'unhealthy', error: error.message };
      }

      return health;
    } catch (error) {
      console.error('Error checking system health:', error);
      throw error;
    }
  }

  // User Analytics
  async getUserAnalytics() {
    try {
      const userStats = await this.getUserStats();
      
      // Get additional user analytics
      const client = await pgPool.connect();
      
      // Users with avatars
      const usersWithAvatarsResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM "User" 
        WHERE "avtUrl" IS NOT NULL AND "avtUrl" != ''
      `);
      const usersWithAvatars = parseInt(usersWithAvatarsResult.rows[0].count);

      // Users with phone numbers
      const usersWithPhoneResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM "User" 
        WHERE "phone" IS NOT NULL AND "phone" != ''
      `);
      const usersWithPhone = parseInt(usersWithPhoneResult.rows[0].count);

      // Users by month (last 12 months)
      const usersByMonthResult = await client.query(`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month
      `);

      // Top usernames (most common patterns)
      const topUsernamesResult = await client.query(`
        SELECT 
          SUBSTRING(username, 1, 3) as prefix,
          COUNT(*) as count
        FROM "User"
        GROUP BY SUBSTRING(username, 1, 3)
        ORDER BY count DESC
        LIMIT 10
      `);

      client.release();

      return {
        ...userStats,
        usersWithAvatars,
        usersWithPhone,
        usersByMonth: usersByMonthResult.rows,
        topUsernamePrefixes: topUsernamesResult.rows
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  // Dashboard Overview
  async getDashboardOverview() {
    try {
      const [userStats, postStats, commentStats, reactionStats, notificationStats] = await Promise.all([
        this.getUserStats(),
        this.getPostStats(),
        this.getCommentStats(),
        this.getReactionStats(),
        this.getNotificationStats()
      ]);

      return {
        users: userStats,
        posts: postStats,
        comments: commentStats,
        reactions: reactionStats,
        notifications: notificationStats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting dashboard overview:', error);
      throw error;
    }
  }
}

module.exports = new StatsService();
