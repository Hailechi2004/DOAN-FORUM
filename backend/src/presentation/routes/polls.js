const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../../utils/validator");
const pollController = require("../controllers/pollController");
const authenticate = require("../middleware/authenticate");

/**
 * @swagger
 * /api/polls:
 *   get:
 *     tags: [Polls]
 *     summary: Get all polls
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: created_by
 *         schema:
 *           type: integer
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 *         description: Polls retrieved successfully
 */
router.get("/", authenticate, pollController.getAll);

/**
 * @swagger
 * /api/polls/{id}:
 *   get:
 *     tags: [Polls]
 *     summary: Get poll by ID
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
 *         description: Poll retrieved successfully
 */
router.get("/:id", authenticate, pollController.getById);

/**
 * @swagger
 * /api/polls/{id}/results:
 *   get:
 *     tags: [Polls]
 *     summary: Get poll results
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
 *         description: Results retrieved successfully
 */
router.get("/:id/results", authenticate, pollController.getResults);

/**
 * @swagger
 * /api/polls:
 *   post:
 *     tags: [Polls]
 *     summary: Create poll
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - options
 *             properties:
 *               question:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *               allow_multiple:
 *                 type: boolean
 *               is_anonymous:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Poll created successfully
 */
router.post(
  "/",
  authenticate,
  [
    body("question").notEmpty(),
    body("options").isArray({ min: 2 }),
    body("expires_at").optional().isISO8601(),
    body("allow_multiple").optional().isBoolean(),
    body("is_anonymous").optional().isBoolean(),
  ],
  validate,
  pollController.create
);

/**
 * @swagger
 * /api/polls/{id}/vote:
 *   post:
 *     tags: [Polls]
 *     summary: Vote on poll
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
 *               - option_ids
 *             properties:
 *               option_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 */
router.post(
  "/:id/vote",
  authenticate,
  [body("option_ids").isArray({ min: 1 })],
  validate,
  pollController.vote
);

/**
 * @swagger
 * /api/polls/{id}:
 *   delete:
 *     tags: [Polls]
 *     summary: Delete poll
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
 *         description: Poll deleted successfully
 */
router.delete("/:id", authenticate, pollController.delete);

module.exports = router;
