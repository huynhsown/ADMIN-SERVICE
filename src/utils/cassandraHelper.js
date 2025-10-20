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
      .replace(/FROM sme_comments/g, 'FROM sme_post_keyspace.sme_comments');
    
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
      .replace(/FROM sme_notifications/g, 'FROM sme_notification_keyspace.sme_notifications');
    
    return this.execute(modifiedQuery, params);
  }
}

module.exports = CassandraHelper;
