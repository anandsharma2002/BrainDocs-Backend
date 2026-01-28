const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');

router.get('/', topicController.getTopics);
router.post('/', topicController.createTopic);
router.post('/:topicId/subheadings', topicController.addSubheading);
router.put('/:topicId/subheadings/:subheadingId', topicController.updateSubheading);
router.post('/:topicId/subheadings/:subheadingId/secondary', topicController.addSecondaryHeading);
router.put('/:topicId/subheadings/:subheadingId/secondary/:secondaryId', topicController.updateSecondaryHeading);

router.delete('/:topicId', topicController.deleteTopic);
router.delete('/:topicId/subheadings/:subheadingId', topicController.deleteSubheading);
router.delete('/:topicId/subheadings/:subheadingId/secondary/:secondaryId', topicController.deleteSecondaryHeading);

module.exports = router;
