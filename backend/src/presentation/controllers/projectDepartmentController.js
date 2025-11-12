const ProjectDepartment = require("../../models/ProjectDepartment");
const ProjectTeamMember = require("../../models/ProjectTeamMember");
const ProjectNotification = require("../../models/ProjectNotification");
const Project = require("../../models/Project");
const Department = require("../../models/Department");
const Team = require("../../models/Team");

class ProjectDepartmentController {
  // Admin: Assign departments to project
  async assignDepartments(req, res) {
    try {
      const { id: projectId } = req.params;
      const { department_ids } = req.body;

      if (
        !department_ids ||
        !Array.isArray(department_ids) ||
        department_ids.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "department_ids array is required",
        });
      }

      // Get project info
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      // Assign departments
      await ProjectDepartment.assignDepartments(
        projectId,
        department_ids,
        req.user.id
      );

      // Send notifications to department managers
      await ProjectNotification.notifyDepartmentAssignment(
        projectId,
        project.name,
        department_ids
      );

      // Get updated departments list
      const departments =
        await ProjectDepartment.getProjectDepartments(projectId);

      res.status(200).json({
        success: true,
        message: "Departments assigned successfully",
        data: departments,
      });
    } catch (error) {
      console.error("Error assigning departments:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to assign departments",
      });
    }
  }

  // Get project departments (Admin & Manager)
  async getProjectDepartments(req, res) {
    try {
      const { id: projectId } = req.params;

      const departments =
        await ProjectDepartment.getProjectDepartments(projectId);

      res.status(200).json({
        success: true,
        data: departments,
      });
    } catch (error) {
      console.error("Error fetching project departments:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch departments",
      });
    }
  }

  // Department Manager: Get projects assigned to my department
  async getMyDepartmentProjects(req, res) {
    try {
      const { status } = req.query;

      // Get user's managed departments
      const [departments] = await Department.findByManagerId(req.user.id);

      if (!departments || departments.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: "You are not managing any department",
        });
      }

      // Get projects for all managed departments
      const allProjects = [];
      for (const dept of departments) {
        const projects = await ProjectDepartment.getDepartmentProjects(
          dept.id,
          status
        );
        allProjects.push(...projects);
      }

      res.status(200).json({
        success: true,
        data: allProjects,
      });
    } catch (error) {
      console.error("Error fetching department projects:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch projects",
      });
    }
  }

  // Department Manager: Assign team to project
  async assignTeam(req, res) {
    try {
      const { id: projectId } = req.params;
      const { department_id, team_id } = req.body;

      if (!department_id || !team_id) {
        return res.status(400).json({
          success: false,
          message: "department_id and team_id are required",
        });
      }

      // Verify manager has access to this department
      const [departments] = await Department.findByManagerId(req.user.id);
      const hasDepartmentAccess = departments.some(
        (d) => d.id === parseInt(department_id)
      );

      if (!hasDepartmentAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this department",
        });
      }

      // Verify team belongs to department
      const team = await Team.findById(team_id);
      if (!team || team.department_id !== parseInt(department_id)) {
        return res.status(400).json({
          success: false,
          message: "Team does not belong to this department",
        });
      }

      // Assign team
      await ProjectDepartment.assignTeam(
        projectId,
        department_id,
        team_id,
        req.user.id
      );

      // Get updated info
      const updatedDepartments =
        await ProjectDepartment.getProjectDepartments(projectId);

      res.status(200).json({
        success: true,
        message: "Team assigned successfully",
        data: updatedDepartments,
      });
    } catch (error) {
      console.error("Error assigning team:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to assign team",
      });
    }
  }

  // Department Manager: Assign members to project
  async assignMembers(req, res) {
    try {
      const { id: projectId } = req.params;
      const { department_id, team_id, member_ids } = req.body;

      if (
        !department_id ||
        !team_id ||
        !member_ids ||
        !Array.isArray(member_ids)
      ) {
        return res.status(400).json({
          success: false,
          message: "department_id, team_id, and member_ids array are required",
        });
      }

      // Verify manager has access
      const [departments] = await Department.findByManagerId(req.user.id);
      const hasDepartmentAccess = departments.some(
        (d) => d.id === parseInt(department_id)
      );

      if (!hasDepartmentAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this department",
        });
      }

      // Assign members
      await ProjectTeamMember.assignMembers(
        projectId,
        department_id,
        team_id,
        member_ids,
        req.user.id
      );

      // Get updated members
      const members = await ProjectTeamMember.getProjectMembers(projectId);

      res.status(200).json({
        success: true,
        message: "Members assigned successfully",
        data: members,
      });
    } catch (error) {
      console.error("Error assigning members:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to assign members",
      });
    }
  }

  // Get project members
  async getProjectMembers(req, res) {
    try {
      const { id: projectId } = req.params;
      const { department_id } = req.query;

      let members;
      if (department_id) {
        members = await ProjectTeamMember.getProjectMembersByDepartment(
          projectId,
          department_id
        );
      } else {
        members = await ProjectTeamMember.getProjectMembers(projectId);
      }

      res.status(200).json({
        success: true,
        data: members,
      });
    } catch (error) {
      console.error("Error fetching project members:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch members",
      });
    }
  }

  // Remove department from project (Admin only)
  async removeDepartment(req, res) {
    try {
      const { id: projectId, departmentId } = req.params;

      await ProjectDepartment.removeDepartment(projectId, departmentId);

      res.status(200).json({
        success: true,
        message: "Department removed from project",
      });
    } catch (error) {
      console.error("Error removing department:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to remove department",
      });
    }
  }

  // Department Manager: Accept project invitation
  async acceptProjectInvitation(req, res) {
    try {
      const { id: projectId, departmentId } = req.params;

      // Verify manager has access to this department
      const [departments] = await Department.findByManagerId(req.user.id);
      const hasDepartmentAccess = departments.some(
        (d) => d.id === parseInt(departmentId)
      );

      if (!hasDepartmentAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this department",
        });
      }

      // Accept the invitation
      await ProjectDepartment.acceptInvitation(
        projectId,
        departmentId,
        req.user.id
      );

      res.status(200).json({
        success: true,
        message: "Project invitation accepted successfully",
      });
    } catch (error) {
      console.error("Error accepting project invitation:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to accept project invitation",
      });
    }
  }

  // Department Manager: Reject project invitation
  async rejectProjectInvitation(req, res) {
    try {
      const { id: projectId, departmentId } = req.params;
      const { rejection_reason } = req.body;

      // Verify manager has access to this department
      const [departments] = await Department.findByManagerId(req.user.id);
      const hasDepartmentAccess = departments.some(
        (d) => d.id === parseInt(departmentId)
      );

      if (!hasDepartmentAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this department",
        });
      }

      // Reject the invitation
      await ProjectDepartment.rejectInvitation(
        projectId,
        departmentId,
        req.user.id,
        rejection_reason
      );

      res.status(200).json({
        success: true,
        message: "Project invitation rejected successfully",
      });
    } catch (error) {
      console.error("Error rejecting project invitation:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to reject project invitation",
      });
    }
  }
}

module.exports = new ProjectDepartmentController();
