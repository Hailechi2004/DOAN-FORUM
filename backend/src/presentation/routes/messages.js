const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const validate = require("../../utils/validator");
const messageController = require("../controllers/messageController");
const authenticate = require("../middleware/authenticate");

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     tags: [Messages]
 *     summary: Get all conversations
 *     description: Retrieve all conversations for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       last_message:
 *                         type: string
 *                       last_message_time:
 *                         type: string
 *                         format: date-time
 *                       participants:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/User'
 */
router.get("/conversations", authenticate, messageController.getConversations);

/**
 * @swagger
 * /api/messages/conversations:
 *   post:
 *     tags: [Messages]
 *     summary: Get or create conversation
 *     description: Get existing conversation or create new one with specified user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of user to start conversation with
 *     responses:
 *       200:
 *         description: Conversation retrieved or created successfully
 */
router.post(
  "/conversations",
  authenticate,
  [body("user_id").isInt().withMessage("User ID is required")],
  validate,
  messageController.getOrCreateConversation
);

/**
 * @swagger
 * /api/messages/conversations/{conversation_id}/messages:
 *   get:
 *     tags: [Messages]
 *     summary: Get messages in conversation
 *     description: Retrieve messages from a specific conversation with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 */
router.get(
  "/conversations/:conversation_id/messages",
  authenticate,
  [
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("offset").optional().isInt({ min: 0 }),
  ],
  validate,
  messageController.getMessages
);

/**
 * @swagger
 * /api/messages/send:
 *   post:
 *     tags: [Messages]
 *     summary: Send message
 *     description: Send a new message in a conversation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversation_id
 *               - content
 *             properties:
 *               conversation_id:
 *                 type: integer
 *               content:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post(
  "/send",
  authenticate,
  [
    body("conversation_id").isInt().withMessage("Conversation ID is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("attachments").optional().isArray(),
  ],
  validate,
  messageController.sendMessage
);

/**
 * @swagger
 * /api/messages/messages/{message_id}/read:
 *   patch:
 *     tags: [Messages]
 *     summary: Mark message as read
 *     description: Mark a message as read by the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: message_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message marked as read
 */
router.patch(
  "/messages/:message_id/read",
  authenticate,
  messageController.markAsRead
);

module.exports = router;
