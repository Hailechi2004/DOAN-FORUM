/**
 * Dependency Injection Container
 * Quản lý việc khởi tạo và inject dependencies giữa các layers
 */

// Database connection
const db = require("./config/database");

// Repositories
const MySQLUserRepository = require("./infrastructure/repositories/MySQLUserRepository");
const MySQLProjectRepository = require("./infrastructure/repositories/MySQLProjectRepository");
const MySQLTaskRepository = require("./infrastructure/repositories/MySQLTaskRepository");
const MySQLPostRepository = require("./infrastructure/repositories/MySQLPostRepository");
const MySQLCommentRepository = require("./infrastructure/repositories/MySQLCommentRepository");
const MySQLDepartmentRepository = require("./infrastructure/repositories/MySQLDepartmentRepository");
const MySQLTeamRepository = require("./infrastructure/repositories/MySQLTeamRepository");
const MySQLCategoryRepository = require("./infrastructure/repositories/MySQLCategoryRepository");
const MySQLFileRepository = require("./infrastructure/repositories/MySQLFileRepository");
const MySQLEventRepository = require("./infrastructure/repositories/MySQLEventRepository");
const MySQLPollRepository = require("./infrastructure/repositories/MySQLPollRepository");
const MySQLBookmarkRepository = require("./infrastructure/repositories/MySQLBookmarkRepository");
const MySQLMeetingRepository = require("./infrastructure/repositories/MySQLMeetingRepository");
const MySQLMessageRepository = require("./infrastructure/repositories/MySQLMessageRepository");
const MySQLNotificationRepository = require("./infrastructure/repositories/MySQLNotificationRepository");
const MySQLReactionRepository = require("./infrastructure/repositories/MySQLReactionRepository");

// Use Cases - User
const CreateUserUseCase = require("./application/use-cases/user/CreateUserUseCase");
const GetUserByIdUseCase = require("./application/use-cases/user/GetUserByIdUseCase");
const GetAllUsersUseCase = require("./application/use-cases/user/GetAllUsersUseCase");
const UpdateUserProfileUseCase = require("./application/use-cases/user/UpdateUserProfileUseCase");

// Use Cases - Project
const CreateProjectUseCase = require("./application/use-cases/project/CreateProjectUseCase");
const GetProjectByIdUseCase = require("./application/use-cases/project/GetProjectByIdUseCase");
const GetAllProjectsUseCase = require("./application/use-cases/project/GetAllProjectsUseCase");
const UpdateProjectUseCase = require("./application/use-cases/project/UpdateProjectUseCase");

// Use Cases - Task
const CreateTaskUseCase = require("./application/use-cases/task/CreateTaskUseCase");
const GetTaskByIdUseCase = require("./application/use-cases/task/GetTaskByIdUseCase");
const GetAllTasksUseCase = require("./application/use-cases/task/GetAllTasksUseCase");
const UpdateTaskUseCase = require("./application/use-cases/task/UpdateTaskUseCase");

// Use Cases - Post
const CreatePostUseCase = require("./application/use-cases/post/CreatePostUseCase");
const GetPostByIdUseCase = require("./application/use-cases/post/GetPostByIdUseCase");
const GetAllPostsUseCase = require("./application/use-cases/post/GetAllPostsUseCase");
const UpdatePostUseCase = require("./application/use-cases/post/UpdatePostUseCase");
const DeletePostUseCase = require("./application/use-cases/post/DeletePostUseCase");
const TogglePinPostUseCase = require("./application/use-cases/post/TogglePinPostUseCase");

// Use Cases - Comment
const CreateCommentUseCase = require("./application/use-cases/comment/CreateCommentUseCase");
const GetCommentByIdUseCase = require("./application/use-cases/comment/GetByIdCommentUseCase");
const GetAllCommentsUseCase = require("./application/use-cases/comment/GetAllCommentsUseCase");
const UpdateCommentUseCase = require("./application/use-cases/comment/UpdateCommentUseCase");
const DeleteCommentUseCase = require("./application/use-cases/comment/DeleteCommentUseCase");

