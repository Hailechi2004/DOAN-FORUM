class UpdateDepartmentUseCase {
  constructor(departmentRepository) {
    this.departmentRepository = departmentRepository;
  }

  async execute(id, data) {
    if (!id) {
      throw new Error('Department ID is required');
    }

    // Check if exists
    const existing = await this.departmentRepository.findById(id);
    if (!existing) {
      throw new Error('Department not found');
    }

    return await this.departmentRepository.update(id, data);
  }
}

module.exports = UpdateDepartmentUseCase;
