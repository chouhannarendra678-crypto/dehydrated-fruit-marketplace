const mongoose = require('mongoose');
const env = require('./env.config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Connection notice: ${error.message}`);
    console.warn(`[MongoDB] Operating in offline/decoupled mode until MongoDB service starts at ${env.MONGO_URI}`);
    return null;
  }
};

module.exports = connectDB;

