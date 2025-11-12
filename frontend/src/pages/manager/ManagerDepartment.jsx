import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import axios from "../../utils/axios";

const ManagerDepartment = () => {
  const { user } = useSelector((state) => state.auth);
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);

      // Fetch department info
      const deptResponse = await axios.get(
        `/departments/${user.department_id}`
      );
      setDepartment(deptResponse.data.data || deptResponse.data);

      // Fetch employees in department
      const empResponse = await axios.get(
        `/departments/${user.department_id}/members`
      );
      setEmployees(empResponse.data.data || empResponse.data || []);

      // Fetch department stats
      const statsResponse = await axios.get(
        `/departments/${user.department_id}/stats`
      );
      setStats(statsResponse.data.data || statsResponse.data || stats);
    } catch (error) {
      console.error("Error fetching department data:", error);
      setError("Failed to load department information");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: "100%", borderLeft: `4px solid ${color}` }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={60} height={40} />
            ) : (
              <Typography variant="h4" fontWeight="bold" color={color}>
                {value}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{ bgcolor: `${color}20`, color: color, width: 56, height: 56 }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🏢 My Department
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your department information and team members
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Department Info */}
      {loading ? (
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
      ) : department ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main" }}>
              <BusinessIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {department.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Code: {department.code}
              </Typography>
              <Chip
                label={department.is_active ? "Active" : "Inactive"}
                color={department.is_active ? "success" : "default"}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" color="text.secondary">
            {department.description || "No description available"}
          </Typography>
        </Paper>
      ) : null}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Employees"
            value={employees.length}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={<WorkIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Completed Tasks"
            value={stats.completedTasks}
            icon={<StarIcon />}
            color="#4caf50"
          />
        </Grid>
      </Grid>

      {/* Employees Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Department Members
        </Typography>
        {loading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">
                        No employees found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={emp.avatar_url}
                            alt={emp.full_name}
                            sx={{ width: 40, height: 40 }}
                          >
                            {emp.full_name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {emp.full_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              @{emp.username}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {emp.position || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">{emp.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {emp.phone || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={emp.status || "active"}
                          color={
                            emp.status === "active" ? "success" : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default ManagerDepartment;
