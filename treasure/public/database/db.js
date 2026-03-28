const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://Ajayram007:11223344@cluster0th.woj1uhz.mongodb.net/');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

connectDB();

module.exports = mongoose.connection;