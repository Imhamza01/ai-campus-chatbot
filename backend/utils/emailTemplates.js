// utils/emailTemplates.js

const ticketCreatedTemplate = (ticket, user) => `
  <h2>New Ticket Created</h2>
  <p><strong>Title:</strong> ${ticket.title}</p>
  <p><strong>Description:</strong> ${ticket.description}</p>
  <p><strong>Created by:</strong> ${user.name} (${user.email})</p>
  <p>Status: ${ticket.status}</p>
`;

const ticketAssignedTemplate = (ticket, faculty) => `
  <h2>Ticket Assigned to You</h2>
  <p><strong>Title:</strong> ${ticket.title}</p>
  <p><strong>Description:</strong> ${ticket.description}</p>
  <p>Assigned to: ${faculty.name} (${faculty.email})</p>
`;

const ticketStatusUpdatedTemplate = (ticket, student) => `
  <h2>Ticket Status Updated</h2>
  <p><strong>Title:</strong> ${ticket.title}</p>
  <p><strong>Status:</strong> ${ticket.status}</p>
  <p>Hi ${student.name}, your ticket has been updated.</p>
`;

module.exports = {
  ticketCreatedTemplate,
  ticketAssignedTemplate,
  ticketStatusUpdatedTemplate
};
