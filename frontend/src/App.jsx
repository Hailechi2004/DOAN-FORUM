import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import theme from "./theme";
import store from "./store";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPosts from "./pages/admin/Posts";
import AdminDepartments from "./pages/admin/Departments";
import AdminTeams from "./pages/admin/Teams";
import Users from "./pages/admin/Users";
import Projects from "./pages/admin/Projects";
import ProjectDetail from "./pages/admin/ProjectDetail";
import Events from "./pages/admin/Events";
import Meetings from "./pages/admin/Meetings";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import AdminProfile from "./pages/admin/Profile";
import ManagerDepartment from "./pages/manager/ManagerDepartment";
import ManagerPosts from "./pages/manager/Posts";
import ManagerTeams from "./pages/manager/Teams";
import ManagerProjects from "./pages/manager/Projects";
import ManagerProjectDetail from "./pages/manager/ProjectDetail_Full";
import ManagerUsers from "./pages/manager/Users";
import ManagerEvents from "./pages/manager/Events";
import ManagerMeetings from "./pages/manager/Meetings";
import ManagerAnalytics from "./pages/manager/Analytics";
import ManagerSettings from "./pages/manager/Settings";
import ManagerProfile from "./pages/manager/Profile";
import NewsFeed from "./pages/employee/NewsFeed";
import Profile from "./pages/employee/Profile";
import Departments from "./pages/employee/Departments";
import Teams from "./pages/employee/Teams";
import EmployeeProjects from "./pages/employee/Projects";
import EmployeeProjectDetail from "./pages/employee/ProjectDetail";
import TestJitsi from "./pages/TestJitsi";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          autoHideDuration={3000}
        >
          <CssBaseline />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/test-jitsi" element={<TestJitsi />} />

              {/* Admin/Manager routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRoles={["System Admin", "admin"]}>
                    <AdminLayout userType="admin" />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="posts" replace />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="users" element={<Users />} />
                <Route path="departments" element={<AdminDepartments />} />
                <Route path="teams" element={<AdminTeams />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="tasks" element={<div>Tasks (Coming Soon)</div>} />
                <Route path="events" element={<Events />} />
                <Route path="meetings" element={<Meetings />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Manager routes */}
              <Route
                path="/manager"
                element={
                  <ProtectedRoute
                    requiredRoles={["Department Manager", "manager"]}
                  >
                    <AdminLayout userType="manager" />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="posts" replace />} />
                <Route path="posts" element={<ManagerPosts />} />
                <Route path="department" element={<ManagerDepartment />} />
                <Route path="teams" element={<ManagerTeams />} />
                <Route path="users" element={<ManagerUsers />} />
                <Route path="projects" element={<ManagerProjects />} />
                <Route path="projects/:id" element={<ManagerProjectDetail />} />
                <Route path="events" element={<ManagerEvents />} />
                <Route path="meetings" element={<ManagerMeetings />} />
                <Route path="analytics" element={<ManagerAnalytics />} />
                <Route path="settings" element={<ManagerSettings />} />
                <Route path="profile" element={<ManagerProfile />} />
              </Route>

              <Route
                path="/employee"
                element={
                  <ProtectedRoute requiredRoles={["Employee", "User", "user"]}>
                    <EmployeeLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="news-feed" replace />} />
                <Route path="news-feed" element={<NewsFeed />} />
                <Route
                  path="messages"
                  element={<div>Messages (Coming Soon)</div>}
                />
                <Route path="projects" element={<EmployeeProjects />} />
                <Route
                  path="projects/:id"
                  element={<EmployeeProjectDetail />}
                />
                <Route path="tasks" element={<div>Tasks (Coming Soon)</div>} />
                <Route
                  path="calendar"
                  element={<div>Calendar (Coming Soon)</div>}
                />
                <Route path="teams" element={<Teams />} />
                <Route path="departments" element={<Departments />} />
                <Route
                  path="bookmarks"
                  element={<div>Bookmarks (Coming Soon)</div>}
                />
                <Route path="profile" element={<Profile />} />
                <Route
                  path="settings"
                  element={<div>Settings (Coming Soon)</div>}
                />
                <Route
                  path="notifications"
                  element={<div>Notifications (Coming Soon)</div>}
                />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route
                path="/unauthorized"
                element={<div>Unauthorized Access</div>}
              />
            </Routes>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
