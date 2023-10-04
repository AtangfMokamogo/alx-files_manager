const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

/**
 * This class defines controller functions that monitor the states of
 * redis cache and momgodb databases.
 * @class
 */
class AppController {
  /**
   * This function checks the statuses of the redis cache and mongodb databases.
   * @param {Object} req The request object.
   * @param {Object} res The response object.
   */
  static async getStatus(req, res) {
    try {
      const redisState = redisClient.isAlive();
      const dbState = dbClient.isAlive();

      if (redisState && dbState) {
        res.status(200).json({ redis: true, db: true });
      } else {
        res.status(500).json({ redis: redisState, db: dbState });
      }
    } catch (error) {
      console.error('Error in getStatus', error);
      res.status(500).json({ Error: 'Internal Server Error' });
    }
  }

  /**
   * This function computes the number of files and user in database.
   * @param {Object} req the request object.
   * @param {Object} res the response object
   */
  static async getStats(req, res) {
    try {
      const userNum = await dbClient.nbUsers();
      const fileNum = await dbClient.nbFiles();

      res.status(200).json({ users: userNum, files: fileNum });
    } catch (error) {
      console.error('Error in getStats: ', error);
      res.status(500).json({ Error: 'Internal Server Error' });
    }
  }
}

module.exports = AppController;
