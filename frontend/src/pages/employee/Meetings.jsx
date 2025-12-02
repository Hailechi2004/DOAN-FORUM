import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  VideoCall as VideoCallIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { format } from "date-fns";
import JitsiMeeting from "../../components/JitsiMeeting";
import socketService from "../../services/socketService";

const EmployeeMeetings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMeetingSession, setActiveMeetingSession] = useState(null);
  const [showJitsi, setShowJitsi] = useState(false);
  const [meetingStats, setMeetingStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });

  // Connect socket
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      socketService.connect(token);

      // Listen for meeting events
      socketService.on("meeting:started", (data) => {
        console.log("Meeting started:", data);
        fetchMeetings();
      });

      socketService.on("meeting:ended", (data) => {
        console.log("Meeting ended:", data);
        fetchMeetings();
      });

      socketService.on("meeting:user-joined", (data) => {
        console.log("User joined meeting:", data);
      });

      socketService.on("meeting:user-left", (data) => {
        console.log("User left meeting:", data);
      });
    }

    return () => {
      socketService.off("meeting:started");
      socketService.off("meeting:ended");
      socketService.off("meeting:user-joined");
      socketService.off("meeting:user-left");
    };
  }, []);

  // Fetch meetings
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/meetings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const allMeetings = response.data.data;
        setMeetings(allMeetings);

        // Calculate stats
        const stats = {
          total: allMeetings.length,
          upcoming: allMeetings.filter(
            (m) => m.status === "scheduled" || m.status === "in_progress"
          ).length,
          completed: allMeetings.filter((m) => m.status === "completed").length,
          cancelled: allMeetings.filter((m) => m.status === "cancelled").length,
        };
        setMeetingStats(stats);
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setError(err.response?.data?.message || "Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Join meeting
  const handleJoinMeeting = async (meeting) => {
    try {
      console.log("🎯 Attempting to join meeting:", meeting);
      console.log("📋 Meeting link:", meeting.meeting_link);

      // Check if meeting has been started
      if (!meeting.meeting_link) {
        setError(
          "Meeting has not been started yet. Please wait for the organizer to start the meeting."
        );
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3000/api/meetings/${meeting.meeting_id}/join`,
        {
          display_name: user?.username || user?.email || "Employee",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Join response:", response.data);

      if (response.data.success) {
        const sessionData = response.data.data;
        // Map backend response to expected format
        const meetingSession = {
          room_name: sessionData.roomName,
          meeting_title: sessionData.meeting?.title || meeting.title,
          meeting_id: sessionData.meeting?.id || meeting.meeting_id,
          jitsi_url: sessionData.jitsiUrl,
          jitsi_domain: sessionData.jitsiDomain,
        };
        console.log("🎥 Opening Jitsi with session:", meetingSession);
        setActiveMeetingSession(meetingSession);
        setShowJitsi(true);
      }
    } catch (err) {
      console.error("❌ Error joining meeting:", err);
      setError(err.response?.data?.message || "Failed to join meeting");
    }
  };

  // Meeting ended callback
  const handleMeetingEnd = async () => {
    setShowJitsi(false);

    if (activeMeetingSession) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:3000/api/meetings/${activeMeetingSession.meeting_id}/end`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        console.error("Error ending meeting:", err);
      }
    }

    setActiveMeetingSession(null);
    fetchMeetings();
  };

  // User joined callback
  const handleUserJoined = (participantInfo) => {
    console.log("User joined:", participantInfo);
  };

  // User left callback
  const handleUserLeft = (participantInfo) => {
    console.log("User left:", participantInfo);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "primary";
      case "in_progress":
        return "success";
      case "completed":
        return "default";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "scheduled":
        return "Scheduled";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" gutterBottom>
          My Meetings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchMeetings}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Meetings
                  </Typography>
                  <Typography variant="h4">{meetingStats.total}</Typography>
                </Box>
                <EventIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Upcoming
                  </Typography>
                  <Typography variant="h4">{meetingStats.upcoming}</Typography>
                </Box>
                <AccessTimeIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h4">{meetingStats.completed}</Typography>
                </Box>
                <PeopleIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Cancelled
                  </Typography>
                  <Typography variant="h4">{meetingStats.cancelled}</Typography>
                </Box>
                <CloseIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Meetings Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          All Meetings
        </Typography>

        {meetings.length === 0 ? (
          <Alert severity="info">No meetings found</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Scheduled Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Organizer</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meetings.map((meeting) => (
                  <TableRow key={meeting.meeting_id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {meeting.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {meeting.description || "No description"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {meeting.scheduled_time
                        ? format(
                            new Date(meeting.scheduled_time),
                            "MMM dd, yyyy HH:mm"
                          )
                        : "Not scheduled"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(meeting.status)}
                        color={getStatusColor(meeting.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {meeting.created_by_name || "Unknown"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {(meeting.status === "scheduled" ||
                        meeting.status === "in_progress") && (
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          startIcon={<VideoCallIcon />}
                          onClick={() => handleJoinMeeting(meeting)}
                        >
                          Join
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Jitsi Meeting Dialog */}
      {showJitsi && activeMeetingSession && (
        <JitsiMeeting
          open={showJitsi}
          onClose={() => setShowJitsi(false)}
          roomName={activeMeetingSession.room_name}
          meetingTitle={activeMeetingSession.meeting_title}
          meetingId={activeMeetingSession.meeting_id}
          jitsiDomain={
            activeMeetingSession.jitsi_url?.split("/")[2] || "meet.jit.si"
          }
          onMeetingEnd={handleMeetingEnd}
          onUserJoined={handleUserJoined}
          onUserLeft={handleUserLeft}
        />
      )}
    </Container>
  );
};

export default EmployeeMeetings;
