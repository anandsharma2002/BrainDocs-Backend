const Topic = require('../models/Topic');

// Get all topics (for sidebar)
// Returns user's own topics + public topics from others
exports.getTopics = async (req, res) => {
    try {
        let query = {};

        // If user is authenticated, show their topics + public topics
        if (req.user) {
            query = {
                $or: [
                    { owner: req.user._id }, // User's own topics
                    { isPublic: true } // Public topics from others
                ]
            };
        } else {
            // If not authenticated, only show public topics
            query = { isPublic: true };
        }

        const topics = await Topic.find(query)
            .populate('owner', 'name email avatar')
            .sort({ order: 1 });
        res.json(topics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new Main Topic
exports.createTopic = async (req, res) => {
    const { title, slug, description, isPublic } = req.body;
    try {
        const newTopic = new Topic({
            title,
            slug,
            description,
            owner: req.user._id, // Set owner to current user
            isPublic: isPublic || false
        });
        await newTopic.save();

        // Emit event to update sidebar for all users
        const io = req.app.get('io');
        io.emit('topics_updated');

        res.status(201).json(newTopic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Add Subheading to Topic
exports.addSubheading = async (req, res) => {
    const { topicId } = req.params;
    const { title, slug, content, description, titleLevel } = req.body;

    try {
        const topic = await Topic.findById(topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        topic.subheadings.push({ title, slug, content, description, titleLevel });
        await topic.save();

        const io = req.app.get('io');
        io.emit('topics_updated', await Topic.find().sort({ order: 1 }));

        res.json(topic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Add Secondary Heading to Subheading
exports.addSecondaryHeading = async (req, res) => {
    const { topicId, subheadingId } = req.params;
    const { title, slug, content } = req.body;

    try {
        const topic = await Topic.findById(topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        const subheading = topic.subheadings.id(subheadingId);
        if (!subheading) return res.status(404).json({ message: 'Subheading not found' });

        subheading.secondaryHeadings.push({ title, slug, content });
        await topic.save();

        const io = req.app.get('io');
        io.emit('topics_updated', await Topic.find().sort({ order: 1 }));

        res.json(topic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update Subheading Content
// Update Subheading Content
exports.updateSubheading = async (req, res) => {
    const { topicId, subheadingId } = req.params;
    const { content, title, slug, description, titleLevel } = req.body;

    try {
        const topic = await Topic.findById(topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        const subheading = topic.subheadings.id(subheadingId);
        if (!subheading) return res.status(404).json({ message: 'Subheading not found' });

        if (content !== undefined) subheading.content = content;
        if (title !== undefined) subheading.title = title;
        if (slug !== undefined) subheading.slug = slug;
        if (description !== undefined) subheading.description = description;
        if (titleLevel !== undefined) subheading.titleLevel = titleLevel;

        await topic.save();

        const io = req.app.get('io');
        // Emit update if structure (title/slug) changed, otherwise just save
        if (title || slug) {
            io.emit('topics_updated', await Topic.find().sort({ order: 1 }));
        }

        res.json(topic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update Secondary Heading Content
exports.updateSecondaryHeading = async (req, res) => {
    const { topicId, subheadingId, secondaryId } = req.params;
    const { content, title, slug, description, titleLevel } = req.body;

    try {
        const topic = await Topic.findById(topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        const subheading = topic.subheadings.id(subheadingId);
        if (!subheading) return res.status(404).json({ message: 'Subheading not found' });

        const secondary = subheading.secondaryHeadings.id(secondaryId);
        if (!secondary) return res.status(404).json({ message: 'Secondary Heading not found' });

        if (content !== undefined) secondary.content = content;
        if (title !== undefined) secondary.title = title;
        if (slug !== undefined) secondary.slug = slug;
        if (description !== undefined) secondary.description = description;
        if (titleLevel !== undefined) secondary.titleLevel = titleLevel;

        await topic.save();
        res.json(topic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete Main Topic
exports.deleteTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const topic = await Topic.findById(topicId);

        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        // Check ownership (SuperAdmin or owner)
        if (req.user.role !== 'SuperAdmin' && topic.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this topic' });
        }

        await Topic.findByIdAndDelete(topicId);

        const io = req.app.get('io');
        io.emit('topics_updated');

        res.json({ message: 'Topic deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete Subheading
exports.deleteSubheading = async (req, res) => {
    try {
        const { topicId, subheadingId } = req.params;
        const topic = await Topic.findById(topicId);

        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        topic.subheadings.pull({ _id: subheadingId });
        await topic.save();

        const io = req.app.get('io');
        io.emit('topics_updated', await Topic.find().sort({ order: 1 }));

        res.json(topic);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete Secondary Heading
exports.deleteSecondaryHeading = async (req, res) => {
    try {
        const { topicId, subheadingId, secondaryId } = req.params;
        const topic = await Topic.findById(topicId);

        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        const subheading = topic.subheadings.id(subheadingId);
        if (!subheading) return res.status(404).json({ message: 'Subheading not found' });

        subheading.secondaryHeadings.pull({ _id: secondaryId });
        await topic.save();

        const io = req.app.get('io');
        io.emit('topics_updated', await Topic.find().sort({ order: 1 }));

        res.json(topic);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
