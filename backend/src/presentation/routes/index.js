const express = require("express");
const router = express.Router();

// Import ALL routes from presentation layer (Clean Architecture)
const userRoutes = require("./users");
const projectRoutes = require("./projects");
const projectDepartmentRoutes = require("./projectDepartments");
const projectNotificationRoutes = require("./projectNotifications");
const taskRoutes = require("./tasks");
const departmentTaskRoutes = require("./departmentTasks");
const memberTaskRoutes = require("./memberTasks");
const taskReportRoutes = require("./taskReports");
const projectWarningRoutes = require("./projectWarnings");
const authRoutes = require("./auth");
const postRoutes = require("./posts");
const commentRoutes = require("./comments");
const messageRoutes = require("./messages");
const notificationRoutes = require("./notifications");
const departmentRoutes = require("./departments");
const teamRoutes = require("./teams");
const categoryRoutes = require("./categories");
const fileRoutes = require("./files");
const eventRoutes = require("./events");
const pollRoutes = require("./polls");
const bookmarkRoutes = require("./bookmarks");
const meetingRoutes = require("./meetings");
const searchRoutes = require("./search");
const analyticsRoutes = require("./analytics");

// Mount ALL routes
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/projects", projectDepartmentRoutes); // Project departments & members
router.use("/project-notifications", projectNotificationRoutes); // Project notifications
router.use("/tasks", taskRoutes);
router.use("/", departmentTaskRoutes); // Department task workflow
router.use("/", memberTaskRoutes); // Member task workflow
router.use("/", taskReportRoutes); // Task reports
router.use("/", projectWarningRoutes); // Warnings/penalties
router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/comments", commentRoutes);
router.use("/messages", messageRoutes);
router.use("/notifications", notificationRoutes);
router.use("/departments", departmentRoutes);
router.use("/teams", teamRoutes);
router.use("/categories", categoryRoutes);
router.use("/files", fileRoutes);
router.use("/events", eventRoutes);
router.use("/polls", pollRoutes);
router.use("/bookmarks", bookmarkRoutes);
router.use("/meetings", meetingRoutes);
router.use("/search", searchRoutes);
router.use("/analytics", analyticsRoutes);

// Simple roles route without middleware issues
const db = require("../../config/database");
router.get("/roles", async (req, res) => {
  try {
    const [roles] = await db.query("SELECT * FROM roles ORDER BY name");
    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running (Clean Architecture - Fully Migrated)",
    timestamp: new Date().toISOString(),
    architecture: {
      pattern: "Clean Architecture",
      layers: ["Domain", "Application", "Infrastructure", "Presentation"],
      refactoredModules: ["users", "projects", "tasks"],
      legacyModules: [
        "auth",
        "posts",
        "comments",
        "messages",
        "notifications",
        "departments",
        "teams",
        "categories",
        "files",
        "events",
        "polls",
        "bookmarks",
        "meetings",
        "search",
        "analytics",
      ],
    },
  });
});

module.exports = router;
