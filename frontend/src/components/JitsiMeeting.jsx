import React, { useState, useEffect, useRef } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  Videocam as VideocamIcon,
  People as PeopleIcon,
  GridView as GridViewIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";

/**
 * JitsiMeetingComponent
 * Wrapper component for Jitsi Meet video conferencing
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.roomName - Jitsi room name
 * @param {string} props.meetingTitle - Meeting title
 * @param {number} props.meetingId - Meeting ID
 * @param {string} props.jitsiDomain - Jitsi server domain (default: meet.jit.si)
 * @param {Function} props.onMeetingEnd - Callback when meeting ends
 * @param {Function} props.onUserJoined - Callback when user joins
 * @param {Function} props.onUserLeft - Callback when user leaves
 */
const JitsiMeetingComponent = ({
  open,
  onClose,
  roomName,
  meetingTitle,
  meetingId,
  jitsiDomain = "localhost:8000", // Use local Docker Jitsi
  onMeetingEnd,
  onUserJoined,
  onUserLeft,
}) => {
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [reloadKey, setReloadKey] = useState(0); // Key to force reload Jitsi component
  const apiRef = useRef(null);

  // Display name from user info
  const displayName = user?.full_name || user?.username || "Guest";
  const userEmail = user?.email || "";
  const userAvatar = user?.avatar_url || "";

  useEffect(() => {
    if (!open) {
      setIsLoading(true);
      setError(null);
      setParticipantCount(0);
    }
  }, [open]);

  const handleApiReady = (externalApi) => {
    apiRef.current = externalApi;
    setIsLoading(false);

    // Event listeners
    externalApi.addEventListener("videoConferenceJoined", (event) => {
      console.log("User joined conference:", event);
      if (onUserJoined) {
        onUserJoined({
          meeting_id: meetingId,
          user_info: {
            displayName: event.displayName,
            id: event.id,
          },
        });
      }
    });

    externalApi.addEventListener("videoConferenceLeft", () => {
      console.log("User left conference");
      if (onUserLeft) {
        onUserLeft({
          meeting_id: meetingId,
        });
      }
    });

    externalApi.addEventListener("participantJoined", (event) => {
      console.log("Participant joined:", event);
      setParticipantCount((prev) => prev + 1);
    });

    externalApi.addEventListener("participantLeft", (event) => {
      console.log("Participant left:", event);
      setParticipantCount((prev) => Math.max(0, prev - 1));
    });

    externalApi.addEventListener("readyToClose", () => {
      console.log("Meeting ready to close");
      handleClose();
    });

    externalApi.addEventListener("errorOccurred", (event) => {
      console.error("Jitsi error:", event);
      setError("An error occurred during the meeting");
    });

    // Get initial participant count
    const participants = externalApi.getParticipantsInfo();
    setParticipantCount(participants.length);
  };

  const handleClose = () => {
    // End meeting gracefully
    if (apiRef.current) {
      try {
        apiRef.current.executeCommand("hangup");
      } catch (error) {
        console.error("Error hanging up:", error);
      }
    }

    if (onClose) onClose();
    if (onMeetingEnd) {
      onMeetingEnd({
        meeting_id: meetingId,
        ended_at: new Date().toISOString(),
      });
    }
  };

  // Helper functions to toggle Jitsi UI elements
  const toggleFilmstrip = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("toggleFilmstrip");
    }
  };

  const toggleParticipantsPane = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("toggleParticipantsPane");
    }
  };

  const toggleTileView = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("toggleTileView");
    }
  };

  const resetLayout = () => {
    // The most reliable way to reset everything: reload the Jitsi component
    setIsLoading(true);
    setReloadKey((prev) => prev + 1); // This will unmount and remount JitsiMeeting

    // Reset API ref
    if (apiRef.current) {
      try {
        apiRef.current.dispose();
      } catch (error) {
        console.log("API already disposed");
      }
      apiRef.current = null;
    }

    console.log("Reloading Jitsi meeting to reset layout");
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "90vh",
          maxHeight: "900px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "primary.main",
          color: "white",
          py: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <VideocamIcon />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {meetingTitle || "Video Meeting"}
            </Typography>
            <Typography variant="caption">Room: {roomName}</Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            icon={<PeopleIcon />}
            label={`${participantCount} participant${
              participantCount !== 1 ? "s" : ""
            }`}
            color="secondary"
            size="small"
          />

          {/* Quick control buttons */}
          <Stack direction="row" spacing={0.5}>
            <IconButton
              onClick={toggleFilmstrip}
              sx={{ color: "white" }}
              title="Hiển thị/Ẩn video thumbnails"
              size="small"
            >
              <GridViewIcon fontSize="small" />
            </IconButton>

            <IconButton
              onClick={toggleParticipantsPane}
              sx={{ color: "white" }}
              title="Hiển thị/Ẩn danh sách người tham gia"
              size="small"
            >
              <PeopleIcon fontSize="small" />
            </IconButton>

            <IconButton
              onClick={resetLayout}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.15)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
              }}
              title="Khôi phục giao diện mặc định"
              size="small"
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Stack>

          <IconButton
            onClick={handleClose}
            sx={{ color: "white" }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: "relative", bgcolor: "#000" }}>
        {isLoading && (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="100%"
            gap={2}
          >
            <CircularProgress size={60} />
            <Typography color="white">Loading meeting...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {roomName && (
          <JitsiMeeting
            key={reloadKey}
            domain={jitsiDomain}
            roomName={roomName}
            configOverwrite={{
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableModeratorIndicator: false,
              enableEmailInStats: false,
              enableWelcomePage: false,
              prejoinPageEnabled: true, // Enable prejoin page to show camera preview
              subject: meetingTitle,
              // Disable lobby/waiting room completely
              enableLobbyChat: false,
              enableInsecureRoomNameWarning: false,
              enableUserRolesBasedOnToken: false,
              // Disable authentication requirement
              requireDisplayName: false,
              // Allow guest access
              enableAuthenticationUI: false,
              enableForcedReload: false,
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
              TOOLBAR_BUTTONS: [
                "microphone",
                "camera",
                "desktop",
                "fullscreen",
                "fodeviceselection",
                "hangup",
                "profile",
                "chat",
                "recording",
                "livestreaming",
                "etherpad",
                "sharedvideo",
                "settings",
                "raisehand",
                "videoquality",
                "filmstrip",
                "invite",
                "feedback",
                "stats",
                "shortcuts",
                "tileview",
                "select-background",
                "help",
                "mute-everyone",
              ],
              SETTINGS_SECTIONS: [
                "devices",
                "language",
                "moderator",
                "profile",
                "calendar",
              ],
              SHOW_CHROME_EXTENSION_BANNER: false,
            }}
            userInfo={{
              displayName: displayName,
              email: userEmail,
              moderator: true, // Grant moderator rights
            }}
            onApiReady={handleApiReady}
            getIFrameRef={(iframeRef) => {
              if (iframeRef) {
                iframeRef.style.height = "100%";
                iframeRef.style.width = "100%";
              }
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JitsiMeetingComponent;
