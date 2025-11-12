import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Search,
  Edit,
  Delete,
  Add,
  Visibility,
  Business,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { departmentService } from "../../services/api";

const AdminDepartments = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [viewDept, setViewDept] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    parent_id: null,
  });

  useEffect(() => {
    fetchDepartments();
  }, [searchQuery]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getAll({
        search: searchQuery,
      });
      const data = response.data || response;
      setDepartments(data.departments || data || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (dept = null) => {
    if (dept) {
      setSelectedDept(dept);
      setFormData({
        name: dept.name || "",
        code: dept.code || "",
        description: dept.description || "",
        parent_id: dept.parent_id || null,
      });
    } else {
      setSelectedDept(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        parent_id: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDept(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedDept) {
        await departmentService.update(selectedDept.id, formData);
        enqueueSnackbar("Department updated successfully!", {
          variant: "success",
        });
      } else {
        await departmentService.create(formData);
        enqueueSnackbar("Department created successfully!", {
          variant: "success",
        });
      }
      handleCloseDialog();
      fetchDepartments();
    } catch (error) {
      console.error("Failed to save department:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to save department",
        { variant: "error" }
      );
    }
  };

  const handleViewDept = async (dept) => {
    try {
      const response = await departmentService.getById(dept.id);
      const data = response.data || response;
      setViewDept(data.department || data);
      setOpenViewDialog(true);
    } catch (error) {
      console.error("Failed to fetch department details:", error);
    }
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewDept(null);
  };

  const handleOpenDeleteDialog = (dept) => {
    setSelectedDept(dept);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedDept(null);
  };

  const handleDelete = async () => {
    try {
      await departmentService.delete(selectedDept.id);
      enqueueSnackbar("Department deleted successfully!", {
        variant: "success",
      });
      handleCloseDeleteDialog();
      fetchDepartments();
    } catch (error) {
      console.error("Failed to delete department:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to delete department",
        { variant: "error" }
      );
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedDepartments = filteredDepartments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          background:
            "linear-gradient(135deg, #e3f2fd 0%, #fff9c4 50%, #ffffff 100%)",
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.1)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "200px",
            height: "200px",
            background:
              "radial-gradient(circle, rgba(255,235,59,0.3) 0%, transparent 70%)",
            borderRadius: "50%",
            transform: "translate(30%, -30%)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "150px",
            height: "150px",
            background:
              "radial-gradient(circle, rgba(33,150,243,0.2) 0%, transparent 70%)",
            borderRadius: "50%",
            transform: "translate(-30%, 30%)",
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ color: "#1565c0" }}
          >
            Departments Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage company departments and organizational structure
          </Typography>
        </Box>
      </Box>

      {/* Search and Add */}
      <Card sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <TextField
            placeholder="Search departments..."
            variant="outlined"
            size="medium"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ width: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
              },
            }}
          >
            Add Department
          </Button>
        </Box>
      </Card>

      {/* Departments Table */}
      <Card sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>Department</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Members</TableCell>
                <TableCell>Teams</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No departments found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDepartments.map((dept) => (
                  <TableRow
                    key={dept.id}
                    sx={{
                      "&:hover": { backgroundColor: "#f9f9f9" },
                      transition: "all 0.3s",
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Business sx={{ color: "#ffc107" }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {dept.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dept.code}
                        size="small"
                        sx={{ bgcolor: "#ffc107", color: "white" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {dept.description || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dept.member_count || 0}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dept.team_count || 0}
                        size="small"
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewDept(dept)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(dept)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(dept)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredDepartments.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            background:
              "linear-gradient(135deg, #e3f2fd 0%, #fff9c4 50%, #ffffff 100%)",
            fontWeight: 700,
          }}
        >
          {selectedDept ? "Edit Department" : "Add New Department"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department Code *"
                name="code"
                value={formData.code}
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
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {selectedDept ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            background:
              "linear-gradient(135deg, #e3f2fd 0%, #fff9c4 50%, #ffffff 100%)",
            fontWeight: 700,
          }}
        >
          Department Details
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          {viewDept ? (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Department Name
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDept.name}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Department Code
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDept.code}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDept.description || "-"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Total Members
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDept.member_count || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Total Teams
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDept.team_count || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Created Date
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDept.created_at
                    ? new Date(viewDept.created_at).toLocaleDateString()
                    : "-"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDept.updated_at
                    ? new Date(viewDept.updated_at).toLocaleDateString()
                    : "-"}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseViewDialog} color="inherit">
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleCloseViewDialog();
              handleOpenDialog(viewDept);
            }}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete department{" "}
            <strong>{selectedDept?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDepartments;
