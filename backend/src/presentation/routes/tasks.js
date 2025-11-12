const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../../utils/validator");
const taskController = require("../controllers/taskController");
const authenticate = require("../middleware/authenticate");

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get all tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get("/", authenticate, taskController.getAll);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by ID
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
 *         description: Task details
 */
router.get("/:id", authenticate, taskController.getById);

/**
 * @swagger
 * /api/tasks/{id}/comments:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task comments
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
 *         description: List of task comments
 */
router.get("/:id/comments", authenticate, taskController.getComments);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create new task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               project_id:
 *                 type: integer
 *               assigned_to:
 *                 type: integer
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Task created
 */
router.post(
  "/",
  authenticate,
  [
    body("title").trim().notEmpty().withMessage("Task title is required"),
    body("description").optional(),
    body("project_id").optional({ nullable: true }).isInt(),
    body("assigned_to").optional().isInt(),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    body("status")
      .optional()
      .isIn(["pending", "in_progress", "completed", "cancelled"]),
    body("due_date").optional().isISO8601(),
  ],
  validate,
  taskController.create
);

router.put("/:id", authenticate, taskController.update);

router.delete("/:id", authenticate, taskController.delete);

router.patch("/:id/status", authenticate, taskController.updateStatus);

router.patch("/:id/assign", authenticate, taskController.assignTo);

module.exports = router;
