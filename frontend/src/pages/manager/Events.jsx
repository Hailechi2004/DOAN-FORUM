import { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useSnackbar } from "notistack";
import axiosInstance from "../../utils/axios";

const ManagerEvents = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useSelector((state) => state.auth);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
    max_attendees: "",
    is_public: false,
    department_id: null,
  });

  useEffect(() => {
    if (user?.department_id) {
      fetchEvents();
    }
  }, [page, rowsPerPage, searchTerm, user?.department_id]);

  const fetchEvents = async () => {
    if (!user?.department_id) return;

    try {
      setLoading(true);
      // Manager chỉ thấy events của department mình hoặc được mời
      const response = await axiosInstance.get("/events", {
        params: {
          department_id: user.department_id,
          search: searchTerm,
          page: page + 1,
          limit: rowsPerPage,
        },
      });

      const data = response.data.data || response.data;
      setEvents(data.events || data || []);
      setTotalCount(data.total || data.length || 0);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      enqueueSnackbar("Failed to load events", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, event = null) => {
    setDialogMode(mode);
    if (mode === "edit" && event) {
      setSelectedEvent(event);
      setFormData({
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        start_time: event.start_time
          ? format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm")
          : "",
        end_time: event.end_time
          ? format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm")
          : "",
        max_attendees: event.max_attendees || "",
        is_public: false, // Manager không tạo event public
        department_id: user.department_id,
      });
    } else {
      setSelectedEvent(null);
      setFormData({
        title: "",
        description: "",
        location: "",
        start_time: "",
        end_time: "",
        max_attendees: "",
        is_public: false,
        department_id: user.department_id,
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
      start_time: "",
      end_time: "",
      max_attendees: "",
      is_public: false,
      department_id: null,
    });
    setSelectedEvent(null);
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
        department_id: user.department_id, // Lock to manager's department
      };

      if (dialogMode === "edit") {
        await axiosInstance.put(`/events/${selectedEvent.id}`, payload);
        enqueueSnackbar("Event updated successfully", { variant: "success" });
      } else {
        await axiosInstance.post("/events", payload);
        enqueueSnackbar("Event created successfully", { variant: "success" });
      }

      handleCloseDialog();
      fetchEvents();
    } catch (error) {
      console.error("Failed to save event:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to save event", {
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/events/${selectedEvent.id}`);
      enqueueSnackbar("Event deleted successfully", { variant: "success" });
      setOpenDeleteDialog(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
      enqueueSnackbar("Failed to delete event", { variant: "error" });
    }
  };

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
            Department Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            📌 Manage events for your department only
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog("add")}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
            },
          }}
        >
          Create Event
        </Button>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        You can only create and manage events for your department. Events are
        not visible company-wide.
      </Alert>

      {/* Search */}
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search events..."
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

      {/* Events Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Attendees</TableCell>
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
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ py: 3 }}>
                      <EventIcon sx={{ fontSize: 60, color: "#ccc", mb: 2 }} />
                      <Typography color="text.secondary">
                        No events found for your department
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EventIcon color="primary" />
                        <Box>
                          <Typography fontWeight={600}>
                            {event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.description?.substring(0, 50)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{event.location || "N/A"}</TableCell>
                    <TableCell>
                      {event.start_time
                        ? format(
                            new Date(event.start_time),
                            "MMM dd, yyyy HH:mm"
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {event.end_time
                        ? format(new Date(event.end_time), "MMM dd, yyyy HH:mm")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${event.attendee_count || 0}/${
                          event.max_attendees || "∞"
                        }`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog("edit", event)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedEvent(event);
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
          {dialogMode === "add" ? "Create Event" : "Edit Event"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Title"
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
                label="Max Attendees"
                name="max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                This event will be created for your department only
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
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this event?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerEvents;
