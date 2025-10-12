// routes/chatRoutes.js
const express = require ("express");
const { sendMessage } = require("../controllers/chatController.js");

const router = express.Router();
router.post("/send", sendMessage);

module.exports =router;
