import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  TextField,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import ReportCard from "./ReportCard";
import CreateReportDialog from "./CreateReportDialog";
import {
  fetchProjectReports,
  createTaskReport,
} from "../../features/taskWorkflow/taskWorkflowSlice";
import { toast } from "react-toastify";

const TaskReportsTab = ({ projectId, currentUser }) => {
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector(
    (state) => state.taskWorkflow
  );

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [reportTypeFilter, setReportTypeFilter] = useState("all");

  useEffect(() => {
    if (projectId) {
      console.log("📊 [Reports] Loading reports for project:", projectId);
      dispatch(fetchProjectReports({ projectId, reportType: null }));
    }
  }, [dispatch, projectId]);

  const handleCreateReport = async (reportData) => {
    try {
      await dispatch(createTaskReport(reportData)).unwrap();
      toast.success("Tạo báo cáo thành công!");
      setCreateDialogOpen(false);
      dispatch(fetchProjectReports({ projectId, reportType: null }));
    } catch (error) {
      toast.error(error || "Không thể tạo báo cáo");
    }
  };

  const handleEdit = (report) => {
    console.log("Edit report:", report);
    // TODO: Open edit dialog
  };

  const handleDelete = (report) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa báo cáo này?")) {
      // TODO: Call delete API
      toast.success("Đã xóa báo cáo");
    }
  };

  const filteredReports =
    reportTypeFilter === "all"
      ? reports || []
      : (reports || []).filter((r) => r.report_type === reportTypeFilter);

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
        <Typography variant="h5" fontWeight="bold">
          Báo Cáo Tiến Độ
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            size="small"
            value={reportTypeFilter}
            onChange={(e) => setReportTypeFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="daily">Hàng ngày</MenuItem>
            <MenuItem value="weekly">Hàng tuần</MenuItem>
            <MenuItem value="monthly">Hàng tháng</MenuItem>
            <MenuItem value="completion">Hoàn thành</MenuItem>
            <MenuItem value="issue">Vấn đề</MenuItem>
          </TextField>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Tạo Báo Cáo
          </Button>
        </Box>
      </Box>

      {/* Loading */}
      {loading.reports && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error.reports && !loading.reports && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.reports}
        </Alert>
      )}

      {/* Reports List */}
      {!loading.reports && !error.reports && (
        <>
          {filteredReports.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Chưa có báo cáo nào
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                Tạo Báo Cáo Đầu Tiên
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredReports.map((report) => (
                <Grid item xs={12} sm={6} md={4} key={report.id}>
                  <ReportCard
                    report={report}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    canEdit={report.created_by === currentUser?.id}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Create Report Dialog */}
      <CreateReportDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateReport}
        projectId={projectId}
        loading={loading.action}
        error={error.action}
      />
    </Box>
  );
};

export default TaskReportsTab;
