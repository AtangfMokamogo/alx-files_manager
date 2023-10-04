const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const redisClient = require('../utils/redis');
const usersDB = require('../utils/db');

/**
 * This class defines controllers that manage authentication and authorization of api endpoints
 * @class
 */
class AuthController {
  /**
   * This function issues a new token for a client if registered i.e Authorization.
   * @param {Object} req The request object.
   * @param {Object} res the response object
   * @returns Connects or Rejects client request
   */
  static async getConnect(req, res) {
    try {
      // extract the headers
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Basic')) {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [email, password] = credentials.split(':');

        // Assuming 'email' is a unique identifier for users
        const user = await usersDB.getUserByEmail(email);

        if (!user || user.password !== sha1(password)) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = uuidv4();
        const key = `auth_${token}`;

        // Store user ID in Redis with a 24-hour expiration
        await redisClient.set(key, user._id, 24 * 60 * 60);

        return res.status(200).json({ token });
      }

      return res.status(401).json({ error: 'Unauthorized' });
    } catch (error) {
      console.error('Error in getConnect', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * This function logs out a client from api.
   * @param {Object} req the request object.
   * @param {Object} res the response.
   * @returns Logs out a client by deleting token from redis cache
   */
  static async getDisconnect(req, res) {
    try {
      const token = req.headers['x-token'];

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const redisKey = `auth_${token}`;
      const userID = await redisClient.get(redisKey);

      if (!userID) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // delete the token from redis cache
      await redisClient.del(redisKey);

      return res.status(204).end();
    } catch (error) {
      console.error('Error in getDisconnect', error);
      res.status(500).json({ error: 'Unauthorized' });
    }
  }
}
module.exports = AuthController;
