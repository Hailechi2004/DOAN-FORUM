import { useState } from "react";
import { Box, Button, Typography, Container, Paper } from "@mui/material";
import { VideoCall as VideoCallIcon } from "@mui/icons-material";
import JitsiMeeting from "../components/JitsiMeeting";

const TestJitsi = () => {
  const [openJitsi, setOpenJitsi] = useState(false);

  const testMeeting = {
    jitsi_room_name: "test-room-" + Date.now(),
    title: "Test Meeting",
    id: 999,
    jitsi_url: "https://meet.jit.si/test-room-" + Date.now(),
  };

  const handleStartTest = () => {
    setOpenJitsi(true);
  };

  const handleClose = () => {
    setOpenJitsi(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          🎥 Test Jitsi Meeting Integration
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Click the button below to test the Jitsi video conferencing
          integration
        </Typography>

        <Button
          variant="contained"
          size="large"
          color="primary"
          startIcon={<VideoCallIcon />}
          onClick={handleStartTest}
          sx={{
            background: "linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)",
            fontSize: "1.2rem",
            py: 2,
            px: 4,
          }}
        >
          Start Test Meeting
        </Button>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Features to test:
          </Typography>
          <ul style={{ textAlign: "left", display: "inline-block" }}>
            <li>Video conferencing interface loads</li>
            <li>Camera and microphone permissions</li>
            <li>Screen sharing functionality</li>
            <li>Chat feature</li>
            <li>Participant list</li>
            <li>Recording (if enabled)</li>
          </ul>
        </Box>

        {openJitsi && (
          <JitsiMeeting
            open={openJitsi}
            onClose={handleClose}
            roomName={testMeeting.jitsi_room_name}
            meetingTitle={testMeeting.title}
            meetingId={testMeeting.id}
            jitsiDomain="meet.jit.si"
            onParticipantJoined={(participant) => {
              console.log("✅ Participant joined:", participant);
            }}
            onParticipantLeft={(participant) => {
              console.log("👋 Participant left:", participant);
            }}
            onVideoConferenceJoined={() => {
              console.log("🎥 You joined the conference");
            }}
            onVideoConferenceLeft={() => {
              console.log("👋 You left the conference");
              handleClose();
            }}
            onReadyToClose={() => {
              console.log("✅ Ready to close");
              handleClose();
            }}
          />
        )}
      </Paper>
    </Container>
  );
};

export default TestJitsi;
