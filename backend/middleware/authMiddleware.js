const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler'); // Simple async error handler

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by ID and attach to request object (excluding password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    // If no token, return unauthorized error
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Check if user exists and their role is included in the allowed roles
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403); // Forbidden
            throw new Error(`User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`);
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
