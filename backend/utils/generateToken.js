const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // Generate a JWT token with user ID and secret from environment variables
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

module.exports = generateToken;