import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Avatar,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import axiosInstance from "../../utils/axios";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/departments");
      setDepartments(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          "Không thể tải danh sách phòng ban"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
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
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: "#1976d2",
            }}
          >
            <BusinessIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: "#1565c0" }}>
              Phòng ban
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Danh sách các phòng ban trong công ty
            </Typography>
          </Box>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Tìm kiếm phòng ban..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Departments Grid */}
      <Grid container spacing={3}>
        {filteredDepartments.map((dept) => (
          <Grid item xs={12} sm={6} md={4} key={dept.id}>
            <Card
              sx={{
                height: "100%",
                boxShadow: 2,
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        bgcolor: "#1976d2",
                        width: 50,
                        height: 50,
                      }}
                    >
                      <BusinessIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{ color: "#1565c0" }}
                      >
                        {dept.name}
                      </Typography>
                      {dept.code && (
                        <Chip
                          label={dept.code}
                          size="small"
                          sx={{
                            mt: 0.5,
                            bgcolor: "#ffc107",
                            color: "#000",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Divider />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      minHeight: 60,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {dept.description || "Chưa có mô tả"}
                  </Typography>

                  <Divider />

                  <Stack direction="row" spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {dept.member_count || 0} thành viên
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <GroupIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {dept.team_count || 0} teams
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredDepartments.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm
              ? "Không tìm thấy phòng ban phù hợp"
              : "Chưa có phòng ban nào"}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
