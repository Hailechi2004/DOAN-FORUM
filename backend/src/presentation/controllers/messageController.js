const { ApiResponse, ApiError } = require("../../utils/apiHelpers");
const container = require("../../container");
const MessageModel = require("../../models/Message");

class MessageController {
  constructor() {
    this.useCases = container.getMessageUseCases();

    // Bind methods
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getConversations = this.getConversations.bind(this);
    this.getOrCreateConversation = this.getOrCreateConversation.bind(this);
    this.getMessages = this.getMessages.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
  }

  async create(req, res, next) {
    try {
      const message = await this.useCases.createMessage.execute(req.body);
      ApiResponse.success(res, message, "Message created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const messages = await this.useCases.getAllMessages.execute(req.query);
      ApiResponse.success(res, messages);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const message = await this.useCases.getMessageById.execute(req.params.id);
      ApiResponse.success(res, message);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const message = await this.useCases.updateMessage.execute(
        req.params.id,
        req.body
      );
      ApiResponse.success(res, message, "Message updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.useCases.deleteMessage.execute(req.params.id);
      ApiResponse.success(res, null, "Message deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getConversations(req, res, next) {
    try {
      const conversations = await MessageModel.getUserConversations(
        req.user.id
      );

      // Parse participants
      const parsed = conversations.map((conv) => ({
        ...conv,
        participants: conv.participants
          ? conv.participants.split("||").map((p) => {
              const [id, username, full_name, avatar_url] = p.split("|");
              return { id, username, full_name, avatar_url };
            })
          : [],
      }));

      ApiResponse.success(res, parsed);
    } catch (error) {
      next(error);
    }
  }

  async getOrCreateConversation(req, res, next) {
    try {
      const { user_id } = req.body;

      if (user_id === req.user.id) {
        throw new ApiError(400, "Cannot create conversation with yourself");
      }

      // Check if conversation exists
      let conversationId = await MessageModel.findConversation(
        req.user.id,
        user_id
      );

      if (!conversationId) {
        // Create new conversation
        conversationId = await MessageModel.createConversation(
          "direct",
          [req.user.id, user_id],
          req.user.id
        );
      }

      ApiResponse.success(res, { conversation_id: conversationId });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const { conversation_id } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const messages = await MessageModel.getMessages(
        conversation_id,
        parseInt(limit),
        parseInt(offset)
      );

      // Parse attachments
      const parsed = messages.map((msg) => ({
        ...msg,
        attachments: msg.attachments
          ? msg.attachments.split("||").map((a) => {
              const [id, name, path] = a.split(":");
              return { id, name, path };
            })
          : [],
      }));

      ApiResponse.success(res, parsed);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { conversation_id, content, attachments = [] } = req.body;

      const messageId = await MessageModel.sendMessage(
        conversation_id,
        req.user.id,
        content,
        attachments
      );

      // Get the created message
      const [messages] = await MessageModel.getMessages(conversation_id, 1, 0);
      const message = messages[0];

      ApiResponse.success(res, message, "Message sent", 201);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { message_id } = req.params;

      await MessageModel.markAsRead(message_id, req.user.id);

      ApiResponse.success(res, null, "Message marked as read");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController();
