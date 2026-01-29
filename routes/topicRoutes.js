const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const { authenticate } = require('../middleware/auth');

// Optional authentication for GET (shows different topics based on auth status)
router.get('/', (req, res, next) => {
    // Try to authenticate, but don't fail if no token
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        return authenticate(req, res, next);
    }
    next();
}, topicController.getTopics);

// Protected routes - require authentication
router.post('/', authenticate, topicController.createTopic);
router.post('/:topicId/subheadings', authenticate, topicController.addSubheading);
router.put('/:topicId/subheadings/:subheadingId', authenticate, topicController.updateSubheading);
router.post('/:topicId/subheadings/:subheadingId/secondary', authenticate, topicController.addSecondaryHeading);
router.put('/:topicId/subheadings/:subheadingId/secondary/:secondaryId', authenticate, topicController.updateSecondaryHeading);

router.delete('/:topicId', authenticate, topicController.deleteTopic);
router.delete('/:topicId/subheadings/:subheadingId', authenticate, topicController.deleteSubheading);
router.delete('/:topicId/subheadings/:subheadingId/secondary/:secondaryId', authenticate, topicController.deleteSecondaryHeading);

module.exports = router;
