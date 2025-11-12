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
  FormControlLabel,
  Switch,
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
  People as PeopleIcon,
  Event as EventIcon,
  Public as PublicIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import {
  fetchEvents,
  fetchEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchEventAttendees,
  addEventAttendee,
  removeEventAttendee,
  clearCurrentEvent,
} from "../../store/slices/eventSlice";
import axiosInstance from "../../utils/axios";

const Events = () => {
  const dispatch = useDispatch();
  const { events, pagination, loading, error, attendees } = useSelector(
    (state) => state.events
  );
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAttendeesDialog, setOpenAttendeesDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
    max_attendees: "",
    is_public: true,
  });

  useEffect(() => {
    dispatch(fetchEvents({ page: page + 1, limit: rowsPerPage }));
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
      fetchEvents({
        search: searchTerm,
        page: 1,
        limit: rowsPerPage,
      })
    );
    setPage(0);
  };

  const handleOpenDialog = (mode, event = null) => {
    setDialogMode(mode);
    if (mode === "edit" && event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        location: event.location || "",
        start_time: event.start_time
          ? format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm")
          : "",
        end_time: event.end_time
          ? format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm")
          : "",
        max_attendees: event.max_attendees || "",
        is_public: event.is_public === 1 || event.is_public === true,
      });
      setSelectedEvent(event);
    } else {
      setFormData({
        title: "",
        description: "",
        location: "",
        start_time: "",
        end_time: "",
        max_attendees: "",
        is_public: true,
      });
      setSelectedEvent(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: "",
      description: "",
      location: "",
      start_time: "",
      end_time: "",
      max_attendees: "",
      is_public: true,
    });
    setSelectedEvent(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const eventData = {
      ...formData,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: formData.end_time
        ? new Date(formData.end_time).toISOString()
        : null,
      max_attendees: formData.max_attendees
        ? parseInt(formData.max_attendees)
        : null,
    };

    if (dialogMode === "add") {
      await dispatch(createEvent(eventData));
    } else {
      await dispatch(updateEvent({ id: selectedEvent.id, data: eventData }));
    }

    handleCloseDialog();
    dispatch(fetchEvents({ page: page + 1, limit: rowsPerPage }));
  };

  const handleView = async (event) => {
    setSelectedEvent(event);
    await dispatch(fetchEventById(event.id));
    await dispatch(fetchEventAttendees(event.id));
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedEvent(null);
    dispatch(clearCurrentEvent());
  };

  const handleOpenDeleteDialog = (event) => {
    setSelectedEvent(event);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedEvent(null);
  };

  const handleDelete = async () => {
    await dispatch(deleteEvent(selectedEvent.id));
    handleCloseDeleteDialog();
    dispatch(fetchEvents({ page: page + 1, limit: rowsPerPage }));
  };

  const handleOpenAttendeesDialog = async (event) => {
    setSelectedEvent(event);
    await dispatch(fetchEventAttendees(event.id));
    setOpenAttendeesDialog(true);
  };

  const handleCloseAttendeesDialog = () => {
    setOpenAttendeesDialog(false);
    setSelectedEvent(null);
    setSelectedUsers([]);
  };

  const handleAddAttendee = async (user, status = "going") => {
    await dispatch(
      addEventAttendee({
        eventId: selectedEvent.id,
        userId: user.id,
        status,
      })
    );
    await dispatch(fetchEventAttendees(selectedEvent.id));
  };

  const handleRemoveAttendee = async (userId) => {
    await dispatch(
      removeEventAttendee({ eventId: selectedEvent.id, userId: userId })
    );
    await dispatch(fetchEventAttendees(selectedEvent.id));
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return "-";
    try {
      return format(new Date(datetime), "dd/MM/yyyy HH:mm");
    } catch {
      return datetime;
    }
  };

  const getStatusChip = (event) => {
    if (event.is_deleted) {
      return <Chip label="Deleted" color="error" size="small" />;
    }

    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);

    // If event hasn't started yet
    if (now < startTime) {
      return <Chip label="Scheduled" color="info" size="small" />;
    }

    // If event is currently ongoing
    if (now >= startTime && now <= endTime) {
      return <Chip label="In Progress" color="warning" size="small" />;
    }

    // If event has ended
    return <Chip label="Completed" color="success" size="small" />;
  };

  const getAttendeeStatusChip = (status) => {
    const colors = {
      going: "success",
      maybe: "warning",
      not_going: "error",
    };
    const labels = {
      going: "Going",
      maybe: "Maybe",
      not_going: "Not Going",
    };
    return (
      <Chip
        label={labels[status] || status}
        color={colors[status] || "default"}
        size="small"
      />
    );
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
          <EventIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Events Management
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Manage company events and attendees
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
                placeholder="Search events..."
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
                Add Event
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Events Table */}
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
                    Location
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Start Time
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    End Time
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Visibility
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
                ) : events?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No events found
                    </TableCell>
                  </TableRow>
                ) : (
                  events?.map((event) => (
                    <TableRow
                      key={event.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#e3f2fd",
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {event.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{event.location || "-"}</TableCell>
                      <TableCell>{formatDateTime(event.start_time)}</TableCell>
                      <TableCell>{formatDateTime(event.end_time)}</TableCell>
                      <TableCell>
                        {event.is_public ? (
                          <Chip
                            label="Public"
                            icon={<PublicIcon />}
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="Private"
                            icon={<LockIcon />}
                            color="warning"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${event.accepted_count || 0}${
                            event.max_attendees ? `/${event.max_attendees}` : ""
                          }`}
                          color="primary"
                          size="small"
                          icon={<PeopleIcon />}
                        />
                      </TableCell>
                      <TableCell>{getStatusChip(event)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleView(event)}
                            sx={{ color: "#1976d2" }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenAttendeesDialog(event)}
                            sx={{ color: "#2196f3" }}
                          >
                            <PeopleIcon fontSize="small" />
                          </IconButton>
                          {!event.is_deleted && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog("edit", event)}
                                sx={{ color: "#4caf50" }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDeleteDialog(event)}
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

      {/* Add/Edit Event Dialog */}
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
          {dialogMode === "add" ? "Add Event" : "Edit Event"}
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Attendees"
                name="max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={handleInputChange}
                placeholder="Leave empty for unlimited"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_public}
                    onChange={handleInputChange}
                    name="is_public"
                    color="primary"
                  />
                }
                label="Public Event"
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

      {/* View Event Dialog */}
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
          Event Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedEvent && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600}>
                  {selectedEvent.title}
                </Typography>
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  {getStatusChip(selectedEvent)}
                  {selectedEvent.is_public ? (
                    <Chip
                      label="Public"
                      icon={<PublicIcon />}
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip
                      label="Private"
                      icon={<LockIcon />}
                      color="warning"
                      size="small"
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  {selectedEvent.description || "No description"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Start Time
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(selectedEvent.start_time)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  End Time
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(selectedEvent.end_time)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body2">
                  {selectedEvent.location || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Max Attendees
                </Typography>
                <Typography variant="body2">
                  {selectedEvent.max_attendees || "Unlimited"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Attendees ({attendees?.length || 0})
                </Typography>
                <List dense>
                  {attendees?.map((attendee) => (
                    <ListItem key={`view-${attendee.user_id || attendee.id}`}>
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
              options={allUsers.filter(
                (u) => !attendees?.find((a) => a.id === u.id)
              )}
              getOptionLabel={(option) => option.full_name || option.username}
              getOptionKey={(option) => option.id}
              onChange={(e, user) => {
                if (user) {
                  handleAddAttendee(user);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add Attendee"
                  placeholder="Select user"
                />
              )}
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Current Attendees ({attendees?.length || 0})
          </Typography>
          <List dense>
            {attendees?.map((attendee) => (
              <ListItem key={`manage-${attendee.user_id || attendee.id}`}>
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
            Are you sure you want to delete this event? This action cannot be
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

export default Events;
