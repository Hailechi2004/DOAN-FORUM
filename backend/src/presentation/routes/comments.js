const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../../utils/validator");
const commentController = require("../controllers/commentController");
const authenticate = require("../middleware/authenticate");

/**
 * @swagger
 * /api/comments/post/{post_id}:
 *   get:
 *     tags: [Comments]
 *     summary: Get comments for a post
 *     description: Retrieve all comments for a specific post (hierarchical structure)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 */
router.get("/post/:post_id", authenticate, commentController.getByPostId);

// Also support query parameter: /api/comments?post_id=1
router.get("/", authenticate, commentController.getByPostId);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Create comment
 *     description: Create a new comment or reply to existing comment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - post_id
 *               - content
 *             properties:
 *               post_id:
 *                 type: integer
 *                 example: 1
 *               content:
 *                 type: string
 *                 example: Great post!
 *               parent_id:
 *                 type: integer
 *                 nullable: true
 *                 description: Parent comment ID for nested replies
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  authenticate,
  [
    body("post_id").isInt().withMessage("Post ID is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("parent_id").optional().isInt(),
  ],
  validate,
  commentController.create
);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     tags: [Comments]
 *     summary: Update comment
 *     description: Update comment content (author only)
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Comment not found
 */
router.put(
  "/:id",
  authenticate,
  [body("content").notEmpty().withMessage("Content is required")],
  validate,
  commentController.update
);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     tags: [Comments]
 *     summary: Delete comment
 *     description: Soft delete a comment (author only)
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
 *         description: Comment deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Comment not found
 */
router.delete("/:id", authenticate, commentController.delete);

module.exports = router;
