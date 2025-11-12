const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const validate = require("../../utils/validator");
const eventController = require("../controllers/eventController");
const authenticate = require("../middleware/authenticate");

/**
 * @swagger
 * /api/events:
 *   get:
 *     tags: [Events]
 *     summary: Get all events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: created_by
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
 *         description: Events retrieved successfully
 */
router.get("/", authenticate, eventController.getAll);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Get event by ID
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
 *         description: Event retrieved successfully
 */
router.get("/:id", authenticate, eventController.getById);

/**
 * @swagger
 * /api/events/{id}/attendees:
 *   get:
 *     tags: [Events]
 *     summary: Get event attendees
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
 *         description: Attendees retrieved successfully
 */
router.get("/:id/attendees", authenticate, eventController.getAttendees);

/**
 * @swagger
 * /api/events:
 *   post:
 *     tags: [Events]
 *     summary: Create event
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
 *               - start_time
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               is_all_day:
 *                 type: boolean
 *               reminder_minutes:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post(
  "/",
  authenticate,
  [
    body("title").notEmpty(),
    body("start_time").isISO8601(),
    body("end_time").optional().isISO8601(),
    body("is_all_day").optional().isBoolean(),
  ],
  validate,
  eventController.create
);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     tags: [Events]
 *     summary: Update event
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
 *         description: Event updated successfully
 */
router.put("/:id", authenticate, eventController.update);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     tags: [Events]
 *     summary: Delete event
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
 *         description: Event deleted successfully
 */
router.delete("/:id", authenticate, eventController.delete);

/**
 * @swagger
 * /api/events/{id}/attendees:
 *   post:
 *     tags: [Events]
 *     summary: Add attendee to event
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
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, declined]
 *     responses:
 *       200:
 *         description: Attendee added successfully
 */
router.post(
  "/:id/attendees",
  authenticate,
  [
    body("user_id").isInt(),
    body("status").optional().isIn(["pending", "accepted", "declined"]),
  ],
  validate,
  eventController.addAttendee
);

/**
 * @swagger
 * /api/events/{id}/attendees/{userId}:
 *   delete:
 *     tags: [Events]
 *     summary: Remove attendee from event
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
 *         description: Attendee removed successfully
 */
router.delete(
  "/:id/attendees/:userId",
  authenticate,
  eventController.removeAttendee
);

module.exports = router;
