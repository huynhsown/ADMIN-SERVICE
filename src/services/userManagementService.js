const { pgPool } = require('../config/database');

class UserManagementService {
  // Get all users with pagination and filters
  async getAllUsers(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const { search, email, username, firstName, lastName, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

      const client = await pgPool.connect();
      
      // Build WHERE clause
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (search) {
        whereConditions.push(`(
          username ILIKE $${paramIndex} OR 
          "firstName" ILIKE $${paramIndex} OR 
          "lastName" ILIKE $${paramIndex} OR 
          email ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (email) {
        whereConditions.push(`email ILIKE $${paramIndex}`);
        queryParams.push(`%${email}%`);
        paramIndex++;
      }

      if (username) {
        whereConditions.push(`username ILIKE $${paramIndex}`);
        queryParams.push(`%${username}%`);
        paramIndex++;
      }

      if (firstName) {
        whereConditions.push(`"firstName" ILIKE $${paramIndex}`);
        queryParams.push(`%${firstName}%`);
        paramIndex++;
      }

      if (lastName) {
        whereConditions.push(`"lastName" ILIKE $${paramIndex}`);
        queryParams.push(`%${lastName}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM "User" ${whereClause}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get users with pagination
      const offset = (page - 1) * limit;
      const usersQuery = `
        SELECT 
          "userId", username, "firstName", "lastName", email, phone, "avtUrl", 
          "createdAt", "updatedAt"
        FROM "User" 
        ${whereClause}
        ORDER BY "${sortBy}" ${sortOrder.toUpperCase()}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      queryParams.push(parseInt(limit), offset);
      const usersResult = await client.query(usersQuery, queryParams);

      client.release();

      const totalPages = Math.ceil(total / limit);

      return {
        users: usersResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Get user details by ID
  async getUserDetails(userId) {
    try {
      const client = await pgPool.connect();
      
      const query = `
        SELECT 
          "userId", username, "firstName", "lastName", email, phone, "avtUrl", 
          "createdAt", "updatedAt"
        FROM "User" 
        WHERE "userId" = $1
      `;
      
      const result = await client.query(query, [userId]);
      client.release();

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error getting user details:', error);
      throw error;
    }
  }

  // Get user metadata (simplified version)
  async getUserMetadata(userId) {
    try {
      const userDetails = await this.getUserDetails(userId);
      
      // Return basic metadata - in a real app, this might include more complex data
      return {
        userId: userDetails.userId,
        username: userDetails.username,
        fullName: `${userDetails.firstName} ${userDetails.lastName}`,
        email: userDetails.email,
        hasAvatar: !!userDetails.avtUrl,
        hasPhone: !!userDetails.phone,
        createdAt: userDetails.createdAt,
        updatedAt: userDetails.updatedAt
      };
    } catch (error) {
      console.error('Error getting user metadata:', error);
      throw error;
    }
  }

  // Get batch user metadata
  async getBatchUserMetadata(userIds, query = '') {
    try {
      if (!userIds || userIds.length === 0) {
        return [];
      }

      const client = await pgPool.connect();
      
      // Create placeholders for the IN clause
      const placeholders = userIds.map((_, index) => `$${index + 1}`).join(',');
      
      let whereClause = `WHERE "userId" IN (${placeholders})`;
      let queryParams = [...userIds];
      let paramIndex = userIds.length + 1;

      // Add search filter if provided
      if (query) {
        whereClause += ` AND (
          username ILIKE $${paramIndex} OR 
          "firstName" ILIKE $${paramIndex} OR 
          "lastName" ILIKE $${paramIndex} OR 
          email ILIKE $${paramIndex}
        )`;
        queryParams.push(`%${query}%`);
      }

      const sql = `
        SELECT 
          "userId", username, "firstName", "lastName", email, phone, "avtUrl", 
          "createdAt", "updatedAt"
        FROM "User" 
        ${whereClause}
        ORDER BY "createdAt" DESC
      `;
      
      const result = await client.query(sql, queryParams);
      client.release();

      // Convert to metadata format
      return result.rows.map(user => ({
        userId: user.userId,
        username: user.username,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        hasAvatar: !!user.avtUrl,
        hasPhone: !!user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
    } catch (error) {
      console.error('Error getting batch user metadata:', error);
      throw error;
    }
  }

  // Search users
  async searchUsers(searchQuery, filters = {}, pagination = {}) {
    try {
      // Use the same logic as getAllUsers but with search query
      const searchFilters = {
        ...filters,
        search: searchQuery
      };
      
      return await this.getAllUsers(searchFilters, pagination);
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStatistics() {
    try {
      // Get basic user stats from our stats service
      const userStats = await require('./statsService').getUserStats();
      
      // Get additional user analytics directly from database
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

      // Recent users (last 10)
      const recentUsersResult = await client.query(`
        SELECT "userId", username, "firstName", "lastName", email, "createdAt"
        FROM "User"
        ORDER BY "createdAt" DESC
        LIMIT 10
      `);

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

      // Users by year
      const usersByYearResult = await client.query(`
        SELECT 
          EXTRACT(YEAR FROM "createdAt") as year,
          COUNT(*) as count
        FROM "User"
        GROUP BY EXTRACT(YEAR FROM "createdAt")
        ORDER BY year
      `);

      client.release();
      
      // Analyze user data
      const analytics = {
        totalUsers: userStats.total,
        usersWithAvatars,
        usersWithPhone,
        recentUsers: recentUsersResult.rows,
        usersByMonth: usersByMonthResult.rows,
        usersByYear: usersByYearResult.rows
      };

      return {
        ...userStats,
        analytics
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }

  // Group users by month (now handled in database query)
  groupUsersByMonth(users) {
    // This method is now deprecated as we handle grouping in SQL
    return [];
  }

  // Group users by year (now handled in database query)
  groupUsersByYear(users) {
    // This method is now deprecated as we handle grouping in SQL
    return [];
  }

  // Get user activity (placeholder - would need integration with other services)
  async getUserActivity(userId) {
    try {
      // This would typically integrate with post-service, reaction-service, etc.
      // For now, return basic info
      const userDetails = await this.getUserDetails(userId);
      
      return {
        userId,
        username: userDetails.username,
        lastActive: userDetails.updatedAt,
        // These would be populated by calling other services
        totalPosts: 0,
        totalComments: 0,
        totalReactions: 0,
        totalFollowers: 0,
        totalFollowing: 0
      };
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw error;
    }
  }

  // Export users data (CSV format)
  async exportUsers(filters = {}) {
    try {
      const { users } = await this.getAllUsers(filters, { page: 1, limit: 10000 });
      
      // Convert to CSV format
      const csvHeaders = 'userId,username,firstName,lastName,email,phone,avtUrl,createdAt,updatedAt\n';
      const csvRows = users.map(user => 
        `${user.userId},${user.username},${user.firstName},${user.lastName},${user.email},${user.phone || ''},${user.avtUrl || ''},${user.createdAt},${user.updatedAt}`
      ).join('\n');
      
      return csvHeaders + csvRows;
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  }
}

module.exports = new UserManagementService();
