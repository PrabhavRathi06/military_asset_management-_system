// =============================================
// config/db.js
// Handles connection to MongoDB Atlas database
// =============================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try to connect using the MONGO_URI from .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, print the error and stop the server
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;
