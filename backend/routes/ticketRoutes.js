const express = require('express');
const router = express.Router();
const { 
  createTicket, 
  getTickets, 
  assignTicket, 
  updateTicketStatus, 
  addComment,   // 🆕 Added here!
  updatePriority,deleteTicket,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../Middleware/authMiddleware');

// Student creates ticket
router.post('/', protect, authorize('student'), createTicket);

// View tickets (role-based)
router.get('/', protect, getTickets);

// Admin assigns ticket
router.put('/assign/:id', protect, authorize('admin'), assignTicket);

// Admin/faculty update statuss
router.put('/status/:id', protect, authorize('admin', 'faculty'), updateTicketStatus);

// Add comment (anyone logged in)
router.post('/:id/comment', protect, addComment);

router.put('/:id/priority', protect, updatePriority);
router.delete('/:id', protect, authorize('admin'), deleteTicket); 

module.exports = router;
