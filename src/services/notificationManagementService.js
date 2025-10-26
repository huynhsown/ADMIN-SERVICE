const { pgPool, cassandraClient } = require('../config/database');
const CassandraHelper = require('../utils/cassandraHelper');

class NotificationManagementService {
  // Get all notifications with pagination and filters
  async getAllNotifications(filters = {}, pagination = {}) {
    try {
      const {
        toUserId,
        fromUserId,
        eventType,
        readFlag,
        startDate,
        endDate,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = filters;

      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM sme_notifications';
      const params = [];

      // Handle read_flag filter
      if (readFlag !== undefined) {
        query += ' WHERE read_flag = ?';
        params.push(readFlag);
      }

      // Build WHERE clause
      let hasWhereClause = readFlag !== undefined;
      
      if (toUserId) {
        query += hasWhereClause ? ' AND to_user_id = ?' : ' WHERE to_user_id = ?';
        params.push(toUserId);
        hasWhereClause = true;
      }

      if (fromUserId) {
        query += hasWhereClause ? ' AND from_user_id = ?' : ' WHERE from_user_id = ?';
        params.push(fromUserId);
        hasWhereClause = true;
      }

      if (eventType) {
        query += hasWhereClause ? ' AND event_type = ?' : ' WHERE event_type = ?';
        params.push(eventType);
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
      const result = await CassandraHelper.executeInNotificationKeyspace(query, params);
      
      // Sort in application (Cassandra doesn't support ORDER BY on non-partition keys)
      let notifications = result.rows;
      
      // Apply search filter at application level
      if (search) {
        notifications = notifications.filter(notification => 
          notification.message && notification.message.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (sortBy === 'created_at') {
        notifications = notifications.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
        });
      }

      // Pagination
      const total = notifications.length;
      const paginatedNotifications = notifications.slice(offset, offset + limit);

      // Get user information for each notification
      const notificationsWithUsers = await Promise.all(
        paginatedNotifications.map(async (notification) => {
          try {
            // Get to_user info
            let toUser = null;
            if (notification.to_user_id) {
              const toUserResult = await pgPool.query(
                'SELECT "userId", username, "firstName", "lastName", email, "avtUrl" FROM "User" WHERE "userId" = $1',
                [notification.to_user_id.toString()]
              );
              toUser = toUserResult.rows[0] || null;
            }

            // Get from_user info
            let fromUser = null;
            if (notification.from_user_id) {
              const fromUserResult = await pgPool.query(
                'SELECT "userId", username, "firstName", "lastName", email, "avtUrl" FROM "User" WHERE "userId" = $1',
                [notification.from_user_id.toString()]
              );
              fromUser = fromUserResult.rows[0] || null;
            }
            
            return {
              ...notification,
              toUser,
              fromUser
            };
          } catch (error) {
            console.error('Error fetching user info for notification', notification.notification_id, ':', error);
            return {
              ...notification,
              toUser: null,
              fromUser: null
            };
          }
        })
      );

      return {
        notifications: notificationsWithUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all notifications:', error);
      throw error;
    }
  }

  // Get notification details
  async getNotificationDetails(notificationId) {
    try {
      const notificationResult = await CassandraHelper.executeInNotificationKeyspace(
        'SELECT * FROM sme_notifications WHERE notification_id = ?',
        [notificationId]
      );

      if (notificationResult.rows.length === 0) {
        throw new Error('Notification not found');
      }

      const notification = notificationResult.rows[0];

      // Get user information
      let toUser = null;
      let fromUser = null;

      try {
        if (notification.to_user_id) {
          const toUserResult = await pgPool.query(
            'SELECT "userId", username, "firstName", "lastName", email, "avtUrl", "createdAt" FROM "User" WHERE "userId" = $1',
            [notification.to_user_id.toString()]
          );
          toUser = toUserResult.rows[0] || null;
        }

        if (notification.from_user_id) {
          const fromUserResult = await pgPool.query(
            'SELECT "userId", username, "firstName", "lastName", email, "avtUrl", "createdAt" FROM "User" WHERE "userId" = $1',
            [notification.from_user_id.toString()]
          );
          fromUser = fromUserResult.rows[0] || null;
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }

      return {
        ...notification,
        toUser,
        fromUser
      };
    } catch (error) {
      console.error('Error getting notification details:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, adminId) {
    try {
      // Get notification details first
      const notificationResult = await CassandraHelper.executeInNotificationKeyspace(
        'SELECT * FROM sme_notifications WHERE notification_id = ?',
        [notificationId]
      );

      if (notificationResult.rows.length === 0) {
        throw new Error('Notification not found');
      }

      const notification = notificationResult.rows[0];

      // Delete from main table
      await CassandraHelper.executeInNotificationKeyspace(
        'DELETE FROM sme_notifications WHERE notification_id = ?',
        [notificationId]
      );

      // Delete from by_user table
      if (notification.to_user_id) {
        await CassandraHelper.executeInNotificationKeyspace(
          'DELETE FROM sme_notifications_by_user WHERE to_user_id = ? AND created_at = ? AND notification_id = ?',
          [notification.to_user_id, notification.created_at, notificationId]
        );
      }

      // Delete from by_user_and_entity table
      if (notification.to_user_id && notification.entity_id) {
        await CassandraHelper.executeInNotificationKeyspace(
          'DELETE FROM sme_notifications_by_user_and_entity WHERE to_user_id = ? AND entity_id = ? AND created_at = ? AND notification_id = ?',
          [notification.to_user_id, notification.entity_id, notification.created_at, notificationId]
        );
      }

      // Log admin action
      console.log(`Admin ${adminId} deleted notification ${notificationId}`);

      return { success: true, message: 'Notification deleted successfully' };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Mark notification as read/unread
  async markNotificationRead(notificationId, readFlag, adminId) {
    try {
      // Get notification details first
      const notificationResult = await CassandraHelper.executeInNotificationKeyspace(
        'SELECT * FROM sme_notifications WHERE notification_id = ?',
        [notificationId]
      );

      if (notificationResult.rows.length === 0) {
        throw new Error('Notification not found');
      }

      const notification = notificationResult.rows[0];

      // Update main table
      await CassandraHelper.executeInNotificationKeyspace(
        'UPDATE sme_notifications SET read_flag = ? WHERE notification_id = ?',
        [readFlag, notificationId]
      );

      // Update by_user table
      if (notification.to_user_id) {
        await CassandraHelper.executeInNotificationKeyspace(
          'UPDATE sme_notifications_by_user SET read_flag = ? WHERE to_user_id = ? AND created_at = ? AND notification_id = ?',
          [readFlag, notification.to_user_id, notification.created_at, notificationId]
        );
      }

      // Update by_user_and_entity table
      if (notification.to_user_id && notification.entity_id) {
        await CassandraHelper.executeInNotificationKeyspace(
          'UPDATE sme_notifications_by_user_and_entity SET read_flag = ? WHERE to_user_id = ? AND entity_id = ? AND created_at = ? AND notification_id = ?',
          [readFlag, notification.to_user_id, notification.entity_id, notification.created_at, notificationId]
        );
      }

      // Log admin action
      console.log(`Admin ${adminId} marked notification ${notificationId} as ${readFlag ? 'read' : 'unread'}`);

      return { success: true, message: `Notification marked as ${readFlag ? 'read' : 'unread'}` };
    } catch (error) {
      console.error('Error marking notification:', error);
      throw error;
    }
  }

  // Get notification statistics for admin
  async getNotificationStatistics() {
    try {
      // Total notifications
      const totalNotificationsResult = await CassandraHelper.executeInNotificationKeyspace('SELECT COUNT(*) as total FROM sme_notifications');
      const totalNotifications = parseInt(totalNotificationsResult.rows[0].total);

      // Read notifications
      const readNotificationsResult = await CassandraHelper.executeInNotificationKeyspace('SELECT COUNT(*) as read FROM sme_notifications WHERE read_flag = true');
      const readNotifications = parseInt(readNotificationsResult.rows[0].read);

      // Unread notifications
      const unreadNotificationsResult = await CassandraHelper.executeInNotificationKeyspace('SELECT COUNT(*) as unread FROM sme_notifications WHERE read_flag = false');
      const unreadNotifications = parseInt(unreadNotificationsResult.rows[0].unread);

      // Notifications by event type
      const allNotificationsResult = await CassandraHelper.executeInNotificationKeyspace('SELECT event_type FROM sme_notifications');
      const notificationsByType = {};
      allNotificationsResult.rows.forEach(row => {
        const eventType = row.event_type || 'unknown';
        notificationsByType[eventType] = (notificationsByType[eventType] || 0) + 1;
      });

      // Notifications created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayNotificationsResult = await CassandraHelper.executeInNotificationKeyspace(
        'SELECT COUNT(*) as today FROM sme_notifications WHERE created_at >= ? ALLOW FILTERING',
        [today]
      );
      const todayNotifications = parseInt(todayNotificationsResult.rows[0].today);

      // Notifications created this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekNotificationsResult = await CassandraHelper.executeInNotificationKeyspace(
        'SELECT COUNT(*) as week FROM sme_notifications WHERE created_at >= ? ALLOW FILTERING',
        [weekAgo]
      );
      const weekNotifications = parseInt(weekNotificationsResult.rows[0].week);

      // Notifications created this month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthNotificationsResult = await CassandraHelper.executeInNotificationKeyspace(
        'SELECT COUNT(*) as month FROM sme_notifications WHERE created_at >= ? ALLOW FILTERING',
        [monthAgo]
      );
      const monthNotifications = parseInt(monthNotificationsResult.rows[0].month);

      return {
        total: totalNotifications,
        read: readNotifications,
        unread: unreadNotifications,
        byEventType: notificationsByType,
        today: todayNotifications,
        week: weekNotifications,
        month: monthNotifications
      };
    } catch (error) {
      console.error('Error getting notification statistics:', error);
      throw error;
    }
  }

  // Search notifications
  async searchNotifications(query, filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      // Get all notifications and filter at application level
      const allNotificationsResult = await CassandraHelper.executeInNotificationKeyspace(
        'SELECT * FROM sme_notifications ALLOW FILTERING'
      );

      // Apply search filter at application level
      const searchResult = allNotificationsResult.rows.filter(notification => 
        notification.message && notification.message.toLowerCase().includes(query.toLowerCase())
      );

      // Sort by relevance (simple: by created_at for now)
      const sortedNotifications = searchResult.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Pagination
      const total = sortedNotifications.length;
      const paginatedNotifications = sortedNotifications.slice(offset, offset + limit);

      // Get user information
      const notificationsWithUsers = await Promise.all(
        paginatedNotifications.map(async (notification) => {
          try {
            let toUser = null;
            let fromUser = null;

            if (notification.to_user_id) {
              const toUserResult = await pgPool.query(
                'SELECT "userId", username, "firstName", "lastName", "avtUrl" FROM "User" WHERE "userId" = $1',
                [notification.to_user_id.toString()]
              );
              toUser = toUserResult.rows[0] || null;
            }

            if (notification.from_user_id) {
              const fromUserResult = await pgPool.query(
                'SELECT "userId", username, "firstName", "lastName", "avtUrl" FROM "User" WHERE "userId" = $1',
                [notification.from_user_id.toString()]
              );
              fromUser = fromUserResult.rows[0] || null;
            }
            
            return {
              ...notification,
              toUser,
              fromUser
            };
          } catch (error) {
            return {
              ...notification,
              toUser: null,
              fromUser: null
            };
          }
        })
      );

      return {
        notifications: notificationsWithUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        query
      };
    } catch (error) {
      console.error('Error searching notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationManagementService();
