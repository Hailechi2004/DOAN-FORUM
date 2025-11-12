const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../../utils/validator");
const projectController = require("../controllers/projectController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get all projects
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
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get("/", authenticate, projectController.getAll);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project by ID
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
 *         description: Project details
 */
router.get("/:id", authenticate, projectController.getById);

/**
 * @swagger
 * /api/projects/{id}/members:
 *   get:
 *     tags: [Projects]
 *     summary: Get project members
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
 *         description: List of project members
 */
router.get("/:id/members", authenticate, projectController.getMembers);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create new project (Admin/Manager only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               department_id:
 *                 type: integer
 *               team_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Project created
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "manager", "System Admin", "Administrator"),
  [
    body("name").trim().notEmpty().withMessage("Project name is required"),
    body("description").optional({ nullable: true, checkFalsy: true }),
    body("department_id")
      .optional({ nullable: true, checkFalsy: true })
      .isInt(),
    body("team_id").optional({ nullable: true, checkFalsy: true }).isInt(),
    body("manager_id").optional({ nullable: true, checkFalsy: true }).isInt(),
    body("start_date")
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601(),
    body("end_date").optional({ nullable: true, checkFalsy: true }).isISO8601(),
  ],
  validate,
  projectController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "manager", "System Admin", "Administrator"),
  [
    body("name").optional().trim().notEmpty(),
    body("description").optional({ nullable: true, checkFalsy: true }),
    body("status")
      .optional()
      .isIn(["planning", "in_progress", "completed", "on_hold", "cancelled"]),
    body("department_id")
      .optional({ nullable: true, checkFalsy: true })
      .isInt(),
    body("team_id").optional({ nullable: true, checkFalsy: true }).isInt(),
    body("manager_id").optional({ nullable: true, checkFalsy: true }).isInt(),
    body("start_date")
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601(),
    body("end_date").optional({ nullable: true, checkFalsy: true }).isISO8601(),
  ],
  validate,
  projectController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "manager", "System Admin", "Administrator"),
  projectController.delete
);

router.post("/:id/members", authenticate, projectController.addMember);

router.delete(
  "/:id/members/:userId",
  authenticate,
  projectController.removeMember
);

router.patch("/:id/status", authenticate, projectController.updateStatus);

// Mount project extensions routes (tasks, milestones, comments, files, activities)
const projectExtensionsRouter = require("./projectExtensions");
router.use("/:projectId", projectExtensionsRouter);

module.exports = router;
