const express = require("express");
const router = express.Router();
const departmentTaskController = require("../controllers/departmentTaskController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const { body, param } = require("express-validator");

// Validation rules
const assignTaskValidation = [
  body("department_id").isInt().withMessage("Department ID must be an integer"),
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").optional().trim(),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority"),
  body("deadline").optional().isISO8601().withMessage("Invalid date format"),
  body("estimated_hours")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Estimated hours must be positive"),
];

// Admin routes - assign tasks to departments
router.post(
  "/projects/:projectId/department-tasks",
  authenticate,
  authorize("system_admin", "admin"),
  assignTaskValidation,
  departmentTaskController.assignTaskToDepartment
);

// Get all department tasks for a project
router.get(
  "/projects/:projectId/department-tasks",
  authenticate,
  departmentTaskController.getProjectTasks
);

// Get tasks by department
router.get(
  "/departments/:departmentId/tasks",
  authenticate,
  departmentTaskController.getDepartmentTasks
);

// Get overdue tasks (MUST be before :taskId route)
router.get(
  "/department-tasks/overdue",
  authenticate,
  departmentTaskController.getOverdueTasks
);

// Get task details
router.get(
  "/department-tasks/:taskId",
  authenticate,
  departmentTaskController.getTaskById
);

// Manager routes - accept/reject tasks
router.post(
  "/department-tasks/:taskId/accept",
  authenticate,
  authorize("department_manager", "system_admin", "admin"),
  departmentTaskController.acceptTask
);

router.post(
  "/department-tasks/:taskId/reject",
  authenticate,
  authorize("department_manager", "system_admin", "admin"),
  [
    body("reason")
      .trim()
      .notEmpty()
      .withMessage("Rejection reason is required"),
  ],
  departmentTaskController.rejectTask
);

// Update progress
router.patch(
  "/department-tasks/:taskId/progress",
  authenticate,
  authorize("department_manager", "system_admin", "admin"),
  [
    body("progress")
      .isInt({ min: 0, max: 100 })
      .withMessage("Progress must be between 0 and 100"),
    body("actual_hours")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Actual hours must be positive"),
  ],
  departmentTaskController.updateProgress
);

// Submit for approval
router.post(
  "/department-tasks/:taskId/submit",
  authenticate,
  authorize("department_manager", "system_admin", "admin"),
  [body("notes").optional().trim()],
  departmentTaskController.submitTask
);

// Admin routes - approve/reject submissions
router.post(
  "/department-tasks/:taskId/approve",
  authenticate,
  authorize("system_admin", "admin"),
  [body("notes").optional().trim()],
  departmentTaskController.approveTask
);

router.post(
  "/department-tasks/:taskId/reject-submission",
  authenticate,
  authorize("system_admin", "admin"),
  [body("notes").trim().notEmpty().withMessage("Rejection notes are required")],
  departmentTaskController.rejectSubmission
);

// Update task
router.patch(
  "/department-tasks/:taskId",
  authenticate,
  authorize("system_admin", "admin"),
  departmentTaskController.updateTask
);

// Delete task
router.delete(
  "/department-tasks/:taskId",
  authenticate,
  authorize("system_admin", "admin"),
  departmentTaskController.deleteTask
);

module.exports = router;
