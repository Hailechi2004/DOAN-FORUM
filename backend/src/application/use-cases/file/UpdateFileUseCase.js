class UpdateFileUseCase {
  constructor(fileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(id, data) {
    if (!id) throw new Error('File ID is required');
    return await this.fileRepository.update(id, data);
  }
}

module.exports = UpdateFileUseCase;
