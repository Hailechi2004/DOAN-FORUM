const TaskReport = require("../../models/TaskReport");
const { validationResult } = require("express-validator");

class TaskReportController {
  // Create report
  async createReport(req, res) {
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
        report_type,
        title,
        content,
        progress,
        issues,
        attachments,
      } = req.body;

      const reportId = await TaskReport.create({
        project_id,
        department_task_id,
        member_task_id,
        reported_by: req.user.id,
        report_type,
        title,
        content,
        progress,
        issues,
        attachments,
      });

      res.status(201).json({
        success: true,
        message: "Report created successfully",
        data: { reportId },
      });
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create report",
        error: error.message,
      });
    }
  }

  // Get reports by project
  async getProjectReports(req, res) {
    try {
      const { projectId } = req.params;
      const { report_type } = req.query;

      const reports = await TaskReport.getByProject(projectId, report_type);

      res.json({
        success: true,
        message: "Project reports retrieved successfully",
        data: reports,
      });
    } catch (error) {
      console.error("Error getting project reports:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve project reports",
        error: error.message,
      });
    }
  }

  // Get reports by department task
  async getDepartmentTaskReports(req, res) {
    try {
      const { departmentTaskId } = req.params;

      const reports = await TaskReport.getByDepartmentTask(departmentTaskId);

      res.json({
        success: true,
        message: "Department task reports retrieved successfully",
        data: reports,
      });
    } catch (error) {
      console.error("Error getting department task reports:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve department task reports",
        error: error.message,
      });
    }
  }

  // Get reports by member task
  async getMemberTaskReports(req, res) {
    try {
      const { memberTaskId } = req.params;

      const reports = await TaskReport.getByMemberTask(memberTaskId);

      res.json({
        success: true,
        message: "Member task reports retrieved successfully",
        data: reports,
      });
    } catch (error) {
      console.error("Error getting member task reports:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve member task reports",
        error: error.message,
      });
    }
  }

  // Get my reports
  async getMyReports(req, res) {
    try {
      const { report_type } = req.query;

      const reports = await TaskReport.getByUser(req.user.id, report_type);

      res.json({
        success: true,
        message: "Your reports retrieved successfully",
        data: reports,
      });
    } catch (error) {
      console.error("Error getting my reports:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve your reports",
        error: error.message,
      });
    }
  }

  // Get report by ID
  async getReportById(req, res) {
    try {
      const { reportId } = req.params;

      const report = await TaskReport.getById(reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }

      res.json({
        success: true,
        message: "Report retrieved successfully",
        data: report,
      });
    } catch (error) {
      console.error("Error getting report:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve report",
        error: error.message,
      });
    }
  }

  // Update report
  async updateReport(req, res) {
    try {
      const { reportId } = req.params;
      const updates = req.body;

      await TaskReport.update(reportId, updates);

      res.json({
        success: true,
        message: "Report updated successfully",
      });
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update report",
        error: error.message,
      });
    }
  }

  // Delete report
  async deleteReport(req, res) {
    try {
      const { reportId } = req.params;

      await TaskReport.delete(reportId);

      res.json({
        success: true,
        message: "Report deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete report",
        error: error.message,
      });
    }
  }

  // Get reports with issues
  async getReportsWithIssues(req, res) {
    try {
      const { projectId } = req.query;

      const reports = await TaskReport.getReportsWithIssues(projectId);

      res.json({
        success: true,
        message: "Reports with issues retrieved successfully",
        data: reports,
      });
    } catch (error) {
      console.error("Error getting reports with issues:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve reports with issues",
        error: error.message,
      });
    }
  }
}

module.exports = new TaskReportController();
