const { ApiResponse } = require("../../utils/apiHelpers");
const container = require("../../container");
const Meeting = require("../../models/Meeting");
const jitsiService = require("../../services/jitsiService");

class MeetingController {
  constructor() {
    this.useCases = container.getMeetingUseCases();

    // Bind methods
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.cancel = this.cancel.bind(this);
    this.getAttendees = this.getAttendees.bind(this);
    this.addAttendees = this.addAttendees.bind(this);
    this.removeAttendee = this.removeAttendee.bind(this);
    this.respondToInvitation = this.respondToInvitation.bind(this);
    this.getAttachments = this.getAttachments.bind(this);
    this.addAttachment = this.addAttachment.bind(this);
    this.removeAttachment = this.removeAttachment.bind(this);
    this.getParticipants = this.getParticipants.bind(this);
    this.addParticipant = this.addParticipant.bind(this);
    this.removeParticipant = this.removeParticipant.bind(this);

    // Jitsi meeting methods
    this.startMeeting = this.startMeeting.bind(this);
    this.joinMeeting = this.joinMeeting.bind(this);
    this.endMeeting = this.endMeeting.bind(this);
    this.getActiveParticipants = this.getActiveParticipants.bind(this);
    this.getJitsiConfig = this.getJitsiConfig.bind(this);
    this.getMeetingSessions = this.getMeetingSessions.bind(this);
    this.getMeetingStats = this.getMeetingStats.bind(this);
    this.getMeetingEvents = this.getMeetingEvents.bind(this);
  }

