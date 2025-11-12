const Task = require("../../../domain/entities/Task");

class GetTaskByIdUseCase {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(taskId) {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    return new Task(task);
  }
}

module.exports = GetTaskByIdUseCase;
