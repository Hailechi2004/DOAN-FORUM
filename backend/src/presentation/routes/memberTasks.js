const express = require("express");
const router = express.Router();
const memberTaskController = require("../controllers/memberTaskController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const { body, param } = require("express-validator");

// Validation rules
const assignTaskValidation = [
  body("user_id").isInt().withMessage("User ID must be an integer"),
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

// Manager routes - assign tasks to members
router.post(
  "/department-tasks/:departmentTaskId/member-tasks",
  authenticate,
  authorize("department_manager", "system_admin", "admin"),
  assignTaskValidation,
  memberTaskController.assignTaskToMember
);

// Get member tasks for a department task
router.get(
  "/department-tasks/:departmentTaskId/member-tasks",
  authenticate,
  memberTaskController.getDepartmentTaskMembers
);

// Get tasks by user
router.get(
  "/users/:userId/tasks",
  authenticate,
  memberTaskController.getUserTasks
);

// Get my tasks (current user)
router.get("/my-tasks", authenticate, memberTaskController.getMyTasks);

// Get overdue tasks (MUST be before :taskId route)
router.get(
  "/member-tasks/overdue",
  authenticate,
  memberTaskController.getOverdueTasks
);

// Get task details
router.get(
  "/member-tasks/:taskId",
  authenticate,
  memberTaskController.getTaskById
);

// Employee routes - start task
router.post(
  "/member-tasks/:taskId/start",
  authenticate,
  memberTaskController.startTask
);

// Update progress
router.patch(
  "/member-tasks/:taskId/progress",
  authenticate,
  [
    body("progress")
      .isInt({ min: 0, max: 100 })
      .withMessage("Progress must be between 0 and 100"),
    body("actual_hours")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Actual hours must be positive"),
  ],
  memberTaskController.updateProgress
);

// Submit task
router.post(
  "/member-tasks/:taskId/submit",
  authenticate,
  [body("notes").optional().trim()],
  memberTaskController.submitTask
);

// Manager routes - approve/reject
router.post(
  "/member-tasks/:taskId/approve",
  authenticate,
  authorize("department_manager", "system_admin", "admin"),
  [body("notes").optional().trim()],
  memberTaskController.approveTask
);

router.post(
  "/member-tasks/:taskId/reject-submission",
  authenticate,
  authorize("department_manager", "system_admin", "admin"),
  [body("notes").trim().notEmpty().withMessage("Rejection notes are required")],
  memberTaskController.rejectSubmission
);

// Update task
router.patch(
  "/member-tasks/:taskId",
  authenticate,
  authorize("department_manager", "system_admin", "admin"),
  memberTaskController.updateTask
);

// Reassign task
router.post(
  "/member-tasks/:taskId/reassign",
  authenticate,
  authorize("department_manager", "system_admin", "admin"),
  [body("user_id").isInt().withMessage("User ID must be an integer")],
  memberTaskController.reassignTask
);

// Delete task
router.delete(
  "/member-tasks/:taskId",
  authenticate,
  authorize("department_manager", "system_admin", "admin"),
  memberTaskController.deleteTask
);

// Get member workload
router.get(
  "/users/:userId/workload",
  authenticate,
  memberTaskController.getMemberWorkload
);

module.exports = router;
