export default {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile'
  },
  CHAT: {
    SEND: '/api/chat/send'
  },
  FAQ: {
    LIST: '/api/faq',        // GET
    CRUD: '/api/faq'         // POST/PUT/DELETE with /:id
  },
  TICKETS: {
    ROOT: '/api/tickets',    // POST create, GET list
    ASSIGN: '/api/tickets/assign/:id',
    STATUS: '/api/tickets/status/:id',
    COMMENT: '/api/tickets/:id/comment',
    PRIORITY: '/api/tickets/:id/priority'
  },
  FEEDBACK: {
    ROOT: '/api/feedback'
  },
  ADMIN: {
    USERS: '/api/admin/users' // GET list, POST create
  },
  NOTIFICATIONS: {
    ROOT: '/api/notifications'
  }
};
