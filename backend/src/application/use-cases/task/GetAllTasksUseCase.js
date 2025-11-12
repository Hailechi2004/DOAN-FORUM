const Task = require("../../../domain/entities/Task");

class GetAllTasksUseCase {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(filters = {}) {
    const result = await this.taskRepository.getAll(filters);

    return {
      tasks: result.tasks.map((t) => new Task(t)),
      pagination: result.pagination,
    };
  }
}

module.exports = GetAllTasksUseCase;
