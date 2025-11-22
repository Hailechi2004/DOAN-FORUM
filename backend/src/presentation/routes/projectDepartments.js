const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const { validate } = require("../../middleware/validate");
const projectDepartmentController = require("../controllers/projectDepartmentController");

// Admin: Assign departments to project
router.post(
  "/:id/departments",
  authenticate,
  authorize("admin", "System Admin", "Administrator"),
  [
    body("department_ids")
      .isArray({ min: 1 })
      .withMessage("department_ids must be a non-empty array"),
    body("department_ids.*")
      .isInt()
      .withMessage("Each department_id must be an integer"),
  ],
  validate,
  projectDepartmentController.assignDepartments
);

// Get project departments (Admin & Department Manager)
router.get(
  "/:id/departments",
  authenticate,
  projectDepartmentController.getProjectDepartments
);

// Remove department from project (Admin only)
router.delete(
  "/:id/departments/:departmentId",
  authenticate,
  authorize("admin", "System Admin", "Administrator"),
  projectDepartmentController.removeDepartment
);

// Department Manager: Assign team to project
router.post(
  "/:id/assign-team",
  authenticate,
  authorize("manager", "department_manager"),
  [
    body("department_id").isInt().withMessage("department_id is required"),
    body("team_id").isInt().withMessage("team_id is required"),
  ],
  validate,
  projectDepartmentController.assignTeam
);

// Department Manager: Assign members to project
router.post(
  "/:id/assign-members",
  authenticate,
  authorize("manager", "department_manager"),
  [
    body("department_id").isInt().withMessage("department_id is required"),
    body("team_id").isInt().withMessage("team_id is required"),
    body("member_ids")
      .isArray({ min: 1 })
      .withMessage("member_ids must be a non-empty array"),
    body("member_ids.*")
      .isInt()
      .withMessage("Each member_id must be an integer"),
  ],
  validate,
  projectDepartmentController.assignMembers
);

// Get project members (filterable by department)
router.get(
  "/:id/team-members",
  authenticate,
  projectDepartmentController.getProjectMembers
);

// Department Manager: Get my department's projects
router.get(
  "/my-department/projects",
  authenticate,
  authorize("manager", "department_manager"),
  projectDepartmentController.getMyDepartmentProjects
);

// Department Manager: Accept project invitation
router.post(
  "/:id/departments/:departmentId/accept",
  authenticate,
  authorize("manager", "department_manager"),
  projectDepartmentController.acceptProjectInvitation
);

// Department Manager: Reject project invitation
router.post(
  "/:id/departments/:departmentId/reject",
  authenticate,
  authorize("manager", "department_manager"),
  [
    body("rejection_reason")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Rejection reason should not be empty if provided"),
  ],
  validate,
  projectDepartmentController.rejectProjectInvitation
);

module.exports = router;
