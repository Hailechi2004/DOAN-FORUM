const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const validate = require("../../utils/validator");
const categoryController = require("../controllers/categoryController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parent_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get("/", authenticate, categoryController.getAll);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
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
 *         description: Category retrieved successfully
 */
router.get("/:id", authenticate, categoryController.getById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create category
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
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               slug:
 *                 type: string
 *               icon:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "manager"),
  [
    body("name").notEmpty(),
    body("slug").optional(),
    body("description").optional(),
    body("icon").optional(),
    body("parent_id").optional().isInt(),
  ],
  validate,
  categoryController.create
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category
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
 *         description: Category updated successfully
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  categoryController.update
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
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
 *         description: Category deleted successfully
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  categoryController.delete
);

module.exports = router;
