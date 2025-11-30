const UserModel = require("../models/User");
const MessageModel = require("../models/Message");
const NotificationModel = require("../models/Notification");
const tokenService = require("../utils/tokenService");

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.users = new Map(); // userId -> socketId mapping
  }

  initialize() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Authentication error"));
        }

        const decoded = tokenService.verifyAccessToken(token);
        const user = await UserModel.findById(decoded.userId);

        if (!user) {
          return next(new Error("User not found"));
        }

        socket.userId = user.id;
        socket.userEmail = user.email;
        next();
      } catch (error) {
        next(new Error("Authentication error"));
      }
    });

    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.userId}`);
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    // Store user socket connection
    this.users.set(socket.userId, socket.id);

    // Update user online status
    UserModel.updateOnlineStatus(socket.userId, true);

    // Broadcast user online status
    socket.broadcast.emit("user:online", {
      user_id: socket.userId,
      timestamp: new Date(),
    });

    // Join user's personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Handle typing indicators
    socket.on("typing:start", async (data) => {
      const { conversation_id } = data;
      await MessageModel.setTypingStatus(conversation_id, socket.userId, true);
      socket.to(`conversation:${conversation_id}`).emit("typing:start", {
        user_id: socket.userId,
        conversation_id,
      });
    });

    socket.on("typing:stop", async (data) => {
      const { conversation_id } = data;
      await MessageModel.setTypingStatus(conversation_id, socket.userId, false);
      socket.to(`conversation:${conversation_id}`).emit("typing:stop", {
        user_id: socket.userId,
        conversation_id,
      });
    });

    // Handle joining conversations
    socket.on("conversation:join", (data) => {
      const { conversation_id } = data;
      socket.join(`conversation:${conversation_id}`);
      console.log(
        `User ${socket.userId} joined conversation ${conversation_id}`
      );
    });

    socket.on("conversation:leave", (data) => {
      const { conversation_id } = data;
      socket.leave(`conversation:${conversation_id}`);
    });

    // Handle new messages
    socket.on("message:send", async (data) => {
      try {
        const { conversation_id, content, attachments } = data;

        // Save message to database
        const messageId = await MessageModel.sendMessage(
          conversation_id,
          socket.userId,
          content,
          attachments || []
        );

        // Get message with user info
        const messages = await MessageModel.getMessages(conversation_id, 1, 0);
        const message = messages[0];

        // Broadcast to conversation room
        this.io.to(`conversation:${conversation_id}`).emit("message:new", {
          conversation_id,
          message,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle message read receipts
    socket.on("message:read", async (data) => {
      const { message_id, conversation_id } = data;
      await MessageModel.markAsRead(message_id, socket.userId);

      socket.to(`conversation:${conversation_id}`).emit("message:read", {
        message_id,
        user_id: socket.userId,
        read_at: new Date(),
      });
    });

    // Handle post view tracking
    socket.on("post:view", async (data) => {
      const { post_id } = data;
      // Real-time view count update can be handled here
      socket.to(`post:${post_id}`).emit("post:view", {
        post_id,
        user_id: socket.userId,
      });
    });

    // Handle post reactions
    socket.on("post:react", (data) => {
      const { post_id, reaction_type } = data;
      socket.broadcast.emit("post:react", {
        post_id,
        user_id: socket.userId,
        reaction_type,
        timestamp: new Date(),
      });
    });

    // Handle new notification
    socket.on("notification:send", async (data) => {
      const { user_id, type, content, target_type, target_id } = data;

      // Create notification in database
      const notificationId = await NotificationModel.create({
        user_id,
        actor_id: socket.userId,
        type,
        content,
        target_type,
        target_id,
      });

      // Send to specific user
      this.io.to(`user:${user_id}`).emit("notification:new", {
        id: notificationId,
        type,
        content,
        actor_id: socket.userId,
        created_at: new Date(),
      });
    });

    // ============ MEETING EVENTS ============

    // Handle joining a meeting room
    socket.on("meeting:join-room", (data) => {
      const { meeting_id } = data;
      socket.join(`meeting:${meeting_id}`);
      console.log(`User ${socket.userId} joined meeting room ${meeting_id}`);
    });

    // Handle leaving a meeting room
    socket.on("meeting:leave-room", (data) => {
      const { meeting_id } = data;
      socket.leave(`meeting:${meeting_id}`);
      console.log(`User ${socket.userId} left meeting room ${meeting_id}`);
    });

    // Handle user joining meeting
    socket.on("meeting:user-joined", (data) => {
      const { meeting_id, user_info } = data;

      // Broadcast to all users in meeting room
      socket.to(`meeting:${meeting_id}`).emit("meeting:user-joined", {
        meeting_id,
        user_id: socket.userId,
        user_info: user_info || { id: socket.userId },
        timestamp: new Date(),
      });

      console.log(`User ${socket.userId} joined meeting ${meeting_id}`);
    });

    // Handle user leaving meeting
    socket.on("meeting:user-left", (data) => {
      const { meeting_id } = data;

      // Broadcast to all users in meeting room
      socket.to(`meeting:${meeting_id}`).emit("meeting:user-left", {
        meeting_id,
        user_id: socket.userId,
        timestamp: new Date(),
      });

      console.log(`User ${socket.userId} left meeting ${meeting_id}`);
    });

    // Handle screen sharing events
    socket.on("meeting:screen-share-started", (data) => {
      const { meeting_id } = data;
      socket.to(`meeting:${meeting_id}`).emit("meeting:screen-share-started", {
        meeting_id,
        user_id: socket.userId,
        timestamp: new Date(),
      });
    });

    socket.on("meeting:screen-share-stopped", (data) => {
      const { meeting_id } = data;
      socket.to(`meeting:${meeting_id}`).emit("meeting:screen-share-stopped", {
        meeting_id,
        user_id: socket.userId,
        timestamp: new Date(),
      });
    });

    // Handle recording events
    socket.on("meeting:recording-started", (data) => {
      const { meeting_id } = data;
      socket.to(`meeting:${meeting_id}`).emit("meeting:recording-started", {
        meeting_id,
        started_by: socket.userId,
        timestamp: new Date(),
      });
    });

    socket.on("meeting:recording-stopped", (data) => {
      const { meeting_id, recording_url } = data;
      socket.to(`meeting:${meeting_id}`).emit("meeting:recording-stopped", {
        meeting_id,
        stopped_by: socket.userId,
        recording_url,
        timestamp: new Date(),
      });
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.userId}`);
      this.users.delete(socket.userId);

      // Update user offline status
      await UserModel.updateOnlineStatus(socket.userId, false);

      // Broadcast user offline status
      socket.broadcast.emit("user:offline", {
        user_id: socket.userId,
        timestamp: new Date(),
      });
    });
  }

  // Helper method to send notification to specific user
  sendNotificationToUser(userId, notification) {
    this.io.to(`user:${userId}`).emit("notification:new", notification);
  }

  // Helper method to broadcast to conversation
  broadcastToConversation(conversationId, event, data) {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.users.has(userId);
  }

  // ============ MEETING HELPER METHODS ============

  /**
   * Broadcast meeting started event to all attendees
   * @param {number} meetingId - Meeting ID
   * @param {Object} meetingData - Meeting details
   * @param {number} startedBy - User ID who started the meeting
   */
  broadcastMeetingStarted(meetingId, meetingData, startedBy) {
    this.io.emit("meeting:started", {
      meeting_id: meetingId,
      meeting: meetingData,
      started_by: startedBy,
      timestamp: new Date(),
    });
    console.log(`Meeting ${meetingId} started by user ${startedBy}`);
  }

  /**
   * Broadcast meeting ended event to all participants
   * @param {number} meetingId - Meeting ID
   * @param {number} endedBy - User ID who ended the meeting
   */
  broadcastMeetingEnded(meetingId, endedBy) {
    this.io.to(`meeting:${meetingId}`).emit("meeting:ended", {
      meeting_id: meetingId,
      ended_by: endedBy,
      timestamp: new Date(),
    });
    console.log(`Meeting ${meetingId} ended by user ${endedBy}`);
  }

  /**
   * Notify specific attendees about meeting
   * @param {Array} userIds - Array of user IDs to notify
   * @param {Object} data - Notification data
   */
  notifyMeetingAttendees(userIds, data) {
    userIds.forEach((userId) => {
      this.io.to(`user:${userId}`).emit("meeting:notification", {
        ...data,
        timestamp: new Date(),
      });
    });
  }

  /**
   * Broadcast to all users in a meeting room
   * @param {number} meetingId - Meeting ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  broadcastToMeeting(meetingId, event, data) {
    this.io.to(`meeting:${meetingId}`).emit(event, {
      meeting_id: meetingId,
      ...data,
      timestamp: new Date(),
    });
  }
}

module.exports = SocketHandler;
