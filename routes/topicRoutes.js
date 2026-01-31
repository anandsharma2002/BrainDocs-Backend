const express = require('express');
const {
    getTopics,
    getTopic,
    createTopic,
    updateTopic,
    deleteTopic
} = require('../controllers/topicController');
const {
    getTopicHierarchy,
    createHeading,
    createSubHeading,
    updateHeading,
    updateSubHeading,
    deleteHeading,
    deleteSubHeading
} = require('../controllers/hierarchyController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all routes

router
    .route('/')
    .get(getTopics)
    .post(createTopic);

router
    .route('/:id')
    .get(getTopic)
    .put(updateTopic)
    .delete(deleteTopic);

router.route('/:id/hierarchy').get(getTopicHierarchy);

router.route('/:topicId/headings').post(createHeading);
router.route('/headings/:headingId/subheadings').post(createSubHeading);

router.route('/headings/:id')
    .put(updateHeading)
    .delete(deleteHeading);

router.route('/subheadings/:id')
    .put(updateSubHeading)
    .delete(deleteSubHeading);

module.exports = router;
