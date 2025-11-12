const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const validate = require("../../utils/validator");
const postController = require("../controllers/postController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const upload = require("../../config/upload");

/**
 * @swagger
 * /api/posts:
 *   get:
 *     tags: [Posts]
 *     summary: Get all posts
 *     description: Retrieve paginated list of posts with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         description: Filter by department ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authenticate,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("category_id").optional().isInt(),
    query("department_id").optional().isInt(),
    query("search").optional().isString(),
  ],
  validate,
  postController.getAll
);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Get post by ID
 *     description: Retrieve a single post with full details including user reaction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
router.get("/:id", authenticate, postController.getById);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     tags: [Posts]
 *     summary: Create new post
 *     description: Create a new forum post
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 500
 *                 example: Welcome to the Company Forum
 *               content:
 *                 type: string
 *                 example: This is my first post content...
 *               visibility:
 *                 type: string
 *                 enum: [company, department, team, private]
 *                 default: company
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               department_id:
 *                 type: integer
 *               team_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  authenticate,
  upload.array("images", 10), // Allow up to 10 images
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 500 }),
    body("content").notEmpty().withMessage("Content is required"),
    body("visibility")
      .optional()
      .isIn(["company", "department", "team", "private"]),
    body("category_id").optional().isInt(),
    body("department_id").optional().isInt(),
    body("team_id").optional().isInt(),
  ],
  validate,
  postController.create
);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     tags: [Posts]
 *     summary: Update post
 *     description: Update an existing post (author only)
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
 *               title:
 *                 type: string
 *                 maxLength: 500
 *               content:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [company, department, team, private]
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       403:
 *         description: Not authorized to update this post
 *       404:
 *         description: Post not found
 */
router.put(
  "/:id",
  authenticate,
  [
    body("title").optional().isLength({ max: 500 }),
    body("content").optional().notEmpty(),
    body("visibility")
      .optional()
      .isIn(["company", "department", "team", "private"]),
  ],
  validate,
  postController.update
);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete post
 *     description: Soft delete a post (author only)
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
 *         description: Post deleted successfully
 *       403:
 *         description: Not authorized to delete this post
 *       404:
 *         description: Post not found
 */
router.delete("/:id", authenticate, postController.delete);

/**
 * @swagger
 * /api/posts/{id}/reactions:
 *   post:
 *     tags: [Posts]
 *     summary: React to post (alternative endpoint)
 *     description: Add, update, or remove reaction on a post
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
 *               - reaction_type
 *             properties:
 *               reaction_type:
 *                 type: string
 *                 enum: [like, love, haha, wow, sad, angry]
 *                 example: like
 *     responses:
 *       200:
 *         description: Reaction toggled successfully
 *       404:
 *         description: Post not found
 */
router.post(
  "/:id/reactions",
  authenticate,
  [body("reaction_type").isIn(["like", "love", "haha", "wow", "sad", "angry"])],
  validate,
  postController.react
);

/**
 * @swagger
 * /api/posts/{id}/react:
 *   post:
 *     tags: [Posts]
 *     summary: React to post
 *     description: Add, update, or remove reaction on a post
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
 *               - reaction_type
 *             properties:
 *               reaction_type:
 *                 type: string
 *                 enum: [like, love, haha, wow, sad, angry]
 *                 example: like
 *     responses:
 *       200:
 *         description: Reaction toggled successfully
 *       404:
 *         description: Post not found
 */
router.post(
  "/:id/react",
  authenticate,
  [body("reaction_type").isIn(["like", "love", "haha", "wow", "sad", "angry"])],
  validate,
  postController.react
);

/**
 * @swagger
 * /api/posts/{id}/pin:
 *   patch:
 *     tags: [Posts]
 *     summary: Pin/unpin post
 *     description: Toggle post pin status (admin/manager only)
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
 *         description: Post pin status toggled successfully
 *       403:
 *         description: Not authorized (requires admin or manager role)
 *       404:
 *         description: Post not found
 */
router.patch(
  "/:id/pin",
  authenticate,
  authorize("admin", "manager"),
  postController.togglePin
);

module.exports = router;
