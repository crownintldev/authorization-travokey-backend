const { connectToDatabase, databaseConnections } = require("../dbConfig/includedb")
const initializeModel = async (dbname, tableName, scheema) => {
    // Ensure that the database connections are established
    await connectToDatabase(`${dbname}`);
    // Create the User model using the travokey connection
    module.exports = databaseConnections[dbname].model(tableName, scheema);
};

// Call the async function to initialize the User model
module.exports = initializeModel