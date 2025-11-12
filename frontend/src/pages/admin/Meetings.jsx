import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  Divider,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  AttachFile as AttachFileIcon,
  VideoCall as VideoCallIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import {
  fetchMeetings,
  fetchMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  cancelMeeting,
  fetchAttendees,
  addAttendees,
  removeAttendee,
  fetchAttachments,
  clearCurrentMeeting,
} from "../../store/slices/meetingSlice";
import { fetchDepartments } from "../../store/slices/departmentSlice";
import axiosInstance from "../../utils/axios";

const Meetings = () => {
  const dispatch = useDispatch();
  const { meetings, pagination, loading, error, attendees, attachments } =
    useSelector((state) => state.meetings);
  const { user } = useSelector((state) => state.auth);
  const { departments } = useSelector((state) => state.departments);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAttendeesDialog, setOpenAttendeesDialog] = useState(false);
  const [openAttachmentsDialog, setOpenAttachmentsDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department_id: "",
    department_ids: [],
    start_time: "",
    end_time: "",
    location: "",
    meeting_link: "",
    attendees: [],
  });

  useEffect(() => {
    dispatch(fetchMeetings({ page: page + 1, limit: rowsPerPage }));
    dispatch(fetchDepartments());
    fetchAllUsers();
  }, [dispatch, page, rowsPerPage]);

  const fetchAllUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setAllUsers(response.data.data?.users || response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    dispatch(
      fetchMeetings({
        search: searchTerm,
        page: 1,
        limit: rowsPerPage,
      })
    );
    setPage(0);
  };

  const handleOpenDialog = async (mode, meeting = null) => {
    setDialogMode(mode);
    if (mode === "edit" && meeting) {
      // Fetch full meeting details to get department_ids array
      await dispatch(fetchMeetingById(meeting.id));
      const fullMeeting = await dispatch(fetchMeetingById(meeting.id)).unwrap();

      // Get department_ids from backend response (array) or fallback to single department_id
      const deptIds =
        fullMeeting.department_ids && fullMeeting.department_ids.length > 0
          ? fullMeeting.department_ids
          : fullMeeting.department_id
          ? [fullMeeting.department_id]
          : [];

      setFormData({
        title: fullMeeting.title || "",
        description: fullMeeting.description || "",
        department_id: fullMeeting.department_id || "",
        department_ids: deptIds,
        start_time: fullMeeting.start_time
          ? format(new Date(fullMeeting.start_time), "yyyy-MM-dd'T'HH:mm")
          : "",
        end_time: fullMeeting.end_time
          ? format(new Date(fullMeeting.end_time), "yyyy-MM-dd'T'HH:mm")
          : "",
        location: fullMeeting.location || "",
        meeting_link: fullMeeting.meeting_link || "",
        attendees: [],
      });
      setSelectedMeeting(fullMeeting);
    } else {
      setFormData({
        title: "",
        description: "",
        department_id: "",
        department_ids: [], // Admin can select multiple departments
        start_time: "",
        end_time: "",
        location: "",
        meeting_link: "",
        attendees: [],
      });
      setSelectedMeeting(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: "",
      description: "",
      department_id: "",
      department_ids: [], // Admin can select multiple departments
      start_time: "",
      end_time: "",
      location: "",
      meeting_link: "",
      attendees: [],
    });
    setSelectedMeeting(null);
    setSelectedUsers([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const meetingData = {
      ...formData,
      department_ids:
        formData.department_ids.length > 0
          ? formData.department_ids
          : formData.department_id
          ? [formData.department_id]
          : [],
      start_time: new Date(formData.start_time).toISOString(),
      end_time: formData.end_time
        ? new Date(formData.end_time).toISOString()
        : null,
      attendees: selectedUsers.map((u) => u.id),
    };

    if (dialogMode === "add") {
      await dispatch(createMeeting(meetingData));
    } else {
      await dispatch(
        updateMeeting({ id: selectedMeeting.id, data: meetingData })
      );
    }

    handleCloseDialog();
    dispatch(fetchMeetings({ page: page + 1, limit: rowsPerPage }));
  };

  const handleView = async (meeting) => {
    setSelectedMeeting(meeting);
    await dispatch(fetchMeetingById(meeting.id));
    await dispatch(fetchAttendees(meeting.id));
    await dispatch(fetchAttachments(meeting.id));
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedMeeting(null);
    dispatch(clearCurrentMeeting());
  };

  const handleOpenDeleteDialog = (meeting) => {
    setSelectedMeeting(meeting);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedMeeting(null);
  };

  const handleDelete = async () => {
    await dispatch(deleteMeeting(selectedMeeting.id));
    handleCloseDeleteDialog();
    dispatch(fetchMeetings({ page: page + 1, limit: rowsPerPage }));
  };

  const handleCancelMeeting = async (meetingId) => {
    await dispatch(cancelMeeting(meetingId));
    dispatch(fetchMeetings({ page: page + 1, limit: rowsPerPage }));
  };

  const handleOpenAttendeesDialog = async (meeting) => {
    setSelectedMeeting(meeting);
    await dispatch(fetchAttendees(meeting.id));
    setOpenAttendeesDialog(true);
  };

  const handleCloseAttendeesDialog = () => {
    setOpenAttendeesDialog(false);
    setSelectedMeeting(null);
    setSelectedUsers([]);
  };

  const handleAddAttendees = async () => {
    if (selectedUsers.length === 0) return;

    await dispatch(
      addAttendees({
        meetingId: selectedMeeting.id,
        userIds: selectedUsers.map((u) => u.id),
      })
    );

    await dispatch(fetchAttendees(selectedMeeting.id));
    setSelectedUsers([]);
  };

  const handleRemoveAttendee = async (userId) => {
    await dispatch(removeAttendee({ meetingId: selectedMeeting.id, userId }));
    await dispatch(fetchAttendees(selectedMeeting.id));
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return "-";
    try {
      return format(new Date(datetime), "dd/MM/yyyy HH:mm");
    } catch {
      return datetime;
    }
  };

  const getStatusChip = (meeting) => {
    // Check if cancelled by status field or is_cancelled flag
    if (meeting.status === "cancelled" || meeting.is_cancelled) {
      return <Chip label="Cancelled" color="error" size="small" />;
    }

    const now = new Date();
    const startTime = new Date(meeting.start_time);
    const endTime = new Date(meeting.end_time);

    // If meeting hasn't started yet
    if (now < startTime) {
      return <Chip label="Scheduled" color="info" size="small" />;
    }

    // If meeting is currently ongoing
    if (now >= startTime && now <= endTime) {
      return <Chip label="In Progress" color="warning" size="small" />;
    }

    // If meeting has ended
    return <Chip label="Completed" color="success" size="small" />;
  };

  const getAttendeeStatusChip = (status) => {
    const colors = {
      invited: "default",
      accepted: "success",
      declined: "error",
      tentative: "warning",
    };
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={colors[status] || "default"}
        size="small"
      />
    );
  };

  const getAcceptedCount = (meeting) => {
    // If we have loaded attendees for this meeting, count accepted
    if (selectedMeeting?.id === meeting.id && attendees?.length > 0) {
      return attendees.filter((a) => a.status === "accepted").length;
    }
    // Otherwise return the count from backend (which should be accepted count)
    return meeting.accepted_count || 0;
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          <CalendarIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Meetings Management
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Manage company meetings, attendees, and schedules
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || "An error occurred"}
        </Alert>
      )}

      {/* Actions Card */}
      <Card
        sx={{
          mb: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "#1976d2" }} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#1976d2",
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog("add")}
                sx={{
                  background:
                    "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                  color: "#000",
                  fontWeight: 600,
                  boxShadow: "0 4px 15px rgba(255,215,0,0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #ffed4e 0%, #ffd700 100%)",
                    boxShadow: "0 6px 20px rgba(255,215,0,0.4)",
                  },
                }}
              >
                Add Meeting
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Meetings Table */}
      <Card
        sx={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          borderRadius: 2,
        }}
      >
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                  }}
                >
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Title
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Department
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Start Time
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    End Time
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Organizer
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Attendees
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : meetings?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No meetings found
                    </TableCell>
                  </TableRow>
                ) : (
                  meetings?.map((meeting) => (
                    <TableRow
                      key={meeting.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#e3f2fd",
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {meeting.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{meeting.department_name || "-"}</TableCell>
                      <TableCell>
                        {formatDateTime(meeting.start_time)}
                      </TableCell>
                      <TableCell>{formatDateTime(meeting.end_time)}</TableCell>
                      <TableCell>{meeting.creator_name || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={meeting.accepted_count || 0}
                          color="primary"
                          size="small"
                          icon={<PeopleIcon />}
                        />
                      </TableCell>
                      <TableCell>{getStatusChip(meeting)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleView(meeting)}
                            sx={{ color: "#1976d2" }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenAttendeesDialog(meeting)}
                            sx={{ color: "#2196f3" }}
                          >
                            <PeopleIcon fontSize="small" />
                          </IconButton>
                          {!meeting.is_cancelled && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleOpenDialog("edit", meeting)
                                }
                                sx={{ color: "#4caf50" }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleCancelMeeting(meeting.id)}
                                sx={{ color: "#ff9800" }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDeleteDialog(meeting)}
                                sx={{ color: "#f44336" }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={pagination.total || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Meeting Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          {dialogMode === "add" ? "Add Meeting" : "Edit Meeting"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
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
            <Grid item xs={12}>
              <Autocomplete
                multiple={true}
                disabled={false}
                options={departments || []}
                getOptionLabel={(option) => option.name || ""}
                getOptionKey={(option) => option.id}
                value={
                  formData.department_ids
                    ? departments?.filter((d) =>
                        formData.department_ids.includes(d.id)
                      ) || []
                    : []
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    department_ids: Array.isArray(newValue)
                      ? newValue.map((v) => v.id)
                      : [newValue?.id].filter(Boolean),
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Departments"
                    placeholder="Select departments"
                    helperText="Select one or more departments for this meeting"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option.name}
                        {...tagProps}
                        size="small"
                      />
                    );
                  })
                }
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
                required
                InputLabelProps={{
                  shrink: true,
                }}
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
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meeting Link"
                name="meeting_link"
                value={formData.meeting_link}
                onChange={handleInputChange}
                placeholder="https://meet.google.com/..."
                InputProps={{
                  startAdornment: (
                    <VideoCallIcon sx={{ mr: 1, color: "#1976d2" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={allUsers}
                getOptionLabel={(option) => option.full_name || option.username}
                value={selectedUsers}
                onChange={(e, newValue) => setSelectedUsers(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Add Attendees"
                    placeholder="Select users"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option.full_name || option.username}
                        {...tagProps}
                        size="small"
                      />
                    );
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ color: "#757575" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
              color: "#000",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(135deg, #ffed4e 0%, #ffd700 100%)",
              },
            }}
          >
            {dialogMode === "add" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Meeting Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          Meeting Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedMeeting && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600}>
                  {selectedMeeting.title}
                </Typography>
                <Box sx={{ mt: 1 }}>{getStatusChip(selectedMeeting)}</Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  {selectedMeeting.description || "No description"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Start Time
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(selectedMeeting.start_time)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  End Time
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(selectedMeeting.end_time)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body2">
                  {selectedMeeting.location || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="body2">
                  {selectedMeeting.department_name || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Organizer
                </Typography>
                <Typography variant="body2">
                  {selectedMeeting.creator_name || "-"}
                </Typography>
              </Grid>
              {selectedMeeting.meeting_link && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Meeting Link
                  </Typography>
                  <Typography variant="body2">
                    <a
                      href={selectedMeeting.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1976d2" }}
                    >
                      {selectedMeeting.meeting_link}
                    </a>
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Attendees ({attendees?.length || 0})
                </Typography>
                <List dense>
                  {attendees?.map((attendee, index) => (
                    <ListItem
                      key={`view-attendee-${
                        attendee.user_id || attendee.id || index
                      }`}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={attendee.avatar_url}
                          alt={attendee.full_name}
                        >
                          {attendee.full_name?.charAt(0) ||
                            attendee.username?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={attendee.full_name || attendee.username}
                        secondary={attendee.email}
                      />
                      <ListItemSecondaryAction>
                        {getAttendeeStatusChip(attendee.status)}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Attachments ({attachments?.length || 0})
                </Typography>
                <List dense>
                  {attachments?.map((attachment) => (
                    <ListItem key={attachment.id}>
                      <ListItemAvatar>
                        <AttachFileIcon />
                      </ListItemAvatar>
                      <ListItemText
                        primary={attachment.original_name}
                        secondary={attachment.description || "No description"}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Attendees Dialog */}
      <Dialog
        open={openAttendeesDialog}
        onClose={handleCloseAttendeesDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          Manage Attendees
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Autocomplete
              multiple
              options={allUsers}
              getOptionLabel={(option) => option.full_name || option.username}
              getOptionKey={(option) => option.id}
              value={selectedUsers}
              onChange={(e, newValue) => setSelectedUsers(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add Attendees"
                  placeholder="Select users"
                />
              )}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleAddAttendees}
              sx={{ mt: 2 }}
              disabled={selectedUsers.length === 0}
            >
              Add Selected
            </Button>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Current Attendees ({attendees?.length || 0})
          </Typography>
          <List dense>
            {attendees?.map((attendee, index) => (
              <ListItem
                key={`manage-attendee-${
                  attendee.user_id || attendee.id || index
                }`}
              >
                <ListItemAvatar>
                  <Avatar src={attendee.avatar_url} alt={attendee.full_name}>
                    {attendee.full_name?.charAt(0) ||
                      attendee.username?.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={attendee.full_name || attendee.username}
                  secondary={attendee.email}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    {getAttendeeStatusChip(attendee.status)}
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() =>
                        handleRemoveAttendee(attendee.user_id || attendee.id)
                      }
                      sx={{ color: "#f44336" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAttendeesDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this meeting? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Meetings;
