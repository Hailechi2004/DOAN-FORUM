class DeleteFileUseCase {
  constructor(fileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(id) {
    if (!id) throw new Error('File ID is required');
    return await this.fileRepository.delete(id);
  }
}

module.exports = DeleteFileUseCase;
