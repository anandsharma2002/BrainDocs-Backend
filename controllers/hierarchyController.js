const Topic = require('../models/Topic');
const Heading = require('../models/Heading');
const SubHeading = require('../models/SubHeading');

// @desc    Get full topic hierarchy (SideBar)
// @route   GET /api/v1/topics/:id/hierarchy
// @access  Private
exports.getTopicHierarchy = async (req, res, next) => {
    try {
        const topic = await Topic.findById(req.params.id).populate({
            path: 'headings',
            populate: {
                path: 'subHeadings'
            }
        });

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

// @desc    Create Heading
// @route   POST /api/v1/topics/:topicId/headings
// @access  Private
exports.createHeading = async (req, res, next) => {
    try {
        req.body.topicId = req.params.topicId;

        const topic = await Topic.findById(req.params.topicId);
        if (!topic) {
            return res.status(404).json({ success: false, message: 'Topic not found' });
        }

        // Authorization check
        if (topic.createdBy.toString() !== req.user.id && req.user.role !== 'SuperAdmin') {
            return res.status(401).json({ success: false, message: 'Not authorized to add content to this topic' });
        }

        const heading = await Heading.create(req.body);

        res.status(201).json({
            success: true,
            data: heading
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create SubHeading
// @route   POST /api/v1/headings/:headingId/subheadings
// @access  Private
exports.createSubHeading = async (req, res, next) => {
    try {
        req.body.headingId = req.params.headingId;

        const heading = await Heading.findById(req.params.headingId).populate('topicId');
        if (!heading) {
            return res.status(404).json({ success: false, message: 'Heading not found' });
        }

        // Authorization check (via Topic)
        const topic = await Topic.findById(heading.topicId);
        if (topic.createdBy.toString() !== req.user.id && req.user.role !== 'SuperAdmin') {
            return res.status(401).json({ success: false, message: 'Not authorized to add content to this topic' });
        }

        const subHeading = await SubHeading.create(req.body);

        res.status(201).json({
            success: true,
            data: subHeading
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update Heading
// @route   PUT /api/v1/topics/headings/:id
// @access  Private
exports.updateHeading = async (req, res, next) => {
    try {
        let heading = await Heading.findById(req.params.id);

        if (!heading) {
            return res.status(404).json({ success: false, message: 'Heading not found' });
        }

        const topic = await Topic.findById(heading.topicId);
        // Authorization check
        if (topic.createdBy.toString() !== req.user.id && req.user.role !== 'SuperAdmin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this heading' });
        }

        heading = await Heading.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: heading
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update SubHeading
// @route   PUT /api/v1/topics/subheadings/:id
// @access  Private
exports.updateSubHeading = async (req, res, next) => {
    try {
        let subHeading = await SubHeading.findById(req.params.id);

        if (!subHeading) {
            return res.status(404).json({ success: false, message: 'SubHeading not found' });
        }

        // We need to find the topic to check ownership. SubHeading -> Heading -> Topic
        const heading = await Heading.findById(subHeading.headingId);
        const topic = await Topic.findById(heading.topicId);

        // Authorization check
        if (topic.createdBy.toString() !== req.user.id && req.user.role !== 'SuperAdmin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this subheading' });
        }

        subHeading = await SubHeading.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: subHeading
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete Heading
// @route   DELETE /api/v1/headings/:id
// @access  Private
exports.deleteHeading = async (req, res, next) => {
    try {
        const heading = await Heading.findById(req.params.id);

        if (!heading) {
            return res.status(404).json({ success: false, message: 'Heading not found' });
        }

        const topic = await Topic.findById(heading.topicId);
        // Authorization check
        if (topic.createdBy.toString() !== req.user.id && req.user.role !== 'SuperAdmin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this heading' });
        }

        await heading.deleteOne(); // Trigger cascade delete

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete SubHeading
// @route   DELETE /api/v1/subheadings/:id
// @access  Private
exports.deleteSubHeading = async (req, res, next) => {
    try {
        const subHeading = await SubHeading.findById(req.params.id);

        if (!subHeading) {
            return res.status(404).json({ success: false, message: 'SubHeading not found' });
        }

        // We need to find the topic to check ownership. SubHeading -> Heading -> Topic
        const heading = await Heading.findById(subHeading.headingId);
        const topic = await Topic.findById(heading.topicId);

        // Authorization check
        if (topic.createdBy.toString() !== req.user.id && req.user.role !== 'SuperAdmin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this subheading' });
        }

        await subHeading.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
