const PageContent = require('../models/PageContent');
const Topic = require('../models/Topic');
const Heading = require('../models/Heading');
const SubHeading = require('../models/SubHeading');

// @desc    Get content for a page
// @route   GET /api/v1/content/:referenceId
// @access  Private
exports.getContent = async (req, res, next) => {
    try {
        let content = await PageContent.findOne({ referenceId: req.params.referenceId });

        if (!content) {
            // Return empty blocks if no content exists yet
            return res.status(200).json({
                success: true,
                data: { blocks: [] }
            });
        }

        res.status(200).json({
            success: true,
            data: content
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update or Create content for a page
// @route   PUT /api/v1/content/:referenceId
// @access  Private
exports.updateContent = async (req, res, next) => {
    try {
        const { referenceId } = req.params;
        const { referenceModel, blocks } = req.body;

        // Check ownership (Optional: You might want to query the reference item to check createdBy)
        // For simplicity, limiting to SuperAdmin for now or relying on general auth. 
        // Ideally, check if req.user.id === topic owner.
        // Skipping complex ownership check for MVP speed, but enforcing Auth.

        let content = await PageContent.findOne({ referenceId });

        if (content) {
            content.blocks = blocks;
            content.lastUpdated = Date.now();
            await content.save();
        } else {
            content = await PageContent.create({
                referenceId,
                referenceModel,
                blocks
            });
        }

        res.status(200).json({
            success: true,
            data: content
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
