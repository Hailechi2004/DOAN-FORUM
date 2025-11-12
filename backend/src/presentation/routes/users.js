const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../../utils/validator");
const userController = require("../controllers/userController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  "/",
  authenticate,
  authorize("admin", "manager", "System Admin", "Administrator"),
  userController.getAll
);

/**
 * @swagger
 * /api/users/profile/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get("/profile/me", authenticate, userController.getMyProfile);

/**
 * @swagger
 * /api/users/profile/me:
 *   put:
 *     tags: [Users]
 *     summary: Update own profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               bio:
 *                 type: string
 *               birth_date:
 *                 type: string
 *               gender:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/profile/me", authenticate, userController.updateMyProfile);

/**
 * @swagger
 * /api/users/profile/password:
 *   put:
 *     tags: [Users]
 *     summary: Change password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 */
router.put("/profile/password", authenticate, userController.changePassword);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get("/:id", authenticate, userController.getById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user (Admin/Manager only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin", "manager", "System Admin", "Administrator"),
  userController.update
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (Admin only)
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
 *         description: User deleted
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "System Admin", "Administrator"),
  userController.delete
);

router.post(
  "/:id/roles",
  authenticate,
  authorize("admin", "System Admin", "Administrator"),
  [body("role_id").isInt().withMessage("Role ID is required")],
  validate,
  userController.assignRole
);

router.delete(
  "/:id/roles/:roleId",
  authenticate,
  authorize("admin", "System Admin", "Administrator"),
  userController.removeRole
);

module.exports = router;
