const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const validate = require("../../utils/validator");
const departmentController = require("../controllers/departmentController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

/**
 * @swagger
 * /api/departments:
 *   get:
 *     tags: [Departments]
 *     summary: Get all departments
 *     description: Retrieve all departments with optional filters and tree structure
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parent_id
 *         schema:
 *           type: integer
 *         description: Filter by parent department ID (use 'null' for root departments)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name and description
 *       - in: query
 *         name: tree
 *         schema:
 *           type: boolean
 *         description: Return hierarchical tree structure
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 */
router.get(
  "/",
  authenticate,
  [
    query("parent_id").optional(),
    query("search").optional().isString(),
    query("tree").optional().isBoolean(),
  ],
  validate,
  departmentController.getAll
);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     tags: [Departments]
 *     summary: Get department by ID
 *     description: Retrieve single department with details
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
 *         description: Department retrieved successfully
 *       404:
 *         description: Department not found
 */
router.get("/:id", authenticate, departmentController.getById);

/**
 * @swagger
 * /api/departments/{id}/members:
 *   get:
 *     tags: [Departments]
 *     summary: Get department members
 *     description: Retrieve all members of a department
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
 *         description: Members retrieved successfully
 */
router.get("/:id/members", authenticate, departmentController.getMembers);

/**
 * @swagger
 * /api/departments/{id}/stats:
 *   get:
 *     tags: [Departments]
 *     summary: Get department statistics
 *     description: Get statistics including members, posts, projects count
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
 *         description: Statistics retrieved successfully
 */
router.get("/:id/stats", authenticate, departmentController.getStats);

/**
 * @swagger
 * /api/departments:
 *   post:
 *     tags: [Departments]
 *     summary: Create new department
 *     description: Create a new department (admin only)
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
 *                 example: Engineering
 *               description:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *                 nullable: true
 *               manager_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Department created successfully
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "manager"),
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 200 }),
    body("description").optional().isString(),
    body("parent_id").optional().isInt(),
    body("manager_id").optional().isInt(),
  ],
  validate,
  departmentController.create
);

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     tags: [Departments]
 *     summary: Update department
 *     description: Update department details (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *               manager_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Department updated successfully
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  [
    body("name").optional().isLength({ max: 200 }),
    body("description").optional().isString(),
    body("parent_id").optional().isInt(),
    body("manager_id").optional().isInt(),
  ],
  validate,
  departmentController.update
);

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     tags: [Departments]
 *     summary: Delete department
 *     description: Soft delete department (admin only)
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
 *         description: Department deleted successfully
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  departmentController.delete
);

module.exports = router;