  async create(req, res, next) {
    try {
      const meetingData = {
        ...req.body,
        organizer_id: req.user.id,
      };
      const meeting = await this.useCases.createMeeting.execute(meetingData);

      // Add attendees if provided
      if (req.body.attendees && req.body.attendees.length > 0) {
        await Meeting.addAttendees(meeting.id, req.body.attendees);
      }

      ApiResponse.success(res, meeting, "Meeting created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const meetings = await this.useCases.getAllMeetings.execute(req.query);
      ApiResponse.success(res, meetings);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const meeting = await this.useCases.getMeetingById.execute(req.params.id);
      ApiResponse.success(res, meeting);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const meeting = await this.useCases.updateMeeting.execute(
        req.params.id,
        req.body
      );
      ApiResponse.success(res, meeting, "Meeting updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.useCases.deleteMeeting.execute(req.params.id);
      ApiResponse.success(res, null, "Meeting deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      await this.useCases.updateMeeting.execute(req.params.id, {
        is_cancelled: true,
      });
      ApiResponse.success(res, null, "Meeting cancelled successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAttendees(req, res, next) {
    try {
      const attendees = await Meeting.getAttendees(req.params.id);
      ApiResponse.success(res, attendees);
    } catch (error) {
      next(error);
    }
  }

  async addAttendees(req, res, next) {
    try {
      await Meeting.addAttendees(req.params.id, req.body.user_ids);
      ApiResponse.success(res, null, "Attendees added successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async removeAttendee(req, res, next) {
    try {
      await Meeting.removeAttendee(req.params.id, req.params.userId);
      ApiResponse.success(res, null, "Attendee removed successfully");
    } catch (error) {
      next(error);
    }
  }

  async respondToInvitation(req, res, next) {
    try {
      await Meeting.updateAttendeeStatus(
        req.params.id,
        req.params.userId,
        req.body.status
      );
      ApiResponse.success(res, null, "Response recorded successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAttachments(req, res, next) {
    try {
      const attachments = await Meeting.getAttachments(req.params.id);
      ApiResponse.success(res, attachments);
    } catch (error) {
      next(error);
    }
  }

  async addAttachment(req, res, next) {
    try {
      await Meeting.addAttachment(req.params.id, req.body);
      ApiResponse.success(res, null, "Attachment added successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async removeAttachment(req, res, next) {
    try {
      await Meeting.removeAttachment(req.params.id, req.params.attachmentId);
      ApiResponse.success(res, null, "Attachment removed successfully");
    } catch (error) {
      next(error);
    }
  }

  async getParticipants(req, res, next) {
    try {
      const participants = await Meeting.getParticipants(req.params.id);
      ApiResponse.success(res, participants);
    } catch (error) {
      next(error);
    }
  }

  async addParticipant(req, res, next) {
    try {
      await Meeting.addParticipant(req.params.id, req.body);
      ApiResponse.success(res, null, "Participant added successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async removeParticipant(req, res, next) {
    try {
      await Meeting.removeParticipant(req.params.id, req.params.userId);
      ApiResponse.success(res, null, "Participant removed successfully");
    } catch (error) {
      next(error);
    }
  }

  // ============ JITSI MEETING METHODS ============

  /**
   * Start a Jitsi video meeting
   * Generates Jitsi room and updates meeting_link
   */
  async startMeeting(req, res, next) {
    try {
      const meetingId = req.params.id;
      const userId = req.user.id;

      // Debug log
      console.log("🔍 Start Meeting Debug:");
      console.log("  User ID:", userId);
      console.log("  User Role:", req.user.role);
      console.log("  User Department:", req.user.department_id);

      // Get meeting details with attendees
      const meeting = await Meeting.findById(meetingId);
      if (!meeting) {
        return ApiResponse.error(res, "Meeting not found", 404);
      }

      console.log("  Meeting Organizer:", meeting.organizer_id);
      console.log("  Meeting Department:", meeting.department_id);

      // Get attendees to check permissions
      const attendees = await Meeting.getAttendees(meetingId);
      console.log(
        "  Attendees:",
        attendees.map((a) => ({ user_id: a.user_id, status: a.status }))
      );

      // Check permissions - Allow:
      // 1. Organizer
      // 2. Admin (any role containing "admin")
      // 3. Manager (same department)
      // 4. Accepted attendee
      const isOrganizer = meeting.organizer_id === userId;
      const isAdmin = req.user.role?.toLowerCase().includes("admin");
      const isManager =
        req.user.role?.toLowerCase().includes("manager") &&
        req.user.department_id === meeting.department_id;
      const isAcceptedAttendee = attendees.some(
        (a) => a.user_id === userId && a.status === "accepted"
      );

      console.log("  Permissions:");
      console.log("    isOrganizer:", isOrganizer);
      console.log("    isAdmin:", isAdmin);
      console.log("    isManager:", isManager);
      console.log("    isAcceptedAttendee:", isAcceptedAttendee);

      if (!isOrganizer && !isAdmin && !isManager && !isAcceptedAttendee) {
        return ApiResponse.error(
          res,
          "You don't have permission to start this meeting. Only organizer, managers, or accepted attendees can start.",
          403
        );
      }

      // Check if meeting is cancelled
      if (meeting.is_cancelled) {
        return ApiResponse.error(res, "Cannot start a cancelled meeting", 400);
      }

      // Generate Jitsi room
      const roomName = jitsiService.generateRoomName(meetingId);
      const jitsiLink = jitsiService.createMeetingLink(meetingId, roomName);

      // Update meeting with Jitsi link
      const { meeting: updatedMeeting, sessionId } = await Meeting.startMeeting(
        meetingId,
        jitsiLink,
        roomName,
        userId
      );

      // TODO: Broadcast meeting started event via Socket.io
      // (Socket handler integration pending)

      ApiResponse.success(
        res,
        {
          meeting: updatedMeeting,
          roomName,
          jitsiUrl: jitsiLink,
          jitsiDomain: jitsiService.jitsiDomain,
        },
        "Meeting started successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Join a Jitsi meeting
   * Validates access and returns meeting details
   */
  async joinMeeting(req, res, next) {
    try {
      const meetingId = req.params.id;
      const userId = req.user.id;

      // Get meeting with attendees
      const meeting = await Meeting.findById(meetingId);
      if (!meeting) {
        return ApiResponse.error(res, "Meeting not found", 404);
      }

      // Validate access
      const accessValidation = jitsiService.validateRoomAccess(userId, meeting);
      if (!accessValidation.allowed) {
        return ApiResponse.error(res, accessValidation.reason, 403);
      }

      // Check if meeting has been started (has meeting_link)
      if (!meeting.meeting_link) {
        return ApiResponse.error(res, "Meeting has not been started yet", 400);
      }

      // Track user joining
      await Meeting.trackJoin(meetingId, userId);

      // Broadcast user joined event via Socket.io
      const app = require("../../app");
      const socketHandler = app.getSocketHandler();
      if (socketHandler) {
        socketHandler.broadcastToMeeting(meetingId, "meeting:user-joined", {
          user_id: userId,
          user_info: {
            id: userId,
            username: req.user.username,
            full_name: req.user.full_name,
            email: req.user.email,
            avatar_url: req.user.avatar_url,
          },
        });
      }

      // Extract room name from meeting link
      const roomName = jitsiService.extractRoomName(meeting.meeting_link);

      ApiResponse.success(
        res,
        {
          meeting,
          roomName,
          jitsiUrl: meeting.meeting_link,
          jitsiDomain: jitsiService.jitsiDomain,
          userInfo: {
            id: req.user.id,
            displayName: req.user.full_name || req.user.username,
            email: req.user.email,
          },
        },
        "Access granted"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * End a Jitsi meeting
   */
  async endMeeting(req, res, next) {
    try {
      const meetingId = req.params.id;
      const userId = req.user.id;

      // Get meeting details
      const meeting = await Meeting.findById(meetingId);
      if (!meeting) {
        return ApiResponse.error(res, "Meeting not found", 404);
      }

      // Check if user is organizer or has permission
      if (meeting.organizer_id !== userId) {
        const isAdmin = req.user.roles?.includes("System Admin");
        const isManager =
          req.user.roles?.includes("Department Manager") &&
          req.user.department_id === meeting.department_id;

        if (!isAdmin && !isManager) {
          return ApiResponse.error(
            res,
            "Only the organizer or department manager can end the meeting",
            403
          );
        }
      }

      // End meeting
      const updatedMeeting = await Meeting.endMeeting(meetingId, userId);

      // Broadcast meeting ended event via Socket.io
      const app = require("../../app");
      const socketHandler = app.getSocketHandler();
      if (socketHandler) {
        socketHandler.broadcastMeetingEnded(meetingId, userId);

        // Notify all attendees that meeting has ended
        if (meeting.attendees && meeting.attendees.length > 0) {
          const attendeeIds = meeting.attendees.map((a) => a.user_id);
          socketHandler.notifyMeetingAttendees(attendeeIds, {
            type: "meeting_ended",
            meeting_id: meetingId,
            meeting_title: meeting.title,
            ended_by: userId,
          });
        }
      }

      ApiResponse.success(res, updatedMeeting, "Meeting ended successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active participants in a meeting
   */
  async getActiveParticipants(req, res, next) {
    try {
      const meetingId = req.params.id;
      const participants = await Meeting.getActiveParticipants(meetingId);

      ApiResponse.success(res, participants);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Jitsi configuration for frontend
   */
  async getJitsiConfig(req, res, next) {
    try {
      const config = jitsiService.getJitsiConfig();
      ApiResponse.success(res, config);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get meeting session history
   */
  async getMeetingSessions(req, res, next) {
    try {
      const meetingId = req.params.id;
      const sessions = await Meeting.getMeetingSessions(meetingId);
      ApiResponse.success(res, sessions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get meeting statistics
   */
  async getMeetingStats(req, res, next) {
    try {
      const meetingId = req.params.id;
      const stats = await Meeting.getMeetingStats(meetingId);
      ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get meeting events log
   */
  async getMeetingEvents(req, res, next) {
    try {
      const meetingId = req.params.id;
      const limit = parseInt(req.query.limit) || 50;
      const events = await Meeting.getMeetingEvents(meetingId, limit);
      ApiResponse.success(res, events);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MeetingController();
