import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  VideoCall as VideoCallIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useSnackbar } from "notistack";
import axiosInstance from "../../utils/axios";
import JitsiMeeting from "../../components/JitsiMeeting";
import { useDispatch } from "react-redux";
import {
  startMeeting,
  joinMeeting,
  endMeeting,
  fetchActiveParticipants,
} from "../../store/slices/meetingSlice";
import socketService from "../../services/socketService";

const ManagerMeetings = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useSelector((state) => state.auth);

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  // Jitsi Meeting states
  const [openJitsiDialog, setOpenJitsiDialog] = useState(false);
  const [activeMeetingSession, setActiveMeetingSession] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    meeting_link: "",
    start_time: "",
    end_time: "",
    department_ids: [],
  });

  useEffect(() => {
    if (user?.department_id) {
      fetchMeetings();
      
      // Connect Socket.io if authenticated
      const token = localStorage.getItem('accessToken');
      if (token && !socketService.socket?.connected) {
        socketService.connect(token);
      }
    }
  }, [page, rowsPerPage, searchTerm, user?.department_id]);

  const fetchMeetings = async () => {
    if (!user?.department_id) return;

    try {
      setLoading(true);
      // Manager chỉ thấy meetings của department mình
      const response = await axiosInstance.get("/meetings", {
        params: {
          department_id: user.department_id,
          search: searchTerm,
          page: page + 1,
          limit: rowsPerPage,
        },
      });

      const data = response.data.data || response.data;
      setMeetings(data.meetings || data || []);
      setTotalCount(data.total || data.length || 0);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
      enqueueSnackbar("Failed to load meetings", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, meeting = null) => {
    setDialogMode(mode);
    if (mode === "edit" && meeting) {
      setSelectedMeeting(meeting);
      setFormData({
        title: meeting.title,
        description: meeting.description || "",
        location: meeting.location || "",
        meeting_link: meeting.meeting_link || "",
        start_time: meeting.start_time
          ? format(new Date(meeting.start_time), "yyyy-MM-dd'T'HH:mm")
          : "",
        end_time: meeting.end_time
          ? format(new Date(meeting.end_time), "yyyy-MM-dd'T'HH:mm")
          : "",
        department_ids: [user.department_id],
      });
    } else {
      setSelectedMeeting(null);
      setFormData({
        title: "",
        description: "",
        location: "",
        meeting_link: "",
        start_time: "",
        end_time: "",
        department_ids: [user.department_id],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: "",
      description: "",
      location: "",
      meeting_link: "",
      start_time: "",
      end_time: "",
      department_ids: [],
    });
    setSelectedMeeting(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        department_ids: [user.department_id], // Lock to manager's department
      };

      if (dialogMode === "edit") {
        await axiosInstance.put(`/meetings/${selectedMeeting.id}`, payload);
        enqueueSnackbar("Meeting updated successfully", { variant: "success" });
      } else {
        await axiosInstance.post("/meetings", payload);
        enqueueSnackbar("Meeting created successfully", { variant: "success" });
      }

      handleCloseDialog();
      fetchMeetings();
    } catch (error) {
      console.error("Failed to save meeting:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to save meeting",
        { variant: "error" }
      );
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/meetings/${selectedMeeting.id}`);
      enqueueSnackbar("Meeting deleted successfully", { variant: "success" });
      setOpenDeleteDialog(false);
      setSelectedMeeting(null);
      fetchMeetings();
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      enqueueSnackbar("Failed to delete meeting", { variant: "error" });
    }
  };

  // Jitsi Meeting Handlers
  const handleStartMeeting = async (meeting) => {
    try {
      const result = await dispatch(startMeeting(meeting.id)).unwrap();
      setActiveMeetingSession(result.meeting);
      setOpenJitsiDialog(true);
      enqueueSnackbar("Meeting started successfully", { variant: "success" });
    } catch (error) {
      console.error("Error starting meeting:", error);
      enqueueSnackbar("Failed to start meeting", { variant: "error" });
    }
  };

  const handleJoinMeeting = async (meeting) => {
    try {
      const result = await dispatch(joinMeeting(meeting.id)).unwrap();
      setActiveMeetingSession(result.meeting);
      setOpenJitsiDialog(true);
      enqueueSnackbar("Joined meeting successfully", { variant: "success" });
    } catch (error) {
      console.error("Error joining meeting:", error);
      enqueueSnackbar("Failed to join meeting", { variant: "error" });
    }
  };

  const handleEndMeeting = async () => {
    if (activeMeetingSession) {
      try {
        await dispatch(endMeeting(activeMeetingSession.id)).unwrap();
        setOpenJitsiDialog(false);
        setActiveMeetingSession(null);
        fetchMeetings();
        enqueueSnackbar("Meeting ended successfully", { variant: "success" });
      } catch (error) {
        console.error("Error ending meeting:", error);
        enqueueSnackbar("Failed to end meeting", { variant: "error" });
      }
    }
  };

  const handleCloseJitsiDialog = useCallback(() => {
    setOpenJitsiDialog(false);
    setActiveMeetingSession(null);
  }, []);

  const handleParticipantJoined = useCallback((participant) => {
    console.log("Participant joined:", participant);
    if (activeMeetingSession) {
      dispatch(fetchActiveParticipants(activeMeetingSession.id));
    }
  }, [activeMeetingSession, dispatch]);

  const handleParticipantLeft = useCallback((participant) => {
    console.log("Participant left:", participant);
    if (activeMeetingSession) {
      dispatch(fetchActiveParticipants(activeMeetingSession.id));
    }
  }, [activeMeetingSession, dispatch]);

  // Socket.io listeners for real-time updates
  useEffect(() => {
    const handleMeetingStarted = (data) => {
      console.log("Meeting started:", data);
      fetchMeetings();
    };

    const handleMeetingEnded = (data) => {
      console.log("Meeting ended:", data);
      fetchMeetings();
      if (activeMeetingSession?.id === data.meetingId) {
        handleCloseJitsiDialog();
      }
    };

    const handleUserJoined = (data) => {
      console.log("User joined meeting:", data);
      if (activeMeetingSession?.id === data.meetingId) {
        dispatch(fetchActiveParticipants(data.meetingId));
      }
    };

    const handleUserLeft = (data) => {
      console.log("User left meeting:", data);
      if (activeMeetingSession?.id === data.meetingId) {
        dispatch(fetchActiveParticipants(data.meetingId));
      }
    };

    socketService.on("meeting:started", handleMeetingStarted);
    socketService.on("meeting:ended", handleMeetingEnded);
    socketService.on("meeting:user-joined", handleUserJoined);
    socketService.on("meeting:user-left", handleUserLeft);

    return () => {
      socketService.off("meeting:started", handleMeetingStarted);
      socketService.off("meeting:ended", handleMeetingEnded);
      socketService.off("meeting:user-joined", handleUserJoined);
      socketService.off("meeting:user-left", handleUserLeft);
    };
  }, [activeMeetingSession, dispatch, handleCloseJitsiDialog, fetchMeetings]);

  if (!user?.department_id) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          You are not assigned to any department. Please contact administrator.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Department Meetings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            📌 Manage meetings for your department only
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog("add")}
          sx={{
            background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
            color: "#000",
            "&:hover": {
              background: "linear-gradient(135deg, #ffed4e 0%, #ffd700 100%)",
            },
          }}
        >
          Create Meeting
        </Button>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        You can only create and manage meetings for your department. Admin can
        invite your department to company-wide meetings.
      </Alert>

      {/* Search */}
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search meetings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      {/* Meetings Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Meeting</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Link</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : meetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ py: 3 }}>
                      <CalendarIcon
                        sx={{ fontSize: 60, color: "#ccc", mb: 2 }}
                      />
                      <Typography color="text.secondary">
                        No meetings found for your department
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                meetings.map((meeting) => (
                  <TableRow key={meeting.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon color="primary" />
                        <Box>
                          <Typography fontWeight={600}>
                            {meeting.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {meeting.description?.substring(0, 50)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{meeting.location || "N/A"}</TableCell>
                    <TableCell>
                      {meeting.start_time
                        ? format(
                            new Date(meeting.start_time),
                            "MMM dd, yyyy HH:mm"
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {meeting.end_time
                        ? format(
                            new Date(meeting.end_time),
                            "MMM dd, yyyy HH:mm"
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {meeting.meeting_link ? (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            window.open(meeting.meeting_link, "_blank")
                          }
                        >
                          <VideoCallIcon />
                        </IconButton>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {/* Jitsi Meeting Button */}
                      {meeting.jitsi_room_name ? (
                        <Tooltip title="Join Jitsi Video Meeting" arrow>
                          <Badge
                            badgeContent="LIVE"
                            color="error"
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.5rem',
                                height: '14px',
                                minWidth: '14px',
                                padding: '0 4px'
                              }
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleJoinMeeting(meeting)}
                              sx={{ 
                                color: "#9c27b0",
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                  '0%, 100%': { opacity: 1 },
                                  '50%': { opacity: 0.6 }
                                }
                              }}
                            >
                              <VideoCallIcon />
                            </IconButton>
                          </Badge>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Start Jitsi Video Conference" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleStartMeeting(meeting)}
                            sx={{ 
                              color: "#9c27b0",
                              '&:hover': {
                                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <VideoCallIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog("edit", meeting)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "add" ? "Create Meeting" : "Edit Meeting"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Time"
                name="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Time"
                name="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Meeting Link"
                name="meeting_link"
                value={formData.meeting_link}
                onChange={handleInputChange}
                placeholder="https://meet.google.com/..."
                helperText="Optional: External meeting link"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VideoCallIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" icon={<VideoCallIcon />}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Department Meeting • Jitsi Video Conferencing Available
                </Typography>
                <Typography variant="body2">
                  This meeting will be created for your department. Click the purple video button to start Jitsi conference anytime!
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === "add" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Meeting</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this meeting?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Jitsi Meeting Dialog */}
      {activeMeetingSession && (
        <JitsiMeeting
          open={openJitsiDialog}
          onClose={handleCloseJitsiDialog}
          roomName={activeMeetingSession.jitsi_room_name}
          meetingTitle={activeMeetingSession.title}
          meetingId={activeMeetingSession.id}
          jitsiDomain={
            activeMeetingSession.jitsi_url?.split("/")[2] || "meet.jit.si"
          }
          onParticipantJoined={handleParticipantJoined}
          onParticipantLeft={handleParticipantLeft}
          onVideoConferenceJoined={() => {
            console.log("User joined conference");
          }}
          onVideoConferenceLeft={() => {
            console.log("User left conference");
            handleCloseJitsiDialog();
          }}
          onReadyToClose={() => {
            handleCloseJitsiDialog();
          }}
        />
      )}
    </Box>
  );
};

export default ManagerMeetings;
