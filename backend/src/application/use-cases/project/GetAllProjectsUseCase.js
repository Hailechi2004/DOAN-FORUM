const Project = require("../../../domain/entities/Project");

class GetAllProjectsUseCase {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(filters = {}) {
    const result = await this.projectRepository.getAll(filters);

    return {
      projects: result.projects.map((p) => new Project(p)),
      pagination: result.pagination,
    };
  }
}

module.exports = GetAllProjectsUseCase;
