import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  fetchDashboard,
  fetchActivityTrend,
  fetchTopUsers,
  fetchProjectStats,
  fetchTaskStats,
} from "../../store/slices/analyticsSlice";

const COLORS = {
  primary: "#1976d2",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
  info: "#00bcd4",
  purple: "#9c27b0",
  pink: "#e91e63",
  teal: "#009688",
};

const PROJECT_COLORS = {
  planning: COLORS.info,
  in_progress: COLORS.warning,
  completed: COLORS.success,
  cancelled: COLORS.error,
  on_hold: "#9e9e9e",
};

const TASK_PRIORITY_COLORS = {
  low: COLORS.success,
  medium: COLORS.info,
  high: COLORS.warning,
  urgent: COLORS.error,
};

const Analytics = () => {
  const dispatch = useDispatch();
  const {
    dashboard,
    activityTrend,
    topUsers,
    projectStats,
    taskStats,
    loading,
    error,
  } = useSelector((state) => state.analytics);

  useEffect(() => {
    // Admin sees all analytics, no department filter
    const params = {};
    dispatch(fetchDashboard(params));
    dispatch(fetchActivityTrend(30)); // Pass number directly, not object
    dispatch(fetchTopUsers(10)); // Pass number directly, not object
    dispatch(fetchProjectStats(params));
    dispatch(fetchTaskStats(params));
  }, [dispatch]);

  const StatCard = ({ title, value, subtitle, icon, color, loading }) => (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderLeft: `4px solid ${color}`,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={80} height={40} />
            ) : (
              <Typography variant="h3" fontWeight="bold" color={color}>
                {value?.toLocaleString()}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}20`,
              color: color,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const getMedalIcon = (rank) => {
    const medals = {
      1: "🥇",
      2: "🥈",
      3: "🥉",
    };
    return medals[rank] || `#${rank}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Transform activity trend data for chart
  const activityChartData =
    activityTrend.posts?.map((post, index) => ({
      date: formatDate(post.date),
      Posts: post.count,
      Tasks: activityTrend.tasks[index]?.count || 0,
    })) || [];

  // Transform project stats for pie chart
  const projectChartData =
    projectStats?.map((stat) => ({
      name: stat.status.replace("_", " ").toUpperCase(),
      value: stat.count,
      color: PROJECT_COLORS[stat.status] || COLORS.info,
    })) || [];

  // Transform task stats for bar charts
  const taskStatusData =
    taskStats.byStatus?.map((stat) => ({
      name: stat.status.replace("_", " ").toUpperCase(),
      count: stat.count,
    })) || [];

  const taskPriorityData =
    taskStats.byPriority?.map((stat) => ({
      name: stat.priority.toUpperCase(),
      count: stat.count,
      fill: TASK_PRIORITY_COLORS[stat.priority] || COLORS.info,
    })) || [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📊 Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive overview of system statistics and trends
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Dashboard Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={dashboard.totalUsers}
            subtitle={`${dashboard.activeUsers} active users`}
            icon={<PeopleIcon />}
            color={COLORS.primary}
            loading={loading.dashboard}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Posts"
            value={dashboard.totalPosts}
            subtitle={`${dashboard.postsThisMonth} this month`}
            icon={<ArticleIcon />}
            color={COLORS.success}
            loading={loading.dashboard}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={dashboard.totalProjects}
            subtitle={`${dashboard.activeProjects} active`}
            icon={<FolderIcon />}
            color={COLORS.warning}
            loading={loading.dashboard}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={dashboard.totalTasks}
            subtitle={`${dashboard.completedTasks} completed`}
            icon={<AssignmentIcon />}
            color={COLORS.purple}
            loading={loading.dashboard}
          />
        </Grid>
      </Grid>

      {/* Activity Trend Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <TrendingUpIcon sx={{ mr: 1, color: COLORS.primary }} />
          <Typography variant="h6" fontWeight="bold">
            Activity Trend (Last 30 Days)
          </Typography>
        </Box>
        {loading.trend ? (
          <Skeleton variant="rectangular" height={300} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Posts"
                stroke={COLORS.success}
                strokeWidth={2}
                dot={{ fill: COLORS.success }}
              />
              <Line
                type="monotone"
                dataKey="Tasks"
                stroke={COLORS.purple}
                strokeWidth={2}
                dot={{ fill: COLORS.purple }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Top Contributors - Full Width */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <TrophyIcon sx={{ mr: 1, color: COLORS.warning }} />
          <Typography variant="h6" fontWeight="bold">
            Top Contributors
          </Typography>
        </Box>
        {loading.users ? (
          <Skeleton variant="rectangular" height={400} />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell align="center">Posts</TableCell>
                  <TableCell align="center">Comments</TableCell>
                  <TableCell align="center">Tasks</TableCell>
                  <TableCell align="center">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topUsers.map((user, index) => {
                  const total =
                    parseInt(user.post_count) +
                    parseInt(user.comment_count) +
                    parseInt(user.task_count);
                  return (
                    <TableRow
                      key={user.id}
                      sx={{
                        bgcolor:
                          index < 3 ? `${COLORS.warning}05` : "transparent",
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {getMedalIcon(index + 1)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            src={user.avatar_url}
                            alt={user.full_name}
                            sx={{ width: 32, height: 32 }}
                          >
                            {user.full_name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
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
                          label={user.post_count}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={user.comment_count}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={user.task_count}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {total}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default Analytics;
