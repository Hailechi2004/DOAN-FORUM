const Task = require("../../../domain/entities/Task");

class UpdateTaskUseCase {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(taskId, updateData) {
    // Kiểm tra task tồn tại
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Update task
    await this.taskRepository.update(taskId, updateData);

    // Return updated task
    const updatedTask = await this.taskRepository.findById(taskId);
    return new Task(updatedTask);
  }
}

module.exports = UpdateTaskUseCase;
