const express = require("express");
const router = express.Router();
const projectWarningController = require("../controllers/projectWarningController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const { body } = require("express-validator");

// Validation rules
const issueWarningValidation = [
  body("project_id").isInt().withMessage("Project ID must be an integer"),
  body("department_task_id").optional().isInt(),
  body("member_task_id").optional().isInt(),
  body("warned_user_id")
    .isInt()
    .withMessage("Warned user ID must be an integer"),
  body("warning_type")
    .isIn([
      "late_submission",
      "poor_quality",
      "missed_deadline",
      "incomplete_work",
      "other",
    ])
    .withMessage("Invalid warning type"),
  body("severity")
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid severity"),
  body("reason").trim().notEmpty().withMessage("Reason is required"),
  body("penalty_amount").optional().isFloat({ min: 0 }),
];

// Admin/Manager: Issue warning
router.post(
  "/warnings",
  authenticate,
  authorize("system_admin", "admin", "department_manager"),
  issueWarningValidation,
  projectWarningController.issueWarning
);

// Get warnings by project
router.get(
  "/projects/:projectId/warnings",
  authenticate,
  projectWarningController.getProjectWarnings
);

// Get warnings by user
router.get(
  "/users/:userId/warnings",
  authenticate,
  projectWarningController.getUserWarnings
);

// Get my warnings
router.get(
  "/my-warnings",
  authenticate,
  projectWarningController.getMyWarnings
);

// Get warning by ID
router.get(
  "/warnings/:warningId",
  authenticate,
  projectWarningController.getWarningById
);

// User: Acknowledge warning
router.post(
  "/warnings/:warningId/acknowledge",
  authenticate,
  projectWarningController.acknowledgeWarning
);

// Get user warning statistics
router.get(
  "/users/:userId/warning-stats",
  authenticate,
  projectWarningController.getUserStats
);

// Get unacknowledged warnings
router.get(
  "/warnings/unacknowledged",
  authenticate,
  projectWarningController.getUnacknowledgedWarnings
);

// Admin: Delete warning
router.delete(
  "/warnings/:warningId",
  authenticate,
  authorize("system_admin", "admin"),
  projectWarningController.deleteWarning
);

module.exports = router;
