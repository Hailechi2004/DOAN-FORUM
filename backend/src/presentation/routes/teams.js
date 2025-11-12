const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const validate = require("../../utils/validator");
const teamController = require("../controllers/teamController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

/**
 * @swagger
 * /api/teams:
 *   get:
 *     tags: [Teams]
 *     summary: Get all teams
 *     description: Retrieve paginated list of teams with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 */
router.get(
  "/",
  authenticate,
  [
    query("department_id").optional().isInt(),
    query("search").optional().isString(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  teamController.getAll
);

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     tags: [Teams]
 *     summary: Get team by ID
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
 *         description: Team retrieved successfully
 */
router.get("/:id", authenticate, teamController.getById);

/**
 * @swagger
 * /api/teams/{id}/members:
 *   get:
 *     tags: [Teams]
 *     summary: Get team members
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
router.get("/:id/members", authenticate, teamController.getMembers);

/**
 * @swagger
 * /api/teams/{id}/stats:
 *   get:
 *     tags: [Teams]
 *     summary: Get team statistics
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
router.get("/:id/stats", authenticate, teamController.getStats);

/**
 * @swagger
 * /api/teams:
 *   post:
 *     tags: [Teams]
 *     summary: Create new team
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
 *               team_lead_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Team created successfully
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "manager"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("description").optional().isString(),
    body("department_id").optional().isInt(),
    body("team_lead_id").optional().isInt(),
  ],
  validate,
  teamController.create
);

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     tags: [Teams]
 *     summary: Update team
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
 *               department_id:
 *                 type: integer
 *               team_lead_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Team updated successfully
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  [
    body("name").optional().notEmpty(),
    body("description").optional().isString(),
    body("department_id").optional().isInt(),
    body("team_lead_id").optional().isInt(),
  ],
  validate,
  teamController.update
);

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     tags: [Teams]
 *     summary: Delete team
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
 *         description: Team deleted successfully
 */
router.delete("/:id", authenticate, authorize("admin"), teamController.delete);

/**
 * @swagger
 * /api/teams/{id}/members:
 *   post:
 *     tags: [Teams]
 *     summary: Add member to team
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
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *               role:
 *                 type: string
 *                 enum: [member, lead]
 *                 default: member
 *     responses:
 *       200:
 *         description: Member added successfully
 */
router.post(
  "/:id/members",
  authenticate,
  authorize("admin", "manager"),
  [
    body("user_id").isInt().withMessage("User ID is required"),
    body("role").optional().isIn(["member", "lead"]),
  ],
  validate,
  teamController.addMember
);

/**
 * @swagger
 * /api/teams/{id}/members/{userId}:
 *   delete:
 *     tags: [Teams]
 *     summary: Remove member from team
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Member removed successfully
 */
router.delete(
  "/:id/members/:userId",
  authenticate,
  authorize("admin", "manager"),
  teamController.removeMember
);

/**
 * @swagger
 * /api/teams/{id}/members/{userId}/role:
 *   patch:
 *     tags: [Teams]
 *     summary: Update member role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [member, lead]
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.patch(
  "/:id/members/:userId/role",
  authenticate,
  authorize("admin", "manager"),
  [body("role").isIn(["member", "lead"])],
  validate,
  teamController.updateMemberRole
);

module.exports = router;
