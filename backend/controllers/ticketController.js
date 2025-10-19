const Ticket = require('../models/Ticket');
const { sendEmail } = require('../utils/mailer');
const { ticketCreatedTemplate } = require('../utils/emailTemplates');
const User = require('../models/UserMain'); // make sure User is imported
const { createNotification } = require('../utils/notifications');

const createTicket = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can create tickets.' });
    }

    const { title, description, priority, category } = req.body; // ✅ FIXED

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || 'medium',
      category: category || 'general',
      createdBy: req.user._id,
      status: 'open',
    });

    const admins = await User.find({ role: 'admin' });

    await Promise.all(
      admins.map(admin =>
        createNotification(
          admin._id,
          `New ticket "${ticket.title}" created by ${req.user.name}`,
          `/tickets/${ticket._id}`
        )
      )
    );

    try {
      await Promise.all(
        admins.map(admin =>
          sendEmail({
            to: admin.email,
            subject: `New Ticket Created: ${ticket.title}`,
            text: `Ticket "${title}" has been created by ${req.user.name}`,
          })
        )
      );
    } catch (err) {
      console.error('Failed to send admin emails:', err.message);
    }

    try {
      await sendEmail({
        to: req.user.email,
        subject: `Your Ticket "${ticket.title}" has been created`,
        text: `Hi ${req.user.name},\n\nYour ticket has been successfully created.`,
      });
    } catch (err) {
      console.error('Failed to send student email:', err.message);
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ message: error.message });
  }
};
// Update priority (admin/faculty only)
// Update ticket priority (admin/faculty)

const updatePriority = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('createdBy', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const { priority } = req.body;
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority value' });
    }

    ticket.priority = priority;
    await ticket.save();

    // Notify student about priority change
    if (ticket.createdBy?.email) {
      await sendEmail({
        to: ticket.createdBy.email,
        subject: `Ticket Priority Updated`,
        text: `The priority of your ticket "${ticket.title}" has been updated to "${ticket.priority}".`,
      });
    }

    res.json({ message: 'Priority updated', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tickets (role-based)
const getTickets = async (req, res) => {
  try {
    let tickets;

    if (req.user.role === 'admin') {
      // Admin sees all tickets
      tickets = await Ticket.find()
        .populate('createdBy assignedTo', 'name email role');
    } 
    else if (req.user.role === 'faculty') {
      // Faculty sees only tickets assigned to them
      tickets = await Ticket.find({ assignedTo: req.user._id })
        .populate('createdBy assignedTo', 'name email role');
    } 
    else if (req.user.role === 'student') {
      // Student sees only their own tickets
      tickets = await Ticket.find({ createdBy: req.user._id })
        .populate('assignedTo', 'name email role');
    } 
    else {
      return res.status(403).json({ message: 'Invalid role.' });
    }

    res.json(tickets);
  } catch (error) {
    console.error("getTickets error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Assign ticket to faculty (only admin)
const assignTicket = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can assign tickets.' });
    }

    const ticket = await Ticket.findById(req.params.id).populate('assignedTo', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    ticket.assignedTo = req.body.assignedTo;
    await ticket.save();

    const faculty = await User.findById(req.body.assignedTo);
if (faculty) {
  await createNotification(faculty._id, `Ticket "${ticket.title}" assigned to you`, `/tickets/${ticket._id}`);
}

    res.json(ticket);

    // Notify faculty
    if (ticket.assignedTo) {
      try {
        await sendEmail({
          to: ticket.assignedTo.email,
          subject: `Ticket Assigned: ${ticket.title}`,
          text: `Hello ${ticket.assignedTo.name},\n\nYou have been assigned a new ticket: "${ticket.title}".\n\n- AI Helpdesk Team`,
        });
      } catch (err) {
        console.error('Failed to send ticket assignment email:', err.message);
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update ticket status (faculty/admin)
const updateTicketStatus = async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only faculty or admin can update ticket status.' });
    }

    const ticket = await Ticket.findById(req.params.id).populate('createdBy', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    const oldStatus = ticket.status;
    ticket.status = req.body.status || ticket.status;
    await ticket.save();

    await createNotification(ticket.createdBy._id, `Your ticket "${ticket.title}" status updated to "${ticket.status}"`, `/tickets/${ticket._id}`);

    res.json(ticket);

    // Send email only if status changed
    if (oldStatus !== ticket.status) {
      try {
        await sendEmail({
          to: ticket.createdBy.email,
          subject: `Your Ticket "${ticket.title}" Status Updated`,
          text: `Hello ${ticket.createdBy.name},\n\nThe status of your ticket "${ticket.title}" has been updated to "${ticket.status}".\n\n- AI Helpdesk Team`,
        });
      } catch (err) {
        console.error('Failed to send ticket status email:', err.message);
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Add a comment (student, faculty, or admin)
const addComment = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const newComment = { user: req.user._id, message };
    ticket.comments.push(newComment);
    await ticket.save();

    const populated = await ticket.populate('comments.user', 'name email role');
    res.status(201).json(populated.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteTicket = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete tickets." });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.json({ message: "Ticket deleted successfully." });
  } catch (error) {
    console.error("Delete ticket error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTicket,deleteTicket, getTickets, assignTicket, updateTicketStatus, addComment,updatePriority };
