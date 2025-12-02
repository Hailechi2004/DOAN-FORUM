const crypto = require("crypto");

/**
 * Jitsi Meet Service
 * Handles Jitsi meeting room creation, URL generation, and access validation
 */
class JitsiService {
  constructor() {
    // Jitsi server domain - can be configured via environment variable
    this.jitsiDomain = process.env.JITSI_DOMAIN || "meet.jit.si";
    this.appPrefix = process.env.JITSI_ROOM_PREFIX || "dacn-forum";
  }

  /**
   * Generate unique room name for a meeting
   * Format: dacn-forum-meeting-{meetingId}-{timestamp}-{random}
   * @param {number} meetingId - The meeting ID
   * @returns {string} Unique room name
   */
  generateRoomName(meetingId) {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(4).toString("hex");
    return `${this.appPrefix}-meeting-${meetingId}-${timestamp}-${randomStr}`;
  }

  /**
   * Create full Jitsi meeting link
   * @param {number} meetingId - The meeting ID
   * @param {string} roomName - Optional custom room name
   * @returns {string} Full Jitsi meeting URL
   */
  createMeetingLink(meetingId, roomName = null) {
    const room = roomName || this.generateRoomName(meetingId);
    // Add config parameters to disable lobby, prejoin, and authentication
    const configParams = [
      "config.prejoinPageEnabled=false",
      "config.startWithAudioMuted=false",
      "config.startWithVideoMuted=false",
      "config.requireDisplayName=false",
      "config.enableLobbyChat=false",
      "config.disableLobby=true",
      "config.enableAuthenticationUI=false",
    ].join("&");
    return `https://${this.jitsiDomain}/${room}#${configParams}`;
  }

  /**
   * Validate if user has access to join a meeting room
   * @param {number} userId - The user ID attempting to join
   * @param {Object} meeting - The meeting object with attendees/participants
   * @returns {Object} { allowed: boolean, reason: string }
   */
  validateRoomAccess(userId, meeting) {
    if (!meeting) {
      return { allowed: false, reason: "Meeting not found" };
    }

    if (meeting.is_cancelled) {
      return { allowed: false, reason: "Meeting has been cancelled" };
    }

    // Organizer always has access
    if (meeting.organizer_id === userId) {
      return { allowed: true, reason: "Organizer access" };
    }

    // Check if user is an accepted attendee
    const isAcceptedAttendee = meeting.attendees?.some(
      (a) => a.user_id === userId && a.status === "accepted"
    );

    if (isAcceptedAttendee) {
      return { allowed: true, reason: "Accepted attendee" };
    }

    // Check if user is a participant
    const isParticipant = meeting.participants?.some(
      (p) => p.user_id === userId
    );

    if (isParticipant) {
      return { allowed: true, reason: "Participant" };
    }

    // If meeting has no attendees list, allow (open meeting)
    if (!meeting.attendees || meeting.attendees.length === 0) {
      return { allowed: true, reason: "Open meeting" };
    }

    return {
      allowed: false,
      reason: "Not invited or invitation not accepted",
    };
  }

  /**
   * Generate Jitsi JWT token for secure meetings (optional)
   * Requires jitsi-meet-tokens to be configured on Jitsi server
   * @param {Object} user - User object with id, username, email
   * @param {string} roomName - The room name
   * @returns {string|null} JWT token or null if not configured
   */
  generateJWT(user, roomName) {
    // This requires JWT secret to be configured
    // For MVP, we'll skip this and use public rooms
    // TODO: Implement when moving to production with self-hosted Jitsi
    const jwtSecret = process.env.JITSI_JWT_SECRET;

    if (!jwtSecret) {
      return null; // Public room mode
    }

    // JWT implementation would go here
    // See: https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/tokens.md
    return null;
  }

  /**
   * Extract room name from Jitsi URL
   * @param {string} meetingLink - Full Jitsi URL
   * @returns {string|null} Room name or null if invalid
   */
  extractRoomName(meetingLink) {
    if (!meetingLink) return null;

    try {
      const url = new URL(meetingLink);
      const pathParts = url.pathname.split("/").filter((p) => p);
      return pathParts[0] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate Jitsi meeting link format
   * @param {string} meetingLink - The meeting link to validate
   * @returns {boolean} True if valid Jitsi link
   */
  isValidJitsiLink(meetingLink) {
    if (!meetingLink) return false;

    try {
      const url = new URL(meetingLink);
      // Check if it's a valid Jitsi domain
      return (
        url.hostname === this.jitsiDomain ||
        url.hostname.includes("jitsi") ||
        url.hostname.includes("meet")
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Jitsi configuration for frontend
   * @returns {Object} Jitsi config object
   */
  getJitsiConfig() {
    return {
      domain: this.jitsiDomain,
      roomPrefix: this.appPrefix,
      features: {
        recording: process.env.JITSI_RECORDING_ENABLED === "true",
        livestreaming: process.env.JITSI_LIVESTREAM_ENABLED === "true",
        transcription: process.env.JITSI_TRANSCRIPTION_ENABLED === "true",
      },
      limits: {
        maxParticipants: parseInt(process.env.JITSI_MAX_PARTICIPANTS || "75"),
        maxDuration: parseInt(process.env.JITSI_MAX_DURATION_HOURS || "24"),
      },
    };
  }
}

module.exports = new JitsiService();
