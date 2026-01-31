const Topic = require('../models/Topic');

// @desc    Get all topics (Public + Created by User)
// @route   GET /api/v1/topics
// @access  Private
exports.getTopics = async (req, res, next) => {
    try {
        const query = {
            $or: [
                { isPublic: true },
                { createdBy: req.user.id }
            ]
        };

        const topics = await Topic.find(query).populate({
            path: 'headings',
            populate: {
                path: 'subHeadings'
            }
        });

        res.status(200).json({
            success: true,
            count: topics.length,
            data: topics
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single topic
// @route   GET /api/v1/topics/:id
// @access  Private
exports.getTopic = async (req, res, next) => {
    try {
        const topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ success: false, message: 'Topic not found' });
        }

        res.status(200).json({
            success: true,
            data: topic
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new topic
// @route   POST /api/v1/topics
// @access  Private
exports.createTopic = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.createdBy = req.user.id;

        // Check for published topic restriction (Only SuperAdmin can create public topics)
        if (req.body.isPublic && req.user.role !== 'SuperAdmin') {
            return res.status(401).json({ success: false, message: 'Not authorized to create public topics' });
        }

        const topic = await Topic.create(req.body);

        res.status(201).json({
            success: true,
            data: topic
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Topic with this title already exists' });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update topic
// @route   PUT /api/v1/topics/:id
// @access  Private
exports.updateTopic = async (req, res, next) => {
    try {
        let topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ success: false, message: 'Topic not found' });
        }

        // Make sure user is topic owner or SuperAdmin
        if (topic.createdBy.toString() !== req.user.id && req.user.role !== 'SuperAdmin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this topic' });
        }

        topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: topic
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete topic
// @route   DELETE /api/v1/topics/:id
// @access  Private
exports.deleteTopic = async (req, res, next) => {
    try {
        const topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ success: false, message: 'Topic not found' });
        }

        // Make sure user is topic owner or SuperAdmin
        if (topic.createdBy.toString() !== req.user.id && req.user.role !== 'SuperAdmin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this topic' });
        }

        await topic.deleteOne(); // Trigger cascade delete

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