// Use Cases - Department
const CreateDepartmentUseCase = require("./application/use-cases/department/CreateDepartmentUseCase");
const GetDepartmentByIdUseCase = require("./application/use-cases/department/GetByIdDepartmentUseCase");
const GetAllDepartmentsUseCase = require("./application/use-cases/department/GetAllDepartmentsUseCase");
const UpdateDepartmentUseCase = require("./application/use-cases/department/UpdateDepartmentUseCase");
const DeleteDepartmentUseCase = require("./application/use-cases/department/DeleteDepartmentUseCase");

// Use Cases - Team
const CreateTeamUseCase = require("./application/use-cases/team/CreateTeamUseCase");
const GetTeamByIdUseCase = require("./application/use-cases/team/GetByIdTeamUseCase");
const GetAllTeamsUseCase = require("./application/use-cases/team/GetAllTeamsUseCase");
const UpdateTeamUseCase = require("./application/use-cases/team/UpdateTeamUseCase");
const DeleteTeamUseCase = require("./application/use-cases/team/DeleteTeamUseCase");

// Use Cases - Category
const CreateCategoryUseCase = require("./application/use-cases/category/CreateCategoryUseCase");
const GetCategoryByIdUseCase = require("./application/use-cases/category/GetByIdCategoryUseCase");
const GetAllCategorysUseCase = require("./application/use-cases/category/GetAllCategorysUseCase");
const UpdateCategoryUseCase = require("./application/use-cases/category/UpdateCategoryUseCase");
const DeleteCategoryUseCase = require("./application/use-cases/category/DeleteCategoryUseCase");

// Use Cases - File
const CreateFileUseCase = require("./application/use-cases/file/CreateFileUseCase");
const GetFileByIdUseCase = require("./application/use-cases/file/GetByIdFileUseCase");
const GetAllFilesUseCase = require("./application/use-cases/file/GetAllFilesUseCase");
const UpdateFileUseCase = require("./application/use-cases/file/UpdateFileUseCase");
const DeleteFileUseCase = require("./application/use-cases/file/DeleteFileUseCase");

// Use Cases - Event
const CreateEventUseCase = require("./application/use-cases/event/CreateEventUseCase");
const GetEventByIdUseCase = require("./application/use-cases/event/GetByIdEventUseCase");
const GetAllEventsUseCase = require("./application/use-cases/event/GetAllEventsUseCase");
const UpdateEventUseCase = require("./application/use-cases/event/UpdateEventUseCase");
const DeleteEventUseCase = require("./application/use-cases/event/DeleteEventUseCase");

// Use Cases - Poll
const CreatePollUseCase = require("./application/use-cases/poll/CreatePollUseCase");
const GetPollByIdUseCase = require("./application/use-cases/poll/GetByIdPollUseCase");
const GetAllPollsUseCase = require("./application/use-cases/poll/GetAllPollsUseCase");
const UpdatePollUseCase = require("./application/use-cases/poll/UpdatePollUseCase");
const DeletePollUseCase = require("./application/use-cases/poll/DeletePollUseCase");

// Use Cases - Bookmark
const CreateBookmarkUseCase = require("./application/use-cases/bookmark/CreateBookmarkUseCase");
const GetBookmarkByIdUseCase = require("./application/use-cases/bookmark/GetByIdBookmarkUseCase");
const GetAllBookmarksUseCase = require("./application/use-cases/bookmark/GetAllBookmarksUseCase");
const UpdateBookmarkUseCase = require("./application/use-cases/bookmark/UpdateBookmarkUseCase");
const DeleteBookmarkUseCase = require("./application/use-cases/bookmark/DeleteBookmarkUseCase");

// Use Cases - Meeting
const CreateMeetingUseCase = require("./application/use-cases/meeting/CreateMeetingUseCase");
const GetMeetingByIdUseCase = require("./application/use-cases/meeting/GetByIdMeetingUseCase");
const GetAllMeetingsUseCase = require("./application/use-cases/meeting/GetAllMeetingsUseCase");
const UpdateMeetingUseCase = require("./application/use-cases/meeting/UpdateMeetingUseCase");
const DeleteMeetingUseCase = require("./application/use-cases/meeting/DeleteMeetingUseCase");

