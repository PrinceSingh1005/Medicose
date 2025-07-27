const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connect to MongoDB using the URI from environment variables
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Log error and exit process if connection fails
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;