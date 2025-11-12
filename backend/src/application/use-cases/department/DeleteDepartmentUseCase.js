class DeleteDepartmentUseCase {
  constructor(departmentRepository) {
    this.departmentRepository = departmentRepository;
  }

  async execute(id) {
    if (!id) {
      throw new Error('Department ID is required');
    }

    const existing = await this.departmentRepository.findById(id);
    if (!existing) {
      throw new Error('Department not found');
    }

    return await this.departmentRepository.delete(id);
  }
}

module.exports = DeleteDepartmentUseCase;
