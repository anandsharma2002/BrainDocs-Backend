const User = require('../models/User');
const Topic = require('../models/Topic');

// @desc    Get all users (with search)
// @route   GET /api/users?search=query
// @access  Public
exports.getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;

        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's topic count
        const topicCount = await Topic.countDocuments({
            owner: user._id,
            isPublic: true
        });

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                bio: user.bio,
                createdAt: user.createdAt,
                publicTopicCount: topicCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// @desc    Get user's public topics
// @route   GET /api/users/:id/topics
// @access  Public
exports.getUserTopics = async (req, res) => {
    try {
        const topics = await Topic.find({
            owner: req.params.id,
            isPublic: true
        })
            .populate('owner', 'name email avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: topics.length,
            topics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user topics',
            error: error.message
        });
    }
};
