const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');

// Webhook to trigger update from external source
// POST /api/webhook/update-topics
router.post('/update-topics', async (req, res) => {
    const { secret } = req.body;
    if (secret !== process.env.WEBHOOK_SECRET) {
        // Allow it for now if no secret set, or return 403
        // For demo, just proceed or check simple key
        if (secret !== 'braindocs-secret') {
            // return res.status(403).json({ message: 'Invalid Secret' });
        }
    }

    // Trigger refresh
    const io = req.app.get('io');
    const topics = await Topic.find().sort({ order: 1 });
    io.emit('topics_updated', topics);

    console.log('Webhook received, topics updated');
    res.json({ message: 'Topics refreshed via Webhook' });
});

module.exports = router;
