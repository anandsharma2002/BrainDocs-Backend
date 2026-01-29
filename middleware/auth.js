const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user from JWT token
exports.authenticate = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Please login again.'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or expired. Please login again.'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
};

// Authorize specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }

        next();
    };
};

// Check if user is owner or SuperAdmin
exports.isOwnerOrAdmin = (resourceOwnerField = 'owner') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized. Please login.'
                });
            }

            // SuperAdmin can access everything
            if (req.user.role === 'SuperAdmin') {
                return next();
            }

            // Check if user is the owner
            // The resource should be attached to req by previous middleware
            const resource = req.resource;

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            const ownerId = resource[resourceOwnerField];

            if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to perform this action'
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Authorization error',
                error: error.message
            });
        }
    };
};
