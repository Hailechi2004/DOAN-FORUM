const express = require("express");
const router = express.Router();
const { query } = require("express-validator");
const validate = require("../../utils/validator");
const analyticsController = require("../controllers/analyticsController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Get dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 activeUsers:
 *                   type: integer
 *                 totalPosts:
 *                   type: integer
 *                 postsThisMonth:
 *                   type: integer
 *                 totalProjects:
 *                   type: integer
 *                 activeProjects:
 *                   type: integer
 *                 totalTasks:
 *                   type: integer
 *                 completedTasks:
 *                   type: integer
 */
router.get("/dashboard", authenticate, analyticsController.getDashboard);

/**
 * @swagger
 * /api/analytics/activity-trend:
 *   get:
 *     tags: [Analytics]
 *     summary: Get activity trend over time
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Activity trend data
 */
router.get(
  "/activity-trend",
  authenticate,
  analyticsController.getActivityTrend
);

/**
 * @swagger
 * /api/analytics/top-users:
 *   get:
 *     tags: [Analytics]
 *     summary: Get top contributing users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top users list
 */
router.get("/top-users", authenticate, analyticsController.getTopUsers);

/**
 * @swagger
 * /api/analytics/projects:
 *   get:
 *     tags: [Analytics]
 *     summary: Get project statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project statistics by status
 */
router.get(
  "/projects",
  authenticate,
  authorize("admin", "manager"),
  analyticsController.getProjectStats
);

/**
 * @swagger
 * /api/analytics/tasks:
 *   get:
 *     tags: [Analytics]
 *     summary: Get task statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task statistics by status and priority
 */
router.get(
  "/tasks",
  authenticate,
  authorize("admin", "manager"),
  analyticsController.getTaskStats
);

module.exports = router;
