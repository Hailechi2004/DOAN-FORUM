const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/authenticate");
const projectNotificationController = require("../controllers/projectNotificationController");

// Get my notifications
router.get("/", authenticate, projectNotificationController.getMyNotifications);

// Get unread count
router.get(
  "/unread-count",
  authenticate,
  projectNotificationController.getUnreadCount
);

// Mark notification as read
router.put("/:id/read", authenticate, projectNotificationController.markAsRead);

// Mark all as read
router.put(
  "/read-all",
  authenticate,
  projectNotificationController.markAllAsRead
);

// Delete notification
router.delete(
  "/:id",
  authenticate,
  projectNotificationController.deleteNotification
);

module.exports = router;
