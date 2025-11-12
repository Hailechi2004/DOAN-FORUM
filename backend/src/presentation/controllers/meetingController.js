const { ApiResponse } = require("../../utils/apiHelpers");
const container = require("../../container");
const Meeting = require("../../models/Meeting");

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
}

module.exports = new MeetingController();
