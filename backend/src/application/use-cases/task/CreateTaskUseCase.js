const Task = require("../../../domain/entities/Task");

class CreateTaskUseCase {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(taskData) {
    // Validate required fields
    if (!taskData.title) {
      throw new Error("Task title is required");
    }

    // Create task
    const task = await this.taskRepository.create(taskData);

    return new Task(task);
  }
}

module.exports = CreateTaskUseCase;
