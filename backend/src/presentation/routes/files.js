const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const validate = require("../../utils/validator");
const fileController = require("../controllers/fileController");
const authenticate = require("../middleware/authenticate");
const { uploadLimiter } = require("../middleware/rateLimiter");
const upload = require("../../config/upload");

/**
 * @swagger
 * /api/files:
 *   get:
 *     tags: [Files]
 *     summary: Get all files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: uploader_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: related_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: related_id
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 */
router.get("/", authenticate, fileController.getAll);

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     tags: [Files]
 *     summary: Get file by ID
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
 *         description: File retrieved successfully
 */
router.get("/:id", authenticate, fileController.getById);

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     tags: [Files]
 *     summary: Upload file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               related_type:
 *                 type: string
 *               related_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: File uploaded successfully
 */
router.post(
  "/upload",
  authenticate,
  uploadLimiter,
  upload.single("file"),
  fileController.upload
);

/**
 * @swagger
 * /api/files/{id}/download:
 *   get:
 *     tags: [Files]
 *     summary: Download file
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
 *         description: File download started
 */
router.get("/:id/download", authenticate, fileController.download);

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     tags: [Files]
 *     summary: Delete file
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
 *         description: File deleted successfully
 */
router.delete("/:id", authenticate, fileController.delete);

module.exports = router;
