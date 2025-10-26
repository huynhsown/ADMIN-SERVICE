const { cassandraClient } = require('../config/database');

class CassandraHelper {
  static async execute(query, params = []) {
    try {
      return await cassandraClient.execute(query, params, { prepare: true });
    } catch (error) {
      console.error('Error executing Cassandra query:', error);
      throw error;
    }
  }

  static async executeInPostKeyspace(query, params = []) {
    // Replace table names with keyspace.table format
    const modifiedQuery = query
      .replace(/FROM sme_posts/g, 'FROM sme_post_keyspace.sme_posts')
      .replace(/FROM sme_comments/g, 'FROM sme_post_keyspace.sme_comments')
      .replace(/FROM sme_post_media/g, 'FROM sme_post_keyspace.sme_post_media')
      .replace(/FROM sme_post_mentions/g, 'FROM sme_post_keyspace.sme_post_mentions')
      .replace(/FROM sme_posts_by_hashtag/g, 'FROM sme_post_keyspace.sme_posts_by_hashtag')
      .replace(/FROM sme_comments_by_post/g, 'FROM sme_post_keyspace.sme_comments_by_post')
      .replace(/FROM sme_posts_by_author/g, 'FROM sme_post_keyspace.sme_posts_by_author')
      .replace(/FROM sme_hashtags/g, 'FROM sme_post_keyspace.sme_hashtags')
      .replace(/UPDATE sme_posts/g, 'UPDATE sme_post_keyspace.sme_posts')
      .replace(/UPDATE sme_comments/g, 'UPDATE sme_post_keyspace.sme_comments')
      .replace(/UPDATE sme_posts_by_author/g, 'UPDATE sme_post_keyspace.sme_posts_by_author')
      .replace(/UPDATE sme_comments_by_post/g, 'UPDATE sme_post_keyspace.sme_comments_by_post');
    
    return this.execute(modifiedQuery, params);
  }

  static async executeInReactionKeyspace(query, params = []) {
    // Replace table names with keyspace.table format
    const modifiedQuery = query
      .replace(/FROM sme_reactions/g, 'FROM sme_reaction_keyspace.sme_reactions');
    
    return this.execute(modifiedQuery, params);
  }

  static async executeInNotificationKeyspace(query, params = []) {
    // Replace table names with keyspace.table format
    const modifiedQuery = query
      .replace(/FROM sme_notifications/g, 'FROM sme_notification_keyspace.sme_notifications')
      .replace(/FROM sme_notifications_by_user/g, 'FROM sme_notification_keyspace.sme_notifications_by_user')
      .replace(/FROM sme_notifications_by_user_and_entity/g, 'FROM sme_notification_keyspace.sme_notifications_by_user_and_entity')
      .replace(/UPDATE sme_notifications/g, 'UPDATE sme_notification_keyspace.sme_notifications')
      .replace(/UPDATE sme_notifications_by_user/g, 'UPDATE sme_notification_keyspace.sme_notifications_by_user')
      .replace(/UPDATE sme_notifications_by_user_and_entity/g, 'UPDATE sme_notification_keyspace.sme_notifications_by_user_and_entity')
      .replace(/DELETE FROM sme_notifications/g, 'DELETE FROM sme_notification_keyspace.sme_notifications')
      .replace(/DELETE FROM sme_notifications_by_user/g, 'DELETE FROM sme_notification_keyspace.sme_notifications_by_user')
      .replace(/DELETE FROM sme_notifications_by_user_and_entity/g, 'DELETE FROM sme_notification_keyspace.sme_notifications_by_user_and_entity');
    
    return this.execute(modifiedQuery, params);
  }
}

module.exports = CassandraHelper;
