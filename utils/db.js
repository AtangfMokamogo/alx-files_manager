const { MongoClient, ObjectId } = require('mongodb');
const sha1 = require('sha1');

/**
 * Represents a MongoDB client with basic functionalities.
 * @class
 */
class DBClient {
  /**
   * Creates a new instance of the DBClient.
   * @constructor
   */
  constructor() {
    /**
     * The MongoDB client instance.
     * @type {MongoClient}
     * @private
     */
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    this.uri = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Connect to MongoDB
    this.client.connect();
  }

  /**
   * Checks if the MongoDB client is connected.
   * @returns {boolean} true if the client is connected, false otherwise.
   */
  isAlive() {
    // Check the connection status
    return this.client.topology.isConnected();
  }

  /**
   * Gets the number of documents in the 'users' collection.
   * @returns {Promise<number>} A Promise that resolves to the number of users.
   */
  async nbUsers() {
    const usersCollection = this.client.db().collection('users');
    const count = await usersCollection.countDocuments();
    return count;
  }

  /**
   * Gets the number of documents in the 'files' collection.
   * @returns {Promise<number>} A Promise that resolves to the number of files.
   */
  async nbFiles() {
    const filesCollection = this.client.db().collection('files');
    const count = await filesCollection.countDocuments();
    return count;
  }

  /**
   * This method commit a new user to the users collection in database
   * @param {string} email - This is the user email to commit to databse
   * @param {string} password The password
   */
  async addUser(email, password) {
    const userCollection = this.client.db().collection('users');
    // check if email already exists and throw error if it does
    const userPresent = await userCollection.findOne({ email });
    if (userPresent) {
      return 'Already exist';
    }
    // hash password string
    const passHash = sha1(password);

    // create a new user object to save to database with the email and pass
    const newUser = {
      email: `${email}`,
      password: passHash,
    };

    // commit user to database
    const user = await userCollection.insertOne(newUser);
    // return object id
    return user.insertedId;
  }

  /**
   * this function retrieves a user by their email from db.
   * @param {object} email and object with email as field.
   * @returns a user object.
   */
  async getUserByEmail(email) {
    const userCollection = this.client.db().collection('users');
    const query = { email: `${email}` };
    const user = await userCollection.findOne(query);

    return user;
  }

  /**
   * The function retrieves a user based on userid
   * @param {object} userId and object with userid as field
   * @returns a user object
   */
  async getUserById(userId) {
    const _id = new ObjectId(userId);
    const userCollection = this.client.db().collection('users');
    const query = { _id };
    const user = await userCollection.findOne(query);

    return user;
  }

  /**
   * This function queries the files_manager db for an doc with filed File ID
   * @param {String} fileId File ID
   * @returns A document object corresponding to File ID
   */
  async getFileById(fileId) {
    const _id = new ObjectId(fileId);
    const filesCollection = this.client.db().collection('files');
    const query = { _id };
    const user = await filesCollection.findOne(query);

    return user;
  }

  /**
   * This function retrieves a file from database.
   * @param {Object} field An object with field to query in api.
   * @returns
   */
  async getFileByField(field) {
    const filesCollection = this.client.db().collection('files');
    const fileObj = filesCollection.findOne(field);
    return fileObj;
  }

  /**
   * This function adds a file to database
   * @param {object} fileObject a query object to save to db
   */
  async addFile(fileObject) {
    const filesCollection = this.client.db().collection('files');
    const newFile = await filesCollection.insertOne(fileObject);
    const insertedDocument = newFile.ops[0];
    const {
      _id, userID, name, type, isPublic, parentId,
    } = insertedDocument;

    console.log(`${_id} was saved`);

    // Returning only the desired fields
    return {
      id: _id,
      userId: userID,
      name,
      type,
      isPublic,
      parentId,
    };
  }
}

// Create an instance of DBClient.
const dbClient = new DBClient();

// Export the instance for external use.
module.exports = dbClient;
