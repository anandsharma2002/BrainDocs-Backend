const express = require('express');
const { getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:id', getUserProfile);

module.exports = router;
