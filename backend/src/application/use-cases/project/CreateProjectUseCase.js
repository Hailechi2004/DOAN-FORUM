const Project = require("../../../domain/entities/Project");

class CreateProjectUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(projectData) {
    // Validate required fields
    if (!projectData.name) {
      throw new Error("Project name is required");
    }

    // Create project
    const project = await this.projectRepository.create(projectData);

    return new Project(project);
  }
}

module.exports = CreateProjectUseCase;
