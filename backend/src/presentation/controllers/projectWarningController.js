const ProjectWarning = require("../../models/ProjectWarning");
const { validationResult } = require("express-validator");

class ProjectWarningController {
  // Admin/Manager: Issue warning
  async issueWarning(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        project_id,
        department_task_id,
        member_task_id,
        warned_user_id,
        warning_type,
        severity,
        reason,
        penalty_amount,
      } = req.body;

      const warningId = await ProjectWarning.create({
        project_id,
        department_task_id,
        member_task_id,
        warned_user_id,
        issued_by: req.user.id,
        warning_type,
        severity,
        reason,
        penalty_amount,
      });

      // TODO: Send notification to warned user

      res.status(201).json({
        success: true,
        message: "Warning issued successfully",
        data: { warningId },
      });
    } catch (error) {
      console.error("Error issuing warning:", error);
      res.status(500).json({
        success: false,
        message: "Failed to issue warning",
        error: error.message,
      });
    }
  }

  // Get warnings by project
  async getProjectWarnings(req, res) {
    try {
      const { projectId } = req.params;
      const { severity } = req.query;

      const warnings = await ProjectWarning.getByProject(projectId, severity);

      res.json({
        success: true,
        message: "Project warnings retrieved successfully",
        data: warnings,
      });
    } catch (error) {
      console.error("Error getting project warnings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve project warnings",
        error: error.message,
      });
    }
  }

  // Get warnings by user
  async getUserWarnings(req, res) {
    try {
      const { userId } = req.params;
      const { acknowledged } = req.query;

      const ackFilter =
        acknowledged === "true"
          ? true
          : acknowledged === "false"
            ? false
            : null;

      const warnings = await ProjectWarning.getByUser(userId, ackFilter);

      res.json({
        success: true,
        message: "User warnings retrieved successfully",
        data: warnings,
      });
    } catch (error) {
      console.error("Error getting user warnings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user warnings",
        error: error.message,
      });
    }
  }

  // Get my warnings (current user)
  async getMyWarnings(req, res) {
    try {
      const { acknowledged } = req.query;

      const ackFilter =
        acknowledged === "true"
          ? true
          : acknowledged === "false"
            ? false
            : null;

      const warnings = await ProjectWarning.getByUser(req.user.id, ackFilter);

      res.json({
        success: true,
        message: "Your warnings retrieved successfully",
        data: warnings,
      });
    } catch (error) {
      console.error("Error getting my warnings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve your warnings",
        error: error.message,
      });
    }
  }

  // Get warning by ID
  async getWarningById(req, res) {
    try {
      const { warningId } = req.params;

      const warning = await ProjectWarning.getById(warningId);

      if (!warning) {
        return res.status(404).json({
          success: false,
          message: "Warning not found",
        });
      }

      res.json({
        success: true,
        message: "Warning retrieved successfully",
        data: warning,
      });
    } catch (error) {
      console.error("Error getting warning:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve warning",
        error: error.message,
      });
    }
  }

  // User: Acknowledge warning
  async acknowledgeWarning(req, res) {
    try {
      const { warningId } = req.params;

      const warning = await ProjectWarning.getById(warningId);
      if (!warning) {
        return res.status(404).json({
          success: false,
          message: "Warning not found",
        });
      }

      if (warning.warned_user_id != req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only acknowledge your own warnings",
        });
      }

      if (warning.acknowledged_at) {
        return res.status(400).json({
          success: false,
          message: "Warning already acknowledged",
        });
      }

      await ProjectWarning.acknowledge(warningId, req.user.id);

      res.json({
        success: true,
        message: "Warning acknowledged successfully",
      });
    } catch (error) {
      console.error("Error acknowledging warning:", error);
      res.status(500).json({
        success: false,
        message: "Failed to acknowledge warning",
        error: error.message,
      });
    }
  }

  // Get user warning statistics
  async getUserStats(req, res) {
    try {
      const { userId } = req.params;
      const { projectId } = req.query;

      const stats = await ProjectWarning.getUserStats(userId, projectId);

      res.json({
        success: true,
        message: "User warning statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Error getting user stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user warning statistics",
        error: error.message,
      });
    }
  }

  // Get unacknowledged warnings
  async getUnacknowledgedWarnings(req, res) {
    try {
      const { userId } = req.query;

      const warnings = await ProjectWarning.getUnacknowledged(userId);

      res.json({
        success: true,
        message: "Unacknowledged warnings retrieved successfully",
        data: warnings,
      });
    } catch (error) {
      console.error("Error getting unacknowledged warnings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve unacknowledged warnings",
        error: error.message,
      });
    }
  }

  // Admin: Delete warning
  async deleteWarning(req, res) {
    try {
      const { warningId } = req.params;

      await ProjectWarning.delete(warningId);

      res.json({
        success: true,
        message: "Warning deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting warning:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete warning",
        error: error.message,
      });
    }
  }
}

module.exports = new ProjectWarningController();
