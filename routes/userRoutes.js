const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// All routes are public (viewing user profiles)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/:id/topics', userController.getUserTopics);

module.exports = router;
