const redis = require('redis');

/**
 * Represents a Redis client with basic functionalities.
 * @class
 */
class RedisClient {
    /**
   * Creates a new instance of the RedisClient.
   * @constructor
   */
  constructor() {
    this.client = redis.createClient({ host: "localhost", port: 6379});

    this.client.on('error', (err) => {
      console.error(`Redis client error: ${err}`);
    });
  }

    /**
   * Checks if the Redis client is connected.
   * @returns {boolean} true if the client is connected, false otherwise.
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Gets the value stored in Redis for a given key.
   * @param {string} key - The key to retrieve the value for.
   * @returns {Promise<string|null>} A Promise that resolves to the Redis value or null if not found.
   */
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  /**
   * Sets a key-value pair in Redis with an expiration time.
   * @param {string} key - The key to set.
   * @param {string|number} value - The value to associate with the key.
   * @param {number} duration - The expiration time in seconds.
   * @returns {Promise<boolean>} A Promise that resolves to true if successful.
   */
  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
  
  /**
   * Deletes a key and its associated value from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<boolean>} A Promise that resolves to true if the key was successfully deleted.
   */
  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply === 1);
        }
      });
    });
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
