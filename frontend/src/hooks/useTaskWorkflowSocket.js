import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import socketService from "../services/socketService";
import {
  fetchProjectDepartmentTasks,
  fetchProjectMemberTasks,
  fetchProjectReports,
  fetchProjectWarnings,
} from "../features/taskWorkflow/taskWorkflowSlice";

const useTaskWorkflowSocket = (projectId) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!projectId || !user) return;

    // Connect socket with auth token
    const token = localStorage.getItem("token");
    socketService.connect(token);

    // Join project room
    socketService.joinProject(projectId);

    // Department Task Events
    socketService.on("task-assigned-to-department", (data) => {
      toast.info(`📋 Công việc mới: ${data.title}`);
      dispatch(fetchProjectDepartmentTasks(projectId));
    });

    socketService.on("department-task-accepted", (data) => {
      toast.success(`✅ Phòng ban đã chấp nhận: ${data.title}`);
      dispatch(fetchProjectDepartmentTasks(projectId));
    });

    socketService.on("department-task-rejected", (data) => {
      toast.error(`❌ Phòng ban từ chối: ${data.title}`);
      dispatch(fetchProjectDepartmentTasks(projectId));
    });

    socketService.on("department-task-submitted", (data) => {
      toast.info(`📤 Công việc đã nộp: ${data.title}`);
      dispatch(fetchProjectDepartmentTasks(projectId));
    });

    socketService.on("department-task-approved", (data) => {
      toast.success(`🎉 Công việc được duyệt: ${data.title}`);
      dispatch(fetchProjectDepartmentTasks(projectId));
    });

    // Member Task Events
    socketService.on("task-assigned-to-member", (data) => {
      if (data.assigned_to === user.id) {
        toast.info(`📋 Bạn có công việc mới: ${data.title}`);
      }
      dispatch(fetchProjectMemberTasks(projectId));
    });

    socketService.on("member-task-started", (data) => {
      toast.info(`🚀 Công việc bắt đầu: ${data.title}`);
      dispatch(fetchProjectMemberTasks(projectId));
    });

    socketService.on("member-task-submitted", (data) => {
      toast.info(`📤 Công việc đã nộp: ${data.title}`);
      dispatch(fetchProjectMemberTasks(projectId));
    });

    socketService.on("member-task-approved", (data) => {
      if (data.assigned_to === user.id) {
        toast.success(`🎉 Công việc của bạn được duyệt: ${data.title}`);
      }
      dispatch(fetchProjectMemberTasks(projectId));
    });

    socketService.on("member-task-rejected", (data) => {
      if (data.assigned_to === user.id) {
        toast.error(`❌ Công việc bị từ chối: ${data.title}`);
      }
      dispatch(fetchProjectMemberTasks(projectId));
    });

    socketService.on("member-task-progress-updated", (data) => {
      dispatch(fetchProjectMemberTasks(projectId));
    });

    // Report Events
    socketService.on("task-report-created", (data) => {
      toast.info(`📊 Báo cáo mới: ${data.title}`);
      dispatch(fetchProjectReports(projectId));
    });

    socketService.on("task-report-updated", (data) => {
      dispatch(fetchProjectReports(projectId));
    });

    socketService.on("task-report-deleted", (data) => {
      dispatch(fetchProjectReports(projectId));
    });

    // Warning Events
    socketService.on("warning-issued", (data) => {
      if (data.warned_user_id === user.id) {
        toast.error(`⚠️ Bạn nhận cảnh báo: ${data.reason}`);
      }
      dispatch(fetchProjectWarnings(projectId));
    });

    socketService.on("warning-acknowledged", (data) => {
      dispatch(fetchProjectWarnings(projectId));
    });

    // Cleanup
    return () => {
      socketService.off("task-assigned-to-department");
      socketService.off("department-task-accepted");
      socketService.off("department-task-rejected");
      socketService.off("department-task-submitted");
      socketService.off("department-task-approved");
      socketService.off("task-assigned-to-member");
      socketService.off("member-task-started");
      socketService.off("member-task-submitted");
      socketService.off("member-task-approved");
      socketService.off("member-task-rejected");
      socketService.off("member-task-progress-updated");
      socketService.off("task-report-created");
      socketService.off("task-report-updated");
      socketService.off("task-report-deleted");
      socketService.off("warning-issued");
      socketService.off("warning-acknowledged");

      socketService.leaveProject(projectId);
    };
  }, [projectId, user, dispatch]);

  return socketService;
};

export default useTaskWorkflowSocket;
