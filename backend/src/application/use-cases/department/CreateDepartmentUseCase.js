class CreateDepartmentUseCase {
  constructor(departmentRepository) {
    this.departmentRepository = departmentRepository;
  }

  async execute(data) {
    // TODO: Add validation logic
    return await this.departmentRepository.create(data);
  }
}

module.exports = CreateDepartmentUseCase;
