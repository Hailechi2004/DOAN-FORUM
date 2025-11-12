const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../../utils/validator");
const bookmarkController = require("../controllers/bookmarkController");
const authenticate = require("../middleware/authenticate");

/**
 * @swagger
 * /api/bookmarks:
 *   get:
 *     tags: [Bookmarks]
 *     summary: Get user bookmarks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: resource_type
 *         schema:
 *           type: string
 *           enum: [post, file, project, task]
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
 *         description: Bookmarks retrieved successfully
 */
router.get("/", authenticate, bookmarkController.getAll);

/**
 * @swagger
 * /api/bookmarks/{id}:
 *   get:
 *     tags: [Bookmarks]
 *     summary: Get bookmark by ID
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
 *         description: Bookmark retrieved successfully
 */
router.get("/:id", authenticate, bookmarkController.getById);

/**
 * @swagger
 * /api/bookmarks:
 *   post:
 *     tags: [Bookmarks]
 *     summary: Create bookmark
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource_type
 *               - resource_id
 *             properties:
 *               resource_type:
 *                 type: string
 *                 enum: [post, file, project, task]
 *               resource_id:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bookmark created successfully
 */
router.post(
  "/",
  authenticate,
  [
    body("resource_type").isIn(["post", "file", "project", "task"]),
    body("resource_id").isInt(),
    body("notes").optional(),
  ],
  validate,
  bookmarkController.create
);

/**
 * @swagger
 * /api/bookmarks/{id}:
 *   put:
 *     tags: [Bookmarks]
 *     summary: Update bookmark notes
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
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bookmark updated successfully
 */
router.put("/:id", authenticate, bookmarkController.update);

/**
 * @swagger
 * /api/bookmarks/{id}:
 *   delete:
 *     tags: [Bookmarks]
 *     summary: Delete bookmark
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
 *         description: Bookmark deleted successfully
 */
router.delete("/:id", authenticate, bookmarkController.delete);

module.exports = router;
