const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../Middleware/authMiddleware');

router.post('/', protect, authorize('student'), submitFeedback);
router.get('/', protect, authorize('admin'), getAllFeedback);

module.exports = router;
