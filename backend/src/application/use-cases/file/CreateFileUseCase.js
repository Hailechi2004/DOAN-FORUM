class CreateFileUseCase {
  constructor(fileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(data) {
    return await this.fileRepository.create(data);
  }
}

module.exports = CreateFileUseCase;
