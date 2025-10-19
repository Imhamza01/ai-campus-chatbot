// add at top as you already have other routes
const express = require('express');
const router = express.Router();
const { getAllFAQs, addFAQ, updateFAQ, deleteFAQ, getTopFAQs, getFaqCount } = require('../controllers/faqController');
const { protect, authorize } = require('../Middleware/authMiddleware');

router.get('/', protect, getAllFAQs);
router.get('/top', getTopFAQs);          // ✅ no "protect"
router.get('/count', getFaqCount);  ;        // <-- new

router.post('/', protect, authorize('admin'), addFAQ);
router.put('/:id', protect, authorize('admin'), updateFAQ);
router.delete('/:id', protect, authorize('admin'), deleteFAQ);

module.exports = router;
    