// Use Cases - Message
const CreateMessageUseCase = require("./application/use-cases/message/CreateMessageUseCase");
const GetMessageByIdUseCase = require("./application/use-cases/message/GetByIdMessageUseCase");
const GetAllMessagesUseCase = require("./application/use-cases/message/GetAllMessagesUseCase");
const UpdateMessageUseCase = require("./application/use-cases/message/UpdateMessageUseCase");
const DeleteMessageUseCase = require("./application/use-cases/message/DeleteMessageUseCase");

// Use Cases - Notification
const CreateNotificationUseCase = require("./application/use-cases/notification/CreateNotificationUseCase");
const GetNotificationByIdUseCase = require("./application/use-cases/notification/GetByIdNotificationUseCase");
const GetAllNotificationsUseCase = require("./application/use-cases/notification/GetAllNotificationsUseCase");
const UpdateNotificationUseCase = require("./application/use-cases/notification/UpdateNotificationUseCase");
const DeleteNotificationUseCase = require("./application/use-cases/notification/DeleteNotificationUseCase");

// Use Cases - Reaction
const CreateReactionUseCase = require("./application/use-cases/reaction/CreateReactionUseCase");
const GetReactionByIdUseCase = require("./application/use-cases/reaction/GetByIdReactionUseCase");
const GetAllReactionsUseCase = require("./application/use-cases/reaction/GetAllReactionsUseCase");
const UpdateReactionUseCase = require("./application/use-cases/reaction/UpdateReactionUseCase");
const DeleteReactionUseCase = require("./application/use-cases/reaction/DeleteReactionUseCase");

class DIContainer {
  constructor() {
    this.repositories = {};
    this.useCases = {};
    this._initializeRepositories();
    this._initializeUseCases();
  }

  _initializeRepositories() {
    // Initialize repositories
    this.repositories.user = new MySQLUserRepository();
    this.repositories.project = new MySQLProjectRepository();
    this.repositories.task = new MySQLTaskRepository();
    this.repositories.post = new MySQLPostRepository();
    this.repositories.comment = new MySQLCommentRepository();
    this.repositories.department = new MySQLDepartmentRepository();
    this.repositories.team = new MySQLTeamRepository();
    this.repositories.category = new MySQLCategoryRepository();
    this.repositories.file = new MySQLFileRepository();
    this.repositories.event = new MySQLEventRepository();
    this.repositories.poll = new MySQLPollRepository();
    this.repositories.bookmark = new MySQLBookmarkRepository();
    this.repositories.meeting = new MySQLMeetingRepository();
    this.repositories.message = new MySQLMessageRepository();
    this.repositories.notification = new MySQLNotificationRepository();
    this.repositories.reaction = new MySQLReactionRepository();
  }

