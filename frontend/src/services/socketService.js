import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    const serverUrl = import.meta.env.VITE_WS_URL || "http://localhost:3000";

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event, callback) {
    if (!this.socket) {
      console.warn("Socket not connected. Please connect first.");
      return;
    }

    // Store listener for cleanup
    this.listeners.set(event, callback);
    this.socket.on(event, callback);
  }

  off(event) {
    if (!this.socket) return;

    const callback = this.listeners.get(event);
    if (callback) {
      this.socket.off(event, callback);
      this.listeners.delete(event);
    }
  }

  emit(event, data) {
    if (!this.socket) {
      console.warn("Socket not connected. Please connect first.");
      return;
    }
    this.socket.emit(event, data);
  }

  // Task Workflow Events
  joinProject(projectId) {
    this.emit("join-project", { projectId });
  }

  leaveProject(projectId) {
    this.emit("leave-project", { projectId });
  }
}

export default new SocketService();
