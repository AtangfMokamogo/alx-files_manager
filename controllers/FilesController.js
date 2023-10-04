const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

/**
 * This class defines controllers that deal with file upload and management
 * @class
 */
class FilesController {
/**
  * This function uploads a file to the api
  * @param {object} req the request object
  * @param {object} res the response object
  * @returns null
  */
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const key = `auth_${token}`;
      const userID = await redisClient.get(key);

      if (!userID) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        name, type, parentId, isPublic, data,
      } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }

      if (!data && type !== 'folder') {
        return res.status(400).json({ error: 'Missing data' });
      }

      const parentFile = await dbClient.getFileByField({ parentId });

      if (parentFile !== null) {
        if (parentId) {
          console.log(parentFile);

          if (!parentFile) {
            return res.status(400).json({ error: 'Parent not found' });
          }
          if (parentFile && parentFile.type !== 'folder') {
            return res.status(400).json({ error: 'Parent not found' });
          }
        }
      }
      const path = await FilesController.localStorage(type, data);
      const file = {
        userID,
        name,
        type,
        isPublic: isPublic || false,
        parentId: `ObjectId(${parentId})` || 0,
        localPath: path,
      };
      const newFile = await dbClient.addFile(file);
      console.log(newFile);
      return res.status(201).json(newFile);
    } catch (error) {
      console.error('Error in postUpload: ', error);
    }
  }

  /**
   * This function saves a file to local storage and returns its path
   * @param {string} type The string representing the type of the file
   * @param {string} data The base 64 endoced data string if file is image
   * @returns the file path after storage
   */
  static async localStorage(type, data) {
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const fileName = uuidv4();
    const filePath = path.join(folderPath, fileName);

    // New folder if not present
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Store file locally
    if (type !== 'folder') {
      const fileContent = Buffer.from(data, 'base64');
      fs.writeFileSync(filePath, fileContent);
    }

    return filePath;
  }
}

module.exports = FilesController;
