const User = require('../models/User');
const Topic = require('../models/Topic');

// @desc    Global Search (Users & Topics)
// @route   GET /api/v1/search
// @access  Private
exports.globalSearch = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ success: false, message: 'Please provide a search term' });
        }

        // Search Users
        const users = await User.find({
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { fullName: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        }).select('username fullName email avatar bio');

        // Search Topics
        // Ensure Topic model has text index. I'll need to verify/add valid text index on Topic.
        // If not added yet, I should add it. 
        // For now, let's use Regex for Topics if Text Index isn't guaranteed, 
        // BUT Text Index is better. Assuming I add it or use Regex for now.
        // Let's use Regex for flexibility on partial matches for Topics titles.

        const topics = await Topic.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ],
            // Only show public or own topics
            $or: [
                { isPublic: true },
                { createdBy: req.user.id }
            ]
        }).select('title route description');

        res.status(200).json({
            success: true,
            data: {
                users,
                topics
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
