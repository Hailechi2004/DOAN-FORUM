class GetDepartmentByIdUseCase {
  constructor(departmentRepository) {
    this.departmentRepository = departmentRepository;
  }

  async execute(id) {
    if (!id) {
      throw new Error('Department ID is required');
    }

    const department = await this.departmentRepository.findById(id);

    if (!department) {
      throw new Error('Department not found');
    }

    return department;
  }
}

module.exports = GetDepartmentByIdUseCase;