  _initializeUseCases() {
    // User Use Cases
    this.useCases.createUser = new CreateUserUseCase(this.repositories.user);
    this.useCases.getUserById = new GetUserByIdUseCase(this.repositories.user);
    this.useCases.getAllUsers = new GetAllUsersUseCase(this.repositories.user);
    this.useCases.updateUserProfile = new UpdateUserProfileUseCase(
      this.repositories.user
    );

    // Project Use Cases
    this.useCases.createProject = new CreateProjectUseCase(
      this.repositories.project
    );
    this.useCases.getProjectById = new GetProjectByIdUseCase(
      this.repositories.project
    );
    this.useCases.getAllProjects = new GetAllProjectsUseCase(
      this.repositories.project
    );
    this.useCases.updateProject = new UpdateProjectUseCase(
      this.repositories.project
    );

    // Task Use Cases
    this.useCases.createTask = new CreateTaskUseCase(this.repositories.task);
    this.useCases.getTaskById = new GetTaskByIdUseCase(this.repositories.task);
    this.useCases.getAllTasks = new GetAllTasksUseCase(this.repositories.task);
    this.useCases.updateTask = new UpdateTaskUseCase(this.repositories.task);

    // Post Use Cases
    this.useCases.createPost = new CreatePostUseCase(
      this.repositories.post,
      db
    );
    this.useCases.getPostById = new GetPostByIdUseCase(this.repositories.post);
    this.useCases.getAllPosts = new GetAllPostsUseCase(this.repositories.post);
    this.useCases.updatePost = new UpdatePostUseCase(this.repositories.post);
    this.useCases.deletePost = new DeletePostUseCase(this.repositories.post);
    this.useCases.togglePinPost = new TogglePinPostUseCase(
      this.repositories.post
    );

    // Comment Use Cases
    this.useCases.createComment = new CreateCommentUseCase(
      this.repositories.comment
    );
    this.useCases.getCommentById = new GetCommentByIdUseCase(
      this.repositories.comment
    );
    this.useCases.getAllComments = new GetAllCommentsUseCase(
      this.repositories.comment
    );
    this.useCases.updateComment = new UpdateCommentUseCase(
      this.repositories.comment
    );
    this.useCases.deleteComment = new DeleteCommentUseCase(
      this.repositories.comment
    );

    // Department Use Cases
    this.useCases.createDepartment = new CreateDepartmentUseCase(
      this.repositories.department
    );
    this.useCases.getDepartmentById = new GetDepartmentByIdUseCase(
      this.repositories.department
    );
    this.useCases.getAllDepartments = new GetAllDepartmentsUseCase(
      this.repositories.department
    );
    this.useCases.updateDepartment = new UpdateDepartmentUseCase(
      this.repositories.department
    );
    this.useCases.deleteDepartment = new DeleteDepartmentUseCase(
      this.repositories.department
    );

    // Team Use Cases
    this.useCases.createTeam = new CreateTeamUseCase(this.repositories.team);
    this.useCases.getTeamById = new GetTeamByIdUseCase(this.repositories.team);
    this.useCases.getAllTeams = new GetAllTeamsUseCase(this.repositories.team);
    this.useCases.updateTeam = new UpdateTeamUseCase(this.repositories.team);
    this.useCases.deleteTeam = new DeleteTeamUseCase(this.repositories.team);

    // Category Use Cases
    this.useCases.createCategory = new CreateCategoryUseCase(
      this.repositories.category
    );
    this.useCases.getCategoryById = new GetCategoryByIdUseCase(
      this.repositories.category
    );
    this.useCases.getAllCategorys = new GetAllCategorysUseCase(
      this.repositories.category
    );
    this.useCases.updateCategory = new UpdateCategoryUseCase(
      this.repositories.category
    );
    this.useCases.deleteCategory = new DeleteCategoryUseCase(
      this.repositories.category
    );

    // File Use Cases
    this.useCases.createFile = new CreateFileUseCase(this.repositories.file);
    this.useCases.getFileById = new GetFileByIdUseCase(this.repositories.file);
    this.useCases.getAllFiles = new GetAllFilesUseCase(this.repositories.file);
    this.useCases.updateFile = new UpdateFileUseCase(this.repositories.file);
    this.useCases.deleteFile = new DeleteFileUseCase(this.repositories.file);

    // Event Use Cases
    this.useCases.createEvent = new CreateEventUseCase(this.repositories.event);
    this.useCases.getEventById = new GetEventByIdUseCase(
      this.repositories.event
    );
    this.useCases.getAllEvents = new GetAllEventsUseCase(
      this.repositories.event
    );
    this.useCases.updateEvent = new UpdateEventUseCase(this.repositories.event);
    this.useCases.deleteEvent = new DeleteEventUseCase(this.repositories.event);

    // Poll Use Cases
    this.useCases.createPoll = new CreatePollUseCase(this.repositories.poll);
    this.useCases.getPollById = new GetPollByIdUseCase(this.repositories.poll);
    this.useCases.getAllPolls = new GetAllPollsUseCase(this.repositories.poll);
    this.useCases.updatePoll = new UpdatePollUseCase(this.repositories.poll);
    this.useCases.deletePoll = new DeletePollUseCase(this.repositories.poll);

    // Bookmark Use Cases
    this.useCases.createBookmark = new CreateBookmarkUseCase(
      this.repositories.bookmark
    );
    this.useCases.getBookmarkById = new GetBookmarkByIdUseCase(
      this.repositories.bookmark
    );
    this.useCases.getAllBookmarks = new GetAllBookmarksUseCase(
      this.repositories.bookmark
    );
    this.useCases.updateBookmark = new UpdateBookmarkUseCase(
      this.repositories.bookmark
    );
    this.useCases.deleteBookmark = new DeleteBookmarkUseCase(
      this.repositories.bookmark
    );

    // Meeting Use Cases
    this.useCases.createMeeting = new CreateMeetingUseCase(
      this.repositories.meeting
    );
    this.useCases.getMeetingById = new GetMeetingByIdUseCase(
      this.repositories.meeting
    );
    this.useCases.getAllMeetings = new GetAllMeetingsUseCase(
      this.repositories.meeting
    );
    this.useCases.updateMeeting = new UpdateMeetingUseCase(
      this.repositories.meeting
    );
    this.useCases.deleteMeeting = new DeleteMeetingUseCase(
      this.repositories.meeting
    );

    // Message Use Cases
    this.useCases.createMessage = new CreateMessageUseCase(
      this.repositories.message
    );
    this.useCases.getMessageById = new GetMessageByIdUseCase(
      this.repositories.message
    );
    this.useCases.getAllMessages = new GetAllMessagesUseCase(
      this.repositories.message
    );
    this.useCases.updateMessage = new UpdateMessageUseCase(
      this.repositories.message
    );
    this.useCases.deleteMessage = new DeleteMessageUseCase(
      this.repositories.message
    );

    // Notification Use Cases
    this.useCases.createNotification = new CreateNotificationUseCase(
      this.repositories.notification
    );
    this.useCases.getNotificationById = new GetNotificationByIdUseCase(
      this.repositories.notification
    );
    this.useCases.getAllNotifications = new GetAllNotificationsUseCase(
      this.repositories.notification
    );
    this.useCases.updateNotification = new UpdateNotificationUseCase(
      this.repositories.notification
    );
    this.useCases.deleteNotification = new DeleteNotificationUseCase(
      this.repositories.notification
    );

    // Reaction Use Cases
    this.useCases.createReaction = new CreateReactionUseCase(
      this.repositories.reaction
    );
    this.useCases.getReactionById = new GetReactionByIdUseCase(
      this.repositories.reaction
    );
    this.useCases.getAllReactions = new GetAllReactionsUseCase(
      this.repositories.reaction
    );
    this.useCases.updateReaction = new UpdateReactionUseCase(
      this.repositories.reaction
    );
    this.useCases.deleteReaction = new DeleteReactionUseCase(
      this.repositories.reaction
    );
  }

