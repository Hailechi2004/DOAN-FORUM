class GetAllFilesUseCase {
  constructor(fileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(filters = {}) {
    return await this.fileRepository.getAll(filters);
  }
}

module.exports = GetAllFilesUseCase;
