const express = require('express');
const { getContent, updateContent } = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/:referenceId')
    .get(getContent)
    .put(updateContent);

module.exports = router;
