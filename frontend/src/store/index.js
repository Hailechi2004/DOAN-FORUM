import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import postReducer from "./slices/postSlice";
import projectReducer from "./slices/projectSlice";
import taskReducer from "./slices/taskSlice";
import notificationReducer from "./slices/notificationSlice";
import messageReducer from "./slices/messageSlice";
import departmentReducer from "./slices/departmentSlice";
import teamReducer from "./slices/teamSlice";
import eventReducer from "./slices/eventSlice";
import meetingReducer from "./slices/meetingSlice";
import analyticsReducer from "./slices/analyticsSlice";
import taskWorkflowReducer from "../features/taskWorkflow/taskWorkflowSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    projects: projectReducer,
    tasks: taskReducer,
    notifications: notificationReducer,
    messages: messageReducer,
    departments: departmentReducer,
    teams: teamReducer,
    events: eventReducer,
    meetings: meetingReducer,
    analytics: analyticsReducer,
    taskWorkflow: taskWorkflowReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          "messages/addMessage",
          "notifications/addNotification",
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.created_at", "payload.updated_at"],
        // Ignore these paths in the state
        ignoredPaths: [
          "posts.posts",
          "messages.messages",
          "events.events",
          "meetings.meetings",
        ],
      },
    }),
});

export default store;
