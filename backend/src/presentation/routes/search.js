const express = require("express");
const router = express.Router();
const { query } = require("express-validator");
const validate = require("../../utils/validator");
const searchController = require("../controllers/searchController");
const authenticate = require("../middleware/authenticate");

/**
 * @swagger
 * /api/search:
 *   get:
 *     tags: [Search]
 *     summary: Global search across all resources
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (minimum 2 characters)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [posts, users, projects, tasks, files, departments, teams]
 *         description: Filter by resource type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum results per type
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: object
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                 departments:
 *                   type: array
 *                   items:
 *                     type: object
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get(
  "/",
  authenticate,
  [query("q").notEmpty().isLength({ min: 2 })],
  validate,
  searchController.globalSearch
);

module.exports = router;
