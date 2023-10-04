const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

/**
 * this class defines controllers that control user registration and cancellation
 * @class
 */
class UsersController {
  /**
   * This function adds a new user to database.
   * @param {Object} req The request object.
   * @param {Object} res The response object.
   */
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;
      console.log(email, password);
      if (!email) {
        // throw missing email
        res.status(400).json({ error: 'Missing email' });
      } else if (!password) {
        // throw missing pass
        res.status(400).json({ error: 'Missing password' });
      } else {
        // call add user method
        const clientID = await dbClient.addUser(email, password);
        if (clientID === 'Already exist') {
          res.status(400).json({ error: `${clientID}` });
        } else {
          res.status(200).json({ id: `${clientID}`, email: `${email}` });
        }
      }
    } catch (error) {
      console.error('an error occured in Post new controller', error);
    }
  }

  /**
   * retrieves a user based on a provided token.
   * @param {Object} req The request object.
   * @param {Object} res The response object.
   * @returns User id and email.
   */
  static async getMe(req, res) {
    try {
      const userToken = req.headers['x-token'];

      if (!userToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // check for presence of key in redis cache
      const redisKey = `auth_${userToken}`;
      const userObjID = await redisClient.get(redisKey);

      // if there is no key in the redis cache then client not authorized
      if (!userObjID) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbClient.getUserById(userObjID);
      // extract the userid and email from object
      const { _id, email } = user;

      return res.status(200).json({ id: _id, email });
    } catch (error) {
      console.error('Error in getMe: ', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    return 0;
  }
}

module.exports = UsersController;
