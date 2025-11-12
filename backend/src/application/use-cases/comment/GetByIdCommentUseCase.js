class GetCommentByIdUseCase {
  constructor(commentRepository) {
    this.commentRepository = commentRepository;
  }

  async execute(id) {
    if (!id) {
      throw new Error('Comment ID is required');
    }

    const comment = await this.commentRepository.findById(id);

    if (!comment) {
      throw new Error('Comment not found');
    }

    return comment;
  }
}

module.exports = GetCommentByIdUseCase;
