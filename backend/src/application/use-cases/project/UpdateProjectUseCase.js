const Project = require("../../../domain/entities/Project");

class UpdateProjectUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(projectId, updateData) {
    // Kiểm tra project tồn tại
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Update project
    await this.projectRepository.update(projectId, updateData);

    // Return updated project
    const updatedProject = await this.projectRepository.findById(projectId);
    return new Project(updatedProject);
  }
}

module.exports = UpdateProjectUseCase;
