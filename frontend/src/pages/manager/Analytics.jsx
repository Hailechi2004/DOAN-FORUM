import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  People as PeopleIcon,
  Article as ArticleIcon,
  Folder as FolderIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axiosInstance from "../../utils/axios";

const COLORS = {
  primary: "#1976d2",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
};

const ManagerAnalytics = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState(null);
  const [activityTrend, setActivityTrend] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.department_id) {
      fetchAnalytics();
    }
  }, [user?.department_id]);

  const fetchAnalytics = async () => {
    if (!user?.department_id) return;

    try {
      setLoading(true);

      // Fetch department-scoped analytics
      const [dashboardRes, activityRes, topUsersRes] = await Promise.all([
        axiosInstance.get("/analytics/dashboard", {
          params: { department_id: user.department_id },
        }),
        axiosInstance.get("/analytics/activity-trend", {
          params: { department_id: user.department_id, days: 30 },
        }),
        axiosInstance.get("/analytics/top-users", {
          params: { department_id: user.department_id, limit: 10 },
        }),
      ]);

      setDashboard(dashboardRes.data.data || dashboardRes.data);

      // Ensure activityTrend is always an array
      const activityData = activityRes.data.data || activityRes.data || [];
      setActivityTrend(Array.isArray(activityData) ? activityData : []);

      // Ensure topUsers is always an array
      const usersData = topUsersRes.data.data || topUsersRes.data || [];
      setTopUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, loading }) => (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
        border: `2px solid ${color}30`,
      }}
    >
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
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (!user?.department_id) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          You are not assigned to any department. Please contact administrator.
        </Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Department Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          📊 Statistics and insights for your department
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Department Members"
            value={dashboard?.totalUsers || 0}
            icon={<PeopleIcon />}
            color={COLORS.primary}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Department Posts"
            value={dashboard?.totalPosts || 0}
            icon={<ArticleIcon />}
            color={COLORS.success}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assigned Projects"
            value={dashboard?.totalProjects || 0}
            icon={<FolderIcon />}
            color={COLORS.warning}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Department Tasks"
            value={dashboard?.totalTasks || 0}
            icon={<AssignmentIcon />}
            color={COLORS.error}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Activity Trend Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Department Activity Trend (Last 30 Days)
          </Typography>
        </Box>
        {loading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : activityTrend.length === 0 ? (
          <Box
            height={300}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography color="text.secondary">
              No activity data available for the last 30 days
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="posts"
                stroke={COLORS.success}
                strokeWidth={2}
                name="Posts"
              />
              <Line
                type="monotone"
                dataKey="comments"
                stroke={COLORS.primary}
                strokeWidth={2}
                name="Comments"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Top Contributors */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <TrophyIcon sx={{ color: "#ffd700" }} />
          <Typography variant="h6" fontWeight="bold">
            Top Contributors in Department
          </Typography>
        </Box>
        {loading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell align="center">Posts</TableCell>
                  <TableCell align="center">Comments</TableCell>
                  <TableCell align="center">Total Activity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">
                        No activity data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  topUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          color={
                            index === 0
                              ? "warning"
                              : index === 1
                              ? "default"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar src={user.avatar_url} alt={user.full_name}>
                            {user.full_name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {user.full_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              @{user.username}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={user.post_count || 0}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={user.comment_count || 0}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600}>
                          {(user.post_count || 0) + (user.comment_count || 0)}
                        </Typography>
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

export default ManagerAnalytics;