  // Getters for use cases
  getUserUseCases() {
    return {
      createUser: this.useCases.createUser,
      getUserById: this.useCases.getUserById,
      getAllUsers: this.useCases.getAllUsers,
      updateUserProfile: this.useCases.updateUserProfile,
    };
  }

  getProjectUseCases() {
    return {
      createProject: this.useCases.createProject,
      getProjectById: this.useCases.getProjectById,
      getAllProjects: this.useCases.getAllProjects,
      updateProject: this.useCases.updateProject,
    };
  }

  getTaskUseCases() {
    return {
      createTask: this.useCases.createTask,
      getTaskById: this.useCases.getTaskById,
      getAllTasks: this.useCases.getAllTasks,
      updateTask: this.useCases.updateTask,
    };
  }

  getPostUseCases() {
    return {
      createPost: this.useCases.createPost,
      getPostById: this.useCases.getPostById,
      getAllPosts: this.useCases.getAllPosts,
      updatePost: this.useCases.updatePost,
      deletePost: this.useCases.deletePost,
      togglePinPost: this.useCases.togglePinPost,
    };
  }

  getCommentUseCases() {
    return {
      createComment: this.useCases.createComment,
      getCommentById: this.useCases.getCommentById,
      getAllComments: this.useCases.getAllComments,
      updateComment: this.useCases.updateComment,
      deleteComment: this.useCases.deleteComment,
    };
  }

  getDepartmentUseCases() {
    return {
      createDepartment: this.useCases.createDepartment,
      getDepartmentById: this.useCases.getDepartmentById,
      getAllDepartments: this.useCases.getAllDepartments,
      updateDepartment: this.useCases.updateDepartment,
      deleteDepartment: this.useCases.deleteDepartment,
    };
  }

