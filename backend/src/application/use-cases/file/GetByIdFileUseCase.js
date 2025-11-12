class GetFileByIdUseCase {
  constructor(fileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(id) {
    if (!id) throw new Error('File ID is required');
    const result = await this.fileRepository.findById(id);
    if (!result) throw new Error('File not found');
    return result;
  }
}

module.exports = GetFileByIdUseCase;
