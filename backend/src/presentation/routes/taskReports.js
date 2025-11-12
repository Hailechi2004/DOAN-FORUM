const express = require("express");
const router = express.Router();
const taskReportController = require("../controllers/taskReportController");
const authenticate = require("../../middleware/authenticate");
const { body } = require("express-validator");

// Validation rules
const createReportValidation = [
  body("project_id").isInt().withMessage("Project ID must be an integer"),
  body("department_task_id").optional().isInt(),
  body("member_task_id").optional().isInt(),
  body("report_type")
    .isIn(["daily", "weekly", "monthly", "completion", "issue"])
    .withMessage("Invalid report type"),
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("progress").optional().isInt({ min: 0, max: 100 }),
  body("issues").optional().trim(),
  body("attachments").optional(),
];

// Create report
router.post(
  "/reports",
  authenticate,
  createReportValidation,
  taskReportController.createReport
);

// Get reports by project
router.get(
  "/projects/:projectId/reports",
  authenticate,
  taskReportController.getProjectReports
);

// Get reports by department task
router.get(
  "/department-tasks/:departmentTaskId/reports",
  authenticate,
  taskReportController.getDepartmentTaskReports
);

// Get reports by member task
router.get(
  "/member-tasks/:memberTaskId/reports",
  authenticate,
  taskReportController.getMemberTaskReports
);

// Get my reports
router.get("/my-reports", authenticate, taskReportController.getMyReports);

// Get report by ID
router.get(
  "/reports/:reportId",
  authenticate,
  taskReportController.getReportById
);

// Update report
router.patch(
  "/reports/:reportId",
  authenticate,
  taskReportController.updateReport
);

// Delete report
router.delete(
  "/reports/:reportId",
  authenticate,
  taskReportController.deleteReport
);

// Get reports with issues
router.get(
  "/reports/with-issues",
  authenticate,
  taskReportController.getReportsWithIssues
);

module.exports = router;
