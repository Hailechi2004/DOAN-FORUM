class GetAllDepartmentsUseCase {
  constructor(departmentRepository) {
    this.departmentRepository = departmentRepository;
  }

  async execute(filters = {}) {
    return await this.departmentRepository.getAll(filters);
  }
}

module.exports = GetAllDepartmentsUseCase;
