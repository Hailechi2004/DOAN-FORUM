const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../../utils/validator");
const meetingController = require("../controllers/meetingController");
const authenticate = require("../middleware/authenticate");

/**
 * @swagger
 * /api/meetings:
 *   get:
 *     tags: [Meetings]
 *     summary: Get all meetings
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
 *         name: organizer_id
 *         schema:
 *           type: integer
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Meetings retrieved successfully
 */
router.get("/", authenticate, meetingController.getAll);

/**
 * @swagger
 * /api/meetings/{id}:
 *   get:
 *     tags: [Meetings]
 *     summary: Get meeting by ID
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
 *         description: Meeting retrieved successfully
 */
router.get("/:id", authenticate, meetingController.getById);

/**
 * @swagger
 * /api/meetings/{id}/attendees:
 *   get:
 *     tags: [Meetings]
 *     summary: Get meeting attendees
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
router.get("/:id/attendees", authenticate, meetingController.getAttendees);

/**
 * @swagger
 * /api/meetings:
 *   post:
 *     tags: [Meetings]
 *     summary: Create meeting
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
 *               department_id:
 *                 type: integer
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               meeting_link:
 *                 type: string
 *               recurrence:
 *                 type: object
 *               attendees:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Meeting created successfully
 */
router.post(
  "/",
  authenticate,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("start_time").isISO8601().withMessage("Valid start_time is required"),
    body("end_time").optional().isISO8601(),
    body("department_id").optional().isInt(),
    body("attendees").optional().isArray(),
  ],
  validate,
  meetingController.create
);

/**
 * @swagger
 * /api/meetings/{id}:
 *   put:
 *     tags: [Meetings]
 *     summary: Update meeting
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
 *         description: Meeting updated successfully
 */
router.put("/:id", authenticate, meetingController.update);

/**
 * @swagger
 * /api/meetings/{id}:
 *   delete:
 *     tags: [Meetings]
 *     summary: Delete meeting
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
 *         description: Meeting deleted successfully
 */
router.delete("/:id", authenticate, meetingController.delete);

/**
 * @swagger
 * /api/meetings/{id}/cancel:
 *   post:
 *     tags: [Meetings]
 *     summary: Cancel meeting
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
 *         description: Meeting cancelled successfully
 */
router.post("/:id/cancel", authenticate, meetingController.cancel);

/**
 * @swagger
 * /api/meetings/{id}/attendees:
 *   post:
 *     tags: [Meetings]
 *     summary: Add attendees to meeting
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
 *               - user_ids
 *             properties:
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Attendees added successfully
 */
router.post(
  "/:id/attendees",
  authenticate,
  [body("user_ids").isArray().withMessage("user_ids must be an array")],
  validate,
  meetingController.addAttendees
);

/**
 * @swagger
 * /api/meetings/{id}/attendees/{userId}:
 *   delete:
 *     tags: [Meetings]
 *     summary: Remove attendee from meeting
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
  meetingController.removeAttendee
);

/**
 * @swagger
 * /api/meetings/{id}/attendees/{userId}/respond:
 *   put:
 *     tags: [Meetings]
 *     summary: Respond to meeting invitation
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, declined, tentative]
 *     responses:
 *       200:
 *         description: Response recorded successfully
 */
router.put(
  "/:id/attendees/:userId/respond",
  authenticate,
  [
    body("status")
      .isIn(["accepted", "declined", "tentative"])
      .withMessage("Status must be accepted, declined, or tentative"),
  ],
  validate,
  meetingController.respondToInvitation
);

/**
 * @swagger
 * /api/meetings/{id}/attachments:
 *   get:
 *     tags: [Meetings]
 *     summary: Get meeting attachments
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
 *         description: Attachments retrieved successfully
 */
router.get("/:id/attachments", authenticate, meetingController.getAttachments);

/**
 * @swagger
 * /api/meetings/{id}/attachments:
 *   post:
 *     tags: [Meetings]
 *     summary: Add attachment to meeting
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
 *               - file_id
 *             properties:
 *               file_id:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attachment added successfully
 */
router.post(
  "/:id/attachments",
  authenticate,
  [body("file_id").isInt().withMessage("file_id is required")],
  validate,
  meetingController.addAttachment
);

/**
 * @swagger
 * /api/meetings/{id}/attachments/{attachmentId}:
 *   delete:
 *     tags: [Meetings]
 *     summary: Remove attachment from meeting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Attachment removed successfully
 */
router.delete(
  "/:id/attachments/:attachmentId",
  authenticate,
  meetingController.removeAttachment
);

