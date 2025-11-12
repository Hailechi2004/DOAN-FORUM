const Project = require("../../../domain/entities/Project");

class GetProjectByIdUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(projectId) {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    return new Project(project);
  }
}

module.exports = GetProjectByIdUseCase;
