const { ApiResponse } = require("../../utils/apiHelpers");
const container = require("../../container");
const Event = require("../../models/Event");

class EventController {
  constructor() {
    this.useCases = container.getEventUseCases();

    // Bind methods
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getAttendees = this.getAttendees.bind(this);
    this.addAttendee = this.addAttendee.bind(this);
    this.removeAttendee = this.removeAttendee.bind(this);
  }

  async create(req, res, next) {
    try {
      const event = await this.useCases.createEvent.execute({
        ...req.body,
        created_by: req.user.id,
      });
      ApiResponse.success(res, event, "Event created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const events = await this.useCases.getAllEvents.execute(req.query);
      ApiResponse.success(res, events);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const event = await this.useCases.getEventById.execute(req.params.id);
      ApiResponse.success(res, event);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const event = await this.useCases.updateEvent.execute(
        req.params.id,
        req.body
      );
      ApiResponse.success(res, event, "Event updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.useCases.deleteEvent.execute(req.params.id);
      ApiResponse.success(res, null, "Event deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAttendees(req, res, next) {
    try {
      const attendees = await Event.getAttendees(req.params.id);
      ApiResponse.success(res, attendees);
    } catch (error) {
      next(error);
    }
  }

  async addAttendee(req, res, next) {
    try {
      await Event.addAttendee(req.params.id, req.body);
      ApiResponse.success(res, null, "Attendee added successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async removeAttendee(req, res, next) {
    try {
      await Event.removeAttendee(req.params.id, req.params.userId);
      ApiResponse.success(res, null, "Attendee removed successfully");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventController();