/**
 * @swagger
 * /api/meetings/{id}/participants:
 *   post:
 *     tags: [Meetings]
 *     summary: Add participant to meeting
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
 *                 enum: [invited, accepted, declined, maybe]
 *     responses:
 *       200:
 *         description: Participant added successfully
 */
router.post(
  "/:id/participants",
  authenticate,
  [
    body("user_id").isInt(),
    body("status")
      .optional()
      .isIn(["invited", "accepted", "declined", "maybe"]),
  ],
  validate,
  meetingController.addParticipant
);

/**
 * @swagger
 * /api/meetings/{id}/participants/{userId}:
 *   delete:
 *     tags: [Meetings]
 *     summary: Remove participant from meeting
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
 *         description: Participant removed successfully
 */
router.delete(
  "/:id/participants/:userId",
  authenticate,
  meetingController.removeParticipant
);

// ============ JITSI VIDEO MEETING ROUTES ============

/**
 * @swagger
 * /api/meetings/{id}/start:
 *   post:
 *     tags: [Meetings]
 *     summary: Start a Jitsi video meeting
 *     description: Generates a Jitsi room and updates the meeting link. Only organizer or department manager can start.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meeting ID
 *     responses:
 *       200:
 *         description: Meeting started successfully
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
 *                     meeting:
 *                       type: object
 *                     roomName:
 *                       type: string
 *                     jitsiUrl:
 *                       type: string
 *                     jitsiDomain:
 *                       type: string
 *       403:
 *         description: Not authorized to start this meeting
 *       404:
 *         description: Meeting not found
 */
router.post("/:id/start", authenticate, meetingController.startMeeting);

/**
 * @swagger
 * /api/meetings/{id}/join:
 *   post:
 *     tags: [Meetings]
 *     summary: Join a Jitsi video meeting
 *     description: Validates user access and returns meeting details to join
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meeting ID
 *     responses:
 *       200:
 *         description: Access granted
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
 *                     meeting:
 *                       type: object
 *                     roomName:
 *                       type: string
 *                     jitsiUrl:
 *                       type: string
 *                     userInfo:
 *                       type: object
 *       400:
 *         description: Meeting not started yet
 *       403:
 *         description: Not invited to this meeting
 *       404:
 *         description: Meeting not found
 */
router.post("/:id/join", authenticate, meetingController.joinMeeting);

/**
 * @swagger
 * /api/meetings/{id}/end:
 *   post:
 *     tags: [Meetings]
 *     summary: End a Jitsi video meeting
 *     description: Ends the meeting and updates session records. Only organizer or department manager can end.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meeting ID
 *     responses:
 *       200:
 *         description: Meeting ended successfully
 *       403:
 *         description: Not authorized to end this meeting
 *       404:
 *         description: Meeting not found
 */
router.post("/:id/end", authenticate, meetingController.endMeeting);

/**
 * @swagger
 * /api/meetings/{id}/active-participants:
 *   get:
 *     tags: [Meetings]
 *     summary: Get active participants in a meeting
 *     description: Returns list of users currently in the meeting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Meeting ID
 *     responses:
 *       200:
 *         description: Active participants retrieved successfully
 */
router.get(
  "/:id/active-participants",
  authenticate,
  meetingController.getActiveParticipants
);

/**
 * @swagger
 * /api/meetings/jitsi/config:
 *   get:
 *     tags: [Meetings]
 *     summary: Get Jitsi configuration
 *     description: Returns Jitsi server configuration for frontend
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Jitsi configuration retrieved successfully
 */
router.get("/jitsi/config", authenticate, meetingController.getJitsiConfig);

/**
 * @swagger
 * /api/meetings/{id}/sessions:
 *   get:
 *     tags: [Meetings]
 *     summary: Get meeting session history
 *     description: Returns all sessions for a meeting
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
 *         description: Session history retrieved successfully
 */
router.get("/:id/sessions", authenticate, meetingController.getMeetingSessions);

/**
 * @swagger
 * /api/meetings/{id}/stats:
 *   get:
 *     tags: [Meetings]
 *     summary: Get meeting statistics
 *     description: Returns statistics for a meeting (total sessions, participants, etc)
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
router.get("/:id/stats", authenticate, meetingController.getMeetingStats);

/**
 * @swagger
 * /api/meetings/{id}/events:
 *   get:
 *     tags: [Meetings]
 *     summary: Get meeting events log
 *     description: Returns event log for a meeting (screen share, recording, etc)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 */
router.get("/:id/events", authenticate, meetingController.getMeetingEvents);

module.exports = router;
