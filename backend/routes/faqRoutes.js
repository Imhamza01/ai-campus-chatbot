const express = require('express');
const router = express.Router();
const { getAllFAQs, addFAQ, updateFAQ, deleteFAQ } = require('../controllers/faqController');
const { protect, authorize } = require('../Middleware/authMiddleware');

// Public for students/faculty
router.get('/', protect, getAllFAQs);

// Admin only
router.post('/', protect, authorize('admin'), addFAQ);
router.put('/:id', protect, authorize('admin'), updateFAQ);
router.delete('/:id', protect, authorize('admin'), deleteFAQ);

module.exports = router;
