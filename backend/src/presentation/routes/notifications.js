const express = require("express");
const router = express.Router();
const { query } = require("express-validator");
const validate = require("../../utils/validator");
const notificationController = require("../controllers/notificationController");
const authenticate = require("../middleware/authenticate");

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all notifications
 *     description: Retrieve paginated notifications for authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     unreadCount:
 *                       type: integer
 *                     pagination:
 *                       type: object
 */
router.get(
  "/",
  authenticate,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  notificationController.getAll
);

/**
 * @swagger
 * /api/notifications/unread:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notifications
 *     description: Retrieve only unread notifications for authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notifications retrieved successfully
 */
router.get("/unread", authenticate, notificationController.getUnread);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.patch("/:id/read", authenticate, notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     description: Mark all user notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch("/read-all", authenticate, notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
 *     description: Delete a specific notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 */
router.delete("/:id", authenticate, notificationController.delete);

module.exports = router;
