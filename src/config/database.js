const { Pool } = require('pg');
const cassandra = require('cassandra-driver');
const neo4j = require('neo4j-driver');
const redis = require('redis');

// PostgreSQL Connection
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || 'db_owner',
  password: process.env.POSTGRES_PASSWORD || 'db_owner',
  database: process.env.POSTGRES_DB || 'sme_user',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Cassandra Connection
const cassandraClient = new cassandra.Client({
  contactPoints: [process.env.CASSANDRA_HOST || 'localhost'],
  port: process.env.CASSANDRA_PORT || 9042,
  localDataCenter: 'datacenter1',
  keyspace: process.env.CASSANDRA_KEYSPACE_NOTIFICATION || 'sme_notification_keyspace'
});

// Neo4j Connection
const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || ''
  )
);

// Redis Connection
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Test connections
const testConnections = async () => {
  try {
    // Test PostgreSQL
    const pgClient = await pgPool.connect();
    console.log('✅ PostgreSQL connected successfully');
    pgClient.release();

    // Test Cassandra
    await cassandraClient.connect();
    console.log('✅ Cassandra connected successfully');

    // Test Neo4j
    const neo4jSession = neo4jDriver.session();
    await neo4jSession.run('RETURN 1');
    console.log('✅ Neo4j connected successfully');
    await neo4jSession.close();

    // Test Redis
    await redisClient.connect();
    console.log('✅ Redis connected successfully');

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
};

module.exports = {
  pgPool,
  cassandraClient,
  neo4jDriver,
  redisClient,
  testConnections
};
