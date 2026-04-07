const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async (retries = 5) => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    if (retries > 0) {
      console.log(`Retrying connection... (${retries} left)`);
      setTimeout(() => connectDB(retries - 1), 5000); // Retry after 5 seconds
    } else {
      console.error('Could not connect to MongoDB after multiple attempts. Exiting...');
      // process.exit(1); // Optional: depends on if we want the app to stay alive without DB
    }
  }
};

connectDB();

module.exports = mongoose.connection;