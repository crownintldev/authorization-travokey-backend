const mongoose = require("mongoose");
const { encrypt, decrypt } = require("./crypto");
const AppError = require("./appError");
const connections = {};

const dbManager = {
  /**
   * Establishes a connection to the specified database to ensure it's created.
   * @param {String} connectionString - The database connection string.
   */
  async initializeDatabase(connectionString) {
    
    const connection = await mongoose.createConnection(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Define a simple schema and model
    const Schema = mongoose.Schema;
    const DummySchema = new Schema({ name: String });
    const Dummy = connection.model("Dummy", DummySchema);
    // Create a dummy document
    const dummyDoc = new Dummy({ name: "DummyData" });
    // Save the document to the database
    try {
      await dummyDoc.save();
      console.log("Dummy document created successfully.");
    } catch (error) {
      console.error("Error creating dummy document:", error);
    }
    // No need to create a dummy collection. Just close the connection.
    connection.close();
  },

  /**
   * Creates a new database connection for an admin and returns the encrypted connection string.
   * @param {String} userId - The ID of the admin
   * @returns {Promise<String>} - The encrypted connection string of the new database
   */
  async createDatabaseForAdmin(userId) {
    if (userId !== undefined) {

      
      const connectionString = `${process.env.DBCONN}/${userId}?retryWrites=true&w=majority&appName=AtlasApp`;

      // Initialize database (create connection)
      await this.initializeDatabase(connectionString);

      // Encrypt the connection string and return
      const encryptedString = encrypt(connectionString);
      return encryptedString;
    } else {
      throw new AppError("Error in Creating Db is not defined", 409);
    }
  },

  /**
   * Retrieves a database connection for a given admin.
   * Creates a new connection if one does not exist.
   * @param {String} adminId - The ID of the admin
   * @returns {Promise<mongoose.Connection>} - The Mongoose database connection
  
  async getDatabaseConnectionForAdmin(adminId) {

    if (connections[adminId]) {
      return connections[adminId];
    }

    const adminConfig = await AdminConfig.findOne({ adminId: adminId });

    if (!adminConfig) {
      throw new Error("Admin configuration not found.");
    }

    const dbConnection = mongoose.createConnection(
      adminConfig.dbConnectionString,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    connections[adminId] = dbConnection;

    return dbConnection;
  },
   */
};

module.exports = dbManager;