  getTeamUseCases() {
    return {
      createTeam: this.useCases.createTeam,
      getTeamById: this.useCases.getTeamById,
      getAllTeams: this.useCases.getAllTeams,
      updateTeam: this.useCases.updateTeam,
      deleteTeam: this.useCases.deleteTeam,
    };
  }

  // Getters for repositories (nếu cần truy cập trực tiếp)
  getUserRepository() {
    return this.repositories.user;
  }

  getProjectRepository() {
    return this.repositories.project;
  }

  getTaskRepository() {
    return this.repositories.task;
  }

  getPostRepository() {
    return this.repositories.post;
  }

  getCommentRepository() {
    return this.repositories.comment;
  }

  getDepartmentRepository() {
    return this.repositories.department;
  }

  getTeamRepository() {
    return this.repositories.team;
  }

  getCategoryUseCases() {
    return {
      createCategory: this.useCases.createCategory,
      getCategoryById: this.useCases.getCategoryById,
      getAllCategorys: this.useCases.getAllCategorys,
      updateCategory: this.useCases.updateCategory,
      deleteCategory: this.useCases.deleteCategory,
    };
  }

  getCategoryRepository() {
    return this.repositories.category;
  }

  getFileUseCases() {
    return {
      createFile: this.useCases.createFile,
      getFileById: this.useCases.getFileById,
      getAllFiles: this.useCases.getAllFiles,
      updateFile: this.useCases.updateFile,
      deleteFile: this.useCases.deleteFile,
    };
  }

  getFileRepository() {
    return this.repositories.file;
  }

  getEventUseCases() {
    return {
      createEvent: this.useCases.createEvent,
      getEventById: this.useCases.getEventById,
      getAllEvents: this.useCases.getAllEvents,
      updateEvent: this.useCases.updateEvent,
      deleteEvent: this.useCases.deleteEvent,
    };
  }

  getEventRepository() {
    return this.repositories.event;
  }

  getPollUseCases() {
    return {
      createPoll: this.useCases.createPoll,
      getPollById: this.useCases.getPollById,
      getAllPolls: this.useCases.getAllPolls,
      updatePoll: this.useCases.updatePoll,
      deletePoll: this.useCases.deletePoll,
    };
  }

  getPollRepository() {
    return this.repositories.poll;
  }

  getBookmarkUseCases() {
    return {
      createBookmark: this.useCases.createBookmark,
      getBookmarkById: this.useCases.getBookmarkById,
      getAllBookmarks: this.useCases.getAllBookmarks,
      updateBookmark: this.useCases.updateBookmark,
      deleteBookmark: this.useCases.deleteBookmark,
    };
  }

  getBookmarkRepository() {
    return this.repositories.bookmark;
  }

  getMeetingUseCases() {
    return {
      createMeeting: this.useCases.createMeeting,
      getMeetingById: this.useCases.getMeetingById,
      getAllMeetings: this.useCases.getAllMeetings,
      updateMeeting: this.useCases.updateMeeting,
      deleteMeeting: this.useCases.deleteMeeting,
    };
  }

  getMeetingRepository() {
    return this.repositories.meeting;
  }

  getMessageUseCases() {
    return {
      createMessage: this.useCases.createMessage,
      getMessageById: this.useCases.getMessageById,
      getAllMessages: this.useCases.getAllMessages,
      updateMessage: this.useCases.updateMessage,
      deleteMessage: this.useCases.deleteMessage,
    };
  }

  getMessageRepository() {
    return this.repositories.message;
  }

  getNotificationUseCases() {
    return {
      createNotification: this.useCases.createNotification,
      getNotificationById: this.useCases.getNotificationById,
      getAllNotifications: this.useCases.getAllNotifications,
      updateNotification: this.useCases.updateNotification,
      deleteNotification: this.useCases.deleteNotification,
    };
  }

  getNotificationRepository() {
    return this.repositories.notification;
  }

  getReactionUseCases() {
    return {
      createReaction: this.useCases.createReaction,
      getReactionById: this.useCases.getReactionById,
      getAllReactions: this.useCases.getAllReactions,
      updateReaction: this.useCases.updateReaction,
      deleteReaction: this.useCases.deleteReaction,
    };
  }

  getReactionRepository() {
    return this.repositories.reaction;
  }
}

// Singleton instance
const container = new DIContainer();

module.exports = container;